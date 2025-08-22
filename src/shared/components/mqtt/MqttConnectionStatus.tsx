/**
 * MQTT Connection Status Component
 * Enhanced component to display MQTT connection status with reconnection information
 * Implements requirement 2.1: Connection status indicators with reactive updates
 * Implements requirements 3.2, 3.4: Display reconnection status and backoff information
 */

"use client";

import { AlertCircle, Clock, Loader2, Network, Wifi, WifiOff } from "lucide-react";

import {
  useMqttConnectionStatus,
  useMqttLastReconnectAttempt,
  useMqttNetworkOnline,
  useMqttNextReconnectDelay,
  useMqttReconnectAttempts,
  useMqttTokenExpired,
} from "../../stores/mqtt-connection.store";
import { Badge } from "../ui/badge";
import { useMqttQueryProvider } from "./MqttQueryProvider";

interface MqttConnectionStatusProps {
  /**
   * Show detailed connection information
   */
  detailed?: boolean;

  /**
   * Custom className for styling
   */
  className?: string;
}

/**
 * Component that displays MQTT connection status with reactive updates and reconnection info
 * Uses TanStack Query integration for real-time status updates
 */
export function MqttConnectionStatus({ detailed = false, className = "" }: MqttConnectionStatusProps) {
  const { isConnected, getActiveTopics } = useMqttQueryProvider();
  const activeTopics = getActiveTopics();

  // Enhanced connection state information
  const connectionStatus = useMqttConnectionStatus();
  const reconnectAttempts = useMqttReconnectAttempts();
  const nextReconnectDelay = useMqttNextReconnectDelay();
  const isNetworkOnline = useMqttNetworkOnline();
  const isTokenExpired = useMqttTokenExpired();
  const lastReconnectAttempt = useMqttLastReconnectAttempt();

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case "connected":
        return <Wifi className="h-4 w-4" />;
      case "connecting":
      case "reconnecting":
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case "error":
        return <AlertCircle className="h-4 w-4" />;
      case "disconnected":
      default:
        return <WifiOff className="h-4 w-4" />;
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "bg-green-500";
      case "connecting":
      case "reconnecting":
        return "bg-yellow-500";
      case "error":
        return "bg-red-500";
      case "disconnected":
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case "connected":
        return "Connected";
      case "connecting":
        return "Connecting...";
      case "reconnecting":
        return `Reconnecting... (${reconnectAttempts}/10)`;
      case "error":
        if (isTokenExpired) return "Auth Error";
        if (!isNetworkOnline) return "Network Offline";
        return "Connection Error";
      case "disconnected":
      default:
        return "Disconnected";
    }
  };

  const formatDelay = (delayMs: number): string => {
    if (delayMs < 1000) return `${delayMs}ms`;
    if (delayMs < 60000) return `${Math.round(delayMs / 1000)}s`;
    return `${Math.round(delayMs / 60000)}m`;
  };

  if (!detailed) {
    return (
      <Badge variant="outline" className={`${getStatusColor()} text-white border-none ${className}`}>
        {getStatusIcon()}
        <span className="ml-1">{getStatusText()}</span>
      </Badge>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className={`${getStatusColor()} text-white border-none`}>
          {getStatusIcon()}
          <span className="ml-1">{getStatusText()}</span>
        </Badge>

        {/* Network status indicator */}
        {!isNetworkOnline && (
          <Badge variant="outline" className="bg-orange-500 text-white border-none">
            <Network className="h-3 w-3" />
            <span className="ml-1">Offline</span>
          </Badge>
        )}
      </div>

      {/* Reconnection information */}
      {connectionStatus === "reconnecting" && (
        <div className="text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Next attempt in {formatDelay(nextReconnectDelay)}</span>
          </div>
          {lastReconnectAttempt && (
            <div className="text-xs mt-1">Last attempt: {lastReconnectAttempt.toLocaleTimeString()}</div>
          )}
        </div>
      )}

      {/* Error information */}
      {connectionStatus === "error" && (
        <div className="text-sm text-red-600">
          {isTokenExpired && <div>• Authentication token expired</div>}
          {!isNetworkOnline && <div>• Network connection unavailable</div>}
          {reconnectAttempts > 0 && <div>• Reconnection attempts: {reconnectAttempts}/10</div>}
        </div>
      )}

      {/* Active topics when connected */}
      {isConnected && (
        <div className="text-sm text-muted-foreground">
          <div>Active topics: {activeTopics.length}</div>
          {activeTopics.length > 0 && (
            <div className="mt-1">
              {activeTopics.slice(0, 3).map(({ topic, data }) => (
                <div key={topic} className="text-xs">
                  • {topic} ({data.messages.length} messages)
                </div>
              ))}
              {activeTopics.length > 3 && <div className="text-xs">... and {activeTopics.length - 3} more</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
