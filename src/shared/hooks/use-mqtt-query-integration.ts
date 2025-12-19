/**
 * MQTT Query Integration Hook
 * Manages the integration between MQTT messages and TanStack Query cache
 * Implements requirement 2.3: Cache invalidation on message receipt
 */

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useMqttConnectionStore } from "../stores/mqtt-connection.store";
import type { MqttMessage } from "../types/mqtt.types";

/**
 * Topic data structure stored in TanStack Query cache
 */
interface MqttTopicData<T = unknown> {
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

  // Normaliza el payload a string (UTF-8) antes de guardar en la caché
  const normalizeMessagePayload = useCallback((message: MqttMessage): MqttMessage => {
    try {
      const shouldDecodeAsString =
        typeof message.payload === "string" ||
        message.properties?.payloadFormatIndicator === true ||
        (typeof message.properties?.contentType === "string" &&
          message.properties.contentType.toLowerCase().includes("json"));

      if (typeof message.payload === "string") {
        return message;
      }

      if (shouldDecodeAsString) {
        return { ...message, payload: message.payload.toString("utf8") };
      }

      // Como fallback, también guardamos como string (utf8) para evitar Buffers en la cache
      return { ...message, payload: message.payload.toString("utf8") };
    } catch (_err) {
      // Si por alguna razón falla, devolvemos el mensaje original
      return message;
    }
  }, []);

  /**
   * Handles incoming MQTT messages and updates TanStack Query cache
   * Implements requirement 2.3: Cache invalidation on message receipt
   */
  const handleGlobalMessage = useCallback(
    (topic: string, message: MqttMessage) => {
      const queryKey = ["mqtt-topic", topic];

      // Get current cached data
      const currentData = queryClient.getQueryData<MqttTopicData>(queryKey);

      // Only update if there are active subscribers for this topic
      if (!currentData || currentData.subscribers === 0) {
        return;
      }

      // Normalizamos todos los mensajes previos y el actual para evitar Buffers en cache
      const normalizedPrevious = (currentData.messages || []).map(normalizeMessagePayload);
      const normalizedIncoming = normalizeMessagePayload(message);

      // Create updated topic data (manteniendo solo los últimos 100)
      const updatedData: MqttTopicData = {
        ...currentData,
        messages: [...normalizedPrevious, normalizedIncoming].slice(-100),
        lastMessage: normalizedIncoming,
        lastUpdated: new Date(),
        // Note: parsedData will be handled by individual useMqttTopic hooks
      };

      // Update cache con actualización quirúrgica (sin invalidar)
      // Esto evita refetchs innecesarios y re-render global
      queryClient.setQueryData(queryKey, updatedData);
    },
    [queryClient, normalizeMessagePayload]
  );

  // Derive connection state from global store to avoid provider order dependency
  const isConnected = useMqttConnectionStore((state) => state.status === "connected");

  return {
    isConnected,
    handleGlobalMessage,
    /**
     * Manually invalidate all MQTT topic queries
     * Useful for cleanup or forced refresh
     */
    invalidateAllTopics: useCallback(() => {
      queryClient.invalidateQueries({
        queryKey: ["mqtt-topic"],
        type: "all",
      });
    }, [queryClient]),

    /**
     * Clear all MQTT topic data from cache
     * Useful for logout or connection reset
     */
    clearAllTopics: useCallback(() => {
      queryClient.removeQueries({
        queryKey: ["mqtt-topic"],
        type: "all",
      });
    }, [queryClient]),

    /**
     * Get all active MQTT topic subscriptions
     */
    getActiveTopics: useCallback(() => {
      const queries = queryClient.getQueriesData({ queryKey: ["mqtt-topic"] });
      return queries
        .map(([key, data]) => ({
          topic: key[1] as string,
          data: data as MqttTopicData,
        }))
        .filter(({ data }) => data && data.subscribers > 0);
    }, [queryClient]),
  };
}
