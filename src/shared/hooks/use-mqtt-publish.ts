/**
 * MQTT Publishing Hook with TanStack Query Mutations
 * Implements requirement 2.5: TanStack Query mutations for message publishing
 * Implements requirement 4.2: Client-side publish method integration
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useMqttContext } from "../context/mqtt-provider";
import type { MqttActionResponse, MqttPublishOptions } from "../types/mqtt.types";

/**
 * Options for MQTT publish mutation
 */
export interface MqttPublishMutationOptions {
  /**
   * Topics to invalidate after successful publish
   * Useful for request-response patterns or related data updates
   */
  invalidateTopics?: string[];

  /**
   * Whether to optimistically update the cache before publish
   * Default: false
   */
  optimisticUpdate?: boolean;

  /**
   * Custom success callback
   */
  onSuccess?: (data: MqttActionResponse, variables: MqttPublishVariables) => void;

  /**
   * Custom error callback
   */
  onError?: (error: Error, variables: MqttPublishVariables) => void;

  /**
   * Custom settled callback (called on both success and error)
   */
  onSettled?: (data: MqttActionResponse | undefined, error: Error | null, variables: MqttPublishVariables) => void;
}

/**
 * Variables for MQTT publish mutation
 */
export interface MqttPublishVariables {
  topic: string;
  message: string | Buffer | object;
  options?: MqttPublishOptions;
}

/**
 * Hook for publishing MQTT messages using TanStack Query mutations
 * Provides reactive state management and error handling for publish operations
 *
 * @param mutationOptions - Configuration options for the mutation
 * @returns TanStack Query mutation object with MQTT-specific enhancements
 */
export function useMqttPublish(mutationOptions: MqttPublishMutationOptions = {}) {
  const queryClient = useQueryClient();
  const { publish, isConnected, connectionStatus } = useMqttContext();

  const { invalidateTopics = [], optimisticUpdate = false, onSuccess, onError, onSettled } = mutationOptions;

  /**
   * Context type for optimistic updates
   */
  interface MutationContext {
    previousData: unknown;
    queryKey: readonly unknown[];
  }

  /**
   * TanStack Query mutation for MQTT message publishing
   * Implements requirement 2.5: TanStack Query mutations for message publishing
   */
  const mutation = useMutation<MqttActionResponse, Error, MqttPublishVariables, MutationContext>({
    mutationFn: async ({ topic, message, options = {} }: MqttPublishVariables) => {
      // Validate connection status before attempting to publish
      if (!isConnected) {
        throw new Error(`Cannot publish: MQTT client is not connected. Current status: ${connectionStatus}`);
      }

      try {
        // Convert object messages to JSON strings
        const processedMessage =
          typeof message === "object" && !Buffer.isBuffer(message) ? JSON.stringify(message) : message;

        // Use the publish method from useMqtt hook
        await publish(topic, processedMessage, options);

        // Log successful publish for monitoring
        console.log("MQTT message published successfully via mutation:", {
          topic,
          messageType: typeof message,
          messageSize:
            typeof processedMessage === "string"
              ? processedMessage.length
              : Buffer.isBuffer(processedMessage)
                ? processedMessage.length
                : 0,
          qos: options.qos || 1,
          retain: options.retain || false,
          timestamp: new Date().toISOString(),
        });

        return { success: true };
      } catch (error) {
        // Enhanced error handling for publish failures (requirement 4.2)
        const errorMessage = error instanceof Error ? error.message : "Unknown publish error";

        console.error("MQTT publish mutation failed:", {
          topic,
          error: errorMessage,
          messageType: typeof message,
          connectionStatus,
          isConnected,
          timestamp: new Date().toISOString(),
        });

        throw new Error(`Failed to publish to topic "${topic}": ${errorMessage}`);
      }
    },

    onMutate: async (variables) => {
      // Optimistic update implementation
      if (optimisticUpdate) {
        const { topic, message } = variables;
        const queryKey = ["mqtt-topic", topic];

        // Cancel any outgoing refetches
        await queryClient.cancelQueries({ queryKey });

        // Snapshot the previous value
        const previousData = queryClient.getQueryData(queryKey);

        // Optimistically update the cache (normalizando payload a string)
        queryClient.setQueryData(queryKey, (old: unknown) => {
          const current = old as {
            messages: Array<{
              topic: string;
              payload: string | Buffer;
              qos: 0 | 1 | 2;
              retain: boolean;
              properties?: MqttPublishOptions["properties"];
            }>;
            lastMessage: unknown;
            lastUpdated: Date;
          } | null;

          if (!current) return current;

          const payloadString = Buffer.isBuffer(message)
            ? message.toString("utf8")
            : typeof message === "object"
              ? JSON.stringify(message)
              : String(message);

          const optimisticMessage = {
            topic,
            payload: payloadString,
            qos: variables.options?.qos || 1,
            retain: variables.options?.retain || false,
            properties: variables.options?.properties,
          };

          return {
            ...current,
            messages: [...current.messages, optimisticMessage].slice(-100),
            lastMessage: optimisticMessage,
            lastUpdated: new Date(),
          };
        });

        // Return context with previous data for potential rollback
        return { previousData, queryKey } as MutationContext;
      }

      return undefined;
    },

    onError: (error, variables, context) => {
      // Rollback optimistic update on error
      if (optimisticUpdate && context) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }

      // Call custom error handler
      onError?.(error, variables);
    },

    onSuccess: (data, variables) => {
      // Invalidate related topics after successful publish
      if (invalidateTopics.length > 0) {
        invalidateTopics.forEach((topic) => {
          queryClient.invalidateQueries({
            queryKey: ["mqtt-topic", topic],
          });
        });
      }

      // Call custom success handler
      onSuccess?.(data, variables);
    },

    onSettled: (data, error, variables) => {
      // Call custom settled handler
      onSettled?.(data, error, variables);
    },

    // Retry configuration for publish failures
    retry: (failureCount, error) => {
      // Don't retry if client is disconnected
      if (!isConnected) {
        return false;
      }

      // Retry up to 3 times for network-related errors
      if (failureCount < 3 && error.message.includes("network")) {
        return true;
      }

      return false;
    },

    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  return {
    ...mutation,

    /**
     * Enhanced publish method with better error messages
     * Convenience method that wraps the mutation
     */
    publishMessage: (topic: string, message: string | Buffer | object, options?: MqttPublishOptions) => {
      return mutation.mutate({ topic, message, options });
    },

    /**
     * Async version of publish message that returns a promise
     */
    publishMessageAsync: (topic: string, message: string | Buffer | object, options?: MqttPublishOptions) => {
      return mutation.mutateAsync({ topic, message, options });
    },

    /**
     * Check if publishing is currently possible
     */
    canPublish: isConnected && connectionStatus === "connected",

    /**
     * Current connection status for UI feedback
     */
    connectionStatus,

    /**
     * Whether the MQTT client is connected
     */
    isConnected,
  };
}

/**
 * Hook for publishing JSON messages with automatic serialization
 * Convenience hook for common JSON message publishing use case
 *
 * @param mutationOptions - Configuration options for the mutation
 * @returns Enhanced mutation object with JSON-specific methods
 */
export function useMqttPublishJson<T extends Record<string, unknown> = Record<string, unknown>>(
  mutationOptions: MqttPublishMutationOptions = {}
) {
  const baseMutation = useMqttPublish(mutationOptions);

  return {
    ...baseMutation,

    /**
     * Publish a JSON object to an MQTT topic
     * Automatically serializes the object and sets appropriate content type
     */
    publishJson: (topic: string, data: T, options: MqttPublishOptions = {}) => {
      const enhancedOptions: MqttPublishOptions = {
        ...options,
        properties: {
          ...options.properties,
          contentType: "application/json",
          payloadFormatIndicator: true, // UTF-8 string
          ...options.properties, // Allow override
        },
      };

      return baseMutation.publishMessage(topic, data, enhancedOptions);
    },

    /**
     * Async version of publishJson
     */
    publishJsonAsync: (topic: string, data: T, options: MqttPublishOptions = {}) => {
      const enhancedOptions: MqttPublishOptions = {
        ...options,
        properties: {
          ...options.properties,
          contentType: "application/json",
          payloadFormatIndicator: true, // UTF-8 string
          ...options.properties, // Allow override
        },
      };

      return baseMutation.publishMessageAsync(topic, data, enhancedOptions);
    },
  };
}

/**
 * Hook for request-response pattern publishing
 * Automatically handles response topic setup and correlation
 *
 * @param mutationOptions - Configuration options for the mutation
 * @returns Enhanced mutation object with request-response methods
 */
export function useMqttPublishRequest(mutationOptions: MqttPublishMutationOptions = {}) {
  const baseMutation = useMqttPublish(mutationOptions);

  return {
    ...baseMutation,

    /**
     * Publish a request message with automatic response topic and correlation setup
     * Useful for request-response patterns in MQTT v5.0
     */
    publishRequest: (
      requestTopic: string,
      message: string | Buffer | object,
      responseTopic: string,
      options: MqttPublishOptions = {}
    ) => {
      // Generate correlation data for request-response matching
      const correlationData = Buffer.from(Date.now().toString() + Math.random().toString());

      const enhancedOptions: MqttPublishOptions = {
        ...options,
        properties: {
          ...options.properties,
          responseTopic,
          correlationData,
          userProperties: {
            "request-timestamp": new Date().toISOString(),
            ...options.properties?.userProperties,
          },
        },
      };

      return baseMutation.publishMessage(requestTopic, message, enhancedOptions);
    },

    /**
     * Async version of publishRequest
     */
    publishRequestAsync: (
      requestTopic: string,
      message: string | Buffer | object,
      responseTopic: string,
      options: MqttPublishOptions = {}
    ) => {
      // Generate correlation data for request-response matching
      const correlationData = Buffer.from(Date.now().toString() + Math.random().toString());

      const enhancedOptions: MqttPublishOptions = {
        ...options,
        properties: {
          ...options.properties,
          responseTopic,
          correlationData,
          userProperties: {
            "request-timestamp": new Date().toISOString(),
            ...options.properties?.userProperties,
          },
        },
      };

      return baseMutation.publishMessageAsync(requestTopic, message, enhancedOptions);
    },
  };
}
