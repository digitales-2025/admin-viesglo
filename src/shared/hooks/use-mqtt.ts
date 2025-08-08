/**
 * useMqtt Custom Hook
 * Encapsulates MQTT client lifecycle management with automatic credential fetching,
 * connection management, and proper cleanup as per requirements 4.1-4.5
 */

import { useCallback, useEffect, useRef } from "react";
import mqtt, { type MqttClient } from "mqtt";

import { DEFAULT_MQTT_OPTIONS, RECONNECTION_CONFIG, WEBSOCKET_CONFIG } from "../config/mqtt.config";
import { MqttCredentialsService } from "../services/mqtt-credentials.service";
import { useMqttConnectionStore } from "../stores/mqtt-connection.store";
import {
  calculateReconnectionDelay,
  createNetworkMonitor,
  generateClientId,
  isNetworkConnectivityError,
  isTokenExpirationError,
  shouldAttemptReconnection,
  transformToWebSocketUrl,
  validateMqttV5Options,
} from "../stores/mqtt-connection.utils";
import type {
  MqttConnectionOptions,
  MqttCredentials,
  MqttMessage,
  MqttPublishOptions,
  UseMqttOptions,
  UseMqttReturn,
} from "../types/mqtt.types";
import { getMqttErrorHandler } from "../utils/mqtt-error-handler";

// Minimal types to avoid use of 'any' with MQTT v5 packet/properties
type MqttV5Properties = {
  payloadFormatIndicator?: boolean;
  messageExpiryInterval?: number;
  topicAlias?: number;
  responseTopic?: string;
  correlationData?: Buffer;
  userProperties?: Record<string, string | string[]>;
  subscriptionIdentifier?: number | number[];
  contentType?: string;
};

type MqttPublishPacketMinimal = {
  qos: 0 | 1 | 2;
  retain?: boolean;
  properties?: MqttV5Properties;
};

/**
 * Validates MQTT v5.0 message properties
 * Ensures properties conform to MQTT v5.0 specification
 *
 * @param properties - Raw properties object from MQTT packet
 * @returns Validated properties object
 * @throws Error if properties are invalid
 */
function validateMessageProperties(properties: Record<string, unknown>): MqttMessage["properties"] {
  const validated: MqttMessage["properties"] = {};
  const props = properties as Partial<MqttV5Properties>;

  // Validate payloadFormatIndicator (0 = bytes, 1 = UTF-8)
  if (props.payloadFormatIndicator !== undefined) {
    if (typeof props.payloadFormatIndicator === "boolean") {
      validated.payloadFormatIndicator = props.payloadFormatIndicator;
    } else {
      throw new Error("payloadFormatIndicator must be a boolean");
    }
  }

  // Validate messageExpiryInterval (seconds)
  if (props.messageExpiryInterval !== undefined) {
    if (typeof props.messageExpiryInterval === "number" && props.messageExpiryInterval >= 0) {
      validated.messageExpiryInterval = props.messageExpiryInterval;
    } else {
      throw new Error("messageExpiryInterval must be a non-negative number");
    }
  }

  // Validate topicAlias
  if (props.topicAlias !== undefined) {
    if (typeof props.topicAlias === "number" && props.topicAlias > 0) {
      validated.topicAlias = props.topicAlias;
    } else {
      throw new Error("topicAlias must be a positive number");
    }
  }

  // Validate responseTopic
  if (props.responseTopic !== undefined) {
    if (typeof props.responseTopic === "string" && props.responseTopic.length > 0) {
      validated.responseTopic = props.responseTopic;
    } else {
      throw new Error("responseTopic must be a non-empty string");
    }
  }

  // Validate correlationData
  if (props.correlationData !== undefined) {
    if (Buffer.isBuffer(props.correlationData)) {
      validated.correlationData = props.correlationData;
    } else {
      throw new Error("correlationData must be a Buffer");
    }
  }

  // Validate userProperties
  if (props.userProperties !== undefined) {
    if (typeof props.userProperties === "object" && props.userProperties !== null) {
      // Validate each user property
      const validatedUserProperties: Record<string, string | string[]> = {};
      for (const [key, value] of Object.entries(props.userProperties)) {
        if (typeof key === "string" && (typeof value === "string" || Array.isArray(value))) {
          if (Array.isArray(value)) {
            // Validate array of strings
            if (value.every((v) => typeof v === "string")) {
              validatedUserProperties[key] = value;
            } else {
              throw new Error(`userProperties[${key}] array must contain only strings`);
            }
          } else {
            validatedUserProperties[key] = value;
          }
        } else {
          throw new Error(`userProperties[${key}] must be a string or array of strings`);
        }
      }
      validated.userProperties = validatedUserProperties;
    } else {
      throw new Error("userProperties must be an object");
    }
  }

  // Validate subscriptionIdentifier
  if (props.subscriptionIdentifier !== undefined) {
    if (typeof props.subscriptionIdentifier === "number" && props.subscriptionIdentifier > 0) {
      validated.subscriptionIdentifier = props.subscriptionIdentifier;
    } else if (Array.isArray(props.subscriptionIdentifier)) {
      // Multiple subscription identifiers
      if (props.subscriptionIdentifier.every((id: unknown) => typeof id === "number" && id > 0)) {
        validated.subscriptionIdentifier = props.subscriptionIdentifier as number[];
      } else {
        throw new Error("subscriptionIdentifier array must contain only positive numbers");
      }
    } else {
      throw new Error("subscriptionIdentifier must be a positive number or array of positive numbers");
    }
  }

  // Validate contentType
  if (props.contentType !== undefined) {
    if (typeof props.contentType === "string" && props.contentType.length > 0) {
      validated.contentType = props.contentType;
    } else {
      throw new Error("contentType must be a non-empty string");
    }
  }

  return validated;
}

/**
 * Parses and validates incoming MQTT messages with error boundaries
 * Implements requirement 6.4 for message processing error handling
 *
 * @param topic - MQTT topic string
 * @param payload - Message payload (string or Buffer)
 * @param packet - MQTT packet with metadata
 * @returns Validated MqttMessage object
 * @throws Error if message validation fails
 */
function parseAndValidateMessage(
  topic: string,
  payload: string | Buffer,
  packet: MqttPublishPacketMinimal
): MqttMessage {
  // Validate topic
  if (!topic || typeof topic !== "string") {
    throw new Error("Invalid topic: must be a non-empty string");
  }

  // Validate payload
  if (payload === null || payload === undefined) {
    throw new Error("Invalid payload: payload cannot be null or undefined");
  }

  // Validate QoS level
  const qos = packet.qos as 0 | 1 | 2;
  if (qos !== 0 && qos !== 1 && qos !== 2) {
    throw new Error(`Invalid QoS level: ${qos}. Must be 0, 1, or 2`);
  }

  // Validate retain flag
  const retain = Boolean(packet.retain);

  // Validate and parse MQTT v5.0 properties if present
  let validatedProperties: MqttMessage["properties"] | undefined;
  if (packet.properties) {
    try {
      validatedProperties = validateMessageProperties(packet.properties);
    } catch (error) {
      console.warn("Invalid MQTT v5.0 properties, using message without properties:", error);
      // Continue without properties rather than failing the entire message
    }
  }

  // Attempt to parse JSON payloads for additional validation
  if (payload.length > 0) {
    try {
      const payloadString = payload.toString();
      // Try to parse as JSON to validate structure (common use case)
      if (payloadString.trim().startsWith("{") || payloadString.trim().startsWith("[")) {
        JSON.parse(payloadString);
        // If successful, it's valid JSON - no need to store the parsed result
        // as consumers should handle their own parsing
      }
    } catch (_jsonError) {
      // Not valid JSON, but that's okay - not all MQTT messages are JSON
      // Log for debugging but don't fail the message processing
      console.debug("Message payload is not valid JSON (this is normal for non-JSON messages):", {
        topic,
        payloadPreview: payload.toString().substring(0, 50),
      });
    }
  }

  return {
    topic,
    payload,
    qos,
    retain,
    properties: validatedProperties,
  };
}

/**
 * Custom hook for MQTT client management
 * Handles connection lifecycle, subscriptions, and publishing
 * Implements requirements 4.1-4.5 for complete MQTT client encapsulation
 *
 * @param options - Configuration options for the MQTT hook
 * @returns UseMqttReturn - Hook interface with connection state and methods
 */
export function useMqtt(options: UseMqttOptions = {}): UseMqttReturn {
  const { autoConnect = true, subscriptions = [], onMessage, onConnect, onDisconnect, onError } = options;

  console.log("🔧 useMqtt hook initialized with options:", {
    autoConnect,
    hasOnMessage: !!onMessage,
    hasOnConnect: !!onConnect,
    hasOnError: !!onError,
    subscriptionsCount: subscriptions.length,
    timestamp: new Date().toISOString(),
  });

  // Store references
  const {
    status,
    client,
    error,
    reconnectAttempts,
    // nextReconnectDelay, // not used locally
    isNetworkOnline,
    tokenExpired,
    setStatus,
    setClient,
    setError,
    incrementReconnectAttempts,
    resetReconnectAttempts,
    // setLastReconnectAttempt, // not used locally
    setNextReconnectDelay,
    setNetworkOnline,
    setTokenExpired,
  } = useMqttConnectionStore();

  // Refs for stable references across re-renders
  const credentialsRef = useRef<MqttCredentials | null>(null);
  const subscriptionsRef = useRef<Set<string>>(new Set());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUnmountedRef = useRef(false);
  const networkMonitorCleanupRef = useRef<(() => void) | null>(null);
  const connectInternalRef = useRef<((forceCredentialsRefresh?: boolean) => Promise<void>) | null>(null);
  const handleConnectionErrorRef = useRef<((error: Error) => void) | null>(null);
  const scheduleReconnectionRef = useRef<((error?: Error | string) => void) | null>(null);

  /**
   * Fetches MQTT credentials from the backend with improved caching
   * Requirement 4.3: Automatic credential fetching with cache management
   */
  const fetchCredentials = useCallback(
    async (forceRefresh: boolean = false): Promise<MqttCredentials> => {
      try {
        console.log(`🔑 Fetching MQTT credentials (forceRefresh: ${forceRefresh})`);

        const credentials = await MqttCredentialsService.getMqttCredentials(forceRefresh);
        credentialsRef.current = credentials;

        console.log("🔑 MQTT credentials obtained successfully:", {
          brokerUrl: credentials.brokerUrl,
          username: credentials.username,
          clientId: credentials.clientId,
        });

        return credentials;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to fetch MQTT credentials";
        console.error("🔑 Failed to fetch MQTT credentials:", errorMessage);

        setError(errorMessage);
        onError?.(error instanceof Error ? error : new Error(errorMessage));
        throw error;
      }
    },
    [setError, onError]
  );

  /**
   * Creates and configures MQTT client with v5.0 protocol and WebSocket transport
   * Requirements 1.3, 3.1: MQTT v5.0 protocol with WebSocket configuration
   * Requirement 4.3: Client initialization with proper configuration
   */
  const createClient = useCallback(
    (credentials: MqttCredentials): MqttClient => {
      // Transform URL for WebSocket transport
      const brokerUrl = transformToWebSocketUrl(credentials.brokerUrl);

      // Build comprehensive MQTT v5.0 connection options
      const connectionOptions: MqttConnectionOptions = {
        ...DEFAULT_MQTT_OPTIONS,
        username: credentials.username,
        password: credentials.password,
        clientId: credentials.clientId || generateClientId("web-mqtt-client"),

        // Disable built-in reconnection - we handle it ourselves
        reconnectPeriod: 0, // Disable automatic reconnection

        // WebSocket specific options
        transformWsUrl: WEBSOCKET_CONFIG.transformWsUrl,
        wsOptions: WEBSOCKET_CONFIG.wsOptions,

        // Enhanced v5.0 properties with user context
        properties: {
          ...DEFAULT_MQTT_OPTIONS.properties,
          userProperties: {
            ...DEFAULT_MQTT_OPTIONS.properties?.userProperties,
            "connection-timestamp": new Date().toISOString(),
            "user-id": credentials.username,
          },
        },
      } as MqttConnectionOptions;

      // Validate v5.0 configuration
      const validation = validateMqttV5Options(connectionOptions);
      if (!validation.valid) {
        console.warn("MQTT v5.0 configuration issues detected:", validation.issues);
      }

      console.log("Creating MQTT v5.0 client with WebSocket transport:", {
        url: brokerUrl,
        protocolVersion: connectionOptions.protocolVersion,
        clientId: connectionOptions.clientId,
        keepalive: connectionOptions.keepalive,
        clean: connectionOptions.clean,
        wsTransport: brokerUrl.startsWith("ws"),
        v5Properties: !!connectionOptions.properties,
      });

      const mqttClient = mqtt.connect(brokerUrl, connectionOptions);

      // Set up MQTT v5.0 event handlers with enhanced logging
      mqttClient.on("connect", (connack) => {
        if (isUnmountedRef.current) return;

        console.log("🟢 MQTT CLIENT CONNECT EVENT FIRED!", {
          connack,
          clientId: credentialsRef.current?.clientId,
          brokerUrl: credentialsRef.current?.brokerUrl,
          timestamp: new Date().toISOString(),
        });

        const errorHandler = getMqttErrorHandler();

        // Log successful connection with comprehensive details
        errorHandler.logConnectionSuccess({
          brokerUrl: credentialsRef.current?.brokerUrl,
          clientId: credentialsRef.current?.clientId,
          protocolVersion: 5,
          sessionPresent: connack.sessionPresent,
        });

        console.log("MQTT v5.0 Client connected successfully:", {
          sessionPresent: connack.sessionPresent,
          reasonCode: connack.reasonCode,
          properties: connack.properties,
          timestamp: new Date().toISOString(),
        });

        console.log('🔄 CALLING setStatus("connected")...');
        setStatus("connected");

        console.log("🔄 CALLING resetReconnectAttempts()...");
        resetReconnectAttempts();

        console.log("🔄 CALLING onConnect callback...");
        onConnect?.();

        console.log("✅ Connect event handler completed");

        // Re-subscribe to previous subscriptions with v5.0 options
        subscriptionsRef.current.forEach((topic) => {
          mqttClient.subscribe(
            topic,
            {
              qos: 1,
              // v5.0 subscription options
              properties: {
                subscriptionIdentifier: Math.floor(Math.random() * 1000),
              },
            },
            (err, granted) => {
              if (err) {
                // Use error handler for subscription errors
                errorHandler.handleSubscriptionError(err, {
                  topic,
                  qos: 1,
                  operation: "subscribe",
                  clientConnected: mqttClient.connected,
                });
              } else {
                console.log(`Re-subscribed to topic ${topic}:`, granted);
              }
            }
          );
        });
      });

      mqttClient.on("disconnect", (packet) => {
        if (isUnmountedRef.current) return;

        const errorHandler = getMqttErrorHandler();

        // Log disconnection with details
        errorHandler.logDisconnectionSuccess({
          clientId: credentialsRef.current?.clientId,
          reason: packet?.reasonCode?.toString(),
          wasClean: packet?.reasonCode === 0,
        });

        console.log("MQTT v5.0 Client disconnected:", {
          reasonCode: packet?.reasonCode,
          properties: packet?.properties,
          timestamp: new Date().toISOString(),
        });

        setStatus("disconnected");
        onDisconnect?.();

        // Check if this was an unexpected disconnection and schedule reconnection
        // Don't reconnect if we're in the process of manually disconnecting
        if (status === "connected" || status === "reconnecting") {
          console.log("Unexpected disconnection detected - scheduling reconnection");
          if (scheduleReconnectionRef.current) {
            scheduleReconnectionRef.current("Unexpected disconnection");
          }
        }
      });

      // Note: Built-in reconnect event handler removed since we disabled automatic reconnection
      // and handle reconnection logic manually with exponential backoff

      mqttClient.on("error", (error) => {
        if (isUnmountedRef.current) return;
        if (handleConnectionErrorRef.current) {
          handleConnectionErrorRef.current(error);
        }
      });

      mqttClient.on("message", (topic, payload, packet) => {
        if (isUnmountedRef.current) return;

        try {
          // Enhanced message parsing and validation (Requirement 6.4)
          const message = parseAndValidateMessage(topic, payload, packet);

          // Log successful message receipt for monitoring
          console.log("MQTT message received:", {
            topic,
            payloadSize: payload.length,
            qos: packet.qos,
            retain: packet.retain,
            hasProperties: !!packet.properties,
            timestamp: new Date().toISOString(),
          });

          onMessage?.(topic, message);
        } catch (error) {
          // Use comprehensive error handler for message processing errors (Requirement 6.4)
          const errorHandler = getMqttErrorHandler();

          errorHandler.handleMessageProcessingError(
            error instanceof Error ? error : new Error("Message processing error"),
            {
              topic,
              payloadSize: payload.length,
              payloadPreview: payload.toString().substring(0, 100),
              qos: packet.qos,
              retain: packet.retain,
              hasProperties: !!packet.properties,
            }
          );

          onError?.(error instanceof Error ? error : new Error("Message processing error"));
        }
      });

      // Check if client is already connected (happens with fast connections)
      // This is a race condition fix - sometimes the connection completes before event handlers are registered
      console.log("🕐 Setting up connection check after event handlers...");

      // Use setImmediate to check after current execution cycle
      const checkConnection = () => {
        console.log("🔍 Checking connection status immediately:", {
          clientConnected: mqttClient.connected,
          isUnmounted: isUnmountedRef.current,
          shouldTrigger: mqttClient.connected && !isUnmountedRef.current,
          timestamp: new Date().toISOString(),
        });

        if (mqttClient.connected && !isUnmountedRef.current) {
          console.log("🔍 Client was already connected - triggering connect handler manually");

          // Manually trigger the connect logic
          const errorHandler = getMqttErrorHandler();

          errorHandler.logConnectionSuccess({
            brokerUrl: credentialsRef.current?.brokerUrl,
            clientId: credentialsRef.current?.clientId,
            protocolVersion: 5,
            sessionPresent: false,
          });

          console.log("🟢 MANUALLY TRIGGERING CONNECTION SUCCESS");
          console.log('🔄 CALLING setStatus("connected")...');
          setStatus("connected");

          console.log("🔄 CALLING resetReconnectAttempts()...");
          resetReconnectAttempts();

          console.log("🔄 CALLING onConnect callback...");
          onConnect?.();

          console.log("✅ Manual connect handler completed");
        } else {
          console.log("❌ Not triggering manual connect - conditions not met");
        }
      };

      // Use both setTimeout and setImmediate for better coverage
      setTimeout(checkConnection, 0);
      setTimeout(checkConnection, 50);
      setTimeout(checkConnection, 100);

      return mqttClient;
    },
    [setStatus, resetReconnectAttempts, onConnect, onDisconnect, onError, onMessage, status]
  );

  /**
   * Schedules a reconnection attempt with exponential backoff
   * Requirements 3.2, 3.4: Automatic reconnection with exponential backoff
   */
  const scheduleReconnection = useCallback(
    (error?: Error | string): void => {
      if (isUnmountedRef.current) return;

      // Clear any existing reconnection timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      // Check if we should attempt reconnection
      const reconnectionDecision = shouldAttemptReconnection(
        error || null,
        reconnectAttempts,
        RECONNECTION_CONFIG.maxReconnectAttempts,
        isNetworkOnline,
        tokenExpired
      );

      if (!reconnectionDecision.shouldReconnect) {
        console.log("Reconnection not attempted:", reconnectionDecision.reason);
        setStatus("error");
        return;
      }

      // Calculate delay with exponential backoff
      const delay = calculateReconnectionDelay(
        reconnectAttempts,
        RECONNECTION_CONFIG.baseReconnectDelay,
        RECONNECTION_CONFIG.maxReconnectDelay,
        RECONNECTION_CONFIG.backoffMultiplier,
        RECONNECTION_CONFIG.jitterEnabled
      );

      setNextReconnectDelay(delay);

      console.log(
        `Scheduling reconnection attempt ${reconnectAttempts + 1}/${RECONNECTION_CONFIG.maxReconnectAttempts} in ${delay}ms`,
        {
          attempt: reconnectAttempts + 1,
          delay,
          reason: reconnectionDecision.reason,
          timestamp: new Date().toISOString(),
        }
      );

      // Store the time when disconnection occurred for downtime calculation
      const disconnectionTime = Date.now();

      // Schedule the reconnection
      reconnectTimeoutRef.current = setTimeout(async () => {
        if (isUnmountedRef.current) return;

        try {
          incrementReconnectAttempts();
          const previousStatus = status;

          // Attempt reconnection with credential refresh
          if (connectInternalRef.current) {
            await connectInternalRef.current(true);
          }

          // If reconnection was successful, log it
          if (useMqttConnectionStore.getState().status === "connected" && previousStatus !== "connected") {
            const errorHandler = getMqttErrorHandler();
            const totalDowntime = Date.now() - disconnectionTime;

            errorHandler.logReconnectionSuccess({
              attemptNumber: reconnectAttempts + 1,
              totalDowntime,
              brokerUrl: credentialsRef.current?.brokerUrl,
              clientId: credentialsRef.current?.clientId,
            });
          }
        } catch (reconnectError) {
          console.error("Reconnection attempt failed:", reconnectError);

          // Recursively schedule another reconnection attempt
          if (scheduleReconnectionRef.current) {
            scheduleReconnectionRef.current(
              reconnectError instanceof Error ? reconnectError : new Error("Reconnection failed")
            );
          }
        }
      }, delay);
    },
    [
      reconnectAttempts,
      isNetworkOnline,
      tokenExpired,
      status,
      setStatus,
      setNextReconnectDelay,
      incrementReconnectAttempts,
    ]
  );

  // Update the ref with the latest scheduleReconnection function
  scheduleReconnectionRef.current = scheduleReconnection;

  /**
   * Handles connection errors and determines appropriate response
   * Requirements 3.2, 3.4, 6.1, 6.2: Enhanced error handling with comprehensive logging
   */
  const handleConnectionError = useCallback(
    (error: Error): void => {
      if (isUnmountedRef.current) return;

      const errorHandler = getMqttErrorHandler();

      // Use comprehensive error handling system
      const errorInfo = errorHandler.handleConnectionError(
        error,
        {
          brokerUrl: credentialsRef.current?.brokerUrl,
          clientId: credentialsRef.current?.clientId,
          username: credentialsRef.current?.username,
          protocolVersion: 5,
          attemptNumber: reconnectAttempts,
          lastSuccessfulConnection: useMqttConnectionStore.getState().lastConnected || undefined,
        },
        reconnectAttempts
      );

      // Update error state
      setError(errorInfo.message);

      // Handle token expiration errors
      if (isTokenExpirationError(error)) {
        console.log("Token expiration detected - marking token as expired");
        setTokenExpired(true);
        setStatus("error");
        onError?.(error);
        return;
      }

      // Handle network connectivity errors
      if (isNetworkConnectivityError(error)) {
        console.log("Network connectivity error detected");
        setStatus("error");
        onError?.(error);

        // Schedule reconnection for network errors (will be attempted when network comes back)
        if (errorInfo.shouldRetry) {
          if (scheduleReconnectionRef.current) {
            scheduleReconnectionRef.current(error);
          }
        }
        return;
      }

      // Handle other errors with reconnection based on error handler recommendation
      setStatus("error");
      onError?.(error);

      if (errorInfo.shouldRetry) {
        if (scheduleReconnectionRef.current) {
          scheduleReconnectionRef.current(error);
        }
      }
    },
    [setError, setTokenExpired, setStatus, onError, reconnectAttempts]
  );

  // Update the ref with the latest handleConnectionError function
  handleConnectionErrorRef.current = handleConnectionError;

  /**
   * Internal connection logic with improved credential caching
   */
  const connectInternal = useCallback(
    async (forceCredentialsRefresh: boolean = false): Promise<void> => {
      if (isUnmountedRef.current || status === "connected" || status === "connecting") {
        console.log("🚫 Skipping connection: unmounted or already connecting/connected", {
          isUnmounted: isUnmountedRef.current,
          status,
        });
        return;
      }

      // Don't attempt connection if network is offline
      if (!isNetworkOnline) {
        console.log("🚫 Cannot connect - network is offline");
        setError("Network is offline");
        setStatus("error");
        return;
      }

      try {
        console.log("🔌 Starting MQTT connection process");
        setStatus("connecting");
        setError(null);

        // Try to use cached credentials first, unless forcing refresh
        let credentials: MqttCredentials;

        if (!forceCredentialsRefresh) {
          const cachedCredentials = MqttCredentialsService.getCachedCredentials();
          if (cachedCredentials) {
            console.log("🔄 Using cached MQTT credentials for connection");
            credentials = cachedCredentials;
            credentialsRef.current = credentials;
          } else {
            console.log("📡 No cached credentials, fetching fresh ones");
            credentials = await fetchCredentials(false);
          }
        } else {
          console.log("🔄 Force refreshing MQTT credentials");
          credentials = await fetchCredentials(true);
        }

        // Create and configure client
        const mqttClient = createClient(credentials);
        setClient(mqttClient);

        console.log("🔌 MQTT client created, waiting for connection...");
        console.log("📊 Current status before client creation:", status);

        // Additional debug info
        const currentStoreState = useMqttConnectionStore.getState();
        console.log("📊 Complete store state:", currentStoreState);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Connection failed";
        console.error("❌ Failed to connect to MQTT broker:", {
          error: errorMessage,
          forceCredentialsRefresh,
          timestamp: new Date().toISOString(),
        });

        // Handle credential fetch errors (likely token expiration)
        if (isTokenExpirationError(errorMessage)) {
          console.log("🔑 Token expiration detected during connection");
          setTokenExpired(true);
          MqttCredentialsService.clearCredentialsCache();
        }

        setError(errorMessage);
        setStatus("error");

        // Handle the connection error
        if (handleConnectionErrorRef.current) {
          handleConnectionErrorRef.current(error instanceof Error ? error : new Error(errorMessage));
        }
      }
    },
    [status, isNetworkOnline, setStatus, setError, setClient, setTokenExpired, fetchCredentials, createClient]
  );

  // Update the ref with the latest connectInternal function
  connectInternalRef.current = connectInternal;

  /**
   * Establishes MQTT connection
   * Requirement 4.1: Connection lifecycle management
   */
  const connect = useCallback(
    async (forceCredentialsRefresh: boolean = false): Promise<void> => {
      await connectInternal(forceCredentialsRefresh);
    },
    [connectInternal]
  );

  /**
   * Disconnects MQTT client
   * Requirement 4.1: Connection lifecycle management
   */
  const disconnect = useCallback(async (): Promise<void> => {
    // Clear any pending reconnection attempts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (client) {
      try {
        await new Promise<void>((resolve) => {
          client.end(false, {}, () => {
            resolve();
          });
        });
        console.log("MQTT Client disconnected cleanly");
      } catch (error) {
        console.error("Error during MQTT disconnect:", error);
      }
    }

    setClient(null);
    setStatus("disconnected");
    setError(null);
    resetReconnectAttempts();
    subscriptionsRef.current.clear();
  }, [client, setClient, setStatus, setError, resetReconnectAttempts]);

  /**
   * Reconnects MQTT client manually with improved credential handling
   * Requirement 4.1: Manual reconnection capability
   */
  const reconnect = useCallback(
    async (forceCredentialsRefresh: boolean = true): Promise<void> => {
      console.log("🔄 Manual reconnection started");

      // Clear any scheduled reconnections
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      // Reset reconnection state
      resetReconnectAttempts();
      setTokenExpired(false);

      // Clear credentials cache if forcing refresh
      if (forceCredentialsRefresh) {
        MqttCredentialsService.clearCredentialsCache();
      }

      try {
        await disconnect();
        await connect(forceCredentialsRefresh);
        console.log("✅ Manual reconnection completed successfully");
      } catch (error) {
        console.error("❌ Manual reconnection failed:", error);
        throw error;
      }
    },
    [disconnect, connect, resetReconnectAttempts, setTokenExpired]
  );

  /**
   * Subscribes to MQTT topic with v5.0 features and enhanced error handling
   * Requirement 4.2: Subscription management with v5.0 properties
   * Requirement 6.4: Enhanced error handling and logging
   */
  const subscribe = useCallback(
    async (topic: string, qos: 0 | 1 | 2 = 1): Promise<void> => {
      // Input validation
      if (!topic || typeof topic !== "string") {
        const error = new Error("Invalid topic: must be a non-empty string");
        console.error("Subscribe validation error:", {
          topic,
          error: error.message,
          timestamp: new Date().toISOString(),
        });
        throw error;
      }

      if (qos !== 0 && qos !== 1 && qos !== 2) {
        const error = new Error(`Invalid QoS level: ${qos}. Must be 0, 1, or 2`);
        console.error("Subscribe validation error:", {
          topic,
          qos,
          error: error.message,
          timestamp: new Date().toISOString(),
        });
        throw error;
      }

      if (!client || status !== "connected") {
        const error = new Error(`MQTT client is not connected. Current status: ${status}`);
        console.error("Subscribe connection error:", {
          topic,
          qos,
          status,
          hasClient: !!client,
          error: error.message,
          timestamp: new Date().toISOString(),
        });
        throw error;
      }

      // Check if already subscribed
      if (subscriptionsRef.current.has(topic)) {
        console.warn("Already subscribed to topic:", {
          topic,
          qos,
          timestamp: new Date().toISOString(),
        });
        return; // Don't throw error, just return silently
      }

      return new Promise((resolve, reject) => {
        const subscribeOptions = {
          qos,
          // MQTT v5.0 subscription properties
          properties: {
            subscriptionIdentifier: Math.floor(Math.random() * 1000),
            userProperties: {
              "subscription-timestamp": new Date().toISOString(),
              "client-id": client.options.clientId || "unknown",
              "subscription-qos": qos.toString(),
            },
          },
        };

        try {
          client.subscribe(topic, subscribeOptions, (error, granted) => {
            if (error) {
              // Use comprehensive error handler for subscription failures
              const errorHandler = getMqttErrorHandler();
              errorHandler.handleSubscriptionError(error, {
                topic,
                qos,
                operation: "subscribe",
                clientConnected: client.connected,
              });
              reject(error);
            } else {
              // Enhanced success logging
              console.log(`Successfully subscribed to topic: ${topic}`, {
                topic,
                requestedQos: qos,
                grantedQos: granted?.[0]?.qos,
                granted,
                timestamp: new Date().toISOString(),
              });
              subscriptionsRef.current.add(topic);
              resolve();
            }
          });
        } catch (syncError) {
          // Handle synchronous errors from the subscribe call
          console.error(`Synchronous error during subscribe to ${topic}:`, {
            error: syncError instanceof Error ? syncError.message : "Unknown error",
            topic,
            qos,
            timestamp: new Date().toISOString(),
          });
          reject(syncError instanceof Error ? syncError : new Error("Unknown subscription error"));
        }
      });
    },
    [client, status]
  );

  /**
   * Unsubscribes from MQTT topic with v5.0 properties and enhanced error handling
   * Requirement 4.2: Subscription management with v5.0 features
   * Requirement 6.4: Enhanced error handling and logging
   */
  const unsubscribe = useCallback(
    async (topic: string): Promise<void> => {
      // Input validation
      if (!topic || typeof topic !== "string") {
        const error = new Error("Invalid topic: must be a non-empty string");
        console.error("Unsubscribe validation error:", {
          topic,
          error: error.message,
          timestamp: new Date().toISOString(),
        });
        throw error;
      }

      if (!client || status !== "connected") {
        const error = new Error(`MQTT client is not connected. Current status: ${status}`);
        console.error("Unsubscribe connection error:", {
          topic,
          status,
          hasClient: !!client,
          error: error.message,
          timestamp: new Date().toISOString(),
        });
        throw error;
      }

      // Check if actually subscribed
      if (!subscriptionsRef.current.has(topic)) {
        console.warn("Not subscribed to topic:", {
          topic,
          currentSubscriptions: Array.from(subscriptionsRef.current),
          timestamp: new Date().toISOString(),
        });
        return; // Don't throw error, just return silently
      }

      return new Promise((resolve, reject) => {
        const unsubscribeOptions = {
          // MQTT v5.0 unsubscribe properties
          properties: {
            userProperties: {
              "unsubscribe-timestamp": new Date().toISOString(),
              "client-id": client.options.clientId || "unknown",
            },
          },
        };

        try {
          client.unsubscribe(topic, unsubscribeOptions, (error, packet) => {
            if (error) {
              // Use comprehensive error handler for unsubscription failures
              const errorHandler = getMqttErrorHandler();
              errorHandler.handleSubscriptionError(error, {
                topic,
                qos: 0, // QoS not relevant for unsubscribe
                operation: "unsubscribe",
                clientConnected: client.connected,
              });
              reject(error);
            } else {
              // Enhanced success logging
              console.log(`Successfully unsubscribed from topic: ${topic}`, {
                topic,
                packet,
                timestamp: new Date().toISOString(),
              });
              subscriptionsRef.current.delete(topic);
              resolve();
            }
          });
        } catch (syncError) {
          // Handle synchronous errors from the unsubscribe call
          console.error(`Synchronous error during unsubscribe from ${topic}:`, {
            error: syncError instanceof Error ? syncError.message : "Unknown error",
            topic,
            timestamp: new Date().toISOString(),
          });
          reject(syncError instanceof Error ? syncError : new Error("Unknown unsubscription error"));
        }
      });
    },
    [client, status]
  );

  /**
   * Publishes message to MQTT topic with v5.0 properties and enhanced error handling
   * Requirement 4.2: Publishing functionality with v5.0 features
   * Requirement 6.3: Enhanced error handling for publish failures
   */
  const publish = useCallback(
    async (topic: string, message: string | Buffer, options: MqttPublishOptions = {}): Promise<void> => {
      // Input validation
      if (!topic || typeof topic !== "string") {
        const error = new Error("Invalid topic: must be a non-empty string");
        console.error("Publish validation error:", {
          topic,
          error: error.message,
          timestamp: new Date().toISOString(),
        });
        throw error;
      }

      if (message === null || message === undefined) {
        const error = new Error("Invalid message: message cannot be null or undefined");
        console.error("Publish validation error:", {
          topic,
          message,
          error: error.message,
          timestamp: new Date().toISOString(),
        });
        throw error;
      }

      const qos = options.qos ?? 1;
      if (![0, 1, 2].includes(qos)) {
        const error = new Error(`Invalid QoS level: ${qos}. Must be 0, 1, or 2`);
        console.error("Publish validation error:", {
          topic,
          qos,
          error: error.message,
          timestamp: new Date().toISOString(),
        });
        throw error;
      }

      if (!client || status !== "connected") {
        const error = new Error(`MQTT client is not connected. Current status: ${status}`);
        console.error("Publish connection error:", {
          topic,
          messageLength: typeof message === "string" ? message.length : message.length,
          qos,
          status,
          hasClient: !!client,
          error: error.message,
          timestamp: new Date().toISOString(),
        });
        throw error;
      }

      const publishOptions = {
        qos,
        retain: options.retain || false,
        properties: {
          // Merge user-provided properties with default v5.0 properties
          ...options.properties,
          userProperties: {
            "publish-timestamp": new Date().toISOString(),
            "client-id": client.options.clientId || "unknown",
            "message-size": (typeof message === "string" ? message.length : message.length).toString(),
            ...options.properties?.userProperties,
          },
        },
      };

      return new Promise((resolve, reject) => {
        try {
          client.publish(topic, message, publishOptions, (error, packet) => {
            if (error) {
              // Use comprehensive error handler for publish failures (Requirement 6.3)
              const errorHandler = getMqttErrorHandler();
              errorHandler.handlePublishingError(error, {
                topic,
                payloadSize: typeof message === "string" ? message.length : message.length,
                qos: publishOptions.qos || 0,
                retain: publishOptions.retain || false,
                hasProperties: !!publishOptions.properties,
                clientConnected: client.connected,
              });
              reject(error);
            } else {
              // Enhanced success logging
              console.log(`Successfully published to topic: ${topic}`, {
                topic,
                messageLength: typeof message === "string" ? message.length : message.length,
                qos: publishOptions.qos,
                retain: publishOptions.retain,
                packet,
                timestamp: new Date().toISOString(),
              });
              resolve();
            }
          });
        } catch (syncError) {
          // Handle synchronous errors from the publish call using comprehensive error handler
          const errorHandler = getMqttErrorHandler();
          const error = syncError instanceof Error ? syncError : new Error("Unknown publish error");

          errorHandler.handlePublishingError(error, {
            topic,
            payloadSize: typeof message === "string" ? message.length : message.length,
            qos: publishOptions.qos || 0,
            retain: publishOptions.retain || false,
            hasProperties: !!publishOptions.properties,
            clientConnected: client.connected,
          });

          reject(error);
        }
      });
    },
    [client, status]
  );

  /**
   * Initialize connection on mount if autoConnect is enabled
   * Requirement 4.1: Automatic connection management
   */
  useEffect(() => {
    if (autoConnect && status === "disconnected") {
      connect();
    }
  }, [autoConnect, connect, status]);

  /**
   * Subscribe to initial topics
   * Requirement 4.2: Initial subscription management
   */
  useEffect(() => {
    if (client && status === "connected" && subscriptions.length > 0) {
      subscriptions.forEach(async (topic) => {
        try {
          await subscribe(topic);
        } catch (error) {
          console.error(`Failed to subscribe to initial topic ${topic}:`, error);
        }
      });
    }
  }, [client, status, subscriptions, subscribe]);

  /**
   * Network connectivity monitoring
   * Requirements 3.2, 3.4: Handle network connectivity changes
   */
  useEffect(() => {
    // Set up network monitoring
    networkMonitorCleanupRef.current = createNetworkMonitor(
      () => {
        // Network came online
        setNetworkOnline(true);

        // If we were disconnected due to network issues, attempt reconnection
        if ((status === "error" || status === "disconnected") && !tokenExpired) {
          console.log("Network connectivity restored - attempting reconnection");
          if (scheduleReconnectionRef.current) {
            scheduleReconnectionRef.current("Network connectivity restored");
          }
        }
      },
      () => {
        // Network went offline
        setNetworkOnline(false);

        // Clear any pending reconnection attempts
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }

        console.log("Network connectivity lost - pausing reconnection attempts");
      }
    );

    return () => {
      if (networkMonitorCleanupRef.current) {
        networkMonitorCleanupRef.current();
        networkMonitorCleanupRef.current = null;
      }
    };
  }, [status, tokenExpired, setNetworkOnline]);

  /**
   * Cleanup on unmount
   * Requirement 4.5: Proper cleanup on component unmount
   */
  useEffect(() => {
    return () => {
      console.log("🚨 useMqtt cleanup triggered - component unmounting");
      isUnmountedRef.current = true;

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      if (networkMonitorCleanupRef.current) {
        networkMonitorCleanupRef.current();
        networkMonitorCleanupRef.current = null;
      }

      // Get the current client from store instead of using stale closure
      const currentClient = useMqttConnectionStore.getState().client;
      if (currentClient) {
        console.log("🔌 Force disconnecting client during cleanup");
        currentClient.end(true); // Force disconnect
      }
    };
  }, []); // ← Removed [client] dependency to prevent cleanup on client changes

  // Return hook interface
  return {
    connectionStatus: status,
    client,
    error,
    isConnected: status === "connected",
    connect,
    subscribe,
    unsubscribe,
    publish,
    disconnect,
    reconnect,
  };
}
