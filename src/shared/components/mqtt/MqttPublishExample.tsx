/**
 * MQTT Publishing Example Component
 * Demonstrates the usage of MQTT publishing mutations with TanStack Query
 * Implements requirements 2.5 and 4.2 for publishing functionality
 */

"use client";

import { useState } from "react";
import { CheckCircle, Loader2, Send, Wifi, WifiOff, XCircle } from "lucide-react";

import { useMqttPublish, useMqttPublishJson, useMqttPublishRequest } from "../../hooks";
import type { MqttPublishOptions } from "../../types/mqtt.types";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

interface MqttPublishExampleProps {
  /**
   * Optional initial topic for publishing
   */
  topic?: string;

  /**
   * Optional title for the component
   */
  title?: string;
}

/**
 * Example component demonstrating MQTT publishing with TanStack Query mutations
 */
export function MqttPublishExample({ topic: initialTopic = "test/publish" }: MqttPublishExampleProps = {}) {
  // Form state
  const [topic, setTopic] = useState(initialTopic);
  const [message, setMessage] = useState("Hello MQTT!");
  const [qos, setQos] = useState<0 | 1 | 2>(1);
  const [retain, setRetain] = useState(false);
  const [jsonData, setJsonData] = useState('{"temperature": 25.5, "humidity": 60}');
  const [requestTopic, setRequestTopic] = useState("dashboard/test3");
  const [responseTopic, setResponseTopic] = useState("dashboard/test4");

  // Basic MQTT publish mutation
  const basicPublish = useMqttPublish({
    onSuccess: (_data, variables) => {
      console.log("Message published successfully:", variables);
    },
    onError: (error, variables) => {
      console.error("Failed to publish message:", error, variables);
    },
  });

  // JSON publish mutation with automatic serialization
  const jsonPublish = useMqttPublishJson({
    invalidateTopics: ["sensors/data"], // Invalidate related topics
    onSuccess: () => {
      console.log("JSON message published successfully");
    },
  });

  // Request-response publish mutation
  const requestPublish = useMqttPublishRequest({
    invalidateTopics: [responseTopic], // Invalidate response topic
    onSuccess: () => {
      console.log("Request published successfully");
    },
  });

  // Handle basic message publish
  const handleBasicPublish = () => {
    const options: MqttPublishOptions = {
      qos,
      retain,
      properties: {
        userProperties: {
          "publish-type": "basic",
          component: "MqttPublishExample",
        },
      },
    };

    basicPublish.publishMessage(topic, message, options);
  };

  // Handle JSON message publish
  const handleJsonPublish = () => {
    try {
      const data = JSON.parse(jsonData);
      jsonPublish.publishJson("dashboard/test2", data, {
        qos: 1,
        properties: {
          userProperties: {
            "data-type": "sensor-reading",
            format: "json",
          },
        },
      });
    } catch (error) {
      console.error("Invalid JSON data:", error);
    }
  };

  // Handle request-response publish
  const handleRequestPublish = () => {
    const requestData = {
      action: "getData",
      timestamp: new Date().toISOString(),
      requestId: Math.random().toString(36).substr(2, 9),
    };

    requestPublish.publishRequest(requestTopic, requestData, responseTopic, {
      qos: 1,
      properties: {
        userProperties: {
          "request-type": "data-fetch",
        },
      },
    });
  };

  // Connection status indicator
  const ConnectionStatus = () => {
    const isConnected = basicPublish.isConnected;
    const status = basicPublish.connectionStatus;

    return (
      <div className="flex items-center gap-2 mb-4">
        {isConnected ? <Wifi className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4 text-red-500" />}
        <Badge variant={isConnected ? "default" : "destructive"}>{status}</Badge>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>MQTT Publishing Examples</CardTitle>
          <CardDescription>Demonstrates MQTT publishing with TanStack Query mutations</CardDescription>
          <ConnectionStatus />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Publishing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Message Publishing</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="topic">Topic</Label>
                <Input
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter MQTT topic"
                />
              </div>

              <div>
                <Label htmlFor="qos">QoS Level</Label>
                <select
                  id="qos"
                  value={qos}
                  onChange={(e) => setQos(Number(e.target.value) as 0 | 1 | 2)}
                  className="w-full p-2 border rounded"
                >
                  <option value={0}>0 - At most once</option>
                  <option value={1}>1 - At least once</option>
                  <option value={2}>2 - Exactly once</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter message content"
                rows={3}
              />
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="retain" checked={retain} onChange={(e) => setRetain(e.target.checked)} />
              <Label htmlFor="retain">Retain message</Label>
            </div>

            <Button
              onClick={handleBasicPublish}
              disabled={!basicPublish.canPublish || basicPublish.isPending}
              className="w-full"
            >
              {basicPublish.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Publish Basic Message
            </Button>

            {basicPublish.isError && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{basicPublish.error?.message || "Failed to publish message"}</AlertDescription>
              </Alert>
            )}

            {basicPublish.isSuccess && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>Message published successfully!</AlertDescription>
              </Alert>
            )}
          </div>

          {/* JSON Publishing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">JSON Message Publishing</h3>

            <div>
              <Label htmlFor="jsonData">JSON Data</Label>
              <Textarea
                id="jsonData"
                value={jsonData}
                onChange={(e) => setJsonData(e.target.value)}
                placeholder="Enter JSON data"
                rows={3}
              />
            </div>

            <Button
              onClick={handleJsonPublish}
              disabled={!jsonPublish.canPublish || jsonPublish.isPending}
              className="w-full"
            >
              {jsonPublish.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Publish JSON Message
            </Button>

            {jsonPublish.isError && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{jsonPublish.error?.message || "Failed to publish JSON message"}</AlertDescription>
              </Alert>
            )}

            {jsonPublish.isSuccess && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>JSON message published successfully!</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Request-Response Publishing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Request-Response Publishing</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="requestTopic">Request Topic</Label>
                <Input
                  id="requestTopic"
                  value={requestTopic}
                  onChange={(e) => setRequestTopic(e.target.value)}
                  placeholder="Enter request topic"
                />
              </div>

              <div>
                <Label htmlFor="responseTopic">Response Topic</Label>
                <Input
                  id="responseTopic"
                  value={responseTopic}
                  onChange={(e) => setResponseTopic(e.target.value)}
                  placeholder="Enter response topic"
                />
              </div>
            </div>

            <Button
              onClick={handleRequestPublish}
              disabled={!requestPublish.canPublish || requestPublish.isPending}
              className="w-full"
            >
              {requestPublish.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send Request
            </Button>

            {requestPublish.isError && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{requestPublish.error?.message || "Failed to send request"}</AlertDescription>
              </Alert>
            )}

            {requestPublish.isSuccess && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>Request sent successfully! Check the response topic for replies.</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Mutation Status Display */}
      <Card>
        <CardHeader>
          <CardTitle>Mutation Status</CardTitle>
          <CardDescription>Current status of all publishing mutations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Basic Publish:</span>
              <Badge
                variant={
                  basicPublish.isPending
                    ? "secondary"
                    : basicPublish.isSuccess
                      ? "default"
                      : basicPublish.isError
                        ? "destructive"
                        : "outline"
                }
              >
                {basicPublish.isPending
                  ? "Publishing..."
                  : basicPublish.isSuccess
                    ? "Success"
                    : basicPublish.isError
                      ? "Error"
                      : "Idle"}
              </Badge>
            </div>

            <div className="flex justify-between">
              <span>JSON Publish:</span>
              <Badge
                variant={
                  jsonPublish.isPending
                    ? "secondary"
                    : jsonPublish.isSuccess
                      ? "default"
                      : jsonPublish.isError
                        ? "destructive"
                        : "outline"
                }
              >
                {jsonPublish.isPending
                  ? "Publishing..."
                  : jsonPublish.isSuccess
                    ? "Success"
                    : jsonPublish.isError
                      ? "Error"
                      : "Idle"}
              </Badge>
            </div>

            <div className="flex justify-between">
              <span>Request Publish:</span>
              <Badge
                variant={
                  requestPublish.isPending
                    ? "secondary"
                    : requestPublish.isSuccess
                      ? "default"
                      : requestPublish.isError
                        ? "destructive"
                        : "outline"
                }
              >
                {requestPublish.isPending
                  ? "Publishing..."
                  : requestPublish.isSuccess
                    ? "Success"
                    : requestPublish.isError
                      ? "Error"
                      : "Idle"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
