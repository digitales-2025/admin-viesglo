/**
 * Shared Hooks Index
 * Exports all custom hooks for easy importing
 */

// MQTT Hooks
export { useMqtt } from "./use-mqtt";
export { useMqttTopic } from "./use-mqtt-topic";
export { useMqttQueryIntegration } from "./use-mqtt-query-integration";
export { useMqttPublish, useMqttPublishJson, useMqttPublishRequest } from "./use-mqtt-publish";
export {
  useMqttErrorMonitoring,
  useMqttErrorsByCategory,
  useMqttErrorsBySeverity,
  useMqttHealthIndicator,
} from "./use-mqtt-error-monitoring";

// Notification Hooks
export { useNotifications } from "./use-notifications";

// Other existing hooks (add as needed)
export { useToast } from "./use-toast";
export { useIsMobile } from "./use-mobile";
export { useMediaQuery } from "./use-media-query";
export { usePagination } from "./use-pagination";
export { useRouteLoading } from "./use-route-loading";
export { useAuthLoading } from "./use-auth-loading";
export { useBreadcrumbs } from "./use-breadcrumbs";
export { useUbigeo } from "./useUbigeo";
