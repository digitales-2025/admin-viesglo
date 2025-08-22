/**
 * MQTT Error Monitor Component
 * Displays MQTT error information and system health status
 * Demonstrates the comprehensive error handling and logging system
 */

"use client";

import {
  useMqttErrorMonitoring,
  useMqttErrorsBySeverity,
  useMqttHealthIndicator,
} from "../../hooks/use-mqtt-error-monitoring";
import { exportMqttErrorData, MqttErrorCategory, MqttErrorSeverity } from "../../utils/mqtt-error-handler";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

/**
 * Props for the MQTT Error Monitor component
 */
interface MqttErrorMonitorProps {
  /**
   * Whether to show detailed error information
   * Default: false
   */
  showDetails?: boolean;

  /**
   * Whether to show the export functionality
   * Default: true
   */
  showExport?: boolean;

  /**
   * Whether to auto-refresh error data
   * Default: true
   */
  autoRefresh?: boolean;

  /**
   * Refresh interval in milliseconds
   * Default: 30000 (30 seconds)
   */
  refreshInterval?: number;
}

/**
 * MQTT Error Monitor Component
 * Provides a comprehensive view of MQTT system health and errors
 */
export function MqttErrorMonitor({
  showDetails = false,
  showExport = true,
  autoRefresh = true,
  refreshInterval = 30000,
}: MqttErrorMonitorProps) {
  const {
    totalErrors,
    errorsByCategory,
    // errorsBySeverity, // Variable no utilizada - comentada
    recentErrors,
    healthStatus,
    errorTrends,
    clearErrorHistory,
    refreshStats,
    hasRecentErrors,
    // hasCriticalErrors, // Variable no utilizada - comentada
    // isHealthy // Variable no utilizada - comentada
  } = useMqttErrorMonitoring({
    autoRefresh,
    refreshInterval,
  });

  /**
   * Handles exporting error data
   */
  const handleExportErrors = (format: "json" | "csv") => {
    const data = exportMqttErrorData(format);
    const blob = new Blob([data], {
      type: format === "json" ? "application/json" : "text/csv",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mqtt-errors-${new Date().toISOString().split("T")[0]}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /**
   * Gets the appropriate color for error severity
   */
  const getSeverityColor = (severity: MqttErrorSeverity) => {
    switch (severity) {
      case MqttErrorSeverity.CRITICAL:
        return "destructive" as const;
      case MqttErrorSeverity.HIGH:
        return "destructive" as const;
      case MqttErrorSeverity.MEDIUM:
        return "secondary" as const;
      case MqttErrorSeverity.LOW:
        return "outline" as const;
      default:
        return "outline" as const;
    }
  };

  /**
   * Gets the appropriate color for error category
   */
  const getCategoryColor = (category: MqttErrorCategory) => {
    switch (category) {
      case MqttErrorCategory.AUTHENTICATION:
        return "destructive" as const;
      case MqttErrorCategory.CONNECTION:
        return "secondary" as const;
      case MqttErrorCategory.NETWORK:
        return "secondary" as const;
      case MqttErrorCategory.MESSAGE_PROCESSING:
        return "outline" as const;
      case MqttErrorCategory.SUBSCRIPTION:
      case MqttErrorCategory.PUBLISHING:
        return "default" as const;
      default:
        return "outline" as const;
    }
  };

  /**
   * Formats duration for display
   */
  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
    return `${(ms / 3600000).toFixed(1)}h`;
  };

  return (
    <div className="space-y-6">
      {/* Health Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>MQTT System Health</span>
            <Badge
              variant={
                healthStatus.status === "healthy"
                  ? "default"
                  : healthStatus.status === "warning"
                    ? "secondary"
                    : "destructive"
              }
            >
              {healthStatus.status.toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{healthStatus.message}</p>

          {healthStatus.recommendations.length > 0 && (
            <Alert>
              <AlertDescription>
                <strong>Recommendations:</strong>
                <ul className="mt-2 list-disc list-inside space-y-1">
                  {healthStatus.recommendations.map((rec, index) => (
                    <li key={`rec-${index}-${rec.slice(0, 10)}`} className="text-sm">
                      {rec}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Error Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalErrors}</div>
            <p className="text-xs text-muted-foreground">{errorTrends.errorRate.toFixed(1)} errors/hour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Critical Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{errorTrends.criticalErrors}</div>
            <p className="text-xs text-muted-foreground">Last hour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Most Common</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={getCategoryColor(errorTrends.mostCommonCategory)}>{errorTrends.mostCommonCategory}</Badge>
            <p className="text-xs text-muted-foreground mt-1">Error category</p>
          </CardContent>
        </Card>
      </div>

      {/* Error Categories */}
      {hasRecentErrors && (
        <Card>
          <CardHeader>
            <CardTitle>Error Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(errorsByCategory).map(
                ([category, count]) =>
                  count > 0 && (
                    <div key={category} className="text-center">
                      <div className="text-lg font-semibold">{count}</div>
                      <Badge variant={getCategoryColor(category as MqttErrorCategory)} className="text-xs">
                        {category}
                      </Badge>
                    </div>
                  )
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Errors */}
      {showDetails && hasRecentErrors && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Errors</span>
              <div className="space-x-2">
                <Button variant="outline" size="sm" onClick={refreshStats}>
                  Refresh
                </Button>
                <Button variant="outline" size="sm" onClick={clearErrorHistory}>
                  Clear History
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentErrors.slice(0, 10).map((error, index) => {
                const ctx = (error.context || {}) as Partial<{
                  topic: string;
                  payloadSize: number;
                  qos: 0 | 1 | 2;
                }>;
                return (
                  <div key={`error-${error.timestamp.getTime()}-${index}`} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant={getCategoryColor(error.category)}>{error.category}</Badge>
                        <Badge variant={getSeverityColor(error.severity)}>{error.severity}</Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">{error.timestamp.toLocaleString()}</span>
                    </div>

                    <p className="text-sm font-medium mb-2">{error.message}</p>

                    <div className="text-xs text-muted-foreground space-y-1">
                      {typeof ctx.topic === "string" && ctx.topic.length > 0 && <div>Topic: {ctx.topic}</div>}
                      {typeof ctx.payloadSize === "number" && <div>Payload Size: {ctx.payloadSize} bytes</div>}
                      {typeof ctx.qos === "number" && <div>QoS: {ctx.qos}</div>}
                      {error.shouldRetry && typeof error.retryDelay === "number" && (
                        <div>Retry in: {formatDuration(error.retryDelay)}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export Controls */}
      {showExport && hasRecentErrors && (
        <Card>
          <CardHeader>
            <CardTitle>Export Error Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => handleExportErrors("json")}>
                Export JSON
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExportErrors("csv")}>
                Export CSV
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Export error data for external analysis or monitoring systems
            </p>
          </CardContent>
        </Card>
      )}

      {/* No Errors State */}
      {!hasRecentErrors && (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-green-600 text-4xl mb-4">✅</div>
            <h3 className="text-lg font-semibold mb-2">No Recent Errors</h3>
            <p className="text-muted-foreground">
              MQTT system is operating normally with no errors in the recent history.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * Simplified Health Indicator Component
 * Shows just the health status without detailed error information
 */
export function MqttHealthIndicator() {
  const {
    // isHealthy, // Variable no utilizada - comentada
    status,
    // message // Variable no utilizada - comentada
  } = useMqttHealthIndicator();

  return (
    <div className="flex items-center space-x-2">
      <div
        className={`w-3 h-3 rounded-full ${
          status === "healthy" ? "bg-green-500" : status === "warning" ? "bg-yellow-500" : "bg-red-500"
        }`}
      />
      <span className="text-sm font-medium">MQTT: {status.charAt(0).toUpperCase() + status.slice(1)}</span>
    </div>
  );
}

/**
 * Critical Errors Alert Component
 * Shows an alert when critical MQTT errors are detected
 */
export function MqttCriticalErrorsAlert() {
  const { errors, hasErrors } = useMqttErrorsBySeverity([MqttErrorSeverity.CRITICAL]);

  if (!hasErrors) return null;

  return (
    <Alert variant="destructive">
      <AlertDescription>
        <strong>Critical MQTT Errors Detected!</strong>
        <br />
        {errors.length} critical error{errors.length > 1 ? "s" : ""} detected. Please check the MQTT connection and
        broker status.
      </AlertDescription>
    </Alert>
  );
}
