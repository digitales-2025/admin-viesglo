"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  MqttConnectionStatus,
  MqttErrorMonitor,
  MqttHealthIndicator,
  MqttPublishExample,
  MqttServerActionExample,
  MqttSessionStatusIndicator,
} from "@/shared/components/mqtt";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { useMqttPublish, useMqttPublishRequest } from "@/shared/hooks";
import { useMqttTopic } from "@/shared/hooks/use-mqtt-topic";

export default function MqttTestPage() {
  const serverPublishingEnabled = process.env.NEXT_PUBLIC_ENABLE_MQTT_SERVER_PUBLISH === "true";
  const [topic, setTopic] = useState("dashboard/test");
  const { messages, isConnected, isSubscribed, subscribe, unsubscribe } = useMqttTopic(topic, {
    autoSubscribe: false,
    qos: 1,
  });

  const handleSubscribe = useCallback(() => {
    if (!isSubscribed) subscribe();
  }, [isSubscribed, subscribe]);

  const handleUnsubscribe = useCallback(() => {
    if (isSubscribed) unsubscribe();
  }, [isSubscribed, unsubscribe]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Test MQTT</h1>

      {/* Estado de Conexión y Sesión */}
      <Card>
        <CardHeader>
          <CardTitle>Estado de Conexión y Sesión</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Conexión MQTT</div>
            <MqttConnectionStatus />
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Salud del Sistema</div>
            <MqttHealthIndicator />
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Estado de Sesión</div>
            <MqttSessionStatusIndicator />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Suscripción a tópico</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Demostración de suscripción MQTT v5: suscríbete a un tópico y observa mensajes entrantes y sus propiedades
            (QoS, retain, userProperties, responseTopic, correlationData, etc.).
          </p>
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

      {/* Publicación de mensajes (Cliente y Server Actions) */}
      <p className="text-sm text-muted-foreground">
        Publicación desde cliente usa el cliente MQTT del navegador. La opción de Server Actions (cuando esté
        habilitada) envía al backend HTTP para publicar de forma segura desde el servidor.
      </p>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <MqttPublishExample topic="dashboard/test" />
        {serverPublishingEnabled ? (
          <MqttServerActionExample />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Publicación vía Server Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertDescription>
                  Esta funcionalidad aún no está implementada. Para habilitarla:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Implementa un endpoint en tu backend que publique al broker (recomendado)</li>
                    <li>O crea un cliente MQTT en el backend de Next (solo si es entorno no-serverless)</li>
                    <li>
                      Configura <code className="px-1">NEXT_PUBLIC_ENABLE_MQTT_SERVER_PUBLISH=true</code> y
                      <code className="px-1">BACKEND_URL</code> en el servidor que atienda el endpoint
                    </li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Demo Request/Response (en la misma página) */}
      <Card>
        <CardHeader>
          <CardTitle>Demo Request/Response</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Patrón Request/Response en MQTT 5: el solicitante publica en un tópico de petición e incluye
            <code className="mx-1">responseTopic</code> y <code className="mx-1">correlationData</code> en las
            propiedades. El respondedor publica la respuesta en ese <code className="mx-1">responseTopic</code>
            devolviendo el <code className="mx-1">correlationData</code> intacto. Suscríbete al response topic antes de
            enviar para no perder la respuesta. Guía:{" "}
            <a
              className="underline"
              target="_blank"
              rel="noreferrer"
              href="https://www.emqx.com/en/blog/mqtt5-request-response"
            >
              MQTT Request/Response (EMQX)
            </a>
            .
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Solicitante</h3>
              <RequesterPanel />
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Respondedor simulado</h3>
              <ResponderPanel />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monitoreo y Errores MQTT */}
      <Card>
        <CardHeader>
          <CardTitle>Monitoreo de Errores y Salud MQTT</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <MqttErrorMonitor showDetails={true} showExport={true} autoRefresh={true} refreshInterval={30000} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ------------------
// Panels Request/Response
// ------------------
function RequesterPanel() {
  const [requestTopic, setRequestTopic] = useState("dashboard/rr/request");
  const [responseTopic, setResponseTopic] = useState("dashboard/rr/response/demo");
  const [payload, setPayload] = useState('{"action":"ping"}');

  // Suscripción al response topic para recibir respuestas
  const { messages: responseMessages } = useMqttTopic(responseTopic, { autoSubscribe: true, qos: 1 });

  const requestPublish = useMqttPublishRequest({ invalidateTopics: [responseTopic] });

  const sendRequest = useCallback(() => {
    const data = (() => {
      try {
        return JSON.parse(payload);
      } catch {
        return payload;
      }
    })();

    requestPublish.publishRequest(requestTopic, data, responseTopic, {
      qos: 1,
      properties: { userProperties: { component: "RequesterPanel" } },
    });
  }, [payload, requestTopic, responseTopic, requestPublish]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="reqTopic">Request Topic</Label>
          <Input id="reqTopic" value={requestTopic} onChange={(e) => setRequestTopic(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="resTopic">Response Topic</Label>
          <Input id="resTopic" value={responseTopic} onChange={(e) => setResponseTopic(e.target.value)} />
        </div>
      </div>

      <div>
        <Label htmlFor="reqPayload">Payload</Label>
        <Textarea id="reqPayload" rows={3} value={payload} onChange={(e) => setPayload(e.target.value)} />
      </div>

      <Button
        className="w-full"
        onClick={sendRequest}
        disabled={requestPublish.isPending || !requestPublish.canPublish}
      >
        Enviar solicitud
      </Button>

      <div className="text-xs text-muted-foreground">
        Respuestas recibidas en <code>{responseTopic}</code>: {responseMessages.length}
      </div>
    </div>
  );
}

function ResponderPanel() {
  const [listenTopic, setListenTopic] = useState("dashboard/rr/request");
  const [autoReply, setAutoReply] = useState(true);
  const [replyTemplate, setReplyTemplate] = useState('{"ok":true,"message":"pong"}');

  const { lastMessage } = useMqttTopic(listenTopic, { autoSubscribe: true, qos: 1 });
  const publishMutation = useMqttPublish();

  const lastHandledKeyRef = useRef<string | null>(null);

  const replyOnce = useCallback(() => {
    if (!lastMessage) return;
    const responseTopic = lastMessage.properties?.responseTopic;
    if (!responseTopic) return;

    const correlationData = lastMessage.properties?.correlationData;
    const body = (() => {
      try {
        return JSON.parse(replyTemplate);
      } catch {
        return replyTemplate;
      }
    })();

    publishMutation.publishMessage(responseTopic, body, {
      qos: 1,
      properties: {
        correlationData,
        contentType: typeof body === "string" ? "text/plain" : "application/json",
        userProperties: { responder: "ResponderPanel" },
      },
    });
  }, [lastMessage, publishMutation, replyTemplate]);

  useEffect(() => {
    if (!autoReply || !lastMessage) return;
    const key = `${lastMessage.topic}|${lastMessage.properties?.correlationData?.toString("hex") || ""}|${lastMessage.payload
      .toString()
      .slice(0, 64)}`;
    if (lastHandledKeyRef.current !== key) {
      lastHandledKeyRef.current = key;
      replyOnce();
    }
  }, [autoReply, lastMessage, replyOnce]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="listen">Request Topic (escucha)</Label>
          <Input id="listen" value={listenTopic} onChange={(e) => setListenTopic(e.target.value)} />
        </div>
        <div className="flex items-end gap-2">
          <input id="auto" type="checkbox" checked={autoReply} onChange={(e) => setAutoReply(e.target.checked)} />
          <Label htmlFor="auto">Auto responder</Label>
        </div>
      </div>

      <div>
        <Label htmlFor="tmpl">Respuesta (template)</Label>
        <Textarea id="tmpl" rows={3} value={replyTemplate} onChange={(e) => setReplyTemplate(e.target.value)} />
      </div>

      <Button className="w-full" onClick={replyOnce} disabled={!publishMutation.canPublish}>
        Responder manualmente
      </Button>

      <div className="text-xs text-muted-foreground">
        Última solicitud: {lastMessage ? lastMessage.payload.toString().slice(0, 80) : "(sin solicitudes)"}
      </div>
    </div>
  );
}
