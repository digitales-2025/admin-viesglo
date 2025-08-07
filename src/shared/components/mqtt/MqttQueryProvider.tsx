/**
 * MQTT Query Provider Component
 * Sets up global MQTT-TanStack Query integration
 * Implements requirement 2.1: Global MQTT state management with TanStack Query
 */

"use client";

import { useEffect } from "react";

import { useMqttQueryIntegration } from "../../hooks/use-mqtt-query-integration";

interface MqttQueryProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component that initializes MQTT-TanStack Query integration
 * Should be placed at the app level, after QueryProvider and authentication
 *
 * This component:
 * - Sets up global MQTT message handling
 * - Integrates with TanStack Query cache
 * - Provides cache invalidation on message receipt
 *
 * @param children - Child components that can use useMqttTopic
 */
export function MqttQueryProvider({ children }: MqttQueryProviderProps) {
  const {
    isConnected,
    // TODO: Add invalidateAllTopics back in
    // invalidateAllTopics,
    clearAllTopics,
    getActiveTopics,
  } = useMqttQueryIntegration();

  // Log connection status changes for debugging
  useEffect(() => {
    console.log("MQTT Query Provider - Connection status changed:", {
      isConnected,
      activeTopics: getActiveTopics().length,
      timestamp: new Date().toISOString(),
    });
  }, [isConnected, getActiveTopics]);

  // Cleanup on unmount (e.g., user logout)
  useEffect(() => {
    return () => {
      console.log("MQTT Query Provider - Cleaning up on unmount");
      clearAllTopics();
    };
  }, [clearAllTopics]);

  return <>{children}</>;
}

/**
 * Hook to access MQTT Query Provider functionality
 * Useful for components that need to manage MQTT cache globally
 */
export function useMqttQueryProvider() {
  const integration = useMqttQueryIntegration();

  return {
    isConnected: integration.isConnected,
    invalidateAllTopics: integration.invalidateAllTopics,
    clearAllTopics: integration.clearAllTopics,
    getActiveTopics: integration.getActiveTopics,
  };
}
