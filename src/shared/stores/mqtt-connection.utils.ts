/**
 * MQTT Connection State Utilities
 * Provides validation and helper functions for MQTT connection state management
 */

import type { ConnectionStatus } from "../types/mqtt.types";

/**
 * Valid state transitions for MQTT connection
 * Ensures proper state flow as per requirements
 *
 * ✅ Permite transiciones más flexibles para manejar casos edge:
 * - disconnected → disconnected: Para resets de estado
 * - disconnected → connected: Para conexiones directas del cliente MQTT
 */
const VALID_TRANSITIONS: Record<ConnectionStatus, ConnectionStatus[]> = {
  disconnected: ["connecting", "connected", "error", "disconnected"], // ✅ Agregado "connected" y "disconnected"
  connecting: ["connected", "error", "disconnected"],
  connected: ["disconnected", "reconnecting", "error"],
  reconnecting: ["connected", "error", "disconnected"],
  error: ["connecting", "reconnecting", "disconnected"],
};

/**
 * Validates if a state transition is allowed
 * @param from Current connection status
 * @param to Target connection status
 * @returns True if transition is valid
 */
export function isValidStateTransition(from: ConnectionStatus, to: ConnectionStatus): boolean {
  const isValid = VALID_TRANSITIONS[from].includes(to);

  return isValid;
}

/**
 * Gets the next valid states from current state
 * @param current Current connection status
 * @returns Array of valid next states
 */
export function getValidNextStates(current: ConnectionStatus): ConnectionStatus[] {
  return VALID_TRANSITIONS[current];
}

/**
 * Determines if the connection is in a stable state
 * @param status Current connection status
 * @returns True if status is stable (connected or disconnected)
 */
export function isStableState(status: ConnectionStatus): boolean {
  return status === "connected" || status === "disconnected";
}

/**
 * Determines if the connection is in a transitional state
 * @param status Current connection status
 * @returns True if status is transitional (connecting or reconnecting)
 */
export function isTransitionalState(status: ConnectionStatus): boolean {
  return status === "connecting" || status === "reconnecting";
}

/**
 * Determines if the connection is in an error state
 * @param status Current connection status
 * @returns True if status indicates an error
 */
export function isErrorState(status: ConnectionStatus): boolean {
  return status === "error";
}

/**
 * Gets a human-readable description of the connection status
 * @param status Current connection status
 * @returns Human-readable status description
 */
export function getStatusDescription(status: ConnectionStatus): string {
  const descriptions: Record<ConnectionStatus, string> = {
    disconnected: "Disconnected from MQTT broker",
    connecting: "Connecting to MQTT broker...",
    connected: "Connected to MQTT broker",
    reconnecting: "Reconnecting to MQTT broker...",
    error: "Connection error occurred",
  };

  return descriptions[status];
}

/**
 * Calculates the next reconnection delay using exponential backoff with jitter
 * @param attempt Current reconnection attempt number (0-based)
 * @param baseDelay Base delay in milliseconds (default: 1000ms)
 * @param maxDelay Maximum delay in milliseconds (default: 30000ms)
 * @param backoffMultiplier Exponential backoff multiplier (default: 2)
 * @param jitterEnabled Whether to add random jitter (default: true)
 * @returns Delay in milliseconds for the next reconnection attempt
 */
export function calculateReconnectionDelay(
  attempt: number,
  baseDelay: number = 1000,
  maxDelay: number = 30000,
  backoffMultiplier: number = 2,
  jitterEnabled: boolean = true
): number {
  // Calculate exponential backoff delay
  const exponentialDelay = baseDelay * Math.pow(backoffMultiplier, attempt);
  const cappedDelay = Math.min(exponentialDelay, maxDelay);

  // Add jitter to prevent thundering herd problem
  if (jitterEnabled) {
    // Add random jitter of ±25% of the delay
    const jitterRange = cappedDelay * 0.25;
    const jitter = (Math.random() - 0.5) * 2 * jitterRange;
    return Math.max(baseDelay, cappedDelay + jitter);
  }

  return cappedDelay;
}

/**
 * Simple check if reconnection should be attempted based on attempt count
 * @param attempts Current number of reconnection attempts
 * @param maxAttempts Maximum allowed reconnection attempts (default: 10)
 * @returns True if reconnection should be attempted
 */
export function shouldAttemptBasicReconnection(attempts: number, maxAttempts: number = 10): boolean {
  return attempts < maxAttempts;
}

/**
 * Creates a standardized error message for logging
 * @param context Context where the error occurred
 * @param error Error object or message
 * @param additionalInfo Additional information to include
 * @returns Formatted error message
 */
export function formatMqttError(context: string, error: Error | string, additionalInfo?: Record<string, any>): string {
  const errorMessage = error instanceof Error ? error.message : error;
  const timestamp = new Date().toISOString();

  let message = `[MQTT ${context}] ${errorMessage} (${timestamp})`;

  if (additionalInfo) {
    const info = Object.entries(additionalInfo)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");
    message += ` - ${info}`;
  }

  return message;
}

/**
 * Validates MQTT v5.0 connection options
 * @param options Connection options to validate
 * @returns Validation result with any issues found
 */
export function validateMqttV5Options(options: any): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  // Check protocol version
  if (options.protocolVersion !== 5) {
    issues.push(`Invalid protocol version: ${options.protocolVersion}. Expected: 5`);
  }

  // Check keepalive range
  if (options.keepalive < 0 || options.keepalive > 65535) {
    issues.push(`Invalid keepalive: ${options.keepalive}. Must be between 0-65535`);
  }

  // Check connect timeout
  if (options.connectTimeout < 1000) {
    issues.push(`Connect timeout too low: ${options.connectTimeout}ms. Minimum: 1000ms`);
  }

  // Check v5.0 properties
  if (options.properties) {
    const props = options.properties;

    if (props.sessionExpiryInterval !== undefined && props.sessionExpiryInterval < 0) {
      issues.push(`Invalid sessionExpiryInterval: ${props.sessionExpiryInterval}`);
    }

    if (props.receiveMaximum !== undefined && (props.receiveMaximum < 1 || props.receiveMaximum > 65535)) {
      issues.push(`Invalid receiveMaximum: ${props.receiveMaximum}. Must be between 1-65535`);
    }

    if (props.maximumPacketSize !== undefined && props.maximumPacketSize < 1) {
      issues.push(`Invalid maximumPacketSize: ${props.maximumPacketSize}`);
    }

    if (props.topicAliasMaximum !== undefined && props.topicAliasMaximum < 0) {
      issues.push(`Invalid topicAliasMaximum: ${props.topicAliasMaximum}`);
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

/**
 * Transforms broker URL for WebSocket transport
 * @param url Original broker URL
 * @returns WebSocket-compatible URL
 */
export function transformToWebSocketUrl(url: string): string {
  let wsUrl = url;

  // Transform protocol
  if (wsUrl.startsWith("mqtt://")) {
    wsUrl = wsUrl.replace("mqtt://", "ws://");
  } else if (wsUrl.startsWith("mqtts://")) {
    wsUrl = wsUrl.replace("mqtts://", "wss://");
  }

  // Ensure WebSocket path is included
  if (!wsUrl.includes("/mqtt") && (wsUrl.startsWith("ws://") || wsUrl.startsWith("wss://"))) {
    wsUrl = wsUrl.replace(/\/$/, "") + "/mqtt";
  }

  return wsUrl;
}

/**
 * Generates a unique client ID for MQTT v5.0
 * @param prefix Optional prefix for the client ID
 * @returns Unique client ID string
 */
export function generateClientId(prefix: string = "mqtt-client"): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 11);
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Checks if the current error indicates a token expiration
 * @param error Error object or message
 * @returns True if error indicates token expiration
 */
export function isTokenExpirationError(error: Error | string): boolean {
  const errorMessage = error instanceof Error ? error.message.toLowerCase() : error.toLowerCase();

  // Common patterns for authentication/authorization errors
  const tokenExpirationPatterns = [
    "unauthorized",
    "authentication failed",
    "bad user name or password",
    "not authorized",
    "token expired",
    "invalid credentials",
    "access denied",
    "forbidden",
  ];

  return tokenExpirationPatterns.some((pattern) => errorMessage.includes(pattern));
}

/**
 * Checks if the current error indicates a network connectivity issue
 * @param error Error object or message
 * @returns True if error indicates network connectivity issue
 */
export function isNetworkConnectivityError(error: Error | string): boolean {
  const errorMessage = error instanceof Error ? error.message.toLowerCase() : error.toLowerCase();
  const errorCode = (error as any)?.code?.toLowerCase();

  // Common patterns for network connectivity errors
  const networkErrorPatterns = [
    "network error",
    "connection refused",
    "connection timeout",
    "connection failed",
    "server unavailable",
    "dns lookup failed",
    "socket hang up",
    "enotfound",
    "econnrefused",
    "econnreset",
    "etimedout",
    "enetunreach",
    "ehostunreach",
  ];

  const networkErrorCodes = ["enotfound", "econnrefused", "econnreset", "etimedout", "enetunreach", "ehostunreach"];

  return (
    networkErrorPatterns.some((pattern) => errorMessage.includes(pattern)) ||
    (errorCode && networkErrorCodes.includes(errorCode))
  );
}

/**
 * Determines if reconnection should be attempted based on error type and attempt count
 * @param error Error that caused disconnection
 * @param attempts Current number of reconnection attempts
 * @param maxAttempts Maximum allowed reconnection attempts
 * @param isNetworkOnline Whether network is currently online
 * @param isTokenExpired Whether authentication token is expired
 * @returns Object indicating if reconnection should be attempted and the reason
 */
export function shouldAttemptReconnection(
  error: Error | string | null,
  attempts: number,
  maxAttempts: number = 10,
  isNetworkOnline: boolean = true,
  isTokenExpired: boolean = false
): { shouldReconnect: boolean; reason: string } {
  // Don't reconnect if token is expired - requires re-authentication
  if (isTokenExpired) {
    return {
      shouldReconnect: false,
      reason: "Authentication token expired - requires re-authentication",
    };
  }

  // Don't reconnect if network is offline
  if (!isNetworkOnline) {
    return {
      shouldReconnect: false,
      reason: "Network is offline - waiting for connectivity",
    };
  }

  // Don't reconnect if max attempts reached
  if (attempts >= maxAttempts) {
    return {
      shouldReconnect: false,
      reason: `Maximum reconnection attempts (${maxAttempts}) reached`,
    };
  }

  // Check if error indicates token expiration
  if (error && isTokenExpirationError(error)) {
    return {
      shouldReconnect: false,
      reason: "Authentication error detected - requires re-authentication",
    };
  }

  // For network errors or other recoverable errors, attempt reconnection
  return {
    shouldReconnect: true,
    reason: "Recoverable error - attempting reconnection",
  };
}

/**
 * Creates a network connectivity monitor
 * @param onOnline Callback when network comes online
 * @param onOffline Callback when network goes offline
 * @returns Cleanup function to remove event listeners
 */
export function createNetworkMonitor(onOnline: () => void, onOffline: () => void): () => void {
  const handleOnline = () => {
    onOnline();
  };

  const handleOffline = () => {
    onOffline();
  };

  // Add event listeners for network status changes
  if (typeof window !== "undefined") {
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Return cleanup function
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }

  // Return no-op cleanup for server-side rendering
  return () => {};
}
