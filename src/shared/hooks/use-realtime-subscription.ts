"use client";

import { useEffect, useMemo, useRef } from "react";
import { useQueryClient, type QueryKey } from "@tanstack/react-query";

import { useMqttTopic } from "./use-mqtt-topic";

type UpdateFunction<TCached> = (oldData: TCached | undefined, messagePayload: unknown, topic: string) => TCached;

/**
 * Suscribe a un tópico MQTT y aplica actualizaciones quirúrgicas a la caché de TanStack Query
 * usando setQueryData sin invalidar.
 */
export function useRealtimeSubscription<TCached = unknown>(
  topic: string,
  queryKey: QueryKey,
  updateFn: UpdateFunction<TCached>
) {
  const queryClient = useQueryClient();
  // Memoizar dependencias para evitar resuscripciones por identidad
  const stableTopic = useMemo(() => topic, [topic]);
  const stableQueryKey = useMemo(() => queryKey, []); // queryKey se pasa como literal estable en componentes
  const stableUpdateRef = useRef(updateFn);
  stableUpdateRef.current = updateFn;

  const { lastMessage } = useMqttTopic(stableTopic, { autoSubscribe: true, qos: 1 });

  useEffect(() => {
    if (!lastMessage) return;
    const payload = (() => {
      const raw = lastMessage.payload;
      try {
        const asString = Buffer.isBuffer(raw) ? raw.toString("utf8") : String(raw);
        return JSON.parse(asString);
      } catch {
        return Buffer.isBuffer(raw) ? raw.toString("utf8") : raw;
      }
    })();

    queryClient.setQueryData<TCached>(stableQueryKey, (oldData) =>
      stableUpdateRef.current(oldData, payload, lastMessage.topic as string)
    );
  }, [lastMessage, queryClient, stableQueryKey]);
}
