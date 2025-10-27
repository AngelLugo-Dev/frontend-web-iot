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

  // Demos y simulación
  demoSquareBtn: null,
  demoCircleBtn: null,
  demoZigzagBtn: null,
  simulateObstacleBtn: null,
  demoStatus: null,
  demoStatusText: null,

  // Constructor de secuencias
  sequenceCommandSelect: null,
  sequenceDurationInput: null,
  addToSequenceBtn: null,
  sequenceList: null,
  sequenceCount: null,
  clearSequenceBtn: null,
  executeSequenceBtn: null,
  saveSequenceBtn: null,
  loadDemoBtns: null,

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

  // Demos y simulación
  DOM.demoSquareBtn = document.getElementById("demoSquareBtn");
  DOM.demoCircleBtn = document.getElementById("demoCircleBtn");
  DOM.demoZigzagBtn = document.getElementById("demoZigzagBtn");
  DOM.simulateObstacleBtn = document.getElementById("simulateObstacleBtn");
  DOM.demoStatus = document.getElementById("demoStatus");
  DOM.demoStatusText = document.getElementById("demoStatusText");

  // Constructor de secuencias
  DOM.sequenceCommandSelect = document.getElementById("sequenceCommandSelect");
  DOM.sequenceDurationInput = document.getElementById("sequenceDurationInput");
  DOM.addToSequenceBtn = document.getElementById("addToSequenceBtn");
  DOM.sequenceList = document.getElementById("sequenceList");
  DOM.sequenceCount = document.getElementById("sequenceCount");
  DOM.clearSequenceBtn = document.getElementById("clearSequenceBtn");
  DOM.executeSequenceBtn = document.getElementById("executeSequenceBtn");
  DOM.saveSequenceBtn = document.getElementById("saveSequenceBtn");
  DOM.loadDemoBtns = document.querySelectorAll(".load-demo-btn");

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

  // Constructor de secuencias
  DOM.addToSequenceBtn.addEventListener("click", addMovementToSequence);
  DOM.clearSequenceBtn.addEventListener("click", clearSequence);
  DOM.executeSequenceBtn.addEventListener("click", executeCustomSequence);
  DOM.saveSequenceBtn.addEventListener("click", saveCustomSequence);

  // Cargar demos predefinidos
  DOM.loadDemoBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const demoType = btn.dataset.demo;
      loadPredefinedDemo(demoType);
    });
  });

  // Simulación de obstáculos
  DOM.simulateObstacleBtn.addEventListener("click", simulateObstacle);

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

// ========================================
// CONSTRUCTOR DE SECUENCIAS PERSONALIZADAS
// ========================================

/**
 * Agrega un movimiento a la secuencia personalizada
 */
function addMovementToSequence() {
  const command = DOM.sequenceCommandSelect.value;
  const duration = parseInt(DOM.sequenceDurationInput.value);

  if (!UTILS.isValidCommand(command)) {
    UTILS.showNotification("Comando inválido", "error");
    return;
  }

  if (duration < 100 || duration > 10000) {
    UTILS.showNotification(
      "Duración debe estar entre 100 y 10000 ms",
      "warning"
    );
    return;
  }

  // Agregar a la secuencia
  const movement = {
    id: UTILS.generateId(),
    command: command,
    duration: duration,
    description: UTILS.getCommandDisplayName(command),
  };

  APP_STATE.customSequence.push(movement);

  // Actualizar UI
  renderSequenceList();
  updateSequenceControls();

  UTILS.showNotification(`Agregado: ${movement.description}`, "success");
}

/**
 * Renderiza la lista de movimientos en la secuencia
 */
function renderSequenceList() {
  if (APP_STATE.customSequence.length === 0) {
    DOM.sequenceList.innerHTML = `
      <div class="text-center text-gray-500 text-xs py-4">
        <i class="fas fa-list text-2xl mb-2"></i>
        <p>Sin movimientos. Agrega uno arriba.</p>
      </div>
    `;
    DOM.sequenceCount.textContent = "0";
    return;
  }

  DOM.sequenceCount.textContent = APP_STATE.customSequence.length;

  DOM.sequenceList.innerHTML = APP_STATE.customSequence
    .map(
      (movement, index) => `
    <div class="flex items-center justify-between bg-gray-800 rounded px-3 py-2 text-xs hover:bg-gray-750 transition group">
      <div class="flex items-center gap-2 flex-1">
        <span class="text-gray-500 font-mono">${index + 1}.</span>
        <span class="font-semibold text-blue-300">${movement.description}</span>
        <span class="text-gray-400">${movement.duration}ms</span>
      </div>
      <button 
        class="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition"
        onclick="removeMovementFromSequence('${movement.id}')"
        type="button"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>
  `
    )
    .join("");
}

/**
 * Elimina un movimiento de la secuencia
 * @param {string} movementId - ID del movimiento a eliminar
 */
function removeMovementFromSequence(movementId) {
  APP_STATE.customSequence = APP_STATE.customSequence.filter(
    (m) => m.id !== movementId
  );
  renderSequenceList();
  updateSequenceControls();
  UTILS.showNotification("Movimiento eliminado", "info");
}

/**
 * Limpia toda la secuencia
 */
function clearSequence() {
  if (APP_STATE.customSequence.length === 0) return;

  APP_STATE.customSequence = [];
  renderSequenceList();
  updateSequenceControls();
  UTILS.showNotification("Secuencia limpiada", "info");
}

/**
 * Actualiza el estado de los controles según la secuencia
 */
function updateSequenceControls() {
  const hasMovements = APP_STATE.customSequence.length > 0;

  DOM.executeSequenceBtn.disabled = !hasMovements;
  DOM.saveSequenceBtn.disabled = !hasMovements;

  if (hasMovements) {
    DOM.executeSequenceBtn.classList.remove("opacity-50", "cursor-not-allowed");
    DOM.saveSequenceBtn.classList.remove("opacity-50", "cursor-not-allowed");
  } else {
    DOM.executeSequenceBtn.classList.add("opacity-50", "cursor-not-allowed");
    DOM.saveSequenceBtn.classList.add("opacity-50", "cursor-not-allowed");
  }
}

/**
 * Ejecuta la secuencia personalizada
 */
async function executeCustomSequence() {
  if (APP_STATE.customSequence.length === 0) {
    UTILS.showNotification("La secuencia está vacía", "warning");
    return;
  }

  if (!wsManager.isConnected()) {
    UTILS.showNotification("No hay conexión WebSocket activa", "error");
    return;
  }

  // Mostrar estado
  DOM.demoStatus.classList.remove("hidden");
  DOM.demoStatusText.textContent = "Ejecutando secuencia personalizada...";

  // Deshabilitar controles
  disableSequenceControls(true);

  try {
    UTILS.showNotification("Iniciando secuencia personalizada", "info");

    for (let i = 0; i < APP_STATE.customSequence.length; i++) {
      const movement = APP_STATE.customSequence[i];

      DOM.demoStatusText.textContent = `Paso ${i + 1}/${
        APP_STATE.customSequence.length
      }: ${movement.description}`;

      // Enviar comando
      sendCommand(movement.command, movement.duration);

      // Esperar a que termine el movimiento + buffer
      await sleep(movement.duration + 200);
    }

    UTILS.showNotification("Secuencia completada exitosamente", "success");
  } catch (error) {
    console.error("Error ejecutando secuencia:", error);
    UTILS.showNotification("Error en la secuencia", "error");
  } finally {
    // Ocultar estado y rehabilitar controles
    DOM.demoStatus.classList.add("hidden");
    disableSequenceControls(false);
  }
}

/**
 * Guarda la secuencia personalizada en localStorage
 */
function saveCustomSequence() {
  if (APP_STATE.customSequence.length === 0) {
    UTILS.showNotification("La secuencia está vacía", "warning");
    return;
  }

  const sequenceName = prompt(
    "Nombre para la secuencia:",
    `Secuencia ${Object.keys(APP_STATE.savedSequences).length + 1}`
  );

  if (!sequenceName) return;

  // Guardar en estado y localStorage
  APP_STATE.savedSequences[sequenceName] = [...APP_STATE.customSequence];

  UTILS.saveToStorage("carrito_iot_sequences", APP_STATE.savedSequences);

  UTILS.showNotification(`Secuencia "${sequenceName}" guardada`, "success");
}

/**
 * Carga una demo predefinida en el constructor
 * @param {string} demoType - Tipo de demo: 'square', 'circle', 'zigzag'
 */
function loadPredefinedDemo(demoType) {
  const predefinedSequences = {
    square: [
      { command: "forward", duration: 2000, description: "Adelante" },
      { command: "right", duration: 500, description: "Giro derecha" },
      { command: "forward", duration: 2000, description: "Adelante" },
      { command: "right", duration: 500, description: "Giro derecha" },
      { command: "forward", duration: 2000, description: "Adelante" },
      { command: "right", duration: 500, description: "Giro derecha" },
      { command: "forward", duration: 2000, description: "Adelante" },
      { command: "right", duration: 500, description: "Giro derecha" },
    ],
    circle: [
      { command: "forward_right", duration: 1000, description: "Curva 1/8" },
      { command: "forward_right", duration: 1000, description: "Curva 2/8" },
      { command: "forward_right", duration: 1000, description: "Curva 3/8" },
      { command: "forward_right", duration: 1000, description: "Curva 4/8" },
      { command: "forward_right", duration: 1000, description: "Curva 5/8" },
      { command: "forward_right", duration: 1000, description: "Curva 6/8" },
      { command: "forward_right", duration: 1000, description: "Curva 7/8" },
      { command: "forward_right", duration: 1000, description: "Curva 8/8" },
    ],
    zigzag: [
      { command: "forward", duration: 1000, description: "Adelante" },
      { command: "right", duration: 300, description: "Giro derecha" },
      { command: "forward", duration: 1000, description: "Adelante" },
      { command: "left", duration: 600, description: "Giro izquierda" },
      { command: "forward", duration: 1000, description: "Adelante" },
      { command: "right", duration: 600, description: "Giro derecha" },
      { command: "forward", duration: 1000, description: "Adelante" },
      { command: "left", duration: 300, description: "Giro izquierda" },
    ],
  };

  const sequence = predefinedSequences[demoType];
  if (!sequence) {
    UTILS.showNotification("Demo no encontrado", "error");
    return;
  }

  // Limpiar secuencia actual
  APP_STATE.customSequence = [];

  // Cargar demo con IDs únicos
  sequence.forEach((movement) => {
    APP_STATE.customSequence.push({
      id: UTILS.generateId(),
      command: movement.command,
      duration: movement.duration,
      description: UTILS.getCommandDisplayName(movement.command),
    });
  });

  // Actualizar UI
  renderSequenceList();
  updateSequenceControls();

  UTILS.showNotification(
    `Demo "${demoType}" cargado (${sequence.length} pasos)`,
    "success"
  );
}

/**
 * Habilita/deshabilita controles de secuencia
 * @param {boolean} disabled - Estado a aplicar
 */
function disableSequenceControls(disabled) {
  DOM.addToSequenceBtn.disabled = disabled;
  DOM.clearSequenceBtn.disabled = disabled;
  DOM.executeSequenceBtn.disabled = disabled;
  DOM.saveSequenceBtn.disabled = disabled;
  DOM.simulateObstacleBtn.disabled = disabled;

  const buttons = [
    DOM.addToSequenceBtn,
    DOM.clearSequenceBtn,
    DOM.executeSequenceBtn,
    DOM.saveSequenceBtn,
    DOM.simulateObstacleBtn,
    ...DOM.loadDemoBtns,
  ];

  buttons.forEach((btn) => {
    if (disabled) {
      btn.classList.add("opacity-50", "cursor-not-allowed");
    } else {
      btn.classList.remove("opacity-50", "cursor-not-allowed");
    }
  });
}

// ========================================
// DEMOS Y SIMULACIÓN (LEGACY)
// ========================================

/**
 * Ejecuta una secuencia de movimientos predefinida (demo)
 * NOTA: Esta función se mantiene por compatibilidad pero ahora se usa loadPredefinedDemo
 * @param {string} sequenceType - Tipo de secuencia: 'square', 'circle', 'zigzag'
 */
async function executeDemoSequence(sequenceType) {
  const sequences = {
    square: [
      { command: "forward", duration: 2000, description: "Adelante" },
      { command: "right", duration: 500, description: "Giro derecha" },
      { command: "forward", duration: 2000, description: "Adelante" },
      { command: "right", duration: 500, description: "Giro derecha" },
      { command: "forward", duration: 2000, description: "Adelante" },
      { command: "right", duration: 500, description: "Giro derecha" },
      { command: "forward", duration: 2000, description: "Adelante" },
      { command: "right", duration: 500, description: "Giro derecha" },
    ],
    circle: [
      { command: "forward_right", duration: 1000, description: "Curva 1/8" },
      { command: "forward_right", duration: 1000, description: "Curva 2/8" },
      { command: "forward_right", duration: 1000, description: "Curva 3/8" },
      { command: "forward_right", duration: 1000, description: "Curva 4/8" },
      { command: "forward_right", duration: 1000, description: "Curva 5/8" },
      { command: "forward_right", duration: 1000, description: "Curva 6/8" },
      { command: "forward_right", duration: 1000, description: "Curva 7/8" },
      { command: "forward_right", duration: 1000, description: "Curva 8/8" },
    ],
    zigzag: [
      { command: "forward", duration: 1000, description: "Adelante" },
      { command: "right", duration: 300, description: "Giro derecha" },
      { command: "forward", duration: 1000, description: "Adelante" },
      { command: "left", duration: 600, description: "Giro izquierda" },
      { command: "forward", duration: 1000, description: "Adelante" },
      { command: "right", duration: 600, description: "Giro derecha" },
      { command: "forward", duration: 1000, description: "Adelante" },
      { command: "left", duration: 300, description: "Giro izquierda" },
    ],
  };

  const sequence = sequences[sequenceType];
  if (!sequence) {
    UTILS.showNotification("Secuencia no encontrada", "error");
    return;
  }

  // Verificar conexión
  if (!wsManager.isConnected()) {
    UTILS.showNotification("No hay conexión WebSocket activa", "error");
    return;
  }

  // Mostrar estado
  DOM.demoStatus.classList.remove("hidden");
  DOM.demoStatusText.textContent = `Ejecutando demo: ${sequenceType}`;

  // Deshabilitar botones de demo durante la ejecución
  disableDemoButtons(true);

  try {
    UTILS.showNotification(`Iniciando demo: ${sequenceType}`, "info");

    for (let i = 0; i < sequence.length; i++) {
      const step = sequence[i];

      DOM.demoStatusText.textContent = `${sequenceType} - Paso ${i + 1}/${
        sequence.length
      }: ${step.description}`;

      // Enviar comando
      sendCommand(step.command, step.duration);

      // Esperar a que termine el movimiento + pequeño buffer
      await sleep(step.duration + 200);
    }

    UTILS.showNotification(`Demo ${sequenceType} completada`, "success");
  } catch (error) {
    console.error("Error ejecutando demo:", error);
    UTILS.showNotification("Error en la demo", "error");
  } finally {
    // Ocultar estado y rehabilitar botones
    DOM.demoStatus.classList.add("hidden");
    disableDemoButtons(false);
  }
}

/**
 * Simula un obstáculo enviando una alerta al backend (solo para desarrollo)
 */
async function simulateObstacle() {
  if (!wsManager.isConnected()) {
    UTILS.showNotification("No hay conexión WebSocket activa", "error");
    return;
  }

  try {
    UTILS.showNotification("Simulando obstáculo...", "warning");

    // Enviar simulación vía fetch async/await
    const response = await fetch(
      `${CONFIG.API_BASE_URL}/api/simulate/obstacle`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          device_id: APP_STATE.currentDeviceId,
          distance_cm: Math.floor(Math.random() * 30) + 5, // 5-35 cm
          timestamp: new Date().toISOString(),
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Simulación de obstáculo:", data);

    UTILS.showNotification("Obstáculo simulado correctamente", "success");
  } catch (error) {
    console.error("Error simulando obstáculo:", error);
    UTILS.showNotification("Error al simular obstáculo", "error");
  }
}

/**
 * Habilita/deshabilita botones de demo
 * @param {boolean} disabled - Estado a aplicar
 */
function disableDemoButtons(disabled) {
  // Esta función ahora está deprecada y se usa disableSequenceControls
  disableSequenceControls(disabled);
}

/**
 * Utilidad para crear pausas asíncronas
 * @param {number} ms - Milisegundos a esperar
 * @returns {Promise} Promesa que se resuelve después del tiempo especificado
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

console.log("✅ App.js cargado completamente");
