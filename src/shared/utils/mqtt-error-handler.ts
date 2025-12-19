/**
 * MQTT Error Handler and Logging System
 * Implements comprehensive error categorization and logging as per requirements 6.1-6.5
 */

/**
 * Error categories for MQTT operations
 */
export enum MqttErrorCategory {
  CONNECTION = "CONNECTION",
  AUTHENTICATION = "AUTHENTICATION",
  NETWORK = "NETWORK",
  MESSAGE_PROCESSING = "MESSAGE_PROCESSING",
  SUBSCRIPTION = "SUBSCRIPTION",
  PUBLISHING = "PUBLISHING",
  VALIDATION = "VALIDATION",
  UNKNOWN = "UNKNOWN",
}

/**
 * Error severity levels
 */
export enum MqttErrorSeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

/**
 * Structured error information for logging
 */
export interface MqttErrorInfo {
  category: MqttErrorCategory;
  severity: MqttErrorSeverity;
  message: string;
  originalError?: Error | string;
  context?: Record<string, unknown>;
  timestamp: Date;
  shouldRetry: boolean;
  retryDelay?: number;
}

/**
 * Connection error details
 */
export interface ConnectionErrorDetails {
  brokerUrl?: string;
  clientId?: string;
  username?: string;
  protocolVersion?: number;
  attemptNumber?: number;
  lastSuccessfulConnection?: Date;
}

/**
 * Message processing error details
 */
export interface MessageErrorDetails {
  topic: string;
  payloadSize: number;
  payloadPreview: string;
  qos: 0 | 1 | 2;
  retain: boolean;
  hasProperties: boolean;
}

/**
 * Subscription error details
 */
export interface SubscriptionErrorDetails {
  topic: string;
  qos: 0 | 1 | 2;
  operation: "subscribe" | "unsubscribe";
  clientConnected: boolean;
}

/**
 * Publishing error details
 */
export interface PublishingErrorDetails {
  topic: string;
  payloadSize: number;
  qos: 0 | 1 | 2;
  retain: boolean;
  hasProperties: boolean;
  clientConnected: boolean;
}

/**
 * MQTT Error Handler Class
 * Centralizes error categorization, logging, and response strategies
 */
export class MqttErrorHandler {
  private static instance: MqttErrorHandler;
  private errorHistory: MqttErrorInfo[] = [];
  private readonly maxHistorySize = 100;

  private constructor() {}

  /**
   * Get singleton instance of error handler
   */
  public static getInstance(): MqttErrorHandler {
    if (!MqttErrorHandler.instance) {
      MqttErrorHandler.instance = new MqttErrorHandler();
    }
    return MqttErrorHandler.instance;
  }

  /**
   * Categorizes error based on error message and context
   * Requirement 6.1: Error categorization system
   */
  private categorizeError(error: Error | string, context?: Record<string, unknown>): MqttErrorCategory {
    const errorMessage = (error instanceof Error ? error.message : error).toLowerCase();
    const errorCode = (error as { code?: string } | undefined)?.code?.toLowerCase();

    // Authentication/Authorization errors
    if (this.isAuthenticationError(errorMessage, errorCode)) {
      return MqttErrorCategory.AUTHENTICATION;
    }

    // Network connectivity errors
    if (this.isNetworkError(errorMessage, errorCode)) {
      return MqttErrorCategory.NETWORK;
    }

    // Connection-specific errors
    if (this.isConnectionError(errorMessage, context)) {
      return MqttErrorCategory.CONNECTION;
    }

    // Message processing errors
    if (this.isMessageProcessingError(errorMessage, context)) {
      return MqttErrorCategory.MESSAGE_PROCESSING;
    }

    // Subscription errors
    if (this.isSubscriptionError(errorMessage, context)) {
      return MqttErrorCategory.SUBSCRIPTION;
    }

    // Publishing errors
    if (this.isPublishingError(errorMessage, context)) {
      return MqttErrorCategory.PUBLISHING;
    }

    // Validation errors
    if (this.isValidationError(errorMessage, context)) {
      return MqttErrorCategory.VALIDATION;
    }

    return MqttErrorCategory.UNKNOWN;
  }

  /**
   * Determines error severity based on category and context
   */
  private determineSeverity(category: MqttErrorCategory, context?: Record<string, unknown>): MqttErrorSeverity {
    switch (category) {
      case MqttErrorCategory.AUTHENTICATION:
        return MqttErrorSeverity.HIGH;

      case MqttErrorCategory.CONNECTION:
        // Critical if it's the initial connection, medium if it's a reconnection
        return context?.isInitialConnection ? MqttErrorSeverity.CRITICAL : MqttErrorSeverity.MEDIUM;

      case MqttErrorCategory.NETWORK:
        return MqttErrorSeverity.MEDIUM;

      case MqttErrorCategory.MESSAGE_PROCESSING:
        return MqttErrorSeverity.LOW;

      case MqttErrorCategory.SUBSCRIPTION:
      case MqttErrorCategory.PUBLISHING:
        return MqttErrorSeverity.MEDIUM;

      case MqttErrorCategory.VALIDATION:
        return MqttErrorSeverity.LOW;

      default:
        return MqttErrorSeverity.MEDIUM;
    }
  }

  /**
   * Determines if error should trigger a retry
   */
  private shouldRetry(category: MqttErrorCategory, attemptNumber?: number): boolean {
    const maxAttempts = 10;
    const currentAttempts = attemptNumber || 0;

    switch (category) {
      case MqttErrorCategory.AUTHENTICATION:
        return false; // Don't retry auth errors - need new credentials

      case MqttErrorCategory.CONNECTION:
      case MqttErrorCategory.NETWORK:
        return currentAttempts < maxAttempts;

      case MqttErrorCategory.SUBSCRIPTION:
      case MqttErrorCategory.PUBLISHING:
        return currentAttempts < 3; // Fewer retries for operation errors

      case MqttErrorCategory.MESSAGE_PROCESSING:
      case MqttErrorCategory.VALIDATION:
        return false; // Don't retry processing/validation errors

      default:
        return currentAttempts < 3;
    }
  }

  /**
   * Calculates retry delay based on error category and attempt number
   */
  private calculateRetryDelay(category: MqttErrorCategory, attemptNumber: number = 0): number {
    const baseDelay = 1000; // 1 second
    const maxDelay = 30000; // 30 seconds

    switch (category) {
      case MqttErrorCategory.CONNECTION:
      case MqttErrorCategory.NETWORK:
        // Exponential backoff for connection/network errors
        return Math.min(baseDelay * Math.pow(2, attemptNumber), maxDelay);

      case MqttErrorCategory.SUBSCRIPTION:
      case MqttErrorCategory.PUBLISHING:
        // Linear backoff for operation errors
        return Math.min(baseDelay + attemptNumber * 1000, 5000);

      default:
        return baseDelay;
    }
  }

  /**
   * Handles connection errors with detailed logging
   * Requirement 6.1, 6.2: Connection error handling with detailed logging
   */
  public handleConnectionError(
    error: Error | string,
    details: ConnectionErrorDetails,
    attemptNumber: number = 0
  ): MqttErrorInfo {
    const category = this.categorizeError(error, { ...details, isConnection: true });
    const severity = this.determineSeverity(category, {
      ...details,
      isInitialConnection: attemptNumber === 0,
    });

    const errorInfo: MqttErrorInfo = {
      category,
      severity,
      message: error instanceof Error ? error.message : error,
      originalError: error,
      context: {
        ...details,
        attemptNumber,
        errorCode: (error as { code?: string } | undefined)?.code,
        errorType: "connection",
      },
      timestamp: new Date(),
      shouldRetry: this.shouldRetry(category, attemptNumber),
      retryDelay: this.shouldRetry(category, attemptNumber)
        ? this.calculateRetryDelay(category, attemptNumber)
        : undefined,
    };

    this.logError(errorInfo);
    this.addToHistory(errorInfo);

    return errorInfo;
  }

  /**
   * Handles message processing errors with detailed logging
   * Requirement 6.4: Message processing error handling
   */
  public handleMessageProcessingError(error: Error | string, details: MessageErrorDetails): MqttErrorInfo {
    const category = MqttErrorCategory.MESSAGE_PROCESSING;
    const severity = this.determineSeverity(category);

    const errorInfo: MqttErrorInfo = {
      category,
      severity,
      message: error instanceof Error ? error.message : error,
      originalError: error,
      context: {
        ...details,
        errorType: "message_processing",
      },
      timestamp: new Date(),
      shouldRetry: false, // Don't retry message processing errors
    };

    this.logError(errorInfo);
    this.addToHistory(errorInfo);

    return errorInfo;
  }

  /**
   * Handles subscription errors with detailed logging
   * Requirement 6.1: Subscription error handling
   */
  public handleSubscriptionError(error: Error | string, details: SubscriptionErrorDetails): MqttErrorInfo {
    const category = MqttErrorCategory.SUBSCRIPTION;
    const severity = this.determineSeverity(category);

    const errorInfo: MqttErrorInfo = {
      category,
      severity,
      message: error instanceof Error ? error.message : error,
      originalError: error,
      context: {
        ...details,
        errorType: "subscription",
      },
      timestamp: new Date(),
      shouldRetry: this.shouldRetry(category),
      retryDelay: this.shouldRetry(category) ? this.calculateRetryDelay(category) : undefined,
    };

    this.logError(errorInfo);
    this.addToHistory(errorInfo);

    return errorInfo;
  }

  /**
   * Handles publishing errors with detailed logging
   * Requirement 6.3: Publishing error handling
   */
  public handlePublishingError(error: Error | string, details: PublishingErrorDetails): MqttErrorInfo {
    const category = MqttErrorCategory.PUBLISHING;
    const severity = this.determineSeverity(category);

    const errorInfo: MqttErrorInfo = {
      category,
      severity,
      message: error instanceof Error ? error.message : error,
      originalError: error,
      context: {
        ...details,
        errorType: "publishing",
      },
      timestamp: new Date(),
      shouldRetry: this.shouldRetry(category),
      retryDelay: this.shouldRetry(category) ? this.calculateRetryDelay(category) : undefined,
    };

    this.logError(errorInfo);
    this.addToHistory(errorInfo);

    return errorInfo;
  }

  /**
   * Logs successful reconnection events
   * Requirement 6.5: Reconnection success logging
   */
  public logReconnectionSuccess(details: {
    attemptNumber: number;
    totalDowntime: number;
    brokerUrl?: string;
    clientId?: string;
  }): void {
    const logData = {
      event: "reconnection_success",
      message: `MQTT client reconnected successfully after ${details.attemptNumber} attempts`,
      details: {
        ...details,
        downtimeMs: details.totalDowntime,
        downtimeFormatted: this.formatDuration(details.totalDowntime),
      },
      timestamp: new Date().toISOString(),
      severity: "INFO",
    };

    // Also log to any external monitoring systems if configured
    this.logToExternalSystems("reconnection_success", logData);
  }

  /**
   * Logs successful connection events
   */
  public logConnectionSuccess(details: {
    brokerUrl?: string;
    clientId?: string;
    protocolVersion?: number;
    sessionPresent?: boolean;
  }): void {
    const logData = {
      event: "connection_success",
      message: "MQTT client connected successfully",
      details,
      timestamp: new Date().toISOString(),
      severity: "INFO",
    };

    this.logToExternalSystems("connection_success", logData);
  }

  /**
   * Logs successful disconnection events
   */
  public logDisconnectionSuccess(details: { clientId?: string; reason?: string; wasClean?: boolean }): void {
    const logData = {
      event: "disconnection_success",
      message: "MQTT client disconnected successfully",
      details,
      timestamp: new Date().toISOString(),
      severity: "INFO",
    };

    this.logToExternalSystems("disconnection", logData);
  }

  /**
   * Gets error statistics for monitoring
   */
  public getErrorStatistics(): {
    totalErrors: number;
    errorsByCategory: Record<MqttErrorCategory, number>;
    errorsBySeverity: Record<MqttErrorSeverity, number>;
    recentErrors: MqttErrorInfo[];
  } {
    const errorsByCategory = {} as Record<MqttErrorCategory, number>;
    const errorsBySeverity = {} as Record<MqttErrorSeverity, number>;

    // Initialize counters
    Object.values(MqttErrorCategory).forEach((category) => {
      errorsByCategory[category] = 0;
    });
    Object.values(MqttErrorSeverity).forEach((severity) => {
      errorsBySeverity[severity] = 0;
    });

    // Count errors
    this.errorHistory.forEach((error) => {
      errorsByCategory[error.category]++;
      errorsBySeverity[error.severity]++;
    });

    return {
      totalErrors: this.errorHistory.length,
      errorsByCategory,
      errorsBySeverity,
      recentErrors: this.errorHistory.slice(-10), // Last 10 errors
    };
  }

  /**
   * Clears error history (useful for testing or memory management)
   */
  public clearErrorHistory(): void {
    this.errorHistory = [];
  }

  // Private helper methods

  private isAuthenticationError(message: string, _code?: string): boolean {
    const authPatterns = [
      "unauthorized",
      "authentication failed",
      "bad user name or password",
      "not authorized",
      "token expired",
      "invalid credentials",
      "access denied",
      "forbidden",
    ];
    return authPatterns.some((pattern) => message.includes(pattern));
  }

  private isNetworkError(message: string, code?: string): boolean {
    const networkPatterns = [
      "network error",
      "connection refused",
      "connection timeout",
      "connection failed",
      "server unavailable",
      "dns lookup failed",
      "socket hang up",
    ];
    const networkCodes = ["enotfound", "econnrefused", "econnreset", "etimedout", "enetunreach"];

    return Boolean(
      networkPatterns.some((pattern) => message.includes(pattern)) || (code && networkCodes.includes(code))
    );
  }

  private isConnectionError(message: string, context?: Record<string, unknown>): boolean {
    const connectionPatterns = ["connection error", "connect failed", "broker unavailable", "handshake failed"];
    return connectionPatterns.some((pattern) => message.includes(pattern)) || context?.isConnection === true;
  }

  private isMessageProcessingError(message: string, context?: Record<string, unknown>): boolean {
    const messagePatterns = [
      "message processing",
      "invalid json",
      "parse error",
      "malformed message",
      "invalid payload",
    ];
    return messagePatterns.some((pattern) => message.includes(pattern)) || context?.errorType === "message_processing";
  }

  private isSubscriptionError(message: string, context?: Record<string, unknown>): boolean {
    const subscriptionPatterns = ["subscribe failed", "subscription error", "topic not allowed"];
    return subscriptionPatterns.some((pattern) => message.includes(pattern)) || context?.errorType === "subscription";
  }

  private isPublishingError(message: string, context?: Record<string, unknown>): boolean {
    const publishingPatterns = ["publish failed", "publishing error", "message not sent"];
    return publishingPatterns.some((pattern) => message.includes(pattern)) || context?.errorType === "publishing";
  }

  private isValidationError(message: string, context?: Record<string, unknown>): boolean {
    const validationPatterns = ["validation error", "invalid topic", "invalid qos", "invalid parameter"];
    return validationPatterns.some((pattern) => message.includes(pattern)) || context?.errorType === "validation";
  }

  private logError(errorInfo: MqttErrorInfo): void {
    this.getLogLevel(errorInfo.severity);
    const logData = {
      category: errorInfo.category,
      severity: errorInfo.severity,
      message: errorInfo.message,
      context: this.sanitizeContext(errorInfo.context),
      timestamp: errorInfo.timestamp.toISOString(),
      shouldRetry: errorInfo.shouldRetry,
      retryDelay: errorInfo.retryDelay,
    };

    // Log to external systems if configured
    this.logToExternalSystems("error", logData);
  }

  private getLogLevel(severity: MqttErrorSeverity): "error" | "warn" | "info" {
    switch (severity) {
      case MqttErrorSeverity.CRITICAL:
      case MqttErrorSeverity.HIGH:
        return "error";
      case MqttErrorSeverity.MEDIUM:
        return "warn";
      default:
        return "info";
    }
  }

  private sanitizeContext(context?: Record<string, unknown>): Record<string, unknown> {
    if (!context) return {};

    const sanitized: Record<string, unknown> = { ...context };

    // Remove sensitive information
    const sensitiveKeys = ["password", "token", "credentials", "auth"];
    sensitiveKeys.forEach((key) => {
      if (sanitized[key]) {
        sanitized[key] = "[REDACTED]";
      }
    });

    // Truncate long payloads
    const payloadPreview = sanitized.payloadPreview as unknown;
    if (typeof payloadPreview === "string" && payloadPreview.length > 200) {
      sanitized.payloadPreview = payloadPreview.substring(0, 200) + "...[truncated]";
    }

    return sanitized;
  }

  private addToHistory(errorInfo: MqttErrorInfo): void {
    this.errorHistory.push(errorInfo);

    // Keep history size manageable
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory = this.errorHistory.slice(-this.maxHistorySize);
    }
  }

  private formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
    return `${(ms / 3600000).toFixed(1)}h`;
  }

  private logToExternalSystems(_eventType: string, _data: unknown): void {
    // Placeholder for external logging systems integration
    // This could be extended to send logs to services like:
    // - Sentry for error tracking
    // - DataDog for monitoring
    // - Custom analytics endpoints
    // - etc.

    if (process.env.NODE_ENV === "development") {
      // In development, we might want to store logs differently
      // or send them to development-specific endpoints
    }
  }
}

/**
 * Convenience function to get the singleton error handler instance
 */
export const getMqttErrorHandler = () => MqttErrorHandler.getInstance();
/**

 * MQTT Error Monitoring Utilities
 * Provides functions for monitoring and analyzing MQTT errors
 */

/**
 * Gets error trends over time for monitoring dashboards
 */
export function getMqttErrorTrends(timeWindowMs: number = 3600000): {
  errorRate: number;
  criticalErrors: number;
  mostCommonCategory: MqttErrorCategory;
  errorsByHour: Array<{ hour: string; count: number }>;
} {
  const errorHandler = getMqttErrorHandler();
  const stats = errorHandler.getErrorStatistics();
  const now = Date.now();
  const windowStart = now - timeWindowMs;

  // Filter errors within time window
  const recentErrors = stats.recentErrors.filter((error) => error.timestamp.getTime() >= windowStart);

  // Calculate error rate (errors per hour)
  const hoursInWindow = timeWindowMs / 3600000;
  const errorRate = recentErrors.length / hoursInWindow;

  // Count critical errors
  const criticalErrors = recentErrors.filter((error) => error.severity === MqttErrorSeverity.CRITICAL).length;

  // Find most common category
  const categoryCounts = {} as Record<MqttErrorCategory, number>;
  Object.values(MqttErrorCategory).forEach((category) => {
    categoryCounts[category] = 0;
  });

  recentErrors.forEach((error) => {
    categoryCounts[error.category]++;
  });

  const mostCommonCategory = Object.entries(categoryCounts).reduce(
    (max, [category, count]) => (count > max.count ? { category: category as MqttErrorCategory, count } : max),
    { category: MqttErrorCategory.UNKNOWN, count: 0 }
  ).category;

  // Group errors by hour
  const errorsByHour: Array<{ hour: string; count: number }> = [];
  const hourlyBuckets = {} as Record<string, number>;

  recentErrors.forEach((error) => {
    const hour = new Date(error.timestamp).toISOString().substring(0, 13) + ":00:00.000Z";
    hourlyBuckets[hour] = (hourlyBuckets[hour] || 0) + 1;
  });

  Object.entries(hourlyBuckets).forEach(([hour, count]) => {
    errorsByHour.push({ hour, count });
  });

  return {
    errorRate,
    criticalErrors,
    mostCommonCategory,
    errorsByHour: errorsByHour.sort((a, b) => a.hour.localeCompare(b.hour)),
  };
}

/**
 * Checks if the MQTT system is in a healthy state based on recent errors
 */
export function getMqttHealthStatus(): {
  status: "healthy" | "warning" | "critical";
  message: string;
  recommendations: string[];
} {
  const trends = getMqttErrorTrends();
  const recommendations: string[] = [];

  // Critical status conditions
  if (trends.criticalErrors > 0) {
    return {
      status: "critical",
      message: `${trends.criticalErrors} critical errors detected in the last hour`,
      recommendations: [
        "Check MQTT broker connectivity",
        "Verify authentication credentials",
        "Review network connectivity",
        "Check application logs for detailed error information",
      ],
    };
  }

  // Warning status conditions
  if (trends.errorRate > 10) {
    // More than 10 errors per hour
    recommendations.push("High error rate detected - investigate common error patterns");
  }

  if (trends.mostCommonCategory === MqttErrorCategory.AUTHENTICATION) {
    recommendations.push("Authentication errors detected - check credential expiration");
  }

  if (trends.mostCommonCategory === MqttErrorCategory.NETWORK) {
    recommendations.push("Network errors detected - check connectivity and broker availability");
  }

  if (recommendations.length > 0) {
    return {
      status: "warning",
      message: `MQTT system showing warning signs: ${trends.errorRate.toFixed(1)} errors/hour`,
      recommendations,
    };
  }

  return {
    status: "healthy",
    message: "MQTT system is operating normally",
    recommendations: [],
  };
}

/**
 * Exports error data for external monitoring systems
 */
export function exportMqttErrorData(format: "json" | "csv" = "json"): string {
  const errorHandler = getMqttErrorHandler();
  const stats = errorHandler.getErrorStatistics();

  if (format === "csv") {
    const headers = ["timestamp", "category", "severity", "message", "shouldRetry"];
    const rows = stats.recentErrors.map((error) => [
      error.timestamp.toISOString(),
      error.category,
      error.severity,
      error.message.replace(/"/g, '""'), // Escape quotes for CSV
      error.shouldRetry.toString(),
    ]);

    return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  }

  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      statistics: stats,
      trends: getMqttErrorTrends(),
      healthStatus: getMqttHealthStatus(),
    },
    null,
    2
  );
}
