/**
 * Gestor de Comunicación WebSocket (PUSH)
 * Maneja la conexión bidireccional con el servidor Flask-SocketIO
 * Autor: Tu Nombre
 * Fecha: 2025
 */

class WebSocketManager {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = CONFIG.WEBSOCKET_CONFIG.reconnectionAttempts;
    this.messageHandlers = new Map();
    this.connectionStatusCallbacks = [];
  }

  /**
   * Inicializa la conexión WebSocket
   */
  connect() {
    console.log("🔌 Iniciando conexión WebSocket...");

    try {
      this.socket = io(CONFIG.WEBSOCKET_URL, CONFIG.WEBSOCKET_CONFIG);

      this.setupEventListeners();
    } catch (error) {
      console.error("❌ Error al iniciar WebSocket:", error);
      this.updateConnectionStatus(false);
    }
  }

  /**
   * Configura los listeners de eventos WebSocket
   */
  setupEventListeners() {
    // Evento: Conexión exitosa
    this.socket.on("connect", () => {
      console.log("✅ WebSocket conectado - SID:", this.socket.id);
      this.connected = true;
      this.reconnectAttempts = 0;
      this.updateConnectionStatus(true);

      // Registrar dispositivo automáticamente
      this.registerDevice(APP_STATE.currentDeviceId);

      // Notificar a la UI
      UTILS.showNotification("Conectado al servidor exitosamente", "success");
    });

    // Evento: Desconexión
    this.socket.on("disconnect", (reason) => {
      console.log("🔌 WebSocket desconectado:", reason);
      this.connected = false;
      this.updateConnectionStatus(false);

      UTILS.showNotification("Desconectado del servidor", "warning");

      // Intentar reconexión si está habilitada
      if (APP_STATE.autoReconnect && reason !== "io client disconnect") {
        this.attemptReconnect();
      }
    });

    // Evento: Error de conexión
    this.socket.on("connect_error", (error) => {
      console.error("❌ Error de conexión WebSocket:", error);
      this.updateConnectionStatus(false);
    });

    // Evento: Respuesta de conexión del servidor
    this.socket.on("connection_response", (data) => {
      console.log("📨 Respuesta del servidor:", data);
      if (data.status === "connected") {
        UTILS.showNotification(data.message, "success");
      }
    });

    // Evento: Registro exitoso de dispositivo
    this.socket.on("registration_success", (data) => {
      console.log("✅ Dispositivo registrado:", data);
      UTILS.showNotification(
        `Dispositivo ${data.device_id} registrado`,
        "success"
      );
    });

    // Evento: Error de registro
    this.socket.on("registration_error", (data) => {
      console.error("❌ Error en registro:", data);
      UTILS.showNotification("Error al registrar dispositivo", "error");
    });

    // Evento: Ejecutar movimiento (PUSH desde servidor)
    this.socket.on("execute_movement", (data) => {
      console.log("🎮 Comando recibido (PUSH):", data);
      this.handleIncomingMessage("movement", data);
    });

    // Evento: Comando enviado (confirmación)
    this.socket.on("command_sent", (data) => {
      console.log("✅ Comando confirmado:", data);
      this.handleIncomingMessage("movement", {
        ...data,
        status: "sent",
      });
    });

    // Evento: Error de comando
    this.socket.on("command_error", (data) => {
      console.error("❌ Error en comando:", data);
      UTILS.showNotification(`Error: ${data.error}`, "error");
      this.handleIncomingMessage("system", data);
    });

    // Evento: Alerta de obstáculo
    this.socket.on("obstacle_alert", (data) => {
      console.log("⚠️ Alerta de obstáculo:", data);
      APP_STATE.obstacleCount++;
      UTILS.showNotification("¡Obstáculo detectado!", "warning");
      this.handleIncomingMessage("obstacle", data);
    });

    // Evento: Actualización de estado
    this.socket.on("status_update", (data) => {
      console.log("📊 Actualización de estado:", data);
      this.handleIncomingMessage("status", data);
    });

    // Evento: Pong (respuesta a ping)
    this.socket.on("pong", (data) => {
      console.log("🏓 Pong recibido:", data);
    });
  }

  /**
   * Registra el dispositivo en el servidor
   * @param {number} deviceId - ID del dispositivo
   */
  registerDevice(deviceId) {
    if (!this.connected) {
      console.warn("⚠️ No conectado, no se puede registrar dispositivo");
      return;
    }

    console.log(`📝 Registrando dispositivo ${deviceId}...`);

    this.socket.emit("register_device", {
      device_id: deviceId,
      device_name: `Carrito-${deviceId}`,
    });
  }

  /**
   * Desregistra el dispositivo del servidor
   * @param {number} deviceId - ID del dispositivo
   */
  unregisterDevice(deviceId) {
    if (!this.connected) return;

    console.log(`📝 Desregistrando dispositivo ${deviceId}...`);

    this.socket.emit("unregister_device", {
      device_id: deviceId,
    });
  }

  /**
   * Envía un comando de movimiento por WebSocket
   * @param {object} commandData - Datos del comando
   */
  sendMovementCommand(commandData) {
    if (!this.connected) {
      UTILS.showNotification("No hay conexión con el servidor", "error");
      return false;
    }

    console.log("📤 Enviando comando:", commandData);

    this.socket.emit("movement_command", {
      device_id: APP_STATE.currentDeviceId,
      command: commandData.command,
      duration_ms: commandData.duration_ms,
      meta: {
        speed: 100,
        origin: "web_interface",
        timestamp: new Date().toISOString(),
        ...commandData.meta,
      },
    });

    APP_STATE.commandCount++;
    return true;
  }

  /**
   * Envía ping al servidor
   */
  sendPing() {
    if (this.connected) {
      this.socket.emit("ping");
    }
  }

  /**
   * Maneja mensajes entrantes y notifica a los handlers
   * @param {string} type - Tipo de mensaje
   * @param {object} data - Datos del mensaje
   */
  handleIncomingMessage(type, data) {
    const message = {
      id: UTILS.generateId(),
      type: type,
      data: data,
      timestamp: new Date().toISOString(),
    };

    // Agregar a la lista de mensajes
    APP_STATE.messages.unshift(message);

    // Limitar tamaño de lista
    if (APP_STATE.messages.length > CONFIG.MAX_MESSAGES) {
      APP_STATE.messages.pop();
    }

    // Notificar a handlers registrados
    if (this.messageHandlers.has(type)) {
      this.messageHandlers.get(type).forEach((handler) => handler(message));
    }

    // Notificar a handler genérico
    if (this.messageHandlers.has("all")) {
      this.messageHandlers.get("all").forEach((handler) => handler(message));
    }
  }

  /**
   * Registra un handler para un tipo de mensaje
   * @param {string} type - Tipo de mensaje ('movement', 'obstacle', 'status', 'all')
   * @param {Function} handler - Función handler
   */
  onMessage(type, handler) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type).push(handler);
  }

  /**
   * Registra callback para cambios de estado de conexión
   * @param {Function} callback - Función callback
   */
  onConnectionStatusChange(callback) {
    this.connectionStatusCallbacks.push(callback);
  }

  /**
   * Actualiza el estado de conexión y notifica a callbacks
   * @param {boolean} connected - Estado de conexión
   */
  updateConnectionStatus(connected) {
    this.connected = connected;
    APP_STATE.connected = connected;

    this.connectionStatusCallbacks.forEach((callback) => {
      callback(connected);
    });
  }

  /**
   * Intenta reconectar al servidor
   */
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("❌ Máximo de intentos de reconexión alcanzado");
      UTILS.showNotification("No se pudo reconectar al servidor", "error");
      return;
    }

    this.reconnectAttempts++;
    console.log(
      `🔄 Intento de reconexión ${this.reconnectAttempts}/${this.maxReconnectAttempts}...`
    );

    setTimeout(() => {
      if (!this.connected && this.socket) {
        this.socket.connect();
      }
    }, CONFIG.WEBSOCKET_CONFIG.reconnectionDelay);
  }

  /**
   * Desconecta el WebSocket
   */
  disconnect() {
    if (this.socket) {
      console.log("🔌 Desconectando WebSocket...");
      this.socket.disconnect();
      this.connected = false;
      this.updateConnectionStatus(false);
    }
  }

  /**
   * Reconecta el WebSocket
   */
  reconnect() {
    console.log("🔄 Reconectando...");
    this.disconnect();
    setTimeout(() => {
      this.connect();
    }, 500);
  }

  /**
   * Verifica si está conectado
   * @returns {boolean} Estado de conexión
   */
  isConnected() {
    return this.connected && this.socket && this.socket.connected;
  }
}

// Instancia global del WebSocket Manager
const wsManager = new WebSocketManager();

// Auto-conectar al cargar la página
window.addEventListener("DOMContentLoaded", () => {
  wsManager.connect();
});

console.log("✅ WebSocket Manager inicializado");
