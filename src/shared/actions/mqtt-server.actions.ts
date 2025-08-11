"use server";

/**
 * MQTT Server Actions
 * Server-side MQTT operations for secure message publishing
 */
import { http } from "@/lib/http/serverFetch";
import type { MqttActionResponse, MqttPublishOptions } from "@/shared/types/mqtt.types";
import { getMqttErrorHandler } from "@/shared/utils/mqtt-error-handler";

/**
 * Interface for MQTT publish request to backend
 */
interface MqttPublishRequest {
  topic: string;
  payload: string;
  qos?: 0 | 1 | 2;
  retain?: boolean;
  properties?: {
    payloadFormatIndicator?: boolean;
    messageExpiryInterval?: number;
    topicAlias?: number;
    responseTopic?: string;
    correlationData?: string; // Base64 encoded for JSON transport
    userProperties?: Record<string, string | string[]>;
    subscriptionIdentifier?: number | number[];
    contentType?: string;
  };
}

/**
 * Server Action for publishing MQTT messages
 * Centralizes publishing logic on the server for security
 *
 * @param topic - The MQTT topic to publish to
 * @param payload - The message payload (string or object)
 * @param options - Optional publish options (QoS, retain, properties)
 * @returns Promise<MqttActionResponse> - Success/failure response
 */
export async function publishMqttMessage(
  topic: string,
  payload: string | object,
  options?: MqttPublishOptions
): Promise<MqttActionResponse> {
  try {
    // Validate required parameters
    if (!topic || topic.trim() === "") {
      return {
        success: false,
        error: "Topic is required and cannot be empty",
      };
    }

    // Convert payload to string if it's an object
    const payloadString = typeof payload === "string" ? payload : JSON.stringify(payload);

    // Prepare the request body with MQTT v5.0 properties support
    const publishRequest: MqttPublishRequest = {
      topic: topic.trim(),
      payload: payloadString,
      qos: options?.qos || 0,
      retain: options?.retain || false,
    };

    // Add MQTT v5.0 properties if provided
    if (options?.properties) {
      publishRequest.properties = {
        ...options.properties,
        // Convert Buffer to base64 string for JSON transport
        correlationData: options.properties.correlationData
          ? Buffer.from(options.properties.correlationData).toString("base64")
          : undefined,
      };
    }

    // Make the request to the backend MQTT publish endpoint
    const [data, err] = await http.post<{ success: boolean; messageId?: string }>("/api/mqtt/publish", publishRequest);

    if (err !== null) {
      // Use comprehensive error handler for server action publish failures
      const errorHandler = getMqttErrorHandler();
      const error = new Error(`HTTP ${err.statusCode}: ${err.message}`);

      errorHandler.handlePublishingError(error, {
        topic,
        payloadSize: payloadString.length,
        qos: publishRequest.qos || 0,
        retain: publishRequest.retain || false,
        hasProperties: !!publishRequest.properties,
        clientConnected: false, // Server-side publishing
      });

      return {
        success: false,
        error: `Failed to publish message: ${err.message}`,
      };
    }

    // Log successful publish (excluding sensitive payload data)
    console.log("MQTT message published successfully:", {
      topic,
      qos: publishRequest.qos,
      retain: publishRequest.retain,
      payloadLength: payloadString.length,
      messageId: data?.messageId,
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
    };
  } catch (error) {
    // Use comprehensive error handler for server action exceptions
    const errorHandler = getMqttErrorHandler();
    const publishError = error instanceof Error ? error : new Error("Unknown error occurred while publishing message");

    errorHandler.handlePublishingError(publishError, {
      topic,
      payloadSize: typeof payload === "string" ? payload.length : JSON.stringify(payload).length,
      qos: options?.qos || 0,
      retain: options?.retain || false,
      hasProperties: !!options?.properties,
      clientConnected: false, // Server-side publishing
    });

    return {
      success: false,
      error: publishError.message,
    };
  }
}

/**
 * Server Action for publishing MQTT messages with response topic (Request-Response pattern)
 * Supports MQTT v5.0 request-response pattern with responseTopic and correlationData
 *
 * @param topic - The MQTT topic to publish to
 * @param payload - The message payload (string or object)
 * @param responseTopic - The topic where the response should be sent
 * @param correlationData - Optional correlation data for matching request/response
 * @param options - Optional publish options (QoS, retain, other properties)
 * @returns Promise<MqttActionResponse> - Success/failure response
 */
export async function publishMqttRequest(
  topic: string,
  payload: string | object,
  responseTopic: string,
  correlationData?: Buffer | string,
  options?: Omit<MqttPublishOptions, "properties"> & {
    properties?: Omit<MqttPublishOptions["properties"], "responseTopic" | "correlationData">;
  }
): Promise<MqttActionResponse> {
  try {
    // Validate required parameters
    if (!topic || topic.trim() === "") {
      return {
        success: false,
        error: "Topic is required and cannot be empty",
      };
    }

    if (!responseTopic || responseTopic.trim() === "") {
      return {
        success: false,
        error: "Response topic is required and cannot be empty",
      };
    }

    // Generate correlation data if not provided
    const finalCorrelationData =
      correlationData || Buffer.from(`req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

    // Build the publish options with request-response properties
    const publishOptions: MqttPublishOptions = {
      ...options,
      properties: {
        ...options?.properties,
        responseTopic: responseTopic.trim(),
        correlationData:
          typeof finalCorrelationData === "string" ? Buffer.from(finalCorrelationData) : finalCorrelationData,
      },
    };

    // Use the main publish function with enhanced properties
    const result = await publishMqttMessage(topic, payload, publishOptions);

    if (result.success) {
      console.log("MQTT request message published successfully:", {
        topic,
        responseTopic,
        correlationData:
          typeof finalCorrelationData === "string" ? finalCorrelationData : finalCorrelationData.toString("base64"),
        timestamp: new Date().toISOString(),
      });
    }

    return result;
  } catch (error) {
    // Use comprehensive error handler for request message publishing errors
    const errorHandler = getMqttErrorHandler();
    const publishError =
      error instanceof Error ? error : new Error("Unknown error occurred while publishing request message");

    errorHandler.handlePublishingError(publishError, {
      topic,
      payloadSize: typeof payload === "string" ? payload.length : JSON.stringify(payload).length,
      qos: options?.qos || 0,
      retain: options?.retain || false,
      hasProperties: true, // Request messages always have properties
      clientConnected: false, // Server-side publishing
    });

    return {
      success: false,
      error: publishError.message,
    };
  }
}

/**
 * Server Action for publishing MQTT messages with user properties
 * Convenient wrapper for messages that need custom user properties
 *
 * @param topic - The MQTT topic to publish to
 * @param payload - The message payload (string or object)
 * @param userProperties - Custom user properties for the message
 * @param options - Optional publish options (QoS, retain, other properties)
 * @returns Promise<MqttActionResponse> - Success/failure response
 */
export async function publishMqttMessageWithProperties(
  topic: string,
  payload: string | object,
  userProperties: Record<string, string | string[]>,
  options?: Omit<MqttPublishOptions, "properties"> & {
    properties?: Omit<MqttPublishOptions["properties"], "userProperties">;
  }
): Promise<MqttActionResponse> {
  try {
    // Validate user properties
    if (!userProperties || Object.keys(userProperties).length === 0) {
      return {
        success: false,
        error: "User properties are required and cannot be empty",
      };
    }

    // Build the publish options with user properties
    const publishOptions: MqttPublishOptions = {
      ...options,
      properties: {
        ...options?.properties,
        userProperties,
      },
    };

    // Use the main publish function with enhanced properties
    const result = await publishMqttMessage(topic, payload, publishOptions);

    if (result.success) {
      console.log("MQTT message with user properties published successfully:", {
        topic,
        userPropertiesKeys: Object.keys(userProperties),
        timestamp: new Date().toISOString(),
      });
    }

    return result;
  } catch (error) {
    // Use comprehensive error handler for user properties message publishing errors
    const errorHandler = getMqttErrorHandler();
    const publishError =
      error instanceof Error ? error : new Error("Unknown error occurred while publishing message with properties");

    errorHandler.handlePublishingError(publishError, {
      topic,
      payloadSize: typeof payload === "string" ? payload.length : JSON.stringify(payload).length,
      qos: options?.qos || 0,
      retain: options?.retain || false,
      hasProperties: true, // Messages with user properties always have properties
      clientConnected: false, // Server-side publishing
    });

    return {
      success: false,
      error: publishError.message,
    };
  }
}
