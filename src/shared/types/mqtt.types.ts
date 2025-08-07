/**
 * MQTT v5.0 TypeScript interfaces for configuration, credentials, and messages
 * Based on the design document specifications
 */

import type { MqttClient } from 'mqtt';

/**
 * MQTT.js UserProperties type definition
 * Based on MQTT.js library internal types
 */
export type UserProperties = Record<string, string | string[]>;

/**
 * MQTT broker credentials obtained from authentication endpoint
 */
export interface MqttCredentials {
  brokerUrl: string;
  username: string;
  password: string;
  clientId?: string;
}

/**
 * MQTT v5.0 connection configuration options
 * Aligned with MQTT.js library IClientOptions with WebSocket support
 */
export interface MqttConnectionOptions {
  keepalive: number;
  protocolVersion: 5;
  clean: boolean;
  reconnectPeriod: number;
  connectTimeout: number;
  username?: string;
  password?: string;
  clientId?: string;
  
  // WebSocket transport configuration
  transformWsUrl?: (url: string, options: any, client: any) => string;
  wsOptions?: {
    perMessageDeflate?: boolean;
    maxPayload?: number;
    [key: string]: any;
  };
  
  // MQTT v5.0 properties
  properties?: {
    sessionExpiryInterval?: number;
    receiveMaximum?: number;
    maximumPacketSize?: number;
    topicAliasMaximum?: number;
    requestResponseInformation?: boolean;
    requestProblemInformation?: boolean;
    userProperties?: UserProperties;
  };
}

/**
 * Connection status states for MQTT client
 */
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

/**
 * MQTT v5.0 message structure with properties support
 * Aligned with MQTT.js library types
 */
export interface MqttMessage {
  topic: string;
  payload: string | Buffer;
  qos: 0 | 1 | 2;
  retain: boolean;
  properties?: {
    payloadFormatIndicator?: boolean;
    messageExpiryInterval?: number;
    topicAlias?: number;
    responseTopic?: string;
    correlationData?: Buffer;
    userProperties?: UserProperties;
    subscriptionIdentifier?: number | number[];
    contentType?: string;
  };
}

/**
 * MQTT publish options for outgoing messages
 * Aligned with MQTT.js library IClientPublishOptions
 */
export interface MqttPublishOptions {
  qos?: 0 | 1 | 2;
  retain?: boolean;
  properties?: {
    payloadFormatIndicator?: boolean;
    messageExpiryInterval?: number;
    topicAlias?: number;
    responseTopic?: string;
    correlationData?: Buffer;
    userProperties?: UserProperties;
    subscriptionIdentifier?: number | number[];
    contentType?: string;
  };
}

/**
 * Reconnection configuration for exponential backoff
 */
export interface ReconnectionConfig {
  maxReconnectAttempts: number;
  baseReconnectDelay: number;
  maxReconnectDelay: number;
  backoffMultiplier: number;
  jitterEnabled: boolean;
}

/**
 * MQTT connection state for Zustand store
 */
export interface MqttConnectionState {
  status: ConnectionStatus;
  client: MqttClient | null;
  error: string | null;
  lastConnected: Date | null;
  reconnectAttempts: number;
  lastReconnectAttempt: Date | null;
  nextReconnectDelay: number;
  isNetworkOnline: boolean;
  tokenExpired: boolean;
}

/**
 * MQTT connection actions for Zustand store
 */
export interface MqttConnectionActions {
  setStatus: (status: ConnectionStatus) => void;
  setClient: (client: MqttClient | null) => void;
  setError: (error: string | null) => void;
  incrementReconnectAttempts: () => void;
  resetReconnectAttempts: () => void;
  setLastReconnectAttempt: (date: Date | null) => void;
  setNextReconnectDelay: (delay: number) => void;
  setNetworkOnline: (online: boolean) => void;
  setTokenExpired: (expired: boolean) => void;
}

/**
 * Combined MQTT store interface
 */
export type MqttStore = MqttConnectionState & MqttConnectionActions;

/**
 * TanStack Query cache structure for MQTT topics
 */
export interface MqttTopicCache {
  [topicKey: string]: {
    topic: string;
    messages: MqttMessage[];
    lastMessage: MqttMessage | null;
    lastUpdated: Date;
    subscribers: number;
  };
}

/**
 * Connection state model for detailed tracking
 */
export interface ConnectionStateModel {
  status: ConnectionStatus;
  connectedAt: Date | null;
  disconnectedAt: Date | null;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
  reconnectInterval: number;
  lastError: {
    message: string;
    timestamp: Date;
    code?: string;
  } | null;
}

/**
 * Options for useMqtt custom hook
 */
export interface UseMqttOptions {
  autoConnect?: boolean;
  subscriptions?: string[];
  onMessage?: (topic: string, message: MqttMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Return type for useMqtt custom hook
 */
export interface UseMqttReturn {
  connectionStatus: ConnectionStatus;
  client: MqttClient | null;
  error: string | null;
  isConnected: boolean;
  subscribe: (topic: string, qos?: 0 | 1 | 2) => Promise<void>;
  unsubscribe: (topic: string) => Promise<void>;
  publish: (topic: string, message: string | Buffer, options?: MqttPublishOptions) => Promise<void>;
  disconnect: () => Promise<void>;
  reconnect: () => Promise<void>;
}

/**
 * Server Action response type for MQTT operations
 */
export interface MqttActionResponse {
  success: boolean;
  error?: string;
}