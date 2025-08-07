/**
 * MQTT Credentials Service
 * Handles fetching MQTT credentials from the backend endpoint
 */

import { http } from '../../lib/http/clientFetch';
import type { MqttCredentials } from '../types/mqtt.types';

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
 * Integrates with existing backend client patterns
 */
export class MqttCredentialsService {
  /**
   * Fetches MQTT credentials from the backend endpoint
   * Integrates with existing HTTP client and error handling patterns
   * 
   * @returns Promise<MqttCredentials> - The MQTT broker credentials
   * @throws Error if credentials cannot be fetched or user is not authenticated
   */
  static async getMqttCredentials(): Promise<MqttCredentials> {
    try {
      // Use existing HTTP client to fetch credentials from auth endpoint
      const response = await http.get<MqttCredentialsResponse>('/v1/auth/mqtt-credentials');
      
      // Transform response to match MqttCredentials interface
      const credentials: MqttCredentials = {
        brokerUrl: response.data.brokerUrl,
        username: response.data.username,
        password: response.data.password,
        clientId: response.data.clientId,
      };

      // Validate required fields
      if (!credentials.brokerUrl || !credentials.username || !credentials.password) {
        throw new Error('Invalid MQTT credentials received from server: missing required fields');
      }

      // Validate broker URL format
      if (!this.isValidBrokerUrl(credentials.brokerUrl)) {
        throw new Error('Invalid MQTT broker URL format received from server');
      }

      return credentials;
    } catch (error) {
      // Enhanced error handling with specific error messages
      if (error instanceof Error) {
        // Check for authentication errors
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          throw new Error('Authentication required to fetch MQTT credentials. Please log in again.');
        }
        
        // Check for network/server errors
        if (error.message.includes('503') || error.message.includes('Network')) {
          throw new Error('MQTT credentials service temporarily unavailable. Please try again later.');
        }
        
        // Re-throw validation errors as-is
        if (error.message.includes('Invalid MQTT')) {
          throw error;
        }
        
        // Generic error with context
        throw new Error(`Failed to fetch MQTT credentials: ${error.message}`);
      }
      
      // Fallback for unknown error types
      throw new Error('An unexpected error occurred while fetching MQTT credentials');
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
      const validProtocols = ['ws:', 'wss:', 'mqtt:', 'mqtts:'];
      
      return validProtocols.includes(url.protocol);
    } catch {
      return false;
    }
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