/**
 * MQTT Topic Example Component
 * Demonstrates usage of useMqttTopic hook with TanStack Query integration
 * Implements requirement 2.2: Topic-specific data components with real-time updates
 */

"use client";

import { AlertCircle, Loader2, RefreshCw, Wifi, WifiOff } from "lucide-react";

import { useMqttTopic } from "../../hooks/use-mqtt-topic";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

interface MqttTopicExampleProps {
  /**
   * MQTT topic to subscribe to
   */
  topic: string;

  /**
   * Optional title for the component
   */
  title?: string;

  /**
   * Optional parser function for message data
   */
  parser?: (payload: string | Buffer) => any;
}

/**
 * Example component that demonstrates real-time MQTT data consumption
 * Shows connection status, message count, and latest message data
 *
 * @param topic - MQTT topic to subscribe to
 * @param title - Optional title for the component
 * @param parser - Optional parser function for message data
 */
export function MqttTopicExample({ topic, title, parser }: MqttTopicExampleProps) {
  const {
    // TODO: Add data back in
    // data,
    isLoading,
    error,
    messages,
    lastMessage,
    parsedData,
    lastUpdated,
    subscribers,
    isConnected,
    connectionStatus,
    isSubscribed,
    subscribe,
    unsubscribe,
    refetch,
  } = useMqttTopic(topic, {
    parser,
    qos: 1,
    maxMessages: 50,
    onParseError: (error, message) => {
      console.error(`Parse error for topic ${topic}:`, error, message);
    },
  });

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "bg-green-500";
      case "connecting":
        return "bg-yellow-500";
      case "reconnecting":
        return "bg-orange-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case "connected":
        return <Wifi className="h-4 w-4" />;
      case "connecting":
      case "reconnecting":
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case "error":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <WifiOff className="h-4 w-4" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{title || `MQTT Topic: ${topic}`}</CardTitle>
            <CardDescription>Real-time data from MQTT topic with TanStack Query integration</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${getConnectionStatusColor()} text-white border-none`}>
              {getConnectionStatusIcon()}
              {connectionStatus}
            </Badge>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={!isConnected}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Connection and Subscription Status */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="font-medium text-muted-foreground">Connected</div>
            <div className={isConnected ? "text-green-600" : "text-red-600"}>{isConnected ? "Yes" : "No"}</div>
          </div>
          <div>
            <div className="font-medium text-muted-foreground">Subscribed</div>
            <div className={isSubscribed ? "text-green-600" : "text-orange-600"}>{isSubscribed ? "Yes" : "No"}</div>
          </div>
          <div>
            <div className="font-medium text-muted-foreground">Messages</div>
            <div className="text-blue-600">{messages.length}</div>
          </div>
          <div>
            <div className="font-medium text-muted-foreground">Subscribers</div>
            <div className="text-purple-600">{subscribers}</div>
          </div>
        </div>

        {/* Manual Subscription Controls */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={subscribe} disabled={!isConnected || isSubscribed}>
            Subscribe
          </Button>
          <Button variant="outline" size="sm" onClick={unsubscribe} disabled={!isSubscribed}>
            Unsubscribe
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Error</span>
            </div>
            <div className="text-red-700 text-sm mt-1">{error.message || "Unknown error occurred"}</div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading topic data...</span>
          </div>
        )}

        {/* Latest Message */}
        {lastMessage && (
          <div className="space-y-2">
            <h4 className="font-medium">Latest Message</h4>
            <div className="bg-gray-50 p-3 rounded-md space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">QoS:</span>
                  <span className="ml-2">{lastMessage.qos}</span>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Retain:</span>
                  <span className="ml-2">{lastMessage.retain ? "Yes" : "No"}</span>
                </div>
              </div>

              {lastUpdated && (
                <div className="text-sm">
                  <span className="font-medium text-muted-foreground">Received:</span>
                  <span className="ml-2">{lastUpdated.toLocaleString()}</span>
                </div>
              )}

              <div>
                <div className="font-medium text-muted-foreground text-sm mb-1">Raw Payload:</div>
                <pre className="bg-white p-2 rounded border text-xs overflow-x-auto">
                  {lastMessage.payload.toString()}
                </pre>
              </div>

              {parsedData && (
                <div>
                  <div className="font-medium text-muted-foreground text-sm mb-1">Parsed Data:</div>
                  <pre className="bg-white p-2 rounded border text-xs overflow-x-auto">
                    {JSON.stringify(parsedData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Message History */}
        {messages.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Message History ({messages.length})</h4>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {messages
                .slice(-10)
                .reverse()
                .map((message, index) => (
                  <div key={index} className="bg-gray-50 p-2 rounded text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-mono">
                        QoS: {message.qos} | Retain: {message.retain ? "Y" : "N"}
                      </span>
                      <span className="text-muted-foreground">#{messages.length - index}</span>
                    </div>
                    <div className="mt-1 truncate">
                      {message.payload.toString().substring(0, 100)}
                      {message.payload.toString().length > 100 && "..."}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* No Data State */}
        {!isLoading && !error && messages.length === 0 && (
          <div className="text-center p-4 text-muted-foreground">
            {isConnected && isSubscribed
              ? "No messages received yet. Waiting for data..."
              : "Connect and subscribe to start receiving messages."}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
