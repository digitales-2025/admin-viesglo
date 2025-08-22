/**
 * MQTT Actions Utilities
 * Re-exports server actions and provides client-side utilities for MQTT operations
 */

// Re-export server actions from the proper server actions file
export { publishMqttMessage, publishMqttMessageWithProperties, publishMqttRequest } from "./mqtt-server.actions";

// Import types for client-side use
export type { MqttActionResponse, MqttPublishOptions } from "@/shared/types/mqtt.types";

/**
 * Client-side MQTT utilities
 * These functions can be used from client components
 */

/**
 * Validates a MQTT topic string
 * @param topic - The topic to validate
 * @returns boolean - True if valid, false otherwise
 */
export function validateMqttTopic(topic: string): boolean {
  if (!topic || typeof topic !== "string" || topic.trim() === "") {
    return false;
  }

  // Basic MQTT topic validation rules
  const trimmedTopic = topic.trim();

  // Topics cannot be empty or contain null characters
  if (trimmedTopic.length === 0 || trimmedTopic.includes("\0")) {
    return false;
  }

  // Topics cannot exceed 65535 UTF-8 bytes
  if (new TextEncoder().encode(trimmedTopic).length > 65535) {
    return false;
  }

  // Wildcard characters are not allowed in publish topics
  if (trimmedTopic.includes("+") || trimmedTopic.includes("#")) {
    return false;
  }

  return true;
}

/**
 * Sanitizes payload for MQTT publishing
 * @param payload - The payload to sanitize
 * @returns string - Sanitized payload string
 */
export function sanitizeMqttPayload(payload: unknown): string {
  if (typeof payload === "string") {
    return payload;
  }

  if (payload === null || payload === undefined) {
    return "";
  }

  try {
    return JSON.stringify(payload);
  } catch (error) {
    console.warn("Failed to serialize payload, converting to string:", error);
    return String(payload);
  }
}

/**
 * Validates MQTT QoS level
 * @param qos - The QoS level to validate
 * @returns boolean - True if valid, false otherwise
 */
export function validateMqttQoS(qos: unknown): qos is 0 | 1 | 2 {
  return qos === 0 || qos === 1 || qos === 2;
}
