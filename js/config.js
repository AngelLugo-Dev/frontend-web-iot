/**
 * Configuración Global de la Aplicación
 * Define constantes y configuraciones para la aplicación CarroIoT
 *
 * 🔧 INSTRUCCIONES DE CONFIGURACIÓN:
 * 1. Para desarrollo local: deja localhost:5500
 * 2. Para producción (GitHub Pages): cambia a la IP pública de tu EC2
 *
 * 📍 DÓNDE OBTENER LA IP DE TU EC2:
 *    AWS Console → EC2 → Instances → Tu instancia → Public IPv4 address
 *    Ejemplo: 54.123.45.67
 *
 * ⚠️ ANTES DE SUBIR A GITHUB:
 *    - Descomenta las líneas de PRODUCCIÓN
 *    - Comenta las líneas de localhost
 *    - Reemplaza 54.123.45.67 con TU IP real de EC2
 */

// ====================================================================
// CONFIGURACIÓN DEL SERVIDOR BACKEND
// ====================================================================

const CONFIG = {
  // 🔹 DESARROLLO LOCAL (probando en tu PC):
  // API_BASE_URL: "http://localhost:5500",
  // WEBSOCKET_URL: "http://localhost:5500",

  // 🔹 PRODUCCIÓN (GitHub Pages + EC2):
  API_BASE_URL: "http://54.204.39.238:5500",
  WEBSOCKET_URL: "http://54.204.39.238:5500",

  // 🔹 Con DOMINIO y HTTPS (futuro):
  // API_BASE_URL: "https://api.carrito-iot.com",
  // WEBSOCKET_URL: "wss://api.carrito-iot.com",

  // Configuración de WebSocket
  WEBSOCKET_CONFIG: {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    transports: ["websocket", "polling"],
  },

  // Configuración de dispositivo por defecto
  DEFAULT_DEVICE_ID: 1,

  // Duración por defecto de movimientos (ms)
  DEFAULT_DURATION: 1000,

  // Límite de mensajes en el panel PUSH
  MAX_MESSAGES: 100,

  // Límite de historial
  MAX_HISTORY_ITEMS: 50,

  // Intervalo de actualización automática (ms)
  AUTO_REFRESH_INTERVAL: 5000,

  // Comandos de movimiento disponibles
  COMMANDS: {
    FORWARD: "forward",
    BACKWARD: "backward",
    LEFT: "left",
    RIGHT: "right",
    STOP: "stop",
    ROTATE_LEFT: "rotate_left",
    ROTATE_RIGHT: "rotate_right",
    FORWARD_LEFT: "forward_left",
    FORWARD_RIGHT: "forward_right",
    BACKWARD_LEFT: "backward_left",
    BACKWARD_RIGHT: "backward_right",
  },

  // Tipos de eventos
  EVENT_TYPES: {
    MOVEMENT: "movement",
    OBSTACLE: "obstacle",
    STATUS: "status",
    SYSTEM: "system",
  },

  // Colores para diferentes tipos de mensajes
  MESSAGE_COLORS: {
    movement: "border-blue-500",
    obstacle: "border-red-500",
    status: "border-green-500",
    system: "border-purple-500",
  },

  // Iconos para diferentes tipos de mensajes
  MESSAGE_ICONS: {
    movement: "fa-arrow-right",
    obstacle: "fa-exclamation-triangle",
    status: "fa-info-circle",
    system: "fa-cog",
  },

  // Configuración de notificaciones
  NOTIFICATIONS: {
    DURATION: 3000, // Duración en ms
    POSITION: "bottom-right",
  },
};

// Estado global de la aplicación
const APP_STATE = {
  connected: false,
  currentDeviceId: CONFIG.DEFAULT_DEVICE_ID,
  sessionStartTime: null,
  commandCount: 0,
  obstacleCount: 0,
  currentFilter: "all",
  messages: [],
  history: [],
  autoReconnect: true,
  activeView: "control",
  customSequence: [], // Secuencia de movimientos personalizada
  savedSequences: {}, // Secuencias guardadas por nombre
};

// Utilidades globales
const UTILS = {
  /**
   * Formatea una fecha a string legible
   * @param {Date|string} date - Fecha a formatear
   * @returns {string} Fecha formateada
   */
  formatDate: (date) => {
    const d = new Date(date);
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const seconds = String(d.getSeconds()).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  },

  /**
   * Formatea una fecha completa
   * @param {Date|string} date - Fecha a formatear
   * @returns {string} Fecha completa formateada
   */
  formatFullDate: (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  },

  /**
   * Calcula el tiempo transcurrido desde una fecha
   * @param {Date|string} startDate - Fecha de inicio
   * @returns {string} Tiempo transcurrido en formato MM:SS
   */
  getElapsedTime: (startDate) => {
    if (!startDate) return "00:00";
    const now = new Date();
    const start = new Date(startDate);
    const diff = Math.floor((now - start) / 1000);
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  },

  /**
   * Genera un ID único
   * @returns {string} ID único
   */
  generateId: () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Guarda datos en localStorage
   * @param {string} key - Clave
   * @param {any} value - Valor
   */
  saveToStorage: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  },

  /**
   * Obtiene datos de localStorage
   * @param {string} key - Clave
   * @param {any} defaultValue - Valor por defecto
   * @returns {any} Valor almacenado o valor por defecto
   */
  getFromStorage: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return defaultValue;
    }
  },

  /**
   * Limpia localStorage
   * @param {string} key - Clave a eliminar (opcional)
   */
  clearStorage: (key = null) => {
    try {
      if (key) {
        localStorage.removeItem(key);
      } else {
        localStorage.clear();
      }
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  },

  /**
   * Muestra una notificación toast
   * @param {string} message - Mensaje
   * @param {string} type - Tipo (success, error, warning, info)
   */
  showNotification: (message, type = "info") => {
    const toast = document.createElement("div");
    toast.className = `toast ${type} fade-in`;

    const icon =
      {
        success: "fa-check-circle",
        error: "fa-times-circle",
        warning: "fa-exclamation-triangle",
        info: "fa-info-circle",
      }[type] || "fa-info-circle";

    toast.innerHTML = `
            <div class="flex items-center space-x-3">
                <i class="fas ${icon} text-xl"></i>
                <span>${message}</span>
            </div>
        `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, CONFIG.NOTIFICATIONS.DURATION);
  },

  /**
   * Valida un comando de movimiento
   * @param {string} command - Comando a validar
   * @returns {boolean} true si es válido
   */
  isValidCommand: (command) => {
    return Object.values(CONFIG.COMMANDS).includes(command);
  },

  /**
   * Obtiene el nombre legible de un comando
   * @param {string} command - Comando
   * @returns {string} Nombre legible
   */
  getCommandDisplayName: (command) => {
    const names = {
      forward: "Adelante",
      backward: "Atrás",
      left: "Izquierda",
      right: "Derecha",
      stop: "Detener",
      rotate_left: "Giro 360° Izquierda",
      rotate_right: "Giro 360° Derecha",
      forward_left: "Adelante + Izquierda",
      forward_right: "Adelante + Derecha",
      backward_left: "Atrás + Izquierda",
      backward_right: "Atrás + Derecha",
    };
    return names[command] || command;
  },

  /**
   * Debounce function para limitar ejecuciones
   * @param {Function} func - Función a ejecutar
   * @param {number} wait - Tiempo de espera en ms
   * @returns {Function} Función con debounce
   */
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
};

// Cargar configuración guardada
(() => {
  const savedConfig = UTILS.getFromStorage("carrito_iot_config");
  if (savedConfig) {
    if (savedConfig.serverUrl) {
      CONFIG.API_BASE_URL = savedConfig.serverUrl;
      CONFIG.WEBSOCKET_URL = savedConfig.serverUrl;
    }
    if (savedConfig.deviceId) {
      APP_STATE.currentDeviceId = savedConfig.deviceId;
    }
    if (typeof savedConfig.autoReconnect !== "undefined") {
      APP_STATE.autoReconnect = savedConfig.autoReconnect;
    }
  }
})();

console.log("✅ Configuración cargada:", CONFIG);
