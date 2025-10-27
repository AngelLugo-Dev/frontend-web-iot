/**
 * Aplicación Principal - CarroIoT Frontend
 * Gestiona la UI y coordina WebSocket y API REST
 * Autor: Tu Nombre
 * Fecha: 2025
 */

// ========================================
// ELEMENTOS DEL DOM
// ========================================
const DOM = {
  // Navegación y vistas
  navTabs: null,
  controlView: null,
  monitorView: null,

  // Estado de conexión
  statusIndicator: null,
  statusText: null,

  // Dispositivo
  deviceIdInput: null,
  deviceInfo: null,
  refreshDeviceBtn: null,
  lastMovement: null,

  // Estadísticas
  commandCount: null,
  obstacleCount: null,
  sessionTime: null,

  // Controles
  controlButtons: null,
  stopBtn: null,
  durationSlider: null,
  durationValue: null,

  // Mensajes
  messagesContainer: null,
  clearMessagesBtn: null,
  messageFilters: null,
  messagesTotal: null,
  messagesMovement: null,
  messagesObstacle: null,
  messagesStatus: null,
  messagesSystem: null,

  // Historial
  historyTable: null,
  refreshHistoryBtn: null,

  // Modal configuración
  settingsBtn: null,
  settingsModal: null,
  closeSettingsBtn: null,
  serverUrlInput: null,
  autoReconnectCheckbox: null,
  saveSettingsBtn: null,
};

// ========================================
// INICIALIZACIÓN
// ========================================
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Iniciando aplicación CarroIoT...");

  // Obtener elementos del DOM
  initializeDOMElements();

  // Configurar event listeners
  setupEventListeners();

  // Ajustar vista inicial
  switchView(APP_STATE.activeView);

  // Inicializar contadores de mensajes
  updateMessageCountersUI();

  // Configurar WebSocket handlers
  setupWebSocketHandlers();

  // Cargar datos iniciales
  loadInitialData();

  // Iniciar temporizador de sesión
  startSessionTimer();

  console.log("✅ Aplicación inicializada");
});

/**
 * Inicializa referencias a elementos del DOM
 */
function initializeDOMElements() {
  // Navegación y vistas
  DOM.navTabs = document.querySelectorAll(".nav-tab");
  DOM.controlView = document.getElementById("controlView");
  DOM.monitorView = document.getElementById("monitorView");

  // Estado de conexión
  DOM.statusIndicator = document.getElementById("statusIndicator");
  DOM.statusText = document.getElementById("statusText");

  // Dispositivo
  DOM.deviceIdInput = document.getElementById("deviceIdInput");
  DOM.deviceInfo = document.getElementById("deviceInfo");
  DOM.refreshDeviceBtn = document.getElementById("refreshDeviceBtn");
  DOM.lastMovement = document.getElementById("lastMovement");

  // Estadísticas
  DOM.commandCount = document.getElementById("commandCount");
  DOM.obstacleCount = document.getElementById("obstacleCount");
  DOM.sessionTime = document.getElementById("sessionTime");

  // Controles
  DOM.controlButtons = document.querySelectorAll(".control-btn");
  DOM.stopBtn = document.getElementById("stopBtn");
  DOM.durationSlider = document.getElementById("durationSlider");
  DOM.durationValue = document.getElementById("durationValue");

  // Mensajes
  DOM.messagesContainer = document.getElementById("messagesContainer");
  DOM.clearMessagesBtn = document.getElementById("clearMessagesBtn");
  DOM.messageFilters = document.querySelectorAll(".message-filter");
  DOM.messagesTotal = document.getElementById("messagesTotal");
  DOM.messagesMovement = document.getElementById("messagesMovement");
  DOM.messagesObstacle = document.getElementById("messagesObstacle");
  DOM.messagesStatus = document.getElementById("messagesStatus");
  DOM.messagesSystem = document.getElementById("messagesSystem");

  // Historial
  DOM.historyTable = document.getElementById("historyTable");
  DOM.refreshHistoryBtn = document.getElementById("refreshHistoryBtn");

  // Modal
  DOM.settingsBtn = document.getElementById("settingsBtn");
  DOM.settingsModal = document.getElementById("settingsModal");
  DOM.closeSettingsBtn = document.getElementById("closeSettingsBtn");
  DOM.serverUrlInput = document.getElementById("serverUrlInput");
  DOM.autoReconnectCheckbox = document.getElementById("autoReconnectCheckbox");
  DOM.saveSettingsBtn = document.getElementById("saveSettingsBtn");
}

/**
 * Configura todos los event listeners
 */
function setupEventListeners() {
  // Navegación principal
  DOM.navTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetView = tab.dataset.viewTarget;
      switchView(targetView);
    });
  });

  // Botones de control de movimiento
  DOM.controlButtons.forEach((btn) => {
    btn.addEventListener("click", handleControlButtonClick);
  });

  // Slider de duración
  DOM.durationSlider.addEventListener("input", (e) => {
    const value = e.target.value;
    DOM.durationValue.textContent = `${value} ms`;
  });

  // Input de Device ID
  DOM.deviceIdInput.addEventListener("change", (e) => {
    const newDeviceId = parseInt(e.target.value);
    if (newDeviceId > 0) {
      changeDevice(newDeviceId);
    }
  });

  // Botón refrescar dispositivo
  DOM.refreshDeviceBtn.addEventListener("click", refreshDeviceInfo);

  // Botón limpiar mensajes
  DOM.clearMessagesBtn.addEventListener("click", clearMessages);

  // Filtros de mensajes
  DOM.messageFilters.forEach((filter) => {
    filter.addEventListener("click", handleFilterClick);
  });

  // Botón refrescar historial
  DOM.refreshHistoryBtn.addEventListener("click", refreshHistory);

  // Modal de configuración
  DOM.settingsBtn.addEventListener("click", openSettingsModal);
  DOM.closeSettingsBtn.addEventListener("click", closeSettingsModal);
  DOM.saveSettingsBtn.addEventListener("click", saveSettings);

  // Cerrar modal al hacer clic fuera
  DOM.settingsModal.addEventListener("click", (e) => {
    if (e.target === DOM.settingsModal) {
      closeSettingsModal();
    }
  });

  // Atajos de teclado
  document.addEventListener("keydown", handleKeyboardShortcuts);
}

/**
 * Configura los handlers del WebSocket
 */
function setupWebSocketHandlers() {
  // Handler para cambios de estado de conexión
  wsManager.onConnectionStatusChange((connected) => {
    updateConnectionUI(connected);
  });

  // Handler para todos los mensajes
  wsManager.onMessage("all", (message) => {
    addMessageToUI(message);
    updateMessageCountersUI();
  });

  // Handler específico para movimientos
  wsManager.onMessage("movement", (message) => {
    updateLastMovement(message);
  });

  // Handler para obstáculos
  wsManager.onMessage("obstacle", (message) => {
    updateObstacleCount();
  });
}

/**
 * Carga datos iniciales
 */
async function loadInitialData() {
  // Verificar salud del servidor
  await checkServerHealth();

  // Cargar información del dispositivo
  await refreshDeviceInfo();

  // Cargar historial
  await refreshHistory();

  // Cargar configuración guardada
  loadSavedSettings();
}

/**
 * Cambia entre las vistas de control y monitor
 * @param {"control"|"monitor"} targetView - Vista objetivo
 */
function switchView(targetView = "control") {
  const view = targetView === "monitor" ? "monitor" : "control";

  const sections = {
    control: DOM.controlView,
    monitor: DOM.monitorView,
  };

  Object.entries(sections).forEach(([name, section]) => {
    if (!section) return;
    const isActive = name === view;
    section.classList.toggle("hidden", !isActive);
    section.setAttribute("aria-hidden", String(!isActive));
  });

  DOM.navTabs.forEach((tab) => {
    const isActive = tab.dataset.viewTarget === view;
    tab.classList.toggle("active", isActive);
  });

  APP_STATE.activeView = view;
}

/**
 * Maneja clic en botones de control
 */
function handleControlButtonClick(event) {
  const button = event.currentTarget;
  const command = button.dataset.command;

  if (!command || !UTILS.isValidCommand(command)) {
    console.error("Comando inválido:", command);
    return;
  }

  // Animación visual
  button.classList.add("button-press");
  setTimeout(() => button.classList.remove("button-press"), 300);

  // Obtener duración
  const duration = parseInt(DOM.durationSlider.value);

  // Enviar comando por WebSocket
  sendCommand(command, duration);
}

/**
 * Envía un comando al carrito
 * @param {string} command - Comando a enviar
 * @param {number} duration - Duración en ms
 */
function sendCommand(command, duration) {
  if (!wsManager.isConnected()) {
    UTILS.showNotification("No hay conexión WebSocket activa", "error");
    return;
  }

  const commandData = {
    command: command,
    duration_ms: duration,
    meta: {
      ui_version: "1.0",
      timestamp: new Date().toISOString(),
    },
  };

  const success = wsManager.sendMovementCommand(commandData);

  if (success) {
    updateCommandCount();

    // Agregar a historial local
    addToLocalHistory({
      command: command,
      duration: duration,
      timestamp: new Date().toISOString(),
      status: "sent",
      origin: "websocket",
    });
  }
}

/**
 * Actualiza la UI de estado de conexión
 * @param {boolean} connected - Estado de conexión
 */
function updateConnectionUI(connected) {
  if (connected) {
    DOM.statusIndicator.className =
      "w-3 h-3 rounded-full bg-green-500 shadow-lg";
    DOM.statusText.textContent = "Conectado";
    DOM.statusText.classList.remove("text-red-400");
    DOM.statusText.classList.add("text-green-400");
  } else {
    DOM.statusIndicator.className =
      "w-3 h-3 rounded-full bg-red-500 animate-pulse";
    DOM.statusText.textContent = "Desconectado";
    DOM.statusText.classList.remove("text-green-400");
    DOM.statusText.classList.add("text-red-400");
  }
}

/**
 * Agrega un mensaje al contenedor de mensajes
 * @param {object} message - Mensaje a agregar
 */
function addMessageToUI(message) {
  // Verificar filtro activo
  if (
    APP_STATE.currentFilter !== "all" &&
    message.type !== APP_STATE.currentFilter
  ) {
    return;
  }

  const messageDiv = document.createElement("div");
  messageDiv.className = `message-card type-${message.type} p-4 rounded-lg slide-in`;

  const icon = CONFIG.MESSAGE_ICONS[message.type] || "fa-info";
  const time = UTILS.formatDate(message.timestamp);

  let content = "";
  if (message.type === "movement") {
    const commandName = UTILS.getCommandDisplayName(
      message.data.command || "unknown"
    );
    content = `<strong>${commandName}</strong>`;
    if (message.data.duration_ms) {
      content += ` (${message.data.duration_ms}ms)`;
    }
  } else if (message.type === "obstacle") {
    content = `<strong>Obstáculo detectado</strong>`;
    if (message.data.meta && message.data.meta.distance_cm) {
      content += ` - Distancia: ${message.data.meta.distance_cm}cm`;
    }
  } else if (message.type === "status") {
    content = `<strong>Actualización de estado</strong>`;
  } else {
    content = JSON.stringify(message.data);
  }

  messageDiv.innerHTML = `
        <div class="flex items-start space-x-3">
            <i class="fas ${icon} text-xl mt-1"></i>
            <div class="flex-1">
                <div class="flex justify-between items-start">
                    <p class="text-sm">${content}</p>
                    <span class="text-xs text-gray-400 ml-2">${time}</span>
                </div>
            </div>
        </div>
    `;

  // Limpiar mensaje placeholder si existe
  if (DOM.messagesContainer.querySelector(".text-center")) {
    DOM.messagesContainer.innerHTML = "";
  }

  DOM.messagesContainer.insertBefore(
    messageDiv,
    DOM.messagesContainer.firstChild
  );

  // Limitar número de mensajes
  while (DOM.messagesContainer.children.length > CONFIG.MAX_MESSAGES) {
    DOM.messagesContainer.removeChild(DOM.messagesContainer.lastChild);
  }
}

/**
 * Actualiza el último movimiento mostrado
 * @param {object} message - Mensaje de movimiento
 */
function updateLastMovement(message) {
  const commandName = UTILS.getCommandDisplayName(
    message.data.command || "unknown"
  );
  const time = UTILS.formatDate(message.timestamp);

  if (!DOM.lastMovement) return;

  DOM.lastMovement.innerHTML = `
        <div class="space-y-2">
            <div class="flex justify-between">
                <span class="text-gray-400 text-sm">Comando:</span>
                <span class="font-semibold text-green-400">${commandName}</span>
            </div>
            <div class="flex justify-between">
                <span class="text-gray-400 text-sm">Hora:</span>
                <span class="text-sm">${time}</span>
            </div>
            ${
              message.data.duration_ms
                ? `
            <div class="flex justify-between">
                <span class="text-gray-400 text-sm">Duración:</span>
                <span class="text-sm">${message.data.duration_ms}ms</span>
            </div>
            `
                : ""
            }
        </div>
    `;
}

/**
 * Actualiza el contador de comandos
 */
function updateCommandCount() {
  DOM.commandCount.textContent = APP_STATE.commandCount;
}

/**
 * Actualiza el contador de obstáculos
 */
function updateObstacleCount() {
  DOM.obstacleCount.textContent = APP_STATE.obstacleCount;
}

/**
 * Refresca los contadores de mensajes en la vista de telemetría
 */
function updateMessageCountersUI() {
  if (!DOM.messagesTotal) return;

  const counters = APP_STATE.messages.reduce(
    (acc, message) => {
      acc.total += 1;
      switch (message.type) {
        case CONFIG.EVENT_TYPES.MOVEMENT:
          acc.movement += 1;
          break;
        case CONFIG.EVENT_TYPES.OBSTACLE:
          acc.obstacle += 1;
          break;
        case CONFIG.EVENT_TYPES.STATUS:
          acc.status += 1;
          break;
        case CONFIG.EVENT_TYPES.SYSTEM:
        default:
          acc.system += 1;
          break;
      }
      return acc;
    },
    { total: 0, movement: 0, obstacle: 0, status: 0, system: 0 }
  );

  DOM.messagesTotal.textContent = counters.total;
  DOM.messagesMovement.textContent = counters.movement;
  DOM.messagesObstacle.textContent = counters.obstacle;
  DOM.messagesStatus.textContent = counters.status;
  DOM.messagesSystem.textContent = counters.system;
}

/**
 * Limpia todos los mensajes
 */
function clearMessages() {
  APP_STATE.messages = [];
  DOM.messagesContainer.innerHTML = `
        <div class="text-center text-gray-500 py-8">
            <i class="fas fa-inbox text-4xl mb-2"></i>
            <p>No hay mensajes</p>
        </div>
    `;
  updateMessageCountersUI();
  UTILS.showNotification("Mensajes limpiados", "info");
}

/**
 * Maneja clic en filtros de mensajes
 */
function handleFilterClick(event) {
  const filter = event.currentTarget;
  const filterType = filter.dataset.filter;

  // Actualizar clases activas
  DOM.messageFilters.forEach((f) => f.classList.remove("active"));
  filter.classList.add("active");

  // Actualizar filtro actual
  APP_STATE.currentFilter = filterType;

  // Recargar mensajes con filtro
  reloadMessages();
}

/**
 * Recarga mensajes aplicando el filtro actual
 */
function reloadMessages() {
  DOM.messagesContainer.innerHTML = "";

  const filteredMessages =
    APP_STATE.currentFilter === "all"
      ? APP_STATE.messages
      : APP_STATE.messages.filter((m) => m.type === APP_STATE.currentFilter);

  if (filteredMessages.length === 0) {
    DOM.messagesContainer.innerHTML = `
            <div class="text-center text-gray-500 py-8">
                <i class="fas fa-inbox text-4xl mb-2"></i>
                <p>No hay mensajes de este tipo</p>
            </div>
        `;
  } else {
    filteredMessages.forEach((message) => addMessageToUI(message));
  }
}

/**
 * Refresca información del dispositivo
 */
async function refreshDeviceInfo() {
  try {
    const device = await getCurrentDeviceInfo();

    if (device) {
      DOM.deviceInfo.innerHTML = `
                <div class="space-y-2">
                    <div class="flex justify-between">
                        <span class="text-gray-400 text-sm">Nombre:</span>
                        <span class="font-semibold">${device.device_name}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-400 text-sm">IP:</span>
                        <span class="text-sm">${device.client_ip}</span>
                    </div>
                    ${
                      device.country
                        ? `
                    <div class="flex justify-between">
                        <span class="text-gray-400 text-sm">Ubicación:</span>
                        <span class="text-sm">${device.city}, ${device.country}</span>
                    </div>
                    `
                        : ""
                    }
                </div>
            `;
    } else {
      DOM.deviceInfo.innerHTML =
        '<p class="text-yellow-400 text-sm">Dispositivo no encontrado</p>';
    }
  } catch (error) {
    console.error("Error refrescando dispositivo:", error);
    DOM.deviceInfo.innerHTML =
      '<p class="text-red-400 text-sm">Error al cargar</p>';
  }
}

/**
 * Refresca el historial de movimientos
 */
async function refreshHistory() {
  try {
    const events = await getDeviceHistory(CONFIG.MAX_HISTORY_ITEMS);

    if (events.length === 0) {
      DOM.historyTable.innerHTML = `
                <tr>
                    <td colspan="5" class="px-4 py-8 text-center text-gray-500">
                        <i class="fas fa-folder-open text-3xl mb-2"></i>
                        <p>No hay historial disponible</p>
                    </td>
                </tr>
            `;
      return;
    }

    DOM.historyTable.innerHTML = events
      .map(
        (event) => `
            <tr class="hover:bg-gray-800 transition">
                <td class="px-4 py-3 text-xs">${UTILS.formatFullDate(
                  event.event_ts
                )}</td>
                <td class="px-4 py-3">
                    <span class="px-2 py-1 bg-blue-600 rounded text-xs">
                        ${event.status_description || event.status_clave}
                    </span>
                </td>
                <td class="px-4 py-3 text-xs">${
                  event.meta?.duration_ms || "-"
                } ms</td>
                <td class="px-4 py-3">
                    <span class="px-2 py-1 bg-green-600 rounded text-xs">Completado</span>
                </td>
                <td class="px-4 py-3 text-xs">${
                  event.meta?.origin || "N/A"
                }</td>
            </tr>
        `
      )
      .join("");

    UTILS.showNotification("Historial actualizado", "success");
  } catch (error) {
    console.error("Error refrescando historial:", error);
    UTILS.showNotification("Error al cargar historial", "error");
  }
}

/**
 * Agrega un evento al historial local
 */
function addToLocalHistory(event) {
  APP_STATE.history.unshift(event);
  if (APP_STATE.history.length > CONFIG.MAX_HISTORY_ITEMS) {
    APP_STATE.history.pop();
  }
}

/**
 * Cambia el dispositivo activo
 */
function changeDevice(newDeviceId) {
  console.log(`🔄 Cambiando a dispositivo ${newDeviceId}`);

  // Desregistrar dispositivo anterior
  if (wsManager.isConnected()) {
    wsManager.unregisterDevice(APP_STATE.currentDeviceId);
  }

  // Actualizar ID
  APP_STATE.currentDeviceId = newDeviceId;

  // Registrar nuevo dispositivo
  if (wsManager.isConnected()) {
    wsManager.registerDevice(newDeviceId);
  }

  // Recargar datos
  refreshDeviceInfo();
  refreshHistory();

  // Guardar en configuración
  saveCurrentDevice();
}

/**
 * Inicia el temporizador de sesión
 */
function startSessionTimer() {
  APP_STATE.sessionStartTime = new Date();

  setInterval(() => {
    const elapsed = UTILS.getElapsedTime(APP_STATE.sessionStartTime);
    DOM.sessionTime.textContent = elapsed;
  }, 1000);
}

/**
 * Abre el modal de configuración
 */
function openSettingsModal() {
  DOM.settingsModal.classList.remove("hidden");
  DOM.settingsModal.classList.add("flex");

  // Cargar valores actuales
  DOM.serverUrlInput.value = CONFIG.API_BASE_URL;
  DOM.autoReconnectCheckbox.checked = APP_STATE.autoReconnect;
}

/**
 * Cierra el modal de configuración
 */
function closeSettingsModal() {
  DOM.settingsModal.classList.add("hidden");
  DOM.settingsModal.classList.remove("flex");
}

/**
 * Guarda la configuración
 */
function saveSettings() {
  const newUrl = DOM.serverUrlInput.value.trim();
  const autoReconnect = DOM.autoReconnectCheckbox.checked;

  // Actualizar configuración
  CONFIG.API_BASE_URL = newUrl;
  CONFIG.WEBSOCKET_URL = newUrl;
  APP_STATE.autoReconnect = autoReconnect;

  // Guardar en localStorage
  UTILS.saveToStorage("carrito_iot_config", {
    serverUrl: newUrl,
    deviceId: APP_STATE.currentDeviceId,
    autoReconnect: autoReconnect,
  });

  // Reconectar WebSocket
  wsManager.reconnect();

  closeSettingsModal();
  UTILS.showNotification("Configuración guardada", "success");
}

/**
 * Carga configuración guardada
 */
function loadSavedSettings() {
  const config = UTILS.getFromStorage("carrito_iot_config");
  if (config) {
    if (config.deviceId) {
      DOM.deviceIdInput.value = config.deviceId;
    }
  }
}

/**
 * Guarda el dispositivo actual
 */
function saveCurrentDevice() {
  const config = UTILS.getFromStorage("carrito_iot_config") || {};
  config.deviceId = APP_STATE.currentDeviceId;
  UTILS.saveToStorage("carrito_iot_config", config);
}

/**
 * Maneja atajos de teclado
 */
function handleKeyboardShortcuts(event) {
  // Solo si no estamos en un input
  if (event.target.tagName === "INPUT") return;

  switch (event.key.toLowerCase()) {
    case "w":
    case "arrowup":
      event.preventDefault();
      sendCommand(CONFIG.COMMANDS.FORWARD, parseInt(DOM.durationSlider.value));
      break;
    case "s":
    case "arrowdown":
      event.preventDefault();
      sendCommand(CONFIG.COMMANDS.BACKWARD, parseInt(DOM.durationSlider.value));
      break;
    case "a":
    case "arrowleft":
      event.preventDefault();
      sendCommand(CONFIG.COMMANDS.LEFT, parseInt(DOM.durationSlider.value));
      break;
    case "d":
    case "arrowright":
      event.preventDefault();
      sendCommand(CONFIG.COMMANDS.RIGHT, parseInt(DOM.durationSlider.value));
      break;
    case " ":
    case "escape":
      event.preventDefault();
      sendCommand(CONFIG.COMMANDS.STOP, 100);
      break;
  }
}

console.log("✅ App.js cargado completamente");
