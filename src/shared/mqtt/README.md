# Documentación de Integración de MQTT

Este documento proporciona una guía completa para desarrolladores sobre cómo utilizar la funcionalidad de MQTT v5.0 en esta aplicación Next.js. La integración está diseñada para ser robusta, reactiva y fácil de usar, aprovechando herramientas como TanStack Query, Zustand y Server Actions.

## Tabla de Contenidos

1.  [Visión General de la Arquitectura](#visión-general-de-la-arquitectura)
2.  [Configuración Inicial (`MqttProvider`)](#configuración-inicial-mqttprovider)
3.  [Consumo de Datos de Temas (`useMqttTopic`)](#consumo-de-datos-de-temas-usemqtttopic)
4.  [Publicación de Mensajes](#publicación-de-mensajes)
    - [Publicación desde el Cliente (`useMqttPublish`)](#publicación-desde-el-cliente-usemqttpublish)
    - [Publicación desde el Servidor (Server Actions)](#publicación-desde-el-servidor-server-actions)
5.  [Manejo de Errores y Monitoreo](#manejo-de-errores-y-monitoreo)
6.  [Mejores Prácticas y Configuración Avanzada](#mejores-prácticas-y-configuración-avanzada)

---

## Visión General de la Arquitectura

La integración de MQTT sigue una arquitectura modular y desacoplada, centrada en custom hooks y proveedores de contexto. El estado de la conexión se gestiona globalmente, mientras que los datos de los temas se almacenan en caché y se sirven a través de TanStack Query para garantizar actualizaciones reactivas de la interfaz de usuario.

*Para más detalles, consulta el [documento de diseño](/.kiro/specs/mqtt-client-v5/design.md).*

---

## Configuración Inicial (`MqttProvider`)

El `MqttProvider` es el componente principal que habilita toda la funcionalidad de MQTT. Debe envolver tu aplicación en el layout principal.

**Ubicación:** `src/app/layout.tsx`

```tsx
import { MqttProvider } from '@/shared/components/mqtt';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <MqttProvider enableDebugLogging={process.env.NODE_ENV === 'development'}>
          {children}
        </MqttProvider>
      </body>
    </html>
  );
}
```

El proveedor gestiona automáticamente el ciclo de vida de la conexión MQTT, basándose en la sesión del usuario.

---

## Consumo de Datos de Temas (`useMqttTopic`)

Para suscribirte a un tema y recibir datos en tiempo real, utiliza el hook `useMqttTopic`.

*Este contenido se ha adaptado de [README-mqtt-tanstack-integration.md](src/shared/hooks/README-mqtt-tanstack-integration.md).*

### Ejemplo Básico

```tsx
import { useMqttTopic } from '@/shared/hooks/use-mqtt-topic';

function SensorDisplay() {
  const { parsedData, isConnected } = useMqttTopic('sensors/humidity', {
    parser: (payload) => ({ humidity: parseFloat(payload.toString()) }),
  });

  if (!isConnected) return <div>Conectando...</div>;
  
  return <div>Humedad: {parsedData?.humidity}%</div>;
}
```

### Control Manual de Suscripción

```tsx
function AdvancedSensorDisplay() {
  const { 
    parsedData, 
    isSubscribed, 
    subscribe, 
    unsubscribe 
  } = useMqttTopic('sensors/advanced', {
    autoSubscribe: false,
    parser: JSON.parse,
  });

  return (
    <div>
      <button onClick={subscribe} disabled={isSubscribed}>
        Suscribir
      </button>
      <button onClick={unsubscribe} disabled={!isSubscribed}>
        Anular suscripción
      </button>
      {parsedData && <pre>{JSON.stringify(parsedData, null, 2)}</pre>}
    </div>
  );
}
```

---

## Publicación de Mensajes

### Publicación desde el Cliente (`useMqttPublish`)

Utiliza el hook `useMqttPublish` para publicar mensajes directamente desde los componentes del cliente.

```tsx
import { useMqttPublish } from '@/shared/hooks';

function Publisher() {
  const { publishMessage, isConnected, isPending } = useMqttPublish();

  const handleClick = () => {
    publishMessage('my/topic', 'Hello from client!', { qos: 1 });
  };

  return (
    <button onClick={handleClick} disabled={!isConnected || isPending}>
      {isPending ? 'Publicando...' : 'Publicar Mensaje'}
    </button>
  );
}
```

### Publicación desde el Servidor (Server Actions)

Para una mayor seguridad y para centralizar la lógica de negocio, utiliza Server Actions para publicar mensajes.

**Ubicación:** `src/shared/actions/mqtt.actions.ts`

```ts
'use server';

import { publishMqttMessage } from '@/shared/actions/mqtt.actions';

export async function myServerAction(data: any) {
  const result = await publishMqttMessage('server/topic', { content: data });

  if (!result.success) {
    console.error('Error al publicar desde el servidor:', result.error);
  }

  return result;
}
```

---

## Manejo de Errores y Monitoreo

El sistema incluye un robusto manejo de errores y herramientas de monitoreo.

*Este contenido se ha adaptado de [README-mqtt-error-handling.md](src/shared/hooks/README-mqtt-error-handling.md).*

### Componente de Monitoreo

Puedes añadir el componente `MqttErrorMonitor` a tu panel de administración para obtener una visión detallada de la salud de MQTT.

```tsx
import { MqttErrorMonitor } from '@/shared/components/mqtt';

function AdminDashboard() {
  return <MqttErrorMonitor showDetails={true} />;
}
```

### Hook de Estado de Salud

Utiliza el hook `useMqttHealthIndicator` para mostrar un indicador simple del estado de la conexión.

```tsx
import { useMqttHealthIndicator } from '@/shared/hooks';

function HealthIndicator() {
  const { isHealthy, status } = useMqttHealthIndicator();

  return <div className={`health-indicator ${status}`} />;
}
```

---

## Mejores Prácticas y Configuración Avanzada

-   **Seguridad de los Temas**: Asegúrate de que los permisos de los temas se configuran correctamente en el broker EMQX.
-   **Parsing de Mensajes**: Utiliza siempre un bloque `try...catch` o la opción `onParseError` al parsear los payloads de los mensajes para evitar que los datos malformados rompan tu aplicación.
-   **Server Actions**: Prefiere las Server Actions para las operaciones de publicación que impliquen una lógica de negocio sensible o que requieran autorización.
-   **Pruebas**: Utiliza la página de prueba de MQTT en `/dashboard/admin/mqtt-test` para verificar la conectividad y el flujo de mensajes durante el desarrollo.
