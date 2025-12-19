"use client";

import { MqttProvider } from "./MqttProvider";

interface MqttProviderWrapperProps {
  children: React.ReactNode;
  enableDebugLogging?: boolean;
}

/**
 * Wrapper Client Component para MqttProvider
 * Resuelve el problema de pasar funciones desde Server Components a Client Components
 * Define las funciones de callback internamente en el Client Component
 */
export function MqttProviderWrapper({ children, enableDebugLogging = false }: MqttProviderWrapperProps) {
  // Definir las funciones dentro del Client Component
  const handleError = (error: Error, context: string) => {
    console.error("MQTT Provider Error:", { error: error.message, context });
  };

  const handleInitialized = () => {};

  return (
    <MqttProvider enableDebugLogging={enableDebugLogging} onError={handleError} onInitialized={handleInitialized}>
      {children}
    </MqttProvider>
  );
}
