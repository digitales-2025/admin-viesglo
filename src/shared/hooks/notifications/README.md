# Hooks de Notificaciones

Este directorio contiene hooks especializados para manejar notificaciones en la aplicación Viesglo.

## Estructura

- `use-notifications.ts` - Hook principal que combina funcionalidades de notificaciones personales y globales
- `use-personal-notifications.ts` - Hook específico para notificaciones personales
- `use-global-notifications.ts` - Hook específico para notificaciones globales
- `index.ts` - Archivo de índice que exporta todos los hooks

## Problemas Corregidos

### 1. Bug de Marcado Automático como Leídas
**Problema**: Las notificaciones se marcaban automáticamente como leídas al llegar por MQTT.

**Causa**: El backend envía mensajes vacíos (`""`) con `retain: true` para limpiar mensajes retenidos. Estos mensajes vacíos se procesaban como notificaciones válidas.

**Solución**: Agregar validación para ignorar mensajes vacíos en el procesamiento MQTT:

```typescript
// IMPORTANTE: Ignorar mensajes vacíos que son de limpieza del backend
if (!latestMessage.payload || latestMessage.payload === "" || latestMessage.payload === "{}") {
  console.log("🔔 Ignoring empty message (cleanup)");
  return;
}
```

### 2. Refactorización de Hooks
**Problema**: El hook `useNotifications` estaba muy acoplado y manejaba demasiadas responsabilidades.

**Solución**: Separar en hooks especializados:
- `usePersonalNotifications`: Maneja notificaciones personales
- `useGlobalNotifications`: Maneja notificaciones globales
- `useNotifications`: Hook principal que combina ambos (mantiene compatibilidad)

## Uso

### Hook Principal (Compatibilidad)
```typescript
import { useNotifications } from "@/shared/hooks/notifications";

function MyComponent() {
  const {
    personalNotifications,
    globalNotifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  // ... resto del código
}
```

### Hook Especializado para Notificaciones Personales
```typescript
import { usePersonalNotifications } from "@/shared/hooks/notifications";

function NotificationsBell() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = usePersonalNotifications();

  // ... resto del código
}
```

### Hook Especializado para Notificaciones Globales
```typescript
import { useGlobalNotifications } from "@/shared/hooks/notifications";

function GlobalNotifications() {
  const {
    notifications,
    onNewGlobalNotification,
    markGlobalAsRead,
  } = useGlobalNotifications();

  // ... resto del código
}
```

## Características

### Notificaciones Personales
- ✅ HTTP snapshot inicial
- ✅ MQTT tiempo real para nuevas notificaciones
- ✅ MQTT para actualizaciones de estado (leído/no leído)
- ✅ Conteo de no leídas
- ✅ Marcado individual y masivo como leídas
- ✅ Eliminación local

### Notificaciones Globales
- ✅ HTTP snapshot inicial
- ✅ MQTT tiempo real para nuevas notificaciones
- ✅ Callbacks para notificaciones en tiempo real
- ✅ Marcado como vista (no se eliminan)
- ✅ Tópicos: system, alerts, maintenance

### MQTT
- ✅ QoS 2 + retain para notificaciones
- ✅ QoS 1 sin retain para actualizaciones
- ✅ Filtrado de mensajes vacíos (limpieza)
- ✅ Prevención de duplicados
- ✅ Manejo de errores

## Flujo de Datos

1. **Inicialización**: HTTP snapshot para estado inicial
2. **MQTT**: Suscripción a tópicos relevantes
3. **Nuevas Notificaciones**: Procesamiento en tiempo real
4. **Actualizaciones**: Sincronización de estado (leído/no leído)
5. **Limpieza**: Filtrado de mensajes de limpieza del backend

## Debugging

Los hooks incluyen logs detallados para debugging:

```typescript
console.log("🔔 usePersonalNotifications: Processing personal notification from MQTT", {
  topic: latestMessage.topic,
  timestamp: personalMqtt.lastUpdated,
  payloadLength: latestMessage.payload?.length || 0,
});
```

## Consideraciones de Rendimiento

- **Cache**: TanStack Query para cache de snapshot
- **MQTT**: Solo procesa mensajes cuando hay suscriptores activos
- **Límites**: Máximo 100 mensajes por tópico en cache
- **Invalidación**: Cache invalidation solo cuando es necesario

