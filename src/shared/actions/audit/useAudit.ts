"use client";

import { useQuery } from "@tanstack/react-query";

import { getAuditByEntityId } from "./audit.actions";

const AUDIT_KEYS = {
  all: ["audit"] as const,
  list: (entityId: string) => [...AUDIT_KEYS.all, entityId] as const,
};

export const useAudit = (entityId: string) => {
  return useQuery({
    queryKey: AUDIT_KEYS.list(entityId),
    queryFn: async () => {
      const response = await getAuditByEntityId(entityId);
      if (!response.success) {
        throw new Error(response.error || "Error al obtener el historial de auditoría");
      }
      return response.data;
    },
  });
};
