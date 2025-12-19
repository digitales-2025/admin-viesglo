/**
 * MQTT Server Action Publishing Example Component
 * Demonstrates secure server-side MQTT publishing using Server Actions
 * Implements requirement 5.1-5.5 for secure backend publishing
 */

"use client";

import React, { useState, useTransition } from "react";
import { CheckCircle, Loader2, Send, Server, Shield, XCircle } from "lucide-react";

import {
  publishMqttMessage,
  publishMqttMessageWithProperties,
  publishMqttRequest,
} from "../../actions/mqtt-server.actions";
import type { MqttPublishOptions } from "../../types/mqtt.types";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

/**
 * Example component demonstrating secure MQTT publishing via Server Actions
 */
export function MqttServerActionExample() {
  // Form state
  const [topic, setTopic] = useState("secure/publish");
  const [message, setMessage] = useState("Hello from Server Action!");
  const [qos, setQos] = useState<0 | 1 | 2>(1);
  const [retain, setRetain] = useState(false);
  const [responseTopic, setResponseTopic] = useState("secure/response");
  const [userPropsKey, setUserPropsKey] = useState("source");
  const [userPropsValue, setUserPropsValue] = useState("server-action");
  const [contentType, setContentType] = useState("text/plain");

  // Server Action state management
  const [isPending, startTransition] = useTransition();
  const [lastResult, setLastResult] = useState<{ success: boolean; error?: string } | null>(null);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  // Handle basic server-side publish
  const handleServerPublish = () => {
    setActiveAction("basic");
    startTransition(async () => {
      try {
        const options: MqttPublishOptions = {
          qos,
          retain,
          properties: {
            contentType,
            userProperties: {
              "publish-method": "server-action",
              component: "MqttServerActionExample",
            },
          },
        };

        const result = await publishMqttMessage(topic, message, options);
        setLastResult(result);
      } catch (error) {
        setLastResult({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      } finally {
        setActiveAction(null);
      }
    });
  };

  // Handle request-response server-side publish
  const handleServerRequest = () => {
    setActiveAction("request");
    startTransition(async () => {
      try {
        const requestData = {
          action: "getData",
          timestamp: new Date().toISOString(),
          requestId: Math.random().toString(36).substr(2, 9),
        };

        const result = await publishMqttRequest(
          topic,
          requestData,
          responseTopic,
          undefined, // Let it generate correlation data
          {
            qos,
            properties: {
              contentType: "application/json",
              userProperties: {
                "request-type": "server-side",
              },
            },
          }
        );

        setLastResult(result);
      } catch (error) {
        console.error("Server Action request failed:", error);
        setLastResult({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      } finally {
        setActiveAction(null);
      }
    });
  };

  // Handle publish with custom user properties
  const handleServerPublishWithProperties = () => {
    setActiveAction("properties");
    startTransition(async () => {
      try {
        const userProperties = {
          [userPropsKey]: userPropsValue,
          timestamp: new Date().toISOString(),
          method: "server-action-with-properties",
        };

        const result = await publishMqttMessageWithProperties(topic, message, userProperties, {
          qos,
          retain,
          properties: {
            contentType,
            messageExpiryInterval: 3600, // 1 hour
          },
        });

        setLastResult(result);
      } catch (error) {
        console.error("Server Action publish with properties failed:", error);
        setLastResult({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      } finally {
        setActiveAction(null);
      }
    });
  };

  // Clear results
  const clearResults = () => {
    setLastResult(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Secure MQTT Publishing (Server Actions)
          </CardTitle>
          <CardDescription>
            Demonstrates secure server-side MQTT publishing with MQTT v5.0 properties support
          </CardDescription>
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-blue-500" />
            <Badge variant="secondary">Server-Side Processing</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Server Publishing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Server-Side Publishing</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="serverTopic">Topic</Label>
                <Input
                  id="serverTopic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter MQTT topic"
                />
              </div>

              <div>
                <Label htmlFor="serverQos">QoS Level</Label>
                <select
                  id="serverQos"
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
              <Label htmlFor="serverMessage">Message</Label>
              <Textarea
                id="serverMessage"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter message content"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contentType">Content Type</Label>
                <Input
                  id="contentType"
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  placeholder="e.g., text/plain, application/json"
                />
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="serverRetain"
                  checked={retain}
                  onChange={(e) => setRetain(e.target.checked)}
                />
                <Label htmlFor="serverRetain">Retain message</Label>
              </div>
            </div>

            <Button onClick={handleServerPublish} disabled={isPending && activeAction === "basic"} className="w-full">
              {isPending && activeAction === "basic" ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Publish via Server Action
            </Button>
          </div>

          {/* Request-Response Server Publishing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Request-Response Server Publishing</h3>

            <div>
              <Label htmlFor="serverResponseTopic">Response Topic</Label>
              <Input
                id="serverResponseTopic"
                value={responseTopic}
                onChange={(e) => setResponseTopic(e.target.value)}
                placeholder="Enter response topic"
              />
            </div>

            <Button onClick={handleServerRequest} disabled={isPending && activeAction === "request"} className="w-full">
              {isPending && activeAction === "request" ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send Request via Server Action
            </Button>
          </div>

          {/* Custom Properties Server Publishing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Publishing with Custom User Properties</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="userPropsKey">Property Key</Label>
                <Input
                  id="userPropsKey"
                  value={userPropsKey}
                  onChange={(e) => setUserPropsKey(e.target.value)}
                  placeholder="Property key"
                />
              </div>

              <div>
                <Label htmlFor="userPropsValue">Property Value</Label>
                <Input
                  id="userPropsValue"
                  value={userPropsValue}
                  onChange={(e) => setUserPropsValue(e.target.value)}
                  placeholder="Property value"
                />
              </div>
            </div>

            <Button
              onClick={handleServerPublishWithProperties}
              disabled={isPending && activeAction === "properties"}
              className="w-full"
            >
              {isPending && activeAction === "properties" ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Publish with Properties via Server Action
            </Button>
          </div>

          {/* Results Display */}
          {lastResult && (
            <div className="space-y-2">
              {lastResult.success ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Server Action completed successfully! Message published securely from the backend.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>Server Action failed: {lastResult.error || "Unknown error"}</AlertDescription>
                </Alert>
              )}

              <Button variant="outline" size="sm" onClick={clearResults} className="w-full">
                Clear Results
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Server Action Status */}
      <Card>
        <CardHeader>
          <CardTitle>Server Action Status</CardTitle>
          <CardDescription>Current status of server-side publishing operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Server Actions:</span>
              <Badge variant={isPending ? "secondary" : "outline"}>
                {isPending ? `Processing (${activeAction})...` : "Ready"}
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span>Last Operation:</span>
              <Badge variant={lastResult === null ? "outline" : lastResult.success ? "default" : "destructive"}>
                {lastResult === null ? "None" : lastResult.success ? "Success" : "Failed"}
              </Badge>
            </div>

            <div className="text-sm text-muted-foreground mt-4">
              <p>
                <strong>Security Benefits:</strong> Server Actions ensure that MQTT credentials and publishing logic
                remain secure on the server, preventing client-side exposure of sensitive broker information.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
