"use client";

import { useQuery } from "@tanstack/react-query";

import { getAuditByEntityId } from "./audit.actions";

interface PaginationParams {
  page?: number;
  limit?: number;
}

export const AUDIT_KEYS = {
  all: ["audit"] as const,
  list: (entityId: string, params: PaginationParams = {}) => [...AUDIT_KEYS.all, entityId, params] as const,
};

export const useAudit = (entityId: string, params?: PaginationParams) => {
  const { page, limit } = params || {};

  return useQuery({
    queryKey: AUDIT_KEYS.list(entityId, { page, limit }),
    queryFn: async () => {
      const response = await getAuditByEntityId(entityId, { page, limit });
      if (!response.success) {
        throw new Error(response.error || "Error al obtener el historial de auditoría");
      }
      return response;
    },
  });
};
