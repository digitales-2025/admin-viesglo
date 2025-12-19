/**
 * MQTT Session Status Indicator Component
 * Displays the current state of MQTT session lifecycle management
 * Useful for debugging and monitoring session integration
 */

"use client";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { useMqttSession } from "./MqttSessionProvider";

interface MqttSessionStatusIndicatorProps {
  /**
   * Whether to show detailed debugging information
   * @default false
   */
  showDebugInfo?: boolean;

  /**
   * Whether to show manual controls for testing
   * @default false
   */
  showControls?: boolean;
}

/**
 * Component that displays MQTT session status and provides debugging information
 * Useful for development and testing of session lifecycle management
 */
export function MqttSessionStatusIndicator({
  showDebugInfo = false,
  showControls = false,
}: MqttSessionStatusIndicatorProps) {
  const { isAuthenticated, isAuthError, tokenExpired, mqttStatus, isMqttReady, reconnectAfterTokenRefresh } =
    useMqttSession();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "bg-green-500";
      case "connecting":
      case "reconnecting":
        return "bg-yellow-500";
      case "disconnected":
        return "bg-gray-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "connected":
        return "default" as const;
      case "connecting":
      case "reconnecting":
        return "secondary" as const;
      case "disconnected":
        return "outline" as const;
      case "error":
        return "destructive" as const;
      default:
        return "outline" as const;
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${getStatusColor(mqttStatus)}`} />
          MQTT Session Status
        </CardTitle>
        <CardDescription>Real-time connection and authentication status</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main Status Indicators */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <p className="text-sm font-medium">Authentication</p>
            <Badge variant={isAuthenticated ? "default" : "destructive"}>
              {isAuthenticated ? "Authenticated" : "Not Authenticated"}
            </Badge>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium">MQTT Status</p>
            <Badge variant={getStatusVariant(mqttStatus)}>
              {mqttStatus.charAt(0).toUpperCase() + mqttStatus.slice(1)}
            </Badge>
          </div>
        </div>

        {/* Overall Status */}
        <div className="space-y-1">
          <p className="text-sm font-medium">Overall Status</p>
          <Badge variant={isMqttReady ? "default" : "secondary"}>
            {isMqttReady ? "Ready for Real-time Data" : "Not Ready"}
          </Badge>
        </div>

        {/* Error States */}
        {(isAuthError || tokenExpired) && (
          <div className="space-y-2 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">Issues Detected:</p>
            {isAuthError && (
              <Badge variant="destructive" className="mr-2">
                Auth Error
              </Badge>
            )}
            {tokenExpired && <Badge variant="destructive">Token Expired</Badge>}
          </div>
        )}

        {/* Debug Information */}
        {showDebugInfo && (
          <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p className="text-sm font-medium">Debug Info:</p>
            <div className="text-xs space-y-1 font-mono">
              <div>Auth: {isAuthenticated ? "✓" : "✗"}</div>
              <div>Auth Error: {isAuthError ? "✓" : "✗"}</div>
              <div>Token Expired: {tokenExpired ? "✓" : "✗"}</div>
              <div>MQTT: {mqttStatus}</div>
              <div>Ready: {isMqttReady ? "✓" : "✗"}</div>
            </div>
          </div>
        )}

        {/* Manual Controls */}
        {showControls && (
          <div className="space-y-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Manual Controls:</p>
            <Button size="sm" variant="outline" onClick={reconnectAfterTokenRefresh} disabled={!isAuthenticated}>
              Reconnect MQTT
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Compact version of the status indicator for use in headers/toolbars
 */
export function MqttSessionStatusBadge() {
  const { isMqttReady, mqttStatus } = useMqttSession();

  return (
    <Badge variant={isMqttReady ? "default" : "secondary"} className="text-xs">
      MQTT: {mqttStatus}
    </Badge>
  );
}
