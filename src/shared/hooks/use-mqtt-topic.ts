/**
 * useMqttTopic Hook
 * TanStack Query integration for topic-specific data queries
 * Implements requirements 2.1, 2.2, 2.3, 2.4 for reactive state management
 */

import { useEffect, useCallback, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMqtt } from './use-mqtt';
import type { MqttMessage } from '../types/mqtt.types';

/**
 * Topic data structure stored in TanStack Query cache
 */
interface MqttTopicData<T = any> {
  topic: string;
  messages: MqttMessage[];
  lastMessage: MqttMessage | null;
  lastUpdated: Date;
  parsedData: T | null;
  subscribers: number;
}

/**
 * Options for useMqttTopic hook
 */
interface UseMqttTopicOptions<T> {
  /**
   * Parser function to transform message payload to typed data
   */
  parser?: (payload: string | Buffer) => T;
  
  /**
   * QoS level for subscription (default: 1)
   */
  qos?: 0 | 1 | 2;
  
  /**
   * Maximum number of messages to keep in cache (default: 100)
   */
  maxMessages?: number;
  
  /**
   * Whether to automatically subscribe when connected (default: true)
   */
  autoSubscribe?: boolean;
  
  /**
   * Custom error handler for parsing errors
   */
  onParseError?: (error: Error, message: MqttMessage) => void;
}

/**
 * Hook for subscribing to specific MQTT topics with TanStack Query integration
 * Provides reactive updates when messages are received on the topic
 * Implements requirement 2.2: Topic-specific data queries with reactive updates
 * 
 * @param topic - The MQTT topic to subscribe to
 * @param options - Configuration options for the hook
 * @returns TanStack Query result for the topic data
 */
export function useMqttTopic<T = any>(
  topic: string, 
  options: UseMqttTopicOptions<T> = {}
) {
  const {
    parser,
    qos = 1,
    maxMessages = 100,
    autoSubscribe = true,
    onParseError
  } = options;

  const queryClient = useQueryClient();
  const { subscribe, unsubscribe, isConnected, connectionStatus } = useMqtt({
    // Don't set up global message handler here - it's handled by useMqttQueryIntegration
  });

  // Refs to maintain stable references
  const isSubscribedRef = useRef(false);
  const subscribersCountRef = useRef(0);

  /**
   * Parse the latest message data when cache is updated
   * This runs whenever the query data changes (triggered by global message handler)
   */
  const parseLatestMessage = useCallback((data: MqttTopicData<T>): MqttTopicData<T> => {
    if (!parser || !data.lastMessage) {
      return data;
    }

    try {
      const payloadString = data.lastMessage.payload instanceof Buffer 
        ? data.lastMessage.payload.toString('utf8') 
        : data.lastMessage.payload;
      
      const parsedData = parser(payloadString);
      
      return {
        ...data,
        parsedData,
      };
    } catch (error) {
      console.error(`Failed to parse MQTT message for topic ${topic}:`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        topic,
        payloadPreview: data.lastMessage.payload.toString().substring(0, 100),
        timestamp: new Date().toISOString(),
      });
      
      // Call custom error handler if provided
      onParseError?.(error instanceof Error ? error : new Error('Parse error'), data.lastMessage);
      
      return {
        ...data,
        parsedData: null,
      };
    }
  }, [topic, parser, onParseError]);

  /**
   * Subscribe to MQTT topic
   */
  const subscribeToTopic = useCallback(async () => {
    if (!isConnected || isSubscribedRef.current) {
      return;
    }

    try {
      await subscribe(topic, qos);
      isSubscribedRef.current = true;
      subscribersCountRef.current += 1;

      // Update subscribers count in cache
      const queryKey = ['mqtt-topic', topic];
      const currentData = queryClient.getQueryData<MqttTopicData<T>>(queryKey);
      if (currentData) {
        queryClient.setQueryData(queryKey, {
          ...currentData,
          subscribers: subscribersCountRef.current,
        });
      }

      console.log(`Successfully subscribed to MQTT topic: ${topic}`, {
        topic,
        qos,
        subscribers: subscribersCountRef.current,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`Failed to subscribe to MQTT topic ${topic}:`, error);
    }
  }, [isConnected, topic, qos, subscribe, queryClient]);

  /**
   * Unsubscribe from MQTT topic
   */
  const unsubscribeFromTopic = useCallback(async () => {
    if (!isSubscribedRef.current) {
      return;
    }

    try {
      await unsubscribe(topic);
      isSubscribedRef.current = false;
      subscribersCountRef.current = Math.max(0, subscribersCountRef.current - 1);

      // Update subscribers count in cache
      const queryKey = ['mqtt-topic', topic];
      const currentData = queryClient.getQueryData<MqttTopicData<T>>(queryKey);
      if (currentData) {
        queryClient.setQueryData(queryKey, {
          ...currentData,
          subscribers: subscribersCountRef.current,
        });
      }

      console.log(`Successfully unsubscribed from MQTT topic: ${topic}`, {
        topic,
        subscribers: subscribersCountRef.current,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`Failed to unsubscribe from MQTT topic ${topic}:`, error);
    }
  }, [topic, unsubscribe, queryClient]);

  /**
   * Effect to handle subscription lifecycle
   * Implements requirement 2.1: Connection state management with TanStack Query
   */
  useEffect(() => {
    if (autoSubscribe && isConnected && !isSubscribedRef.current) {
      subscribeToTopic();
    } else if (!isConnected && isSubscribedRef.current) {
      // Reset subscription state when disconnected
      isSubscribedRef.current = false;
    }

    // Cleanup on unmount
    return () => {
      if (isSubscribedRef.current) {
        unsubscribeFromTopic();
      }
    };
  }, [isConnected, autoSubscribe, subscribeToTopic, unsubscribeFromTopic]);

  /**
   * TanStack Query for topic data
   * Implements requirement 2.1: Reactive state management with TanStack Query
   */
  const query = useQuery({
    queryKey: ['mqtt-topic', topic],
    queryFn: (): MqttTopicData<T> => {
      // Get existing data from cache (updated by global message handler)
      const existingData = queryClient.getQueryData<MqttTopicData<T>>(['mqtt-topic', topic]);
      
      if (existingData) {
        // Apply parsing to the existing data
        return parseLatestMessage(existingData);
      }

      // Return initial empty state
      const initialData: MqttTopicData<T> = {
        topic,
        messages: [],
        lastMessage: null,
        lastUpdated: new Date(),
        parsedData: null,
        subscribers: subscribersCountRef.current,
      };

      // Set initial data in cache
      queryClient.setQueryData(['mqtt-topic', topic], initialData);
      return initialData;
    },
    enabled: true, // Always enabled, but data depends on connection
    staleTime: Infinity, // Data is always fresh from MQTT
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes after last use
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnReconnect: false, // Don't refetch on reconnect
    select: useCallback((data: MqttTopicData<T>) => {
      // Apply parsing whenever data is selected
      return parseLatestMessage(data);
    }, [parseLatestMessage]),
  });

  // Return enhanced query result with MQTT-specific data and methods
  return {
    ...query,
    // MQTT-specific data
    topic,
    messages: query.data?.messages || [],
    lastMessage: query.data?.lastMessage || null,
    parsedData: query.data?.parsedData || null,
    lastUpdated: query.data?.lastUpdated || null,
    subscribers: query.data?.subscribers || 0,
    
    // Connection state
    isConnected,
    connectionStatus,
    isSubscribed: isSubscribedRef.current,
    
    // Manual subscription control
    subscribe: subscribeToTopic,
    unsubscribe: unsubscribeFromTopic,
  };
}