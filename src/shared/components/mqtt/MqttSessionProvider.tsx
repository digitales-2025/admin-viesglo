/**
 * MQTT Session Provider Component
 * Manages MQTT connection lifecycle based on user authentication
 * Implements requirements 3.1, 3.3, 3.5 for session management
 */

"use client";

import { useEffect } from "react";

import { useMqttSessionLifecycle } from "../../hooks/use-mqtt-session-lifecycle";
import { useMqttQueryProvider } from "./MqttQueryProvider";

interface MqttSessionProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component that manages MQTT session lifecycle
 * Should be placed at the app level, after QueryProvider and authentication setup
 *
 * This component:
 * - Automatically connects MQTT when user authenticates
 * - Automatically disconnects MQTT when user logs out
 * - Handles token expiration scenarios
 * - Integrates with the existing authentication system
 * - Cleans up MQTT cache on logout
 *
 * Requirements implemented:
 * - 3.1: MQTT connection maintained during user session
 * - 3.3: Clean disconnection on explicit logout
 * - 3.5: Connection termination on token expiration
 *
 * @param children - Child components that can use MQTT functionality
 */
export function MqttSessionProvider({ children }: MqttSessionProviderProps) {
  const { clearAllTopics } = useMqttQueryProvider();

  const { isAuthenticated, isAuthError, tokenExpired, mqttStatus, reconnectAfterTokenRefresh } =
    useMqttSessionLifecycle({
      autoConnectOnAuth: true,
      autoDisconnectOnLogout: true,

      onAuthConnect: () => {
        console.log("MQTT Session Provider - MQTT connected due to authentication");
      },

      onAuthDisconnect: () => {
        console.log("MQTT Session Provider - MQTT disconnected due to logout, clearing cache");
        // Clear all MQTT topic data from TanStack Query cache on logout
        // Requirement 3.3: Clean disconnection includes cache cleanup
        clearAllTopics();
      },

      onTokenExpired: () => {
        console.log("MQTT Session Provider - Token expired, clearing cache");
        // Clear all MQTT topic data from TanStack Query cache on token expiration
        // Requirement 3.5: Token expiration cleanup
        clearAllTopics();
      },
    });

  // Log session state changes for debugging
  useEffect(() => {
    console.log("MQTT Session Provider - Session state changed:", {
      isAuthenticated,
      isAuthError,
      tokenExpired,
      mqttStatus,
      timestamp: new Date().toISOString(),
    });
  }, [isAuthenticated, isAuthError, tokenExpired, mqttStatus]);

  // Expose reconnection function globally for debugging/manual control
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).__mqttReconnectAfterTokenRefresh = reconnectAfterTokenRefresh;
    }

    return () => {
      if (typeof window !== "undefined") {
        delete (window as any).__mqttReconnectAfterTokenRefresh;
      }
    };
  }, [reconnectAfterTokenRefresh]);

  return <>{children}</>;
}

/**
 * Hook to access MQTT session state from child components
 * Useful for components that need to react to authentication/MQTT state changes
 */
export function useMqttSession() {
  const sessionLifecycle = useMqttSessionLifecycle({
    autoConnectOnAuth: false, // Don't auto-connect since the provider handles it
    autoDisconnectOnLogout: false, // Don't auto-disconnect since the provider handles it
  });

  return {
    /**
     * Whether user is currently authenticated
     */
    isAuthenticated: sessionLifecycle.isAuthenticated,

    /**
     * Whether there's an authentication error
     */
    isAuthError: sessionLifecycle.isAuthError,

    /**
     * Whether token has expired
     */
    tokenExpired: sessionLifecycle.tokenExpired,

    /**
     * Current MQTT connection status
     */
    mqttStatus: sessionLifecycle.mqttStatus,

    /**
     * Whether MQTT is connected and ready
     */
    isMqttReady: sessionLifecycle.mqttStatus === "connected" && sessionLifecycle.isAuthenticated,

    /**
     * Manual reconnection after token refresh
     */
    reconnectAfterTokenRefresh: sessionLifecycle.reconnectAfterTokenRefresh,
  };
}
