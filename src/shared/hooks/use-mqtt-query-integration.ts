/**
 * MQTT Query Integration Hook
 * Manages the integration between MQTT messages and TanStack Query cache
 * Implements requirement 2.3: Cache invalidation on message receipt
 */

import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
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
 * Hook that integrates MQTT message handling with TanStack Query
 * This hook should be used at the app level to ensure global message handling
 * Implements requirement 2.3: Cache invalidation on message receipt
 */
export function useMqttQueryIntegration() {
  const queryClient = useQueryClient();
  
  /**
   * Handles incoming MQTT messages and updates TanStack Query cache
   * Implements requirement 2.3: Cache invalidation on message receipt
   */
  const handleGlobalMessage = useCallback((topic: string, message: MqttMessage) => {
    const queryKey = ['mqtt-topic', topic];
    
    // Get current cached data
    const currentData = queryClient.getQueryData<MqttTopicData>(queryKey);
    
    // Only update if there are active subscribers for this topic
    if (!currentData || currentData.subscribers === 0) {
      return;
    }

    // Create updated topic data
    const updatedData: MqttTopicData = {
      ...currentData,
      messages: [
        ...currentData.messages,
        message
      ].slice(-100), // Keep only the last 100 messages by default
      lastMessage: message,
      lastUpdated: new Date(),
      // Note: parsedData will be handled by individual useMqttTopic hooks
    };

    // Update cache with new data
    queryClient.setQueryData(queryKey, updatedData);
    
    // Invalidate query to trigger re-renders (requirement 2.4)
    queryClient.invalidateQueries({ queryKey });

    console.log(`Global MQTT message processed for topic ${topic}:`, {
      topic,
      messageCount: updatedData.messages.length,
      subscribers: updatedData.subscribers,
      timestamp: new Date().toISOString(),
    });
  }, [queryClient]);

  // Set up global message handler
  const { isConnected } = useMqtt({
    onMessage: handleGlobalMessage
  });

  return {
    isConnected,
    /**
     * Manually invalidate all MQTT topic queries
     * Useful for cleanup or forced refresh
     */
    invalidateAllTopics: useCallback(() => {
      queryClient.invalidateQueries({ 
        queryKey: ['mqtt-topic'],
        type: 'all'
      });
    }, [queryClient]),

    /**
     * Clear all MQTT topic data from cache
     * Useful for logout or connection reset
     */
    clearAllTopics: useCallback(() => {
      queryClient.removeQueries({ 
        queryKey: ['mqtt-topic'],
        type: 'all'
      });
    }, [queryClient]),

    /**
     * Get all active MQTT topic subscriptions
     */
    getActiveTopics: useCallback(() => {
      const queries = queryClient.getQueriesData({ queryKey: ['mqtt-topic'] });
      return queries
        .map(([key, data]) => ({
          topic: key[1] as string,
          data: data as MqttTopicData,
        }))
        .filter(({ data }) => data && data.subscribers > 0);
    }, [queryClient]),
  };
}