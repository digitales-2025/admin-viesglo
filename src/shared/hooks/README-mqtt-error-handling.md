# MQTT Error Handling and Logging System

Este documento describe el sistema integral de manejo de errores y logging para el cliente MQTT v5.0, implementado según los requerimientos 6.1-6.5.

## Características Principales

### 1. Categorización de Errores
El sistema categoriza automáticamente los errores en las siguientes categorías:

- **CONNECTION**: Errores de conexión al broker MQTT
- **AUTHENTICATION**: Errores de autenticación y autorización
- **NETWORK**: Errores de conectividad de red
- **MESSAGE_PROCESSING**: Errores al procesar mensajes entrantes
- **SUBSCRIPTION**: Errores al suscribirse/desuscribirse de tópicos
- **PUBLISHING**: Errores al publicar mensajes
- **VALIDATION**: Errores de validación de parámetros
- **UNKNOWN**: Errores no categorizados

### 2. Niveles de Severidad
Cada error se clasifica con un nivel de severidad:

- **CRITICAL**: Errores críticos que requieren atención inmediata
- **HIGH**: Errores de alta prioridad
- **MEDIUM**: Errores de prioridad media
- **LOW**: Errores de baja prioridad

### 3. Logging Detallado
El sistema registra información detallada para cada error:

- Timestamp preciso
- Categoría y severidad del error
- Contexto específico (tópico, payload, QoS, etc.)
- Información de reconexión si aplica
- Recomendaciones de retry automático

## Uso del Sistema

### Hook de Monitoreo de Errores

```typescript
import { useMqttErrorMonitoring } from '@/shared/hooks';

function MyComponent() {
  const {
    totalErrors,
    errorsByCategory,
    errorsBySeverity,
    recentErrors,
    healthStatus,
    errorTrends,
    clearErrorHistory,
    refreshStats,
    hasRecentErrors,
    hasCriticalErrors,
    isHealthy
  } = useMqttErrorMonitoring({
    refreshInterval: 30000, // 30 segundos
    autoRefresh: true
  });

  return (
    <div>
      <h2>MQTT Health: {healthStatus.status}</h2>
      <p>Total Errors: {totalErrors}</p>
      <p>Error Rate: {errorTrends.errorRate.toFixed(1)} errors/hour</p>
      
      {hasCriticalErrors && (
        <div className="alert alert-danger">
          Critical errors detected!
        </div>
      )}
    </div>
  );
}
```

### Hook de Indicador de Salud

```typescript
import { useMqttHealthIndicator } from '@/shared/hooks';

function HealthIndicator() {
  const { isHealthy, status, message, recommendations } = useMqttHealthIndicator();

  return (
    <div className={`health-indicator ${status}`}>
      <span className={`status-dot ${status}`} />
      <span>MQTT: {status}</span>
      {!isHealthy && (
        <div className="recommendations">
          {recommendations.map((rec, i) => (
            <p key={i}>{rec}</p>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Filtrado por Categoría

```typescript
import { useMqttErrorsByCategory } from '@/shared/hooks';
import { MqttErrorCategory } from '@/shared/utils/mqtt-error-handler';

function ConnectionErrors() {
  const { errors, count, hasErrors } = useMqttErrorsByCategory([
    MqttErrorCategory.CONNECTION,
    MqttErrorCategory.NETWORK
  ]);

  if (!hasErrors) return <div>No connection errors</div>;

  return (
    <div>
      <h3>Connection Errors ({count})</h3>
      {errors.map((error, i) => (
        <div key={i} className="error-item">
          <strong>{error.category}</strong>: {error.message}
          <small>{error.timestamp.toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
}
```

### Componente de Monitoreo Completo

```typescript
import { MqttErrorMonitor } from '@/shared/components/mqtt';

function AdminDashboard() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      
      {/* Monitor completo con detalles */}
      <MqttErrorMonitor 
        showDetails={true}
        showExport={true}
        autoRefresh={true}
        refreshInterval={30000}
      />
    </div>
  );
}
```

### Indicador Simple de Salud

```typescript
import { MqttHealthIndicator } from '@/shared/components/mqtt';

function Header() {
  return (
    <header>
      <h1>My App</h1>
      <MqttHealthIndicator />
    </header>
  );
}
```

### Alerta de Errores Críticos

```typescript
import { MqttCriticalErrorsAlert } from '@/shared/components/mqtt';

function Layout({ children }) {
  return (
    <div>
      <MqttCriticalErrorsAlert />
      {children}
    </div>
  );
}
```

## Integración Automática

El sistema se integra automáticamente con:

### 1. Hook useMqtt
Todos los errores de conexión, suscripción y publicación se registran automáticamente.

### 2. Server Actions
Los errores de publicación desde el servidor se registran con contexto completo.

### 3. Procesamiento de Mensajes
Los errores al procesar mensajes entrantes se capturan y registran.

### 4. Reconexiones
Los intentos de reconexión exitosos se registran con métricas de tiempo de inactividad.

## Exportación de Datos

### Exportar como JSON
```typescript
import { exportMqttErrorData } from '@/shared/utils/mqtt-error-handler';

const jsonData = exportMqttErrorData('json');
// Contiene estadísticas completas, tendencias y estado de salud
```

### Exportar como CSV
```typescript
const csvData = exportMqttErrorData('csv');
// Formato CSV para análisis en Excel o herramientas similares
```

## Monitoreo de Tendencias

### Obtener Tendencias de Errores
```typescript
import { getMqttErrorTrends } from '@/shared/utils/mqtt-error-handler';

const trends = getMqttErrorTrends(3600000); // Última hora
console.log({
  errorRate: trends.errorRate, // Errores por hora
  criticalErrors: trends.criticalErrors,
  mostCommonCategory: trends.mostCommonCategory,
  errorsByHour: trends.errorsByHour
});
```

### Verificar Estado de Salud
```typescript
import { getMqttHealthStatus } from '@/shared/utils/mqtt-error-handler';

const health = getMqttHealthStatus();
console.log({
  status: health.status, // 'healthy' | 'warning' | 'critical'
  message: health.message,
  recommendations: health.recommendations
});
```

## Configuración de Logging

El sistema registra automáticamente:

### Errores de Conexión (Req. 6.1, 6.2)
- URL del broker (sin credenciales sensibles)
- Número de intento de conexión
- Código de error específico
- Timestamp preciso

### Errores de Procesamiento de Mensajes (Req. 6.4)
- Tópico del mensaje
- Tamaño del payload
- Vista previa del payload (primeros 100 caracteres)
- Nivel de QoS
- Flag de retain

### Errores de Publicación (Req. 6.3)
- Tópico de destino
- Tamaño del mensaje
- Configuración de QoS y retain
- Estado de conexión del cliente

### Reconexiones Exitosas (Req. 6.5)
- Número de intentos realizados
- Tiempo total de inactividad
- Información del broker
- Timestamp de reconexión

## Mejores Prácticas

### 1. Monitoreo Proactivo
```typescript
// Configurar alertas para errores críticos
const { hasCriticalErrors } = useMqttErrorMonitoring();

useEffect(() => {
  if (hasCriticalErrors) {
    // Enviar notificación al equipo de soporte
    notifySupport('Critical MQTT errors detected');
  }
}, [hasCriticalErrors]);
```

### 2. Análisis de Tendencias
```typescript
// Revisar tendencias regularmente
const { errorTrends } = useMqttErrorMonitoring();

useEffect(() => {
  if (errorTrends.errorRate > 10) {
    console.warn('High error rate detected:', errorTrends);
  }
}, [errorTrends.errorRate]);
```

### 3. Limpieza de Historial
```typescript
// Limpiar historial periódicamente para gestión de memoria
const { clearErrorHistory } = useMqttErrorMonitoring();

useEffect(() => {
  const cleanup = setInterval(() => {
    clearErrorHistory();
  }, 24 * 60 * 60 * 1000); // Cada 24 horas

  return () => clearInterval(cleanup);
}, [clearErrorHistory]);
```

## Integración con Sistemas Externos

El sistema está preparado para integrarse con:

- **Sentry**: Para tracking de errores
- **DataDog**: Para monitoreo de métricas
- **Custom Analytics**: Endpoints personalizados
- **Alerting Systems**: Sistemas de notificación

La integración se puede configurar modificando el método `logToExternalSystems` en el `MqttErrorHandler`.