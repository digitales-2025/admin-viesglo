"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createQuotationGroup,
  deleteQuotationGroup,
  getQuotationGroup,
  getQuotationGroups,
  togleActiveQuotationGroup,
  updateQuotationGroup,
} from "../_actions/quotation-groups.actions";
import { QuotationGroupCreate, QuotationGroupUpdate } from "../_types/quotation-groups.types";

export const QUOTATION_GROUP_KEYS = {
  all: ["quotation-groups"] as const,
  lists: () => [...QUOTATION_GROUP_KEYS.all, "list"] as const,
  list: (filters: string) => [...QUOTATION_GROUP_KEYS.lists(), { filters }] as const,
  detail: (id: string) => [...QUOTATION_GROUP_KEYS.all, id] as const,
};

/**
 * Hook para obtener todos los grupos de cotizaciones
 */
export function useQuotationGroups() {
  return useQuery({
    queryKey: QUOTATION_GROUP_KEYS.lists(),
    queryFn: async () => {
      const response = await getQuotationGroups();
      if (!response.success) {
        throw new Error(response.error || "Error al obtener grupos de cotizaciones");
      }
      return response.data;
    },
  });
}

/**
 * Hook para obtener un grupo de cotizaciones por ID
 */
export function useQuotationGroup(id: string | undefined) {
  return useQuery({
    queryKey: QUOTATION_GROUP_KEYS.detail(id || "unknown"),
    queryFn: async () => {
      const response = await getQuotationGroup(id || "unknown");
      if (!response.success) {
        throw new Error(response.error || "Error al obtener grupo de cotizaciones");
      }
      return response.data;
    },
  });
}

/**
 * Hook para crear un grupo de cotizaciones
 */
export function useCreateQuotationGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (quotationGroup: QuotationGroupCreate) => createQuotationGroup(quotationGroup),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUOTATION_GROUP_KEYS.lists() });
      toast.success("Grupo de cotizaciones creado correctamente");
    },
    onError: () => {
      toast.error("Error al crear grupo de cotizaciones");
    },
  });
}

/**
 * Hook para actualizar un grupo de cotizaciones
 */
export function useUpdateQuotationGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<QuotationGroupUpdate> }) => {
      const response = await updateQuotationGroup(id, data);
      if (!response.success) {
        throw new Error(response.error || "Error al actualizar grupo de cotizaciones");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUOTATION_GROUP_KEYS.lists() });
      toast.success("Grupo de cotizaciones actualizado correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar grupo de cotizaciones");
    },
  });
}

/**
 * Hook para eliminar un grupo de cotizaciones
 */
export function useDeleteQuotationGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await deleteQuotationGroup(id);
      if (!response.success) {
        throw new Error(response.error || "Error al eliminar grupo de cotizaciones");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUOTATION_GROUP_KEYS.lists() });
      toast.success("Grupo de cotizaciones eliminado correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar grupo de cotizaciones");
    },
  });
}

/**
 * Togle active
 */
export function useTogleActiveQuotationGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await togleActiveQuotationGroup(id);
      if (!response.success) {
        throw new Error(response.error || "Error al activar/desactivar grupo de cotizaciones");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUOTATION_GROUP_KEYS.lists() });
      toast.success("Grupo de cotizaciones activado correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al activar/desactivar grupo de cotizaciones");
    },
  });
}
