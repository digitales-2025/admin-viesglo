/**
 * MQTT Configuration Constants
 * Default settings and configuration for MQTT client
 */

import type { IClientOptions, MqttClient as MqttJsClient } from "mqtt";

import type { MqttConnectionOptions } from "../types/mqtt.types";

/**
 * WebSocket transport configuration for MQTT over WebSockets
 * Ensures proper WebSocket connection setup for browser environments
 */
export const WEBSOCKET_CONFIG = {
  // WebSocket-specific options
  transformWsUrl: (url: string, _options: IClientOptions, _client: MqttJsClient) => {
    // Ensure WebSocket protocol is used
    if (url.startsWith("mqtt://")) {
      return url.replace("mqtt://", "ws://");
    }
    if (url.startsWith("mqtts://")) {
      return url.replace("mqtts://", "wss://");
    }
    return url;
  },
  // WebSocket connection options
  wsOptions: {
    perMessageDeflate: false, // Disable compression for better performance
    maxPayload: 1048576, // 1MB max payload
  },
};

/**
 * Default MQTT v5.0 connection options
 * Based on design document specifications with full v5.0 protocol support
 * Requirements: 1.3, 3.1 - MQTT v5.0 protocol with WebSocket transport
 */
export const DEFAULT_MQTT_OPTIONS: MqttConnectionOptions = {
  // Core connection settings
  keepalive: 60, // Send ping every 60 seconds
  protocolVersion: 5, // MQTT v5.0 protocol
  clean: true, // Clean session on connect
  reconnectPeriod: 1000, // Reconnect after 1 second
  connectTimeout: 30000, // 30 second connection timeout

  // MQTT v5.0 specific properties
  properties: {
    // Session management
    sessionExpiryInterval: 3600, // Session expires after 1 hour of inactivity

    // Flow control
    receiveMaximum: 100, // Maximum number of QoS 1 and QoS 2 publications
    maximumPacketSize: 1048576, // 1MB maximum packet size

    // Topic alias support for bandwidth optimization
    topicAliasMaximum: 10, // Support up to 10 topic aliases

    // Enhanced features
    requestResponseInformation: true, // Request response information from server
    requestProblemInformation: true, // Request problem information on errors

    // User properties for custom metadata
    userProperties: {
      "client-type": "web-frontend",
      "client-version": "1.0.0",
    },
  },
};

/**
 * Reconnection configuration with exponential backoff
 * Requirements: 3.2, 3.4 - Automatic reconnection with backoff strategy
 */
export const RECONNECTION_CONFIG = {
  maxReconnectAttempts: 5, // Reduced from 10 to 5 to prevent error spam
  baseReconnectDelay: 1000, // 1 second
  maxReconnectDelay: 30000, // 30 seconds
  backoffMultiplier: 2, // Exponential backoff multiplier
  jitterEnabled: true, // Add random jitter to prevent thundering herd
};

/**
 * Topic configuration for MQTT v5.0
 */
export const TOPIC_CONFIG = {
  maxTopicLength: 65535,
  defaultQoS: 1 as const,
  maxTopicAliases: 10, // v5.0 topic alias support
};

/**
 * MQTT v5.0 Quality of Service levels
 */
export const QOS_LEVELS = {
  AT_MOST_ONCE: 0 as const,
  AT_LEAST_ONCE: 1 as const,
  EXACTLY_ONCE: 2 as const,
} as const;

/**
 * MQTT v5.0 reason codes for enhanced error handling
 */
export const REASON_CODES = {
  SUCCESS: 0x00,
  NORMAL_DISCONNECTION: 0x00,
  GRANTED_QOS_0: 0x00,
  GRANTED_QOS_1: 0x01,
  GRANTED_QOS_2: 0x02,
  DISCONNECT_WITH_WILL_MESSAGE: 0x04,
  NO_MATCHING_SUBSCRIBERS: 0x10,
  NO_SUBSCRIPTION_EXISTED: 0x11,
  CONTINUE_AUTHENTICATION: 0x18,
  RE_AUTHENTICATE: 0x19,
  UNSPECIFIED_ERROR: 0x80,
  MALFORMED_PACKET: 0x81,
  PROTOCOL_ERROR: 0x82,
  IMPLEMENTATION_SPECIFIC_ERROR: 0x83,
  UNSUPPORTED_PROTOCOL_VERSION: 0x84,
  CLIENT_IDENTIFIER_NOT_VALID: 0x85,
  BAD_USER_NAME_OR_PASSWORD: 0x86,
  NOT_AUTHORIZED: 0x87,
  SERVER_UNAVAILABLE: 0x88,
  SERVER_BUSY: 0x89,
  BANNED: 0x8a,
  SERVER_SHUTTING_DOWN: 0x8b,
  BAD_AUTHENTICATION_METHOD: 0x8c,
  KEEP_ALIVE_TIMEOUT: 0x8d,
  SESSION_TAKEN_OVER: 0x8e,
  TOPIC_FILTER_INVALID: 0x8f,
  TOPIC_NAME_INVALID: 0x90,
  PACKET_IDENTIFIER_IN_USE: 0x91,
  PACKET_IDENTIFIER_NOT_FOUND: 0x92,
  RECEIVE_MAXIMUM_EXCEEDED: 0x93,
  TOPIC_ALIAS_INVALID: 0x94,
  PACKET_TOO_LARGE: 0x95,
  MESSAGE_RATE_TOO_HIGH: 0x96,
  QUOTA_EXCEEDED: 0x97,
  ADMINISTRATIVE_ACTION: 0x98,
  PAYLOAD_FORMAT_INVALID: 0x99,
  RETAIN_NOT_SUPPORTED: 0x9a,
  QOS_NOT_SUPPORTED: 0x9b,
  USE_ANOTHER_SERVER: 0x9c,
  SERVER_MOVED: 0x9d,
  SHARED_SUBSCRIPTIONS_NOT_SUPPORTED: 0x9e,
  CONNECTION_RATE_EXCEEDED: 0x9f,
  MAXIMUM_CONNECT_TIME: 0xa0,
  SUBSCRIPTION_IDENTIFIERS_NOT_SUPPORTED: 0xa1,
  WILDCARD_SUBSCRIPTIONS_NOT_SUPPORTED: 0xa2,
} as const;
