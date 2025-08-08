"use client";

import { useCallback, useState } from "react";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { useMqttTopic } from "@/shared/hooks/use-mqtt-topic";

export default function MqttTestPage() {
  const [topic, setTopic] = useState("dashboard/test");
  const { messages, isConnected, isSubscribed, subscribe, unsubscribe } = useMqttTopic(topic, {
    autoSubscribe: false,
    qos: 1,
  });

  // Debug logging
  console.log("MQTT Test Page - Current state:", {
    topic,
    messagesCount: messages.length,
    isConnected,
    isSubscribed,
    timestamp: new Date().toISOString(),
  });

  const handleSubscribe = useCallback(() => {
    if (!isSubscribed) subscribe();
  }, [isSubscribed, subscribe]);

  const handleUnsubscribe = useCallback(() => {
    if (isSubscribed) unsubscribe();
  }, [isSubscribed, unsubscribe]);

  return (
    <div className="container mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">TestMqtt</h1>

      <Card>
        <CardHeader>
          <CardTitle>Suscripción a tópico</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="ingresa un tópico..." />
            <Button onClick={handleSubscribe} disabled={!isConnected || isSubscribed}>
              Suscribirse
            </Button>
            <Button variant="secondary" onClick={handleUnsubscribe} disabled={!isSubscribed}>
              Desuscribir
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            Estado: {isConnected ? "Conectado" : "Desconectado"} • Suscrito: {isSubscribed ? "Sí" : "No"}
          </div>

          <div className="max-h-80 overflow-auto border rounded-md p-2 text-sm bg-muted/30">
            <div className="text-xs text-muted-foreground mb-2">
              Mensajes recibidos: {messages.length} | Tópico: {topic}
            </div>
            {messages.length === 0 ? (
              <div className="text-muted-foreground">Sin mensajes aún…</div>
            ) : (
              messages
                .slice()
                .reverse()
                .map((m, index) => (
                  <div
                    key={`${m.topic}-${index}-${m.qos}-${m.retain}-${m.payload.toString().slice(0, 20)}`}
                    className="whitespace-pre-wrap break-words py-2 border-b border-gray-200 last:border-b-0"
                  >
                    <div className="text-xs text-gray-500 flex justify-between">
                      <span>
                        Mensaje #{messages.length - index} | Tópico: {m.topic} | QoS: {m.qos} | Retain:{" "}
                        {m.retain ? "Sí" : "No"}
                      </span>
                      {m.properties?.messageExpiryInterval !== undefined && (
                        <span>Expira en: {m.properties.messageExpiryInterval}s</span>
                      )}
                    </div>
                    <div className="mt-1 font-mono bg-white p-2 rounded-md text-sm">
                      {`${m.payload instanceof Buffer ? m.payload.toString("utf8") : m.payload}`}
                    </div>
                    {m.properties && (
                      <details className="mt-2 text-xs">
                        <summary className="cursor-pointer text-muted-foreground">Propiedades MQTT v5</summary>
                        <div className="p-2 mt-1 bg-gray-50 rounded-md space-y-1">
                          {m.properties.payloadFormatIndicator !== undefined && (
                            <div>
                              <span className="font-semibold">Payload Format:</span>{" "}
                              {m.properties.payloadFormatIndicator ? "UTF-8" : "Bytes"}
                            </div>
                          )}
                          {m.properties.messageExpiryInterval !== undefined && (
                            <div>
                              <span className="font-semibold">Message Expiry:</span>{" "}
                              {m.properties.messageExpiryInterval}s
                            </div>
                          )}
                          {m.properties.topicAlias !== undefined && (
                            <div>
                              <span className="font-semibold">Topic Alias:</span> {m.properties.topicAlias}
                            </div>
                          )}
                          {m.properties.responseTopic && (
                            <div>
                              <span className="font-semibold">Response Topic:</span> {m.properties.responseTopic}
                            </div>
                          )}
                          {m.properties.correlationData && (
                            <div>
                              <span className="font-semibold">Correlation Data:</span>{" "}
                              <code className="bg-white px-1 py-0.5 rounded">
                                {Array.from(m.properties.correlationData.values())
                                  .map((b) => b.toString(16).padStart(2, "0"))
                                  .join("")
                                  .slice(0, 64)}
                                {m.properties.correlationData.length * 2 > 64 ? "…" : ""}
                              </code>
                              <span className="ml-2 text-muted-foreground">
                                ({m.properties.correlationData.length} bytes)
                              </span>
                            </div>
                          )}
                          {m.properties.subscriptionIdentifier !== undefined && (
                            <div>
                              <span className="font-semibold">Subscription Identifier:</span>{" "}
                              {Array.isArray(m.properties.subscriptionIdentifier)
                                ? JSON.stringify(m.properties.subscriptionIdentifier)
                                : m.properties.subscriptionIdentifier}
                            </div>
                          )}
                          {m.properties.contentType && (
                            <div>
                              <span className="font-semibold">Content Type:</span> {m.properties.contentType}
                            </div>
                          )}
                          {m.properties.userProperties && (
                            <div>
                              <span className="font-semibold">User Properties:</span>
                              <div className="mt-1 space-y-1">
                                {Object.entries(m.properties.userProperties).map(([key, value]) => (
                                  <div key={key} className="grid grid-cols-[160px_1fr] gap-2">
                                    <div className="text-muted-foreground">{key}</div>
                                    <div>{Array.isArray(value) ? value.join(", ") : value}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="pt-2">
                            <span className="font-semibold">Properties (raw):</span>
                            <pre className="text-xs bg-white p-1 rounded mt-1">
                              {JSON.stringify(
                                {
                                  ...m.properties,
                                  correlationData: m.properties.correlationData
                                    ? `0x${Array.from(m.properties.correlationData.values())
                                        .map((b) => b.toString(16).padStart(2, "0"))
                                        .join("")}`
                                    : undefined,
                                },
                                null,
                                2
                              )}
                            </pre>
                          </div>
                        </div>
                      </details>
                    )}
                    <details className="mt-2 text-xs">
                      <summary className="cursor-pointer text-muted-foreground">Mensaje (raw)</summary>
                      <pre className="text-xs bg-gray-50 p-2 rounded mt-1">
                        {JSON.stringify(
                          {
                            topic: m.topic,
                            qos: m.qos,
                            retain: m.retain,
                            payloadType: m.payload instanceof Buffer ? "Buffer" : typeof m.payload,
                            payloadUtf8: m.payload instanceof Buffer ? m.payload.toString("utf8") : m.payload,
                            payloadLength:
                              m.payload instanceof Buffer
                                ? m.payload.length
                                : typeof m.payload === "string"
                                  ? m.payload.length
                                  : undefined,
                            properties: {
                              ...m.properties,
                              correlationData: m.properties?.correlationData
                                ? `0x${Array.from(m.properties.correlationData.values())
                                    .map((b) => b.toString(16).padStart(2, "0"))
                                    .join("")}`
                                : undefined,
                            },
                          },
                          null,
                          2
                        )}
                      </pre>
                    </details>
                  </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
