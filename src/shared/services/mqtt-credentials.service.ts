/**
 * MQTT Credentials Service
 * Handles fetching MQTT credentials from the backend endpoint
 */

import { http } from "../../lib/http/clientFetch";
import type { MqttCredentials } from "../types/mqtt.types";

/**
 * Backend response type for MQTT credentials
 * Matches the expected API response structure
 */
interface MqttCredentialsResponse {
  brokerUrl: string;
  username: string;
  password: string;
  clientId?: string;
}

/**
 * Service class for managing MQTT credentials
 * Integrates with existing backend client patterns with credential caching
 */
export class MqttCredentialsService {
  private static credentialsCache: {
    credentials: MqttCredentials | null;
    timestamp: number;
    pendingRequest: Promise<MqttCredentials> | null;
  } = {
    credentials: null,
    timestamp: 0,
    pendingRequest: null,
  };

  // Cache duration: 5 minutes (credentials shouldn't change frequently)
  private static readonly CACHE_DURATION = 5 * 60 * 1000;

  /**
   * Fetches MQTT credentials from the backend endpoint with caching to avoid multiple requests
   * Integrates with existing HTTP client and error handling patterns
   *
   * @param forceRefresh - Force fetch new credentials ignoring cache
   * @returns Promise<MqttCredentials> - The MQTT broker credentials
   * @throws Error if credentials cannot be fetched or user is not authenticated
   */
  static async getMqttCredentials(forceRefresh: boolean = false): Promise<MqttCredentials> {
    const now = Date.now();

    // Return cached credentials if they're still valid and not forcing refresh
    if (
      !forceRefresh &&
      this.credentialsCache.credentials &&
      now - this.credentialsCache.timestamp < this.CACHE_DURATION
    ) {
      console.log("🔄 Using cached MQTT credentials");
      return this.credentialsCache.credentials;
    }

    // If there's already a pending request, return it to avoid duplicate calls
    if (this.credentialsCache.pendingRequest && !forceRefresh) {
      console.log("⏳ Waiting for pending MQTT credentials request");
      return this.credentialsCache.pendingRequest;
    }

    console.log("🚀 Fetching fresh MQTT credentials from backend");

    // Create new request
    const credentialsRequest = this.fetchCredentialsFromBackend();
    this.credentialsCache.pendingRequest = credentialsRequest;

    try {
      const credentials = await credentialsRequest;

      // Cache the credentials
      this.credentialsCache.credentials = credentials;
      this.credentialsCache.timestamp = now;
      this.credentialsCache.pendingRequest = null;

      return credentials;
    } catch (error) {
      // Clear pending request on error
      this.credentialsCache.pendingRequest = null;
      throw error;
    }
  }

  /**
   * Internal method to fetch credentials from backend
   */
  private static async fetchCredentialsFromBackend(): Promise<MqttCredentials> {
    try {
      // Use existing HTTP client to fetch credentials from auth endpoint
      const response = await http.get<MqttCredentialsResponse>("/v1/auth/mqtt-credentials");

      // Transform response to match MqttCredentials interface
      const credentials: MqttCredentials = {
        brokerUrl: response.data.brokerUrl,
        username: response.data.username,
        password: response.data.password,
        clientId: response.data.clientId,
      };

      // Validate required fields
      if (!credentials.brokerUrl || !credentials.username || !credentials.password) {
        throw new Error("Invalid MQTT credentials received from server: missing required fields");
      }

      // Validate broker URL format
      if (!this.isValidBrokerUrl(credentials.brokerUrl)) {
        throw new Error("Invalid MQTT broker URL format received from server");
      }

      return credentials;
    } catch (error) {
      // Enhanced error handling with specific error messages
      if (error instanceof Error) {
        // Check for authentication errors
        if (error.message.includes("401") || error.message.includes("Unauthorized")) {
          throw new Error("Authentication required to fetch MQTT credentials. Please log in again.");
        }

        // Check for network/server errors
        if (error.message.includes("503") || error.message.includes("Network")) {
          throw new Error("MQTT credentials service temporarily unavailable. Please try again later.");
        }

        // Re-throw validation errors as-is
        if (error.message.includes("Invalid MQTT")) {
          throw error;
        }

        // Generic error with context
        throw new Error(`Failed to fetch MQTT credentials: ${error.message}`);
      }

      // Fallback for unknown error types
      throw new Error("An unexpected error occurred while fetching MQTT credentials");
    }
  }

  /**
   * Validates the broker URL format
   * Ensures the URL is properly formatted for WebSocket connections
   *
   * @param brokerUrl - The broker URL to validate
   * @returns boolean - True if URL is valid, false otherwise
   */
  private static isValidBrokerUrl(brokerUrl: string): boolean {
    try {
      const url = new URL(brokerUrl);

      // Accept WebSocket protocols for MQTT over WebSockets
      const validProtocols = ["ws:", "wss:", "mqtt:", "mqtts:"];

      return validProtocols.includes(url.protocol);
    } catch {
      return false;
    }
  }

  /**
   * Clears the cached credentials
   * Useful when authentication state changes or credentials become invalid
   */
  static clearCredentialsCache(): void {
    console.log("🧹 Clearing MQTT credentials cache");
    this.credentialsCache.credentials = null;
    this.credentialsCache.timestamp = 0;
    this.credentialsCache.pendingRequest = null;
  }

  /**
   * Forces a refresh of credentials and clears cache
   * Useful when token expires or connection fails due to authentication
   *
   * @returns Promise<MqttCredentials> - Fresh credentials from backend
   */
  static async refreshCredentials(): Promise<MqttCredentials> {
    this.clearCredentialsCache();
    return this.getMqttCredentials(true);
  }

  /**
   * Gets cached credentials without making a request
   * Returns null if no valid cached credentials exist
   *
   * @returns MqttCredentials | null - Cached credentials or null
   */
  static getCachedCredentials(): MqttCredentials | null {
    const now = Date.now();

    if (this.credentialsCache.credentials && now - this.credentialsCache.timestamp < this.CACHE_DURATION) {
      return this.credentialsCache.credentials;
    }

    return null;
  }

  /**
   * Checks if MQTT credentials are available without fetching them
   * Useful for determining if user is authenticated for MQTT access
   *
   * @returns Promise<boolean> - True if credentials are available, false otherwise
   */
  static async areMqttCredentialsAvailable(): Promise<boolean> {
    try {
      await this.getMqttCredentials();
      return true;
    } catch {
      return false;
    }
  }
}
