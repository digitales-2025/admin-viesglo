/**
 * useMqtt Custom Hook
 * Encapsulates MQTT client lifecycle management with automatic credential fetching,
 * connection management, and proper cleanup as per requirements 4.1-4.5
 */

import { useEffect, useRef, useCallback } from 'react';
import mqtt, { type MqttClient } from 'mqtt';
import type {
  UseMqttOptions,
  UseMqttReturn,
  MqttCredentials,
  MqttConnectionOptions,
  MqttPublishOptions,
  MqttMessage
} from '../types/mqtt.types';
import { MqttCredentialsService } from '../services/mqtt-credentials.service';
import { useMqttConnectionStore } from '../stores/mqtt-connection.store';
import { DEFAULT_MQTT_OPTIONS, WEBSOCKET_CONFIG, RECONNECTION_CONFIG } from '../config/mqtt.config';
import {
  validateMqttV5Options,
  transformToWebSocketUrl,
  generateClientId,
  calculateReconnectionDelay,
  shouldAttemptReconnection,
  isTokenExpirationError,
  isNetworkConnectivityError,
  createNetworkMonitor
} from '../stores/mqtt-connection.utils';

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
  packet: any
): MqttMessage {
  // Validate topic
  if (!topic || typeof topic !== 'string') {
    throw new Error('Invalid topic: must be a non-empty string');
  }

  // Validate payload
  if (payload === null || payload === undefined) {
    throw new Error('Invalid payload: payload cannot be null or undefined');
  }

  // Validate QoS level
  const qos = packet.qos as 0 | 1 | 2;
  if (qos !== 0 && qos !== 1 && qos !== 2) {
    throw new Error(`Invalid QoS level: ${qos}. Must be 0, 1, or 2`);
  }

  // Validate retain flag
  const retain = Boolean(packet.retain);

  // Validate and parse MQTT v5.0 properties if present
  let validatedProperties: MqttMessage['properties'] | undefined;
  if (packet.properties) {
    try {
      validatedProperties = validateMessageProperties(packet.properties);
    } catch (error) {
      console.warn('Invalid MQTT v5.0 properties, using message without properties:', error);
      // Continue without properties rather than failing the entire message
    }
  }

  // Attempt to parse JSON payloads for additional validation
  if (payload.length > 0) {
    try {
      const payloadString = payload.toString();
      // Try to parse as JSON to validate structure (common use case)
      if (payloadString.trim().startsWith('{') || payloadString.trim().startsWith('[')) {
        JSON.parse(payloadString);
        // If successful, it's valid JSON - no need to store the parsed result
        // as consumers should handle their own parsing
      }
    } catch (jsonError) {
      // Not valid JSON, but that's okay - not all MQTT messages are JSON
      // Log for debugging but don't fail the message processing
      console.debug('Message payload is not valid JSON (this is normal for non-JSON messages):', {
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
 * Validates MQTT v5.0 message properties
 * Ensures properties conform to MQTT v5.0 specification
 * 
 * @param properties - Raw properties object from MQTT packet
 * @returns Validated properties object
 * @throws Error if properties are invalid
 */
function validateMessageProperties(properties: any): MqttMessage['properties'] {
  const validated: MqttMessage['properties'] = {};

  // Validate payloadFormatIndicator (0 = bytes, 1 = UTF-8)
  if (properties.payloadFormatIndicator !== undefined) {
    if (typeof properties.payloadFormatIndicator === 'boolean') {
      validated.payloadFormatIndicator = properties.payloadFormatIndicator;
    } else {
      throw new Error('payloadFormatIndicator must be a boolean');
    }
  }

  // Validate messageExpiryInterval (seconds)
  if (properties.messageExpiryInterval !== undefined) {
    if (typeof properties.messageExpiryInterval === 'number' && properties.messageExpiryInterval >= 0) {
      validated.messageExpiryInterval = properties.messageExpiryInterval;
    } else {
      throw new Error('messageExpiryInterval must be a non-negative number');
    }
  }

  // Validate topicAlias
  if (properties.topicAlias !== undefined) {
    if (typeof properties.topicAlias === 'number' && properties.topicAlias > 0) {
      validated.topicAlias = properties.topicAlias;
    } else {
      throw new Error('topicAlias must be a positive number');
    }
  }

  // Validate responseTopic
  if (properties.responseTopic !== undefined) {
    if (typeof properties.responseTopic === 'string' && properties.responseTopic.length > 0) {
      validated.responseTopic = properties.responseTopic;
    } else {
      throw new Error('responseTopic must be a non-empty string');
    }
  }

  // Validate correlationData
  if (properties.correlationData !== undefined) {
    if (Buffer.isBuffer(properties.correlationData)) {
      validated.correlationData = properties.correlationData;
    } else {
      throw new Error('correlationData must be a Buffer');
    }
  }

  // Validate userProperties
  if (properties.userProperties !== undefined) {
    if (typeof properties.userProperties === 'object' && properties.userProperties !== null) {
      // Validate each user property
      const validatedUserProperties: Record<string, string | string[]> = {};
      for (const [key, value] of Object.entries(properties.userProperties)) {
        if (typeof key === 'string' && (typeof value === 'string' || Array.isArray(value))) {
          if (Array.isArray(value)) {
            // Validate array of strings
            if (value.every(v => typeof v === 'string')) {
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
      throw new Error('userProperties must be an object');
    }
  }

  // Validate subscriptionIdentifier
  if (properties.subscriptionIdentifier !== undefined) {
    if (typeof properties.subscriptionIdentifier === 'number' && properties.subscriptionIdentifier > 0) {
      validated.subscriptionIdentifier = properties.subscriptionIdentifier;
    } else if (Array.isArray(properties.subscriptionIdentifier)) {
      // Multiple subscription identifiers
      if (properties.subscriptionIdentifier.every((id: any) => typeof id === 'number' && id > 0)) {
        validated.subscriptionIdentifier = properties.subscriptionIdentifier;
      } else {
        throw new Error('subscriptionIdentifier array must contain only positive numbers');
      }
    } else {
      throw new Error('subscriptionIdentifier must be a positive number or array of positive numbers');
    }
  }

  // Validate contentType
  if (properties.contentType !== undefined) {
    if (typeof properties.contentType === 'string' && properties.contentType.length > 0) {
      validated.contentType = properties.contentType;
    } else {
      throw new Error('contentType must be a non-empty string');
    }
  }

  return validated;
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
  const {
    autoConnect = true,
    subscriptions = [],
    onMessage,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  // Store references
  const {
    status,
    client,
    error,
    reconnectAttempts,
    nextReconnectDelay,
    isNetworkOnline,
    tokenExpired,
    setStatus,
    setClient,
    setError,
    incrementReconnectAttempts,
    resetReconnectAttempts,
    setLastReconnectAttempt,
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

  /**
   * Fetches MQTT credentials from the backend
   * Requirement 4.3: Automatic credential fetching
   */
  const fetchCredentials = useCallback(async (): Promise<MqttCredentials> => {
    try {
      const credentials = await MqttCredentialsService.getMqttCredentials();
      credentialsRef.current = credentials;
      return credentials;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch MQTT credentials';
      setError(errorMessage);
      onError?.(error instanceof Error ? error : new Error(errorMessage));
      throw error;
    }
  }, [setError, onError]);

  /**
   * Creates and configures MQTT client with v5.0 protocol and WebSocket transport
   * Requirements 1.3, 3.1: MQTT v5.0 protocol with WebSocket configuration
   * Requirement 4.3: Client initialization with proper configuration
   */
  const createClient = useCallback((credentials: MqttCredentials): MqttClient => {
    // Transform URL for WebSocket transport
    const brokerUrl = transformToWebSocketUrl(credentials.brokerUrl);

    // Build comprehensive MQTT v5.0 connection options
    const connectionOptions: MqttConnectionOptions = {
      ...DEFAULT_MQTT_OPTIONS,
      username: credentials.username,
      password: credentials.password,
      clientId: credentials.clientId || generateClientId('web-mqtt-client'),

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
          'connection-timestamp': new Date().toISOString(),
          'user-id': credentials.username,
        },
      },
    } as MqttConnectionOptions;

    // Validate v5.0 configuration
    const validation = validateMqttV5Options(connectionOptions);
    if (!validation.valid) {
      console.warn('MQTT v5.0 configuration issues detected:', validation.issues);
    }

    console.log('Creating MQTT v5.0 client with WebSocket transport:', {
      url: brokerUrl,
      protocolVersion: connectionOptions.protocolVersion,
      clientId: connectionOptions.clientId,
      keepalive: connectionOptions.keepalive,
      clean: connectionOptions.clean,
      wsTransport: brokerUrl.startsWith('ws'),
      v5Properties: !!connectionOptions.properties,
    });

    const mqttClient = mqtt.connect(brokerUrl, connectionOptions);

    // Set up MQTT v5.0 event handlers with enhanced logging
    mqttClient.on('connect', (connack) => {
      if (isUnmountedRef.current) return;

      console.log('MQTT v5.0 Client connected successfully:', {
        sessionPresent: connack.sessionPresent,
        reasonCode: connack.reasonCode,
        properties: connack.properties,
        timestamp: new Date().toISOString(),
      });

      setStatus('connected');
      resetReconnectAttempts();
      onConnect?.();

      // Re-subscribe to previous subscriptions with v5.0 options
      subscriptionsRef.current.forEach((topic) => {
        mqttClient.subscribe(topic, {
          qos: 1,
          // v5.0 subscription options
          properties: {
            subscriptionIdentifier: Math.floor(Math.random() * 1000),
          }
        }, (err, granted) => {
          if (err) {
            console.error(`Failed to re-subscribe to topic ${topic}:`, err);
          } else {
            console.log(`Re-subscribed to topic ${topic}:`, granted);
          }
        });
      });
    });

    mqttClient.on('disconnect', (packet) => {
      if (isUnmountedRef.current) return;

      console.log('MQTT v5.0 Client disconnected:', {
        reasonCode: packet?.reasonCode,
        properties: packet?.properties,
        timestamp: new Date().toISOString(),
      });

      setStatus('disconnected');
      onDisconnect?.();

      // Check if this was an unexpected disconnection and schedule reconnection
      // Don't reconnect if we're in the process of manually disconnecting
      if (status === 'connected' || status === 'reconnecting') {
        console.log('Unexpected disconnection detected - scheduling reconnection');
        scheduleReconnection('Unexpected disconnection');
      }
    });

    // Note: Built-in reconnect event handler removed since we disabled automatic reconnection
    // and handle reconnection logic manually with exponential backoff

    mqttClient.on('error', (error) => {
      if (isUnmountedRef.current) return;
      handleConnectionError(error);
    });

    mqttClient.on('message', (topic, payload, packet) => {
      if (isUnmountedRef.current) return;

      try {
        // Enhanced message parsing and validation (Requirement 6.4)
        const message = parseAndValidateMessage(topic, payload, packet);

        // Log successful message receipt for monitoring
        console.log('MQTT message received:', {
          topic,
          payloadSize: payload.length,
          qos: packet.qos,
          retain: packet.retain,
          hasProperties: !!packet.properties,
          timestamp: new Date().toISOString(),
        });

        onMessage?.(topic, message);
      } catch (error) {
        // Enhanced error handling with detailed logging (Requirement 6.4)
        const errorMessage = error instanceof Error ? error.message : 'Message processing error';

        console.error('MQTT message processing error:', {
          topic,
          error: errorMessage,
          payloadPreview: payload.toString().substring(0, 100), // First 100 chars for analysis
          payloadSize: payload.length,
          qos: packet.qos,
          retain: packet.retain,
          timestamp: new Date().toISOString(),
        });

        onError?.(error instanceof Error ? error : new Error(errorMessage));
      }
    });

    return mqttClient;
  }, [setStatus, setError, resetReconnectAttempts, incrementReconnectAttempts, onConnect, onDisconnect, onError, onMessage]);

  /**
   * Schedules a reconnection attempt with exponential backoff
   * Requirements 3.2, 3.4: Automatic reconnection with exponential backoff
   */
  const scheduleReconnection = useCallback((error?: Error | string): void => {
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
      console.log('Reconnection not attempted:', reconnectionDecision.reason);
      setStatus('error');
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

    console.log(`Scheduling reconnection attempt ${reconnectAttempts + 1}/${RECONNECTION_CONFIG.maxReconnectAttempts} in ${delay}ms`, {
      attempt: reconnectAttempts + 1,
      delay,
      reason: reconnectionDecision.reason,
      timestamp: new Date().toISOString(),
    });

    // Schedule the reconnection
    reconnectTimeoutRef.current = setTimeout(async () => {
      if (isUnmountedRef.current) return;

      try {
        incrementReconnectAttempts();
        // We'll define connectInternal to avoid circular dependency
        await connectInternal();
      } catch (reconnectError) {
        console.error('Reconnection attempt failed:', reconnectError);
        
        // Recursively schedule another reconnection attempt
        scheduleReconnection(reconnectError instanceof Error ? reconnectError : new Error('Reconnection failed'));
      }
    }, delay);
  }, [
    reconnectAttempts,
    isNetworkOnline,
    tokenExpired,
    setStatus,
    setNextReconnectDelay,
    incrementReconnectAttempts
  ]);

  /**
   * Handles connection errors and determines appropriate response
   * Requirements 3.2, 3.4: Error handling for network and token issues
   */
  const handleConnectionError = useCallback((error: Error): void => {
    if (isUnmountedRef.current) return;

    const errorMessage = error.message || 'Unknown MQTT error';
    
    // Enhanced error logging with categorization
    console.error('MQTT Connection Error:', {
      message: errorMessage,
      code: (error as any).code,
      errno: (error as any).errno,
      syscall: (error as any).syscall,
      isTokenError: isTokenExpirationError(error),
      isNetworkError: isNetworkConnectivityError(error),
      timestamp: new Date().toISOString(),
    });

    // Update error state
    setError(errorMessage);

    // Handle token expiration errors
    if (isTokenExpirationError(error)) {
      console.log('Token expiration detected - marking token as expired');
      setTokenExpired(true);
      setStatus('error');
      onError?.(error);
      return;
    }

    // Handle network connectivity errors
    if (isNetworkConnectivityError(error)) {
      console.log('Network connectivity error detected');
      setStatus('error');
      onError?.(error);
      
      // Schedule reconnection for network errors (will be attempted when network comes back)
      scheduleReconnection(error);
      return;
    }

    // Handle other errors with reconnection
    setStatus('error');
    onError?.(error);
    scheduleReconnection(error);
  }, [setError, setTokenExpired, setStatus, onError, scheduleReconnection]);

  /**
   * Internal connection logic without circular dependency
   */
  const connectInternal = useCallback(async (): Promise<void> => {
    if (isUnmountedRef.current || status === 'connected' || status === 'connecting') {
      return;
    }

    // Don't attempt connection if network is offline
    if (!isNetworkOnline) {
      console.log('Cannot connect - network is offline');
      setError('Network is offline');
      setStatus('error');
      return;
    }

    try {
      setStatus('connecting');
      setError(null);

      // Always fetch fresh credentials on connection attempt
      // This handles token expiration by getting new credentials
      const credentials = await fetchCredentials();

      // Create and configure client
      const mqttClient = createClient(credentials);
      setClient(mqttClient);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      console.error('Failed to connect to MQTT broker:', errorMessage);
      
      // Handle credential fetch errors (likely token expiration)
      if (isTokenExpirationError(errorMessage)) {
        setTokenExpired(true);
      }
      
      setError(errorMessage);
      setStatus('error');
      
      // Handle the connection error
      handleConnectionError(error instanceof Error ? error : new Error(errorMessage));
    }
  }, [status, isNetworkOnline, setStatus, setError, setClient, setTokenExpired, fetchCredentials, createClient, handleConnectionError]);

  /**
   * Establishes MQTT connection
   * Requirement 4.1: Connection lifecycle management
   */
  const connect = useCallback(async (): Promise<void> => {
    await connectInternal();
  }, [connectInternal]);

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
        console.log('MQTT Client disconnected cleanly');
      } catch (error) {
        console.error('Error during MQTT disconnect:', error);
      }
    }

    setClient(null);
    setStatus('disconnected');
    setError(null);
    resetReconnectAttempts();
    subscriptionsRef.current.clear();
  }, [client, setClient, setStatus, setError, resetReconnectAttempts]);



  /**
   * Reconnects MQTT client manually
   * Requirement 4.1: Manual reconnection capability
   */
  const reconnect = useCallback(async (): Promise<void> => {
    // Clear any scheduled reconnections
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Reset reconnection state
    resetReconnectAttempts();
    setTokenExpired(false);
    
    await disconnect();
    await connect();
  }, [disconnect, connect, resetReconnectAttempts, setTokenExpired]);

  /**
   * Subscribes to MQTT topic with v5.0 features and enhanced error handling
   * Requirement 4.2: Subscription management with v5.0 properties
   * Requirement 6.4: Enhanced error handling and logging
   */
  const subscribe = useCallback(async (topic: string, qos: 0 | 1 | 2 = 1): Promise<void> => {
    // Input validation
    if (!topic || typeof topic !== 'string') {
      const error = new Error('Invalid topic: must be a non-empty string');
      console.error('Subscribe validation error:', {
        topic,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }

    if (qos !== 0 && qos !== 1 && qos !== 2) {
      const error = new Error(`Invalid QoS level: ${qos}. Must be 0, 1, or 2`);
      console.error('Subscribe validation error:', {
        topic,
        qos,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }

    if (!client || status !== 'connected') {
      const error = new Error(`MQTT client is not connected. Current status: ${status}`);
      console.error('Subscribe connection error:', {
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
      console.warn('Already subscribed to topic:', {
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
            'subscription-timestamp': new Date().toISOString(),
            'client-id': client.options.clientId || 'unknown',
            'subscription-qos': qos.toString(),
          },
        },
      };

      try {
        client.subscribe(topic, subscribeOptions, (error, granted) => {
          if (error) {
            // Enhanced error logging for subscription failures
            console.error(`Failed to subscribe to topic ${topic}:`, {
              error: error.message,
              errorCode: (error as any).code,
              topic,
              qos,
              clientConnected: client.connected,
              timestamp: new Date().toISOString(),
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
          error: syncError instanceof Error ? syncError.message : 'Unknown error',
          topic,
          qos,
          timestamp: new Date().toISOString(),
        });
        reject(syncError instanceof Error ? syncError : new Error('Unknown subscription error'));
      }
    });
  }, [client, status]);

  /**
   * Unsubscribes from MQTT topic with v5.0 properties and enhanced error handling
   * Requirement 4.2: Subscription management with v5.0 features
   * Requirement 6.4: Enhanced error handling and logging
   */
  const unsubscribe = useCallback(async (topic: string): Promise<void> => {
    // Input validation
    if (!topic || typeof topic !== 'string') {
      const error = new Error('Invalid topic: must be a non-empty string');
      console.error('Unsubscribe validation error:', {
        topic,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }

    if (!client || status !== 'connected') {
      const error = new Error(`MQTT client is not connected. Current status: ${status}`);
      console.error('Unsubscribe connection error:', {
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
      console.warn('Not subscribed to topic:', {
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
            'unsubscribe-timestamp': new Date().toISOString(),
            'client-id': client.options.clientId || 'unknown',
          },
        },
      };

      try {
        client.unsubscribe(topic, unsubscribeOptions, (error, packet) => {
          if (error) {
            // Enhanced error logging for unsubscription failures
            console.error(`Failed to unsubscribe from topic ${topic}:`, {
              error: error.message,
              errorCode: (error as any).code,
              topic,
              clientConnected: client.connected,
              timestamp: new Date().toISOString(),
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
          error: syncError instanceof Error ? syncError.message : 'Unknown error',
          topic,
          timestamp: new Date().toISOString(),
        });
        reject(syncError instanceof Error ? syncError : new Error('Unknown unsubscription error'));
      }
    });
  }, [client, status]);

  /**
   * Publishes message to MQTT topic with v5.0 properties and enhanced error handling
   * Requirement 4.2: Publishing functionality with v5.0 features
   * Requirement 6.3: Enhanced error handling for publish failures
   */
  const publish = useCallback(async (
    topic: string,
    message: string | Buffer,
    options: MqttPublishOptions = {}
  ): Promise<void> => {
    // Input validation
    if (!topic || typeof topic !== 'string') {
      const error = new Error('Invalid topic: must be a non-empty string');
      console.error('Publish validation error:', {
        topic,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }

    if (message === null || message === undefined) {
      const error = new Error('Invalid message: message cannot be null or undefined');
      console.error('Publish validation error:', {
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
      console.error('Publish validation error:', {
        topic,
        qos,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }

    if (!client || status !== 'connected') {
      const error = new Error(`MQTT client is not connected. Current status: ${status}`);
      console.error('Publish connection error:', {
        topic,
        messageLength: typeof message === 'string' ? message.length : message.length,
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
          'publish-timestamp': new Date().toISOString(),
          'client-id': client.options.clientId || 'unknown',
          'message-size': (typeof message === 'string' ? message.length : message.length).toString(),
          ...options.properties?.userProperties,
        },
      },
    };

    return new Promise((resolve, reject) => {
      try {
        client.publish(topic, message, publishOptions, (error, packet) => {
          if (error) {
            // Enhanced error logging for publish failures (Requirement 6.3)
            console.error(`Failed to publish to topic ${topic}:`, {
              error: error.message,
              errorCode: (error as any).code,
              topic,
              messageLength: typeof message === 'string' ? message.length : message.length,
              messagePreview: typeof message === 'string'
                ? message.substring(0, 100)
                : message.toString('utf8', 0, 100),
              qos: publishOptions.qos,
              retain: publishOptions.retain,
              clientConnected: client.connected,
              timestamp: new Date().toISOString(),
            });
            reject(error);
          } else {
            // Enhanced success logging
            console.log(`Successfully published to topic: ${topic}`, {
              topic,
              messageLength: typeof message === 'string' ? message.length : message.length,
              qos: publishOptions.qos,
              retain: publishOptions.retain,
              packet,
              timestamp: new Date().toISOString(),
            });
            resolve();
          }
        });
      } catch (syncError) {
        // Handle synchronous errors from the publish call
        console.error(`Synchronous error during publish to ${topic}:`, {
          error: syncError instanceof Error ? syncError.message : 'Unknown error',
          topic,
          messageLength: typeof message === 'string' ? message.length : message.length,
          timestamp: new Date().toISOString(),
        });
        reject(syncError instanceof Error ? syncError : new Error('Unknown publish error'));
      }
    });
  }, [client, status]);

  /**
   * Initialize connection on mount if autoConnect is enabled
   * Requirement 4.1: Automatic connection management
   */
  useEffect(() => {
    if (autoConnect && status === 'disconnected') {
      connect();
    }
  }, [autoConnect, connect, status]);

  /**
   * Subscribe to initial topics
   * Requirement 4.2: Initial subscription management
   */
  useEffect(() => {
    if (client && status === 'connected' && subscriptions.length > 0) {
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
        if ((status === 'error' || status === 'disconnected') && !tokenExpired) {
          console.log('Network connectivity restored - attempting reconnection');
          scheduleReconnection('Network connectivity restored');
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
        
        console.log('Network connectivity lost - pausing reconnection attempts');
      }
    );

    return () => {
      if (networkMonitorCleanupRef.current) {
        networkMonitorCleanupRef.current();
        networkMonitorCleanupRef.current = null;
      }
    };
  }, [status, tokenExpired, setNetworkOnline, scheduleReconnection]);

  /**
   * Cleanup on unmount
   * Requirement 4.5: Proper cleanup on component unmount
   */
  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      if (networkMonitorCleanupRef.current) {
        networkMonitorCleanupRef.current();
        networkMonitorCleanupRef.current = null;
      }

      if (client) {
        client.end(true); // Force disconnect
      }
    };
  }, [client]);

  // Return hook interface
  return {
    connectionStatus: status,
    client,
    error,
    isConnected: status === 'connected',
    subscribe,
    unsubscribe,
    publish,
    disconnect,
    reconnect,
  };
}