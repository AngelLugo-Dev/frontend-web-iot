/**
 * Cliente API REST
 * Maneja todas las comunicaciones HTTP con el backend
 * Autor: Tu Nombre
 * Fecha: 2025
 */

class APIClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  /**
   * Realiza una petición HTTP genérica
   * @param {string} endpoint - Endpoint de la API
   * @param {object} options - Opciones de fetch
   * @returns {Promise} Promesa con la respuesta
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const config = {
      ...options,
      headers: {
        ...this.headers,
        ...options.headers,
      },
    };

    try {
      console.log(`📡 ${config.method || "GET"} ${url}`);

      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("✅ Respuesta:", data);

      return data;
    } catch (error) {
      console.error("❌ Error en petición API:", error);
      throw error;
    }
  }

  /**
   * Petición GET
   * @param {string} endpoint - Endpoint
   * @param {object} params - Parámetros de query
   * @returns {Promise} Respuesta
   */
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;

    return this.request(url, {
      method: "GET",
    });
  }

  /**
   * Petición POST
   * @param {string} endpoint - Endpoint
   * @param {object} data - Datos a enviar
   * @returns {Promise} Respuesta
   */
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Petición PUT
   * @param {string} endpoint - Endpoint
   * @param {object} data - Datos a enviar
   * @returns {Promise} Respuesta
   */
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  /**
   * Petición DELETE
   * @param {string} endpoint - Endpoint
   * @returns {Promise} Respuesta
   */
  async delete(endpoint) {
    return this.request(endpoint, {
      method: "DELETE",
    });
  }

  // ========================================
  // ENDPOINTS ESPECÍFICOS DE CARRITO IoT
  // ========================================

  /**
   * Health check del servidor
   * @returns {Promise} Estado del servidor
   */
  async healthCheck() {
    return this.get("/api/health");
  }

  /**
   * Obtiene todos los dispositivos
   * @returns {Promise} Lista de dispositivos
   */
  async getDevices() {
    return this.get("/api/devices");
  }

  /**
   * Obtiene un dispositivo por ID
   * @param {number} deviceId - ID del dispositivo
   * @returns {Promise} Datos del dispositivo
   */
  async getDevice(deviceId) {
    return this.get(`/api/devices/${deviceId}`);
  }

  /**
   * Registra un nuevo dispositivo
   * @param {object} deviceData - Datos del dispositivo
   * @returns {Promise} Dispositivo registrado
   */
  async registerDevice(deviceData) {
    return this.post("/api/devices/register", deviceData);
  }

  /**
   * Envía un comando de movimiento (vía REST)
   * @param {object} commandData - Datos del comando
   * @returns {Promise} Resultado del comando
   */
  async sendMovement(commandData) {
    return this.post("/api/movements/send", commandData);
  }

  /**
   * Obtiene eventos de un dispositivo
   * @param {number} deviceId - ID del dispositivo
   * @param {number} limit - Límite de eventos
   * @returns {Promise} Lista de eventos
   */
  async getDeviceEvents(deviceId, limit = 50) {
    return this.get(`/api/events/${deviceId}`, { limit });
  }

  /**
   * Obtiene estados operacionales disponibles
   * @returns {Promise} Lista de estados
   */
  async getOperationalStatus() {
    return this.get("/api/status/operational");
  }

  /**
   * Simula un obstáculo (solo para desarrollo/testing)
   * @param {object} obstacleData - Datos del obstáculo simulado
   * @returns {Promise} Resultado de la simulación
   */
  async simulateObstacle(obstacleData) {
    return this.post("/api/simulate/obstacle", obstacleData);
  }

  /**
   * Ejecuta una secuencia de movimientos (demo)
   * @param {object} sequenceData - Datos de la secuencia
   * @returns {Promise} Resultado de la ejecución
   */
  async executeSequence(sequenceData) {
    return this.post("/api/movements/sequence", sequenceData);
  }
}

// Instancia global del cliente API
const apiClient = new APIClient(CONFIG.API_BASE_URL);

// ========================================
// FUNCIONES DE CONVENIENCIA
// ========================================

/**
 * Wrapper para verificar salud del servidor
 */
async function checkServerHealth() {
  try {
    const health = await apiClient.healthCheck();
    console.log("💚 Servidor saludable:", health);
    return health;
  } catch (error) {
    console.error("❌ Servidor no disponible:", error);
    UTILS.showNotification("Servidor no disponible", "error");
    return null;
  }
}

/**
 * Obtiene información del dispositivo actual
 */
async function getCurrentDeviceInfo() {
  try {
    const response = await apiClient.getDevice(APP_STATE.currentDeviceId);
    if (response.success) {
      return response.device;
    }
    return null;
  } catch (error) {
    console.error("Error obteniendo info del dispositivo:", error);
    return null;
  }
}

/**
 * Obtiene el historial de eventos del dispositivo actual
 * @param {number} limit - Límite de eventos
 */
async function getDeviceHistory(limit = 50) {
  try {
    const response = await apiClient.getDeviceEvents(
      APP_STATE.currentDeviceId,
      limit
    );
    if (response.success) {
      APP_STATE.history = response.events;
      return response.events;
    }
    return [];
  } catch (error) {
    console.error("Error obteniendo historial:", error);
    return [];
  }
}

/**
 * Envía un comando de movimiento vía REST
 * @param {string} command - Comando a enviar
 * @param {number} duration - Duración en ms
 * @param {object} meta - Metadatos adicionales
 */
async function sendMovementREST(command, duration, meta = {}) {
  try {
    const commandData = {
      device_id: APP_STATE.currentDeviceId,
      command: command,
      duration_ms: duration,
      meta: {
        origin: "web_rest",
        ...meta,
      },
    };

    const response = await apiClient.sendMovement(commandData);

    if (response.success) {
      console.log("✅ Comando enviado vía REST:", response);
      UTILS.showNotification(`Comando ${command} enviado`, "success");
      APP_STATE.commandCount++;
      return true;
    } else {
      console.error("❌ Error en comando:", response);
      UTILS.showNotification(`Error: ${response.error}`, "error");
      return false;
    }
  } catch (error) {
    console.error("Error enviando comando REST:", error);
    UTILS.showNotification("Error al enviar comando", "error");
    return false;
  }
}

/**
 * Obtiene lista de todos los dispositivos
 */
async function getAllDevices() {
  try {
    const response = await apiClient.getDevices();
    if (response.success) {
      return response.devices;
    }
    return [];
  } catch (error) {
    console.error("Error obteniendo dispositivos:", error);
    return [];
  }
}

/**
 * Obtiene estados operacionales
 */
async function getOperationalStatuses() {
  try {
    const response = await apiClient.getOperationalStatus();
    if (response.success) {
      return response.statuses;
    }
    return [];
  } catch (error) {
    console.error("Error obteniendo estados:", error);
    return [];
  }
}

console.log("✅ API Client inicializado");
