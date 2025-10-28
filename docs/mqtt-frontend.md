## Implementación MQTT en el Frontend (Resumen)

Este documento resume la arquitectura y componentes clave de la integración MQTT v5.0 en el frontend (Next.js + React), incluyendo conexión, reconexión, gestión de sesión, cacheo con TanStack Query, publicación y observabilidad.

### Arquitectura general
- **Hook núcleo (`useMqtt`)**: Orquesta el ciclo de vida del cliente MQTT.js v5 (conexión, suscripción, publicación, desconexión, reconexión manual). Ubicación: `src/shared/hooks/use-mqtt.ts`.
- **Store global (Zustand)**: Estado de conexión y metadatos. Ubicación: `src/shared/stores/mqtt-connection.store.ts` con utilidades en `src/shared/stores/mqtt-connection.utils.ts`.
- **Providers React**:
  - `MqttProvider`: expone el contexto MQTT y coordina sesión + cache. `src/shared/components/mqtt/MqttProvider.tsx`
  - `MqttQueryProvider`: integra mensajes con TanStack Query. `src/shared/components/mqtt/MqttQueryProvider.tsx`
  - `MqttSessionProvider`: conecta MQTT al ciclo de autenticación. `src/shared/components/mqtt/MqttSessionProvider.tsx`
- **Integración TanStack Query**:
  - `useMqttQueryIntegration`: handler global que actualiza/invalida caché por tópico. `src/shared/hooks/use-mqtt-query-integration.ts`
  - `useMqttTopic`: suscripción reactiva por tópico con parsing opcional. `src/shared/hooks/use-mqtt-topic.ts`
- **Errores y observabilidad**: Sistema centralizado de clasificación y métricas en `src/shared/utils/mqtt-error-handler.ts` + UI `MqttErrorMonitor.tsx` y hooks `use-mqtt-error-monitoring.ts`.
- **Credenciales**: `MqttCredentialsService` obtiene y cachea credenciales desde el backend. `src/shared/services/mqtt-credentials.service.ts`
- **Server Actions**: Publicación segura desde servidor usando `serverFetch`. `src/shared/actions/mqtt-server.actions.ts`

### Tipos y configuración (v5)
- Tipos v5: `src/shared/types/mqtt.types.ts` define `MqttConnectionOptions`, `MqttMessage`, `MqttPublishOptions`, `ConnectionStatus`, etc.
- Config por defecto y WebSocket: `src/shared/config/mqtt.config.ts`
  - `WEBSOCKET_CONFIG.transformWsUrl` asegura `ws://`/`wss://` y opciones `wsOptions`.
  - `DEFAULT_MQTT_OPTIONS` con `protocolVersion: 5`, keepalive, propiedades v5 (aliases, receiveMaximum, userProperties, etc.).
  - `RECONNECTION_CONFIG`: backoff exponencial (5 intentos máx, 1s base, jitter, tope 30s).

### Ciclo de vida y reconexión
- `useMqtt` deshabilita la reconexión automática de MQTT.js (`reconnectPeriod: 0`) y aplica reconexión manual con backoff:
  - Cálculo de delay: `calculateReconnectionDelay` (exponencial + jitter) y decisión `shouldAttemptReconnection` (respeta red offline y expiración de token).
  - Monitor de red: `createNetworkMonitor` pausa/reintenta al recuperar conectividad.
  - Manejo de expiración de token: `isTokenExpirationError` marca `tokenExpired` y detiene reintentos hasta refrescar credenciales.
- `MqttSessionProvider` + `useMqttSessionLifecycle` enlazan el estado de auth (`/v1/auth/me`) con MQTT:
  - Conecta al autenticarse, desconecta al hacer logout, limpia caché de tópicos en ambos casos.
  - Expiración de token: desconecta, limpia credenciales y redirige a login.

### Flujo de credenciales
- `MqttCredentialsService.getMqttCredentials()` llama a `/v1/auth/mqtt-credentials`, valida `brokerUrl/username/password`, cachea 5 min y permite `forceRefresh`. Ubicación: `src/shared/services/mqtt-credentials.service.ts`.
- URL de broker se normaliza a WS y se asegura el path `/mqtt` vía `transformToWebSocketUrl`.

### Manejo de mensajes y cache (TanStack Query)
- Handler global (`useMqttQueryIntegration.handleGlobalMessage`) actualiza la query `['mqtt-topic', topic]` con:
  - Normalización de payload a `string` (evita Buffers en caché).
  - `messages` (máx 100), `lastMessage`, `lastUpdated`, `subscribers`.
  - Invalidación de la query para refrescar consumidores.
- `useMqttTopic(topic, { parser })` crea/lee el estado del tópico y aplica parsing del último mensaje con `parser` seguro.

### Publicación (cliente y servidor)
- Cliente: `useMqtt.publish(topic, payload, options)` valida entrada, añade `userProperties` (timestamp, client-id, message-size) y reporta errores al manejador común.
- Server Actions: `publishMqttMessage` y helpers (`publishMqttRequest`, `publishMqttMessageWithProperties`) envían al backend (`/api/mqtt/publish`) usando `http` de `src/lib/http/serverFetch.ts`.
  - Convierte `correlationData` a base64 cuando aplica.
  - Devuelve `MqttActionResponse` tipado y registra errores con severidad/categoría.

### Manejo de errores y salud del sistema
- `mqtt-error-handler` clasifica errores en categorías (CONNECTION, AUTHENTICATION, NETWORK, SUBSCRIPTION, PUBLISHING, MESSAGE_PROCESSING, VALIDATION), calcula severidad, decide si reintentar y su delay, mantiene historial y exporta métricas.
- Hooks de monitoring: estadísticas, tendencias, health status y filtros por severidad/categoría.
- Componentes UI: `MqttErrorMonitor` y `MqttHealthIndicator` para paneles de administración.

### Store de conexión (Zustand)
- Estado: `status`, `client`, `error`, `lastConnected`, `reconnectAttempts`, `nextReconnectDelay`, `isNetworkOnline`, `tokenExpired`.
- Acciones: `setStatus`, `setClient`, `setError`, `incrementReconnectAttempts`, `resetReconnectAttempts`, `setNetworkOnline`, etc. con validación de transiciones (`isValidStateTransition`).

### serverFetch y su rol
- `src/lib/http/serverFetch.ts` no conecta MQTT directamente pero es clave para Server Actions:
  - Inyecta cookies `refresh_token`/`access_token` en peticiones al backend.
  - Actualiza `access_token` cuando llega por `Set-Cookie`.
  - Estandariza errores (`statusCode`, `message`, `error`) que luego se reportan al manejador MQTT en Server Actions.

### Entradas principales (rápido acceso)
- Tipos: `src/shared/types/mqtt.types.ts`
- Config v5/WS/backoff: `src/shared/config/mqtt.config.ts`
- Hook principal: `src/shared/hooks/use-mqtt.ts`
- Store y utils: `src/shared/stores/mqtt-connection.store.ts`, `src/shared/stores/mqtt-connection.utils.ts`
- Providers: `src/shared/components/mqtt/MqttProvider.tsx`, `MqttQueryProvider.tsx`, `MqttSessionProvider.tsx`
- TanStack Query: `src/shared/hooks/use-mqtt-query-integration.ts`, `src/shared/hooks/use-mqtt-topic.ts`
- Errores/monitoring: `src/shared/utils/mqtt-error-handler.ts`, `src/shared/hooks/use-mqtt-error-monitoring.ts`, `src/shared/components/mqtt/MqttErrorMonitor.tsx`
- Server Actions: `src/shared/actions/mqtt-server.actions.ts`
- HTTP server-side: `src/lib/http/serverFetch.ts`

### Comportamiento por defecto y decisiones clave
- Protocolo MQTT v5 y transporte WebSocket garantizados.
- Reconexión manual controlada (backoff exponencial con jitter, aware de red offline y expiración de token).
- Mensajes en caché normalizados a `string` para evitar problemas de serialización.
- Resuscripción automática a tópicos tras reconectar (con propiedades v5 como `subscriptionIdentifier`).
- Observabilidad lista para paneles (health, errores, export CSV/JSON).

### Cómo usar (muy breve)
1) Envolver la app con `MqttProvider` (después de QueryProvider y auth).  
2) Consumir datos con `useMqttTopic('mi/topico', { parser: JSON.parse })`.  
3) Publicar desde cliente (`useMqtt().publish`) o desde servidor (`publishMqttMessage`).



