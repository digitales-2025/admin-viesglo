/**
 * MQTT Session Lifecycle Management Hook
 * Connects MQTT client to user authentication lifecycle
 * Implements requirements 3.1, 3.3, 3.5 for session management
 */

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { backend } from "@/lib/api/types/backend";
import { useMqttContext } from "../context/mqtt-provider";
import { MqttCredentialsService } from "../services/mqtt-credentials.service";
import { useMqttConnectionStore } from "../stores/mqtt-connection.store";

/**
 * Options for MQTT session lifecycle management
 */
interface UseMqttSessionLifecycleOptions {
  /**
   * Whether to automatically connect MQTT on authentication
   * @default true
   */
  autoConnectOnAuth?: boolean;

  /**
   * Whether to automatically disconnect MQTT on logout
   * @default true
   */
  autoDisconnectOnLogout?: boolean;

  /**
   * Callback when MQTT connects due to authentication
   */
  onAuthConnect?: () => void;

  /**
   * Callback when MQTT disconnects due to logout
   */
  onAuthDisconnect?: () => void;

  /**
   * Callback when token expiration is detected
   */
  onTokenExpired?: () => void;
}

/**
 * Hook that manages MQTT connection lifecycle based on user authentication state
 *
 * This hook:
 * - Monitors authentication state changes
 * - Automatically connects MQTT when user is authenticated
 * - Automatically disconnects MQTT when user logs out
 * - Handles token expiration scenarios
 * - Integrates with the existing authentication system
 *
 * Requirements implemented:
 * - 3.1: MQTT connection maintained during user session
 * - 3.3: Clean disconnection on explicit logout
 * - 3.5: Connection termination on token expiration
 */
export function useMqttSessionLifecycle(options: UseMqttSessionLifecycleOptions = {}) {
  const {
    autoConnectOnAuth = true,
    autoDisconnectOnLogout = true,
    onAuthConnect,
    onAuthDisconnect,
    onTokenExpired,
  } = options;

  const router = useRouter();
  const queryClient = useQueryClient();
  const { connect, disconnect, reconnect } = useMqttContext();
  const { status, tokenExpired, setTokenExpired } = useMqttConnectionStore();

  // Track previous authentication state to detect changes
  const prevAuthStateRef = useRef<boolean | null>(null);
  const isInitializedRef = useRef(false);
  const tokenExpirationHandledRef = useRef(false);
  const connectionInProgressRef = useRef(false);
  const disconnectionInProgressRef = useRef(false);

  // Query to check current authentication status
  const authQuery = backend.useQuery("get", "/v1/auth/me", {
    retry: (failureCount: number, error: unknown) => {
      // Don't retry on 401/403 errors (authentication failures)
      if (error && typeof error === "object" && "status" in (error as Record<string, unknown>)) {
        const status = (error as { status?: number }).status;
        if (status === 401 || status === 403) {
          return false;
        }
      }
      return failureCount < 2;
    },
    refetchInterval: 5 * 60 * 1000, // Check auth status every 5 minutes
    refetchIntervalInBackground: false,
    staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
    // Disable query initially until we're sure we want to check auth
    enabled: true,
  });

  const isAuthenticated = !authQuery.isError && !!authQuery.data;
  const isAuthError = authQuery.isError;

  // Add loading state to prevent MQTT connection during auth loading
  const isAuthLoading = authQuery.isLoading || authQuery.isFetching;

  /**
   * Handles authentication state changes with duplicate prevention
   * Requirement 3.1: Automatic connection on login
   */
  const handleAuthStateChange = useCallback(
    async (isCurrentlyAuthenticated: boolean, wasAuthenticated: boolean | null, isLoading: boolean) => {
      // Don't connect while authentication is still loading
      if (isLoading) {
        return;
      }

      // User just logged in (and auth is not loading)
      if (isCurrentlyAuthenticated && wasAuthenticated === false && autoConnectOnAuth) {
        // ✅ Reset connection progress flag if we're disconnected
        if (status === "disconnected") {
          connectionInProgressRef.current = false;
        }

        // Prevent multiple simultaneous connection attempts
        if (connectionInProgressRef.current || status === "connecting" || status === "connected") {
          return;
        }

        connectionInProgressRef.current = true;

        try {
          // Small delay to ensure authentication is fully settled
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Clear cached credentials to get fresh ones
          MqttCredentialsService.clearCredentialsCache();

          // Reset token expiration state
          setTokenExpired(false);
          tokenExpirationHandledRef.current = false;

          await connect();
          onAuthConnect?.();
        } catch (error) {
          console.error("MQTT Session Lifecycle - Failed to connect on authentication:", error);
        } finally {
          connectionInProgressRef.current = false;
        }
      }

      // User just logged out
      else if (!isCurrentlyAuthenticated && wasAuthenticated === true && autoDisconnectOnLogout) {
        // Prevent multiple simultaneous disconnection attempts
        if (disconnectionInProgressRef.current || status === "disconnected") {
          return;
        }

        disconnectionInProgressRef.current = true;

        try {
          // Clear cached credentials on logout
          MqttCredentialsService.clearCredentialsCache();

          await disconnect();
          onAuthDisconnect?.();
        } catch (error) {
          console.error("MQTT Session Lifecycle - Failed to disconnect on logout:", error);
        } finally {
          disconnectionInProgressRef.current = false;
        }
      }
    },
    [
      autoConnectOnAuth,
      autoDisconnectOnLogout,
      connect,
      disconnect,
      onAuthConnect,
      onAuthDisconnect,
      setTokenExpired,
      status,
    ]
  );

  /**
   * Handles token expiration scenarios with improved cleanup
   * Requirement 3.5: Connection termination on token expiration
   */
  const handleTokenExpiration = useCallback(async () => {
    if (tokenExpirationHandledRef.current) {
      return; // Already handled
    }

    tokenExpirationHandledRef.current = true;

    try {
      // Clear cached credentials immediately
      MqttCredentialsService.clearCredentialsCache();

      // Disconnect MQTT client
      await disconnect();

      // Clear any cached authentication data
      queryClient.removeQueries({ queryKey: ["get", "/v1/auth/me"] });

      // Reset connection progress flags
      connectionInProgressRef.current = false;
      disconnectionInProgressRef.current = false;

      // Notify callback
      onTokenExpired?.();

      // Redirect to login page after a short delay to allow cleanup
      setTimeout(() => {
        router.push("/auth/sign-in");
      }, 1000);
    } catch (error) {
      console.error("MQTT Session Lifecycle - Error handling token expiration:", error);
    }
  }, [disconnect, onTokenExpired, router, queryClient]);

  /**
   * Monitor authentication state changes
   * Requirement 3.1: Connect MQTT client to user authentication lifecycle
   */
  useEffect(() => {
    // En el primer render, si ya estamos autenticados, iniciar conexión inmediata
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      prevAuthStateRef.current = isAuthenticated;

      if (
        isAuthenticated &&
        !isAuthLoading &&
        autoConnectOnAuth &&
        status !== "connecting" &&
        status !== "connected" &&
        !connectionInProgressRef.current
      ) {
        connectionInProgressRef.current = true;
        // Pequeña espera para asegurar que el estado de auth esté asentado
        setTimeout(async () => {
          try {
            MqttCredentialsService.clearCredentialsCache();
            setTokenExpired(false);
            tokenExpirationHandledRef.current = false;
            await connect();
            onAuthConnect?.();
          } catch (error) {
            console.error("MQTT Session Lifecycle - Initial connect failed:", error);
          } finally {
            connectionInProgressRef.current = false;
          }
        }, 300);
      }

      return;
    }

    const wasAuthenticated = prevAuthStateRef.current;

    // Only handle state changes when not loading, and not initial states
    if (wasAuthenticated !== isAuthenticated && !isAuthLoading) {
      handleAuthStateChange(isAuthenticated, wasAuthenticated, isAuthLoading);
      prevAuthStateRef.current = isAuthenticated;
    }
  }, [
    isAuthenticated,
    isAuthLoading,
    handleAuthStateChange,
    autoConnectOnAuth,
    status,
    connect,
    setTokenExpired,
    onAuthConnect,
  ]);

  /**
   * Monitor token expiration from MQTT store
   * Requirement 3.5: Handle token expiration
   */
  useEffect(() => {
    if (tokenExpired && !tokenExpirationHandledRef.current) {
      handleTokenExpiration();
    }
  }, [tokenExpired, handleTokenExpiration]);

  /**
   * Monitor authentication errors (401/403) which indicate token expiration
   * Requirement 3.5: Detect token expiration from API responses
   */
  useEffect(() => {
    if (isAuthError && authQuery.error) {
      const error = authQuery.error as { status?: number };

      // Check if it's an authentication error (401/403)
      if (error.status === 401 || error.status === 403) {
        // Mark token as expired in MQTT store
        setTokenExpired(true);
      }
    }
  }, [isAuthError, authQuery.error, setTokenExpired]);

  /**
   * Cleanup on unmount
   * Requirement 3.5: Ensure clean disconnection
   */
  useEffect(() => {
    return () => {
      // Note: We don't disconnect here as the component might unmount for other reasons
      // The actual cleanup should happen in the main MQTT hook
    };
  }, []);

  /**
   * Manual reconnection after token refresh with improved error handling
   * Useful when the app refreshes tokens without full logout/login
   * Returns a promise that resolves on successful reconnection or rejects on failure
   */
  const reconnectAfterTokenRefresh = useCallback(async () => {
    // Prevent multiple simultaneous reconnection attempts
    if (connectionInProgressRef.current) {
      return Promise.resolve(); // Return resolved promise to not break awaiting code
    }

    connectionInProgressRef.current = true;

    try {
      // Clear cached credentials to force fresh fetch
      MqttCredentialsService.clearCredentialsCache();

      // Reset token expiration state
      setTokenExpired(false);
      tokenExpirationHandledRef.current = false;

      // Refetch auth data to get fresh token
      await authQuery.refetch();

      // Reconnect MQTT with fresh credentials
      await reconnect();

      return Promise.resolve(); // Explicit success
    } catch (error) {
      console.error("MQTT Session Lifecycle - Failed to reconnect after token refresh:", error);

      // If reconnection fails, clear credentials and mark token as expired
      MqttCredentialsService.clearCredentialsCache();
      setTokenExpired(true);

      // Return rejected promise so calling code knows reconnection failed
      return Promise.reject(error);
    } finally {
      connectionInProgressRef.current = false;
    }
  }, [setTokenExpired, authQuery, reconnect]);

  return {
    /**
     * Current authentication status
     */
    isAuthenticated,

    /**
     * Whether there's an authentication error
     */
    isAuthError,

    /**
     * Whether authentication is loading
     */
    isAuthLoading,

    /**
     * Whether token has expired
     */
    tokenExpired,

    /**
     * Current MQTT connection status
     */
    mqttStatus: status,

    /**
     * Manual reconnection after token refresh
     */
    reconnectAfterTokenRefresh,

    /**
     * Authentication query for additional control
     */
    authQuery,
  };
}
