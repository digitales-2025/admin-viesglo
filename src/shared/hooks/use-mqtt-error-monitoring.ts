/**
 * MQTT Error Monitoring Hook
 * Provides React components with access to MQTT error information and monitoring data
 */

import { useCallback, useEffect, useState } from "react";

import {
  getMqttErrorHandler,
  getMqttErrorTrends,
  getMqttHealthStatus,
  type MqttErrorCategory,
  type MqttErrorInfo,
  type MqttErrorSeverity,
} from "../utils/mqtt-error-handler";

/**
 * Hook return type for MQTT error monitoring
 */
export interface UseMqttErrorMonitoringReturn {
  // Current error statistics
  totalErrors: number;
  errorsByCategory: Record<MqttErrorCategory, number>;
  errorsBySeverity: Record<MqttErrorSeverity, number>;
  recentErrors: MqttErrorInfo[];

  // Health and trends
  healthStatus: ReturnType<typeof getMqttHealthStatus>;
  errorTrends: ReturnType<typeof getMqttErrorTrends>;

  // Actions
  clearErrorHistory: () => void;
  refreshStats: () => void;

  // Utilities
  hasRecentErrors: boolean;
  hasCriticalErrors: boolean;
  isHealthy: boolean;
}

/**
 * Options for the MQTT error monitoring hook
 */
export interface UseMqttErrorMonitoringOptions {
  /**
   * How often to refresh error statistics (in milliseconds)
   * Default: 30000 (30 seconds)
   */
  refreshInterval?: number;

  /**
   * Time window for trend analysis (in milliseconds)
   * Default: 3600000 (1 hour)
   */
  trendWindow?: number;

  /**
   * Whether to automatically refresh statistics
   * Default: true
   */
  autoRefresh?: boolean;
}

/**
 * Custom hook for monitoring MQTT errors and system health
 * Provides real-time access to error statistics and trends
 */
export function useMqttErrorMonitoring(options: UseMqttErrorMonitoringOptions = {}): UseMqttErrorMonitoringReturn {
  const {
    refreshInterval = 30000, // 30 seconds
    trendWindow = 3600000, // 1 hour
    autoRefresh = true,
  } = options;

  // State for error statistics
  const [errorStats, setErrorStats] = useState(() => {
    const errorHandler = getMqttErrorHandler();
    return errorHandler.getErrorStatistics();
  });

  // State for health status
  const [healthStatus, setHealthStatus] = useState(() => getMqttHealthStatus());

  // State for error trends
  const [errorTrends, setErrorTrends] = useState(() => getMqttErrorTrends(trendWindow));

  /**
   * Refreshes all error monitoring data
   */
  const refreshStats = useCallback(() => {
    const errorHandler = getMqttErrorHandler();
    const newStats = errorHandler.getErrorStatistics();
    const newHealthStatus = getMqttHealthStatus();
    const newTrends = getMqttErrorTrends(trendWindow);

    setErrorStats(newStats);
    setHealthStatus(newHealthStatus);
    setErrorTrends(newTrends);
  }, [trendWindow]);

  /**
   * Clears the error history
   */
  const clearErrorHistory = useCallback(() => {
    const errorHandler = getMqttErrorHandler();
    errorHandler.clearErrorHistory();
    refreshStats();
  }, [refreshStats]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(refreshStats, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshStats]);

  // Initial refresh on mount
  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  // Computed values
  const hasRecentErrors = errorStats.recentErrors.length > 0;
  const hasCriticalErrors = errorTrends.criticalErrors > 0;
  const isHealthy = healthStatus.status === "healthy";

  return {
    // Statistics
    totalErrors: errorStats.totalErrors,
    errorsByCategory: errorStats.errorsByCategory,
    errorsBySeverity: errorStats.errorsBySeverity,
    recentErrors: errorStats.recentErrors,

    // Health and trends
    healthStatus,
    errorTrends,

    // Actions
    clearErrorHistory,
    refreshStats,

    // Computed values
    hasRecentErrors,
    hasCriticalErrors,
    isHealthy,
  };
}

/**
 * Hook for subscribing to specific error categories
 * Useful for components that only care about certain types of errors
 */
export function useMqttErrorsByCategory(
  categories: MqttErrorCategory[],
  options: Pick<UseMqttErrorMonitoringOptions, "refreshInterval" | "autoRefresh"> = {}
): {
  errors: MqttErrorInfo[];
  count: number;
  hasErrors: boolean;
  refreshErrors: () => void;
} {
  const { recentErrors, refreshStats } = useMqttErrorMonitoring(options);

  const filteredErrors = recentErrors.filter((error) => categories.includes(error.category));

  return {
    errors: filteredErrors,
    count: filteredErrors.length,
    hasErrors: filteredErrors.length > 0,
    refreshErrors: refreshStats,
  };
}

/**
 * Hook for subscribing to errors by severity level
 * Useful for components that need to show only critical or high-severity errors
 */
export function useMqttErrorsBySeverity(
  severities: MqttErrorSeverity[],
  options: Pick<UseMqttErrorMonitoringOptions, "refreshInterval" | "autoRefresh"> = {}
): {
  errors: MqttErrorInfo[];
  count: number;
  hasErrors: boolean;
  refreshErrors: () => void;
} {
  const { recentErrors, refreshStats } = useMqttErrorMonitoring(options);

  const filteredErrors = recentErrors.filter((error) => severities.includes(error.severity));

  return {
    errors: filteredErrors,
    count: filteredErrors.length,
    hasErrors: filteredErrors.length > 0,
    refreshErrors: refreshStats,
  };
}

/**
 * Hook for getting a simple health indicator
 * Returns a boolean indicating if the MQTT system is healthy
 */
export function useMqttHealthIndicator(
  options: Pick<UseMqttErrorMonitoringOptions, "refreshInterval" | "autoRefresh"> = {}
): {
  isHealthy: boolean;
  status: "healthy" | "warning" | "critical";
  message: string;
  recommendations: string[];
} {
  const { healthStatus } = useMqttErrorMonitoring(options);

  return {
    isHealthy: healthStatus.status === "healthy",
    status: healthStatus.status,
    message: healthStatus.message,
    recommendations: healthStatus.recommendations,
  };
}
