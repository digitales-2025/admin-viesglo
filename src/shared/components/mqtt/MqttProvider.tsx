/**
 * MQTT Provider Component
 * Unified provider that integrates all MQTT functionality with the app layout and authentication flow
 * Implements requirements 3.1, 3.5, 4.1 for comprehensive MQTT integration
 */

"use client";

import { createContext, useCallback, useContext, useEffect, useRef } from "react";

import { useMqtt } from "../../hooks/use-mqtt";
import { useMqttConnectionStore } from "../../stores/mqtt-connection.store";
import type { MqttMessage, UseMqttReturn } from "../../types/mqtt.types";
import { MqttQueryProvider, useMqttQueryContext } from "./MqttQueryProvider";
import { MqttSessionProvider } from "./MqttSessionProvider";

// Create MQTT Context for sharing the instance
const MqttContext = createContext<UseMqttReturn | null>(null);

export const useMqttContext = () => {
  const context = useContext(MqttContext);
  if (!context) {
    throw new Error("useMqttContext must be used within a MqttProvider");
  }
  return context;
};

interface MqttProviderProps {
  children: React.ReactNode;
  /**
   * Whether to enable debug logging for MQTT operations
   * @default false
   */
  enableDebugLogging?: boolean;
  /**
   * Custom error handler for MQTT errors
   */
  onError?: (error: Error, context: string) => void;
  /**
   * Callback when MQTT provider is fully initialized
   */
  onInitialized?: () => void;
  /**
   * Callback when MQTT provider is being cleaned up
   */
  onCleanup?: () => void;
}

/**
 * Internal MQTT Provider Core Component
 * This component has access to the query context and handles the actual MQTT instance
 */
function MqttProviderCore({
  children,
  enableDebugLogging = false,
  onError,
  onInitialized,
  onCleanup,
}: MqttProviderProps) {
  const isInitializedRef = useRef(false);
  const cleanupHandledRef = useRef(false);

  // Access MQTT connection store for monitoring
  const { status, error, client } = useMqttConnectionStore();

  // Get the global message handler from query context
  const { handleGlobalMessage: queryHandleGlobalMessage } = useMqttQueryContext();

  // Global message handler for all MQTT messages
  const handleGlobalMessage = useCallback(
    (topic: string, message: MqttMessage) => {
      if (enableDebugLogging) {
        console.log("MQTT Provider - Global message received:", {
          topic,
          messageSize: typeof message.payload === "string" ? message.payload.length : message.payload.length,
          qos: message.qos,
          retain: message.retain,
          timestamp: new Date().toISOString(),
        });
      }

      // Forward message to query integration handler
      queryHandleGlobalMessage(topic, message);
    },
    [enableDebugLogging, queryHandleGlobalMessage]
  );

  // Create error handler wrapper to match useMqtt's expected signature
  const handleMqttError = useCallback(
    (error: Error) => {
      onError?.(error, "MQTT_CLIENT_ERROR");
    },
    [onError]
  );

  // Create the main MQTT instance with global message handler
  const mqttInstance = useMqtt({
    // Evitar conexión automática cuando no hay sesión
    // La conexión se iniciará desde MqttSessionProvider al autenticarse
    autoConnect: false,
    onMessage: handleGlobalMessage,
    onError: handleMqttError,
  });

  /**
   * Initialize MQTT provider
   * Requirement 4.1: Proper initialization logic
   */
  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;

      if (enableDebugLogging) {
        console.log("MQTT Provider - Initializing MQTT provider", {
          timestamp: new Date().toISOString(),
          debugLogging: enableDebugLogging,
        });
      }

      // Set up global error handling for unhandled MQTT errors
      const handleGlobalMqttError = (error: Error, context: string) => {
        if (enableDebugLogging) {
          console.error("MQTT Provider - Global MQTT error:", {
            error: error.message,
            context,
            timestamp: new Date().toISOString(),
          });
        }

        onError?.(error, context);
      };

      // Store global error handler for access by other MQTT components
      if (typeof window !== "undefined") {
        (window as any).__mqttGlobalErrorHandler = handleGlobalMqttError;
      }

      // Call initialization callback
      onInitialized?.();

      if (enableDebugLogging) {
        console.log("MQTT Provider - Initialization complete");
      }
    }
  }, [enableDebugLogging, onError, onInitialized]);

  /**
   * Monitor MQTT connection state changes
   * Requirement 3.1: Monitor connection state during user session
   */
  useEffect(() => {
    if (enableDebugLogging) {
      console.log("MQTT Provider - Connection state changed:", {
        status,
        hasError: !!error,
        hasClient: !!client,
        timestamp: new Date().toISOString(),
      });
    }

    // Handle critical errors that might require app-level intervention
    if (error && status === "error") {
      const criticalError = new Error(`MQTT Provider Critical Error: ${error}`);

      if (enableDebugLogging) {
        console.error("MQTT Provider - Critical error detected:", {
          error,
          status,
          timestamp: new Date().toISOString(),
        });
      }

      // Notify global error handler
      if (typeof window !== "undefined" && (window as any).__mqttGlobalErrorHandler) {
        (window as any).__mqttGlobalErrorHandler(criticalError, "MQTT_PROVIDER_CRITICAL_ERROR");
      }
    }
  }, [status, error, client, enableDebugLogging]);

  /**
   * Cleanup on unmount
   * Requirements 3.5, 4.1: Proper cleanup logic to prevent memory leaks
   */
  useEffect(() => {
    return () => {
      if (!cleanupHandledRef.current) {
        cleanupHandledRef.current = true;

        if (enableDebugLogging) {
          console.log("MQTT Provider - Starting cleanup process", {
            timestamp: new Date().toISOString(),
          });
        }

        // Clean up global error handler
        if (typeof window !== "undefined") {
          delete (window as any).__mqttGlobalErrorHandler;
          delete (window as any).__mqttReconnectAfterTokenRefresh;
        }

        // Call cleanup callback
        onCleanup?.();

        if (enableDebugLogging) {
          console.log("MQTT Provider - Cleanup complete");
        }
      }
    };
  }, [enableDebugLogging, onCleanup]);

  /**
   * Handle page visibility changes to optimize MQTT connections
   * Requirement 3.1: Optimize connection management during user session
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (enableDebugLogging) {
        console.log("MQTT Provider - Page visibility changed:", {
          hidden: document.hidden,
          visibilityState: document.visibilityState,
          timestamp: new Date().toISOString(),
        });
      }

      // Note: We don't automatically disconnect on page hide as this could
      // interrupt real-time data flow. The session provider handles disconnection
      // based on authentication state, which is more appropriate.
    };

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibilityChange);

      return () => {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      };
    }
  }, [enableDebugLogging]);

  /**
   * Handle beforeunload to ensure clean disconnection
   * Requirement 3.5: Clean disconnection on app termination
   */
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (enableDebugLogging) {
        console.log("MQTT Provider - Page unloading, ensuring clean disconnection");
      }

      // The session provider and connection store will handle the actual disconnection
      // This is just for logging and any last-minute cleanup
    };

    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", handleBeforeUnload);

      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }
  }, [enableDebugLogging]);

  return (
    <MqttContext.Provider value={mqttInstance}>
      <MqttSessionProvider>{children}</MqttSessionProvider>
    </MqttContext.Provider>
  );
}

/**
 * Unified MQTT Provider Component
 *
 * This component serves as the main entry point for all MQTT functionality in the application.
 * It wraps and coordinates the MqttQueryProvider and MqttSessionProvider to provide a
 * comprehensive MQTT integration with the existing app layout and authentication flow.
 *
 * Features:
 * - Integrates with existing app layout and authentication flow
 * - Provides proper initialization and cleanup logic
 * - Coordinates between query integration and session management
 * - Handles global MQTT state management
 * - Provides debugging and monitoring capabilities
 *
 * Requirements implemented:
 * - 3.1: MQTT connection maintained during user session
 * - 3.5: Connection termination on token expiration and proper cleanup
 * - 4.1: Complete MQTT client lifecycle management
 *
 * Usage:
 * ```tsx
 * <MqttProvider enableDebugLogging={process.env.NODE_ENV === 'development'}>
 *   <App />
 * </MqttProvider>
 * ```
 *
 * @param children - Child components that can use MQTT functionality
 * @param enableDebugLogging - Whether to enable debug logging
 * @param onError - Custom error handler for MQTT errors
 * @param onInitialized - Callback when provider is initialized
 * @param onCleanup - Callback when provider is being cleaned up
 */
export function MqttProvider(props: MqttProviderProps) {
  return (
    <MqttQueryProvider>
      <MqttProviderCore {...props} />
    </MqttQueryProvider>
  );
}

/**
 * Hook to access MQTT Provider context and utilities
 * Provides access to provider-level functionality and state
 */
export function useMqttProvider() {
  const mqttContext = useMqttContext();
  const connectionStore = useMqttConnectionStore();

  return {
    /**
     * Access to all MQTT context methods
     */
    ...mqttContext,

    /**
     * Whether MQTT is connected and ready for use
     */
    isReady: mqttContext.isConnected,

    /**
     * Whether MQTT client exists
     */
    hasClient: !!mqttContext.client,

    /**
     * Current reconnection attempts count
     */
    reconnectAttempts: connectionStore.reconnectAttempts,

    /**
     * Whether network is online
     */
    isNetworkOnline: connectionStore.isNetworkOnline,

    /**
     * Whether token has expired
     */
    tokenExpired: connectionStore.tokenExpired,

    /**
     * Trigger manual reconnection (useful for debugging)
     */
    triggerReconnection: () => {
      if (typeof window !== "undefined" && (window as any).__mqttReconnectAfterTokenRefresh) {
        (window as any).__mqttReconnectAfterTokenRefresh();
      }
    },
  };
}

/**
 * Development utilities for MQTT Provider
 * Only available in development mode
 */
export const MqttProviderDevUtils = {
  /**
   * Get current MQTT provider state for debugging
   */
  getProviderState: () => {
    if (process.env.NODE_ENV !== "development") {
      console.warn("MqttProviderDevUtils is only available in development mode");
      return null;
    }

    const store = useMqttConnectionStore.getState();
    return {
      status: store.status,
      error: store.error,
      hasClient: !!store.client,
      reconnectAttempts: store.reconnectAttempts,
      isNetworkOnline: store.isNetworkOnline,
      tokenExpired: store.tokenExpired,
      lastConnected: store.lastConnected,
    };
  },

  /**
   * Force reconnection for testing
   */
  forceReconnection: () => {
    if (process.env.NODE_ENV !== "development") {
      console.warn("MqttProviderDevUtils is only available in development mode");
      return;
    }

    if (typeof window !== "undefined" && (window as any).__mqttReconnectAfterTokenRefresh) {
      console.log("MqttProviderDevUtils - Forcing reconnection");
      (window as any).__mqttReconnectAfterTokenRefresh();
    }
  },

  /**
   * Log current provider state
   */
  logProviderState: () => {
    if (process.env.NODE_ENV !== "development") {
      console.warn("MqttProviderDevUtils is only available in development mode");
      return;
    }

    const state = MqttProviderDevUtils.getProviderState();
    console.log("MQTT Provider State:", state);
  },
};
