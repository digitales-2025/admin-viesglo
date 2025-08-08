# Requerimientos del Backend para Implementación MQTT

## Resumen
Este documento describe los requerimientos que debe implementar el backend para soportar la funcionalidad MQTT del frontend. El frontend necesita obtener credenciales MQTT válidas para establecer una conexión segura con el broker MQTT.

---

## 🚨 Endpoint Principal Requerido

### `GET /v1/auth/mqtt-credentials`

**Estado:** ⛔ **FALTANTE - NECESITA IMPLEMENTACIÓN**

Este endpoint es **crítico** y actualmente está causando errores 404 en el frontend.

---

## 📝 Especificación del Endpoint

### Headers Requeridos
```
Authorization: Bearer <token_jwt>
Content-Type: application/json
```

### Respuesta Exitosa (200)
```json
{
  "brokerUrl": "ws://localhost:1883/mqtt",
  "username": "user_mqtt_2024",
  "password": "mqtt_secure_password_123",
  "clientId": "web-client-user-123-optional"
}
```

### Respuesta de Error (401 - No autorizado)
```json
{
  "success": false,
  "error": {
    "message": "Authentication required to access MQTT credentials",
    "code": "UNAUTHORIZED"
  }
}
```

### Respuesta de Error (503 - Servicio no disponible)
```json
{
  "success": false,
  "error": {
    "message": "MQTT credentials service temporarily unavailable",
    "code": "SERVICE_UNAVAILABLE"
  }
}
```

---

## 🔧 Campos de la Respuesta

| Campo | Tipo | Requerido | Descripción | Ejemplo |
|-------|------|-----------|-------------|---------|
| `brokerUrl` | `string` | ✅ **SÍ** | URL del broker MQTT con protocolo WebSocket | `"ws://localhost:1883/mqtt"` o `"wss://mqtt.empresa.com/mqtt"` |
| `username` | `string` | ✅ **SÍ** | Usuario para autenticación MQTT | `"user_mqtt_2024"` |
| `password` | `string` | ✅ **SÍ** | Contraseña para autenticación MQTT | `"mqtt_secure_password_123"` |
| `clientId` | `string` | ❌ **NO** | ID único del cliente (opcional, el frontend puede generarlo) | `"web-client-user-123"` |

---

## 🔒 Requerimientos de Seguridad

### 1. Autenticación
- El endpoint **DEBE** validar el token JWT del usuario
- Si el token es inválido o ha expirado, retornar error 401
- Las credenciales MQTT **DEBEN** ser específicas por usuario

### 2. Autorización
- Verificar que el usuario tenga permisos para acceder a MQTT
- Diferentes usuarios pueden tener diferentes niveles de acceso a topics

### 3. Gestión de Credenciales
- Las credenciales MQTT pueden ser:
  - **Dinámicas:** Generadas por usuario/sesión (recomendado)
  - **Estáticas:** Configuradas por usuario en base de datos
  - **Temporales:** Con expiración automática

---

## 🌐 Protocolos Soportados

El frontend está configurado para soportar las siguientes URLs de broker:

| Protocolo Entrada | Transformación WebSocket | Uso |
|-------------------|---------------------------|-----|
| `mqtt://broker:1883` | `ws://broker:1883/mqtt` | Desarrollo local |
| `mqtts://broker:8883` | `wss://broker:8883/mqtt` | Producción segura |
| `ws://broker:1883/mqtt` | Sin cambio | WebSocket directo |
| `wss://broker:8883/mqtt` | Sin cambio | WebSocket seguro |

**⚠️ Importante:** El frontend automáticamente transforma URLs MQTT a WebSocket.

---

## 💡 Ejemplos de Implementación

### Ejemplo 1: Credenciales Dinámicas por Usuario
```javascript
// Backend (Node.js/Express ejemplo)
app.get('/v1/auth/mqtt-credentials', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Generar credenciales específicas por usuario
    const credentials = {
      brokerUrl: process.env.MQTT_BROKER_URL || "ws://localhost:1883/mqtt",
      username: `user_${userId}`,
      password: generateSecurePassword(userId),
      clientId: `web_${userId}_${Date.now()}`
    };
    
    res.json(credentials);
  } catch (error) {
    res.status(503).json({
      success: false,
      error: {
        message: "MQTT credentials service temporarily unavailable",
        code: "SERVICE_UNAVAILABLE"
      }
    });
  }
});
```

### Ejemplo 2: Credenciales desde Base de Datos
```javascript
app.get('/v1/auth/mqtt-credentials', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Obtener credenciales desde base de datos
    const user = await User.findById(userId).select('mqttCredentials');
    
    if (!user?.mqttCredentials) {
      return res.status(404).json({
        success: false,
        error: {
          message: "MQTT credentials not configured for user",
          code: "CREDENTIALS_NOT_FOUND"
        }
      });
    }
    
    res.json({
      brokerUrl: user.mqttCredentials.brokerUrl,
      username: user.mqttCredentials.username,
      password: user.mqttCredentials.password,
      clientId: `web_${userId}_${Date.now()}`
    });
  } catch (error) {
    console.error('MQTT credentials error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: "Internal server error",
        code: "INTERNAL_ERROR"
      }
    });
  }
});
```

---

## 🔍 Validaciones Requeridas

### En el Backend
1. **URL del Broker:** Debe ser una URL válida con protocolo soportado
2. **Username:** No puede estar vacío, debe ser string válido
3. **Password:** No puede estar vacío, debe ser string válido
4. **ClientId:** Opcional, pero si se proporciona debe ser único

### Validación de Ejemplo
```javascript
function validateMqttCredentials(credentials) {
  const errors = [];
  
  if (!credentials.brokerUrl) {
    errors.push('brokerUrl is required');
  } else if (!/^(ws|wss|mqtt|mqtts):\/\/.+/.test(credentials.brokerUrl)) {
    errors.push('brokerUrl must be a valid URL with ws, wss, mqtt, or mqtts protocol');
  }
  
  if (!credentials.username) {
    errors.push('username is required');
  }
  
  if (!credentials.password) {
    errors.push('password is required');
  }
  
  return errors;
}
```

---

## 🚀 Configuración del Broker MQTT

### Variables de Entorno Sugeridas
```env
# Configuración MQTT
MQTT_BROKER_HOST=localhost
MQTT_BROKER_PORT=1883
MQTT_BROKER_WS_PORT=1883
MQTT_BROKER_WS_PATH=/mqtt
MQTT_BROKER_USERNAME=admin
MQTT_BROKER_PASSWORD=admin_password

# URLs completas (alternativa)
MQTT_BROKER_URL=ws://localhost:1883/mqtt
MQTT_BROKER_URL_SECURE=wss://mqtt.empresa.com:8883/mqtt
```

### Configuración de Broker (Mosquitto ejemplo)
```conf
# mosquitto.conf
port 1883
listener 8080
protocol websockets
websockets_path /mqtt

# Autenticación
allow_anonymous false
password_file /etc/mosquitto/passwd
```

---

## 🔄 Flujo de Conexión MQTT

1. **Frontend:** Hace GET `/v1/auth/mqtt-credentials` con token JWT
2. **Backend:** Valida token y genera/obtiene credenciales MQTT
3. **Backend:** Retorna credenciales en formato JSON
4. **Frontend:** Usa credenciales para conectar al broker MQTT v5.0
5. **Frontend:** Si hay error 401/403, redirige a login
6. **Frontend:** Si hay error de conexión, reintenta máximo 5 veces

---

## ⚠️ Estado Actual de Errores

### Error Principal
```
GET http://localhost:5000/v1/auth/mqtt-credentials
[HTTP/1.1 404 Not Found 1ms]
```

**Causa:** El endpoint no está implementado en el backend.

**Solución:** Implementar el endpoint siguiendo las especificaciones de este documento.

### Configuración de Reintentos (Ya Solucionado)
- ✅ **Reducido de 10 a 5 reintentos** para evitar spam de errores
- ✅ **Backoff exponencial** configurado correctamente
- ✅ **Jitter aleatorio** para evitar thundering herd

---

## 🎯 Próximos Pasos

### Para el Equipo de Backend:
1. **Implementar** el endpoint `/v1/auth/mqtt-credentials`
2. **Configurar** broker MQTT con soporte WebSocket
3. **Definir** estrategia de credenciales (dinámicas vs estáticas)
4. **Probar** conectividad MQTT desde el endpoint

### Para Testing:
```bash
# Probar el endpoint manualmente
curl -H "Authorization: Bearer $JWT_TOKEN" \
     -H "Content-Type: application/json" \
     http://localhost:5000/v1/auth/mqtt-credentials

# Debería retornar credenciales MQTT válidas
```

---

## 📞 Contacto

Si necesitas aclaraciones sobre algún requerimiento o tienes preguntas sobre la implementación, revisa:

1. **Código Frontend:** `src/shared/services/mqtt-credentials.service.ts`
2. **Tipos TypeScript:** `src/shared/types/mqtt.types.ts`
3. **Configuración MQTT:** `src/shared/config/mqtt.config.ts`

---

**⚡ Estado:** Documento creado - Endpoint pendiente de implementación
**📅 Fecha:** Enero 2025
**🔄 Versión:** 1.0


