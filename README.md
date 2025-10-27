# CarroIoT - Frontend Web

Aplicación web para control remoto de carrito IoT en tiempo real. Interfaz moderna con Tailwind CSS, comunicación WebSocket bidireccional y API REST.

## 🚀 Características

- **Interfaz Moderna**: Diseñada con Tailwind CSS v3.4.0
- **WebSocket PUSH**: Comunicación bidireccional en tiempo real
- **API REST**: Integración completa con backend Flask
- **Responsive**: Adaptable a cualquier dispositivo
- **Tiempo Real**: Visualización de mensajes PUSH instantáneos
- **Control Intuitivo**: Panel de control basado en diseño proporcionado
- **Historial**: Registro de todos los movimientos ejecutados
- **GitHub Pages Ready**: Lista para desplegar en GitHub Pages

## 📁 Estructura del Proyecto

```
frontend-web/
├── index.html                  # Página principal
├── css/
│   └── styles.css             # Estilos personalizados
├── js/
│   ├── config.js              # Configuración global
│   ├── websocket.js           # Gestor WebSocket
│   ├── api.js                 # Cliente API REST
│   └── app.js                 # Lógica principal
├── assets/                     # Recursos (imágenes, iconos)
└── README.md                   # Este archivo
```

## 🔧 Instalación y Configuración

### Opción 1: Servidor Local Simple

```bash
# Navegar a la carpeta
cd frontend-web

# Opción A: Python
python -m http.server 8000

# Opción B: Node.js (si tienes http-server instalado)
npx http-server -p 8000

# Opción C: VS Code Live Server
# Instalar extensión "Live Server" y hacer clic derecho > "Open with Live Server"
```

Abrir navegador en: `http://localhost:8000`

### Opción 2: GitHub Pages

1. **Subir a GitHub:**

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/tu-usuario/carrito-iot-frontend.git
git push -u origin main
```

2. **Activar GitHub Pages:**

   - Ir a Settings > Pages
   - Source: Deploy from branch
   - Branch: main / (root)
   - Save

3. **Acceder en:** `https://tu-usuario.github.io/carrito-iot-frontend/`

## ⚙️ Configuración

### Cambiar URL del Backend

Editar `js/config.js`:

```javascript
const CONFIG = {
  API_BASE_URL: "http://tu-servidor-ec2.amazonaws.com:5500",
  WEBSOCKET_URL: "http://tu-servidor-ec2.amazonaws.com:5500",
  // ...
};
```

O usar el botón de configuración en la interfaz (⚙️).

### Variables Configurables

En `js/config.js`:

```javascript
// ID del dispositivo por defecto
DEFAULT_DEVICE_ID: 1,

// Duración por defecto de movimientos (ms)
DEFAULT_DURATION: 1000,

// Límite de mensajes en el panel PUSH
MAX_MESSAGES: 100,

// Intervalo de actualización automática (ms)
AUTO_REFRESH_INTERVAL: 5000
```

## 🎮 Uso de la Interfaz

### Panel de Control

La interfaz incluye controles basados en el diseño proporcionado:

- **Adelante**: Mueve el carrito hacia adelante
- **Atrás**: Mueve el carrito hacia atrás
- **Izquierda/Derecha**: Giros direccionales
- **Giro 360°**: Rotación completa (izquierda/derecha)
- **STOP**: Detiene inmediatamente el carrito
- **Movimientos combinados**: Adelante+Izquierda, Atrás+Derecha, etc.

### Atajos de Teclado

- `W` o `↑`: Adelante
- `S` o `↓`: Atrás
- `A` o `←`: Izquierda
- `D` o `→`: Derecha
- `Espacio` o `ESC`: STOP

### Panel de Mensajes PUSH

Muestra en tiempo real:

- ✅ **Movimientos**: Comandos enviados y ejecutados
- ⚠️ **Obstáculos**: Alertas de detección
- 📊 **Estado**: Actualizaciones del dispositivo
- ⚙️ **Sistema**: Mensajes del sistema

Filtros disponibles: Todos | Movimientos | Obstáculos | Estado

### Historial de Movimientos

Tabla con todos los comandos ejecutados:

- Timestamp
- Comando ejecutado
- Duración
- Estado
- Origen (WebSocket/REST)

## 🔌 Comunicación WebSocket

### Conexión Automática

Al cargar la página, se conecta automáticamente al servidor.

### Eventos Enviados al Servidor

```javascript
// Registrar dispositivo
socket.emit("register_device", {
  device_id: 1,
  device_name: "Carrito-001",
});

// Enviar comando de movimiento
socket.emit("movement_command", {
  device_id: 1,
  command: "forward",
  duration_ms: 1000,
  meta: { origin: "web_interface" },
});
```

### Eventos Recibidos del Servidor

```javascript
// Ejecutar movimiento (PUSH)
socket.on("execute_movement", (data) => {
  // { command: 'forward', duration_ms: 1000 }
});

// Alerta de obstáculo
socket.on("obstacle_alert", (data) => {
  // { device_id: 1, status_clave: 1 }
});

// Actualización de estado
socket.on("status_update", (data) => {
  // { device_id: 1, status: {...} }
});
```

## 📡 API REST

### Endpoints Disponibles

```javascript
// Health check
GET /api/health

// Obtener dispositivos
GET /api/devices

// Obtener dispositivo específico
GET /api/devices/{id}

// Enviar comando de movimiento
POST /api/movements/send
{
    "device_id": 1,
    "command": "forward",
    "duration_ms": 1000
}

// Obtener historial de eventos
GET /api/events/{device_id}?limit=50
```

## 🎨 Personalización

### Colores (Tailwind)

Editar en `index.html` (sección `<script>`):

```javascript
tailwind.config = {
  theme: {
    extend: {
      colors: {
        primary: "#1e3a8a", // Azul primario
        secondary: "#0ea5e9", // Azul secundario
        "dark-bg": "#1e293b", // Fondo oscuro
        "darker-bg": "#0f172a", // Fondo más oscuro
      },
    },
  },
};
```

### Estilos Personalizados

Editar `css/styles.css` para agregar/modificar estilos.

## 🐛 Solución de Problemas

### No se conecta al servidor

1. Verificar que el backend esté ejecutándose en el puerto 5500
2. Verificar CORS habilitado en el backend
3. Comprobar URL en configuración
4. Revisar consola del navegador (F12)

### Error de CORS

Si despliegas en GitHub Pages, asegúrate de que el backend tenga CORS configurado:

```python
# En app.py del backend
CORS(app, resources={r"/*": {"origins": "*"}})
```

### WebSocket no conecta

1. Verificar que Flask-SocketIO esté ejecutándose
2. Comprobar puerto 5500 abierto en EC2
3. Verificar Security Group en AWS permite puerto 5500
4. Probar con HTTP (no HTTPS) si no tienes certificado SSL

## 🚀 Despliegue en Producción

### Para GitHub Pages

1. Cambiar URLs en `config.js` a tu servidor EC2
2. Commit y push a GitHub
3. Activar GitHub Pages en Settings

### Para servidor propio

1. Subir carpeta `frontend-web` a servidor web (nginx, Apache)
2. Configurar dominio
3. Configurar certificado SSL (Let's Encrypt)
4. Actualizar URLs en `config.js`

### Con HTTPS

Si tu backend usa HTTPS, cambiar en `config.js`:

```javascript
API_BASE_URL: 'https://tu-dominio.com:5500',
WEBSOCKET_URL: 'https://tu-dominio.com:5500',
```

## 📊 Características Técnicas

- **Framework CSS**: Tailwind CSS v3.4.0 (CDN)
- **WebSocket**: Socket.IO Client v4.7.2
- **Iconos**: Font Awesome v6.5.1
- **JavaScript**: Vanilla ES6+ (sin frameworks)
- **Compatibilidad**: Navegadores modernos (Chrome, Firefox, Safari, Edge)
- **Responsive**: Mobile, Tablet, Desktop

## 🔐 Seguridad

- No almacena credenciales sensibles
- Usa localStorage solo para configuración
- Compatible con HTTPS
- Validación de comandos en cliente y servidor

## 📝 Datos del Desarrollador

Actualizar en `index.html` (footer):

```html
<p class="text-gray-500 text-xs mt-1">
  Desarrollado por <span class="text-blue-300">Tu Nombre</span> | Proyecto IoT
</p>
```

Y enlaces sociales:

```html
<a href="https://github.com/tuusuario" target="_blank">
  <i class="fab fa-github text-2xl"></i>
</a>
<a href="https://linkedin.com/in/tuusuario" target="_blank">
  <i class="fab fa-linkedin text-2xl"></i>
</a>
```

## 🔮 Próximas Mejoras

- [ ] Sistema de autenticación de usuarios
- [ ] Grabación y reproducción de demos
- [ ] Vista de cámara en tiempo real
- [ ] Gráficas de estadísticas
- [ ] Modo oscuro/claro
- [ ] Soporte multiidioma
- [ ] PWA (Progressive Web App)
- [ ] Notificaciones push del navegador

## 🤝 Contribución

Este es un proyecto educativo. Siéntete libre de fork y mejorar.

## 📄 Licencia

Proyecto privado - Todos los derechos reservados

---

**Desarrollado con ❤️ para el proyecto CarroIoT - 2025**
