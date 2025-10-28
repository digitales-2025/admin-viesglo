"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  concreteQuotation,
  createQuotation,
  deleteQuotation,
  getQuotation,
  getQuotations,
  getQuotationsForStats,
  updateQuotation,
} from "../_actions/quotation.action";
import {
  PaginatedQuotationResponse,
  QuotationConcrete,
  QuotationCreate,
  QuotationFilters,
  QuotationResponse,
  QuotationUpdate,
} from "../_types/quotation.types";
import { PAYMENTS_KEYS } from "../../payment/_hooks/usePayments";

export const QUOTATIONS_KEYS = {
  all: ["quotations"] as const,
  lists: () => [...QUOTATIONS_KEYS.all, "list"] as const,
  list: (filters: QuotationFilters = {}) => [...QUOTATIONS_KEYS.lists(), { filters }] as const,
  detail: (id: string) => [...QUOTATIONS_KEYS.all, id] as const,
  stats: (filters: QuotationFilters = {}) => [...QUOTATIONS_KEYS.list(), { filters }] as const,
};

/**
 * Hook para obtener todas las cotizaciones con filtros opcionales
 */
export function useQuotations(filters?: QuotationFilters) {
  return useQuery({
    queryKey: QUOTATIONS_KEYS.list(filters),
    queryFn: async () => {
      const response = await getQuotations(filters);
      if (!response.success) {
        throw new Error(response.error || "Error al obtener cotizaciones");
      }
      return {
        data: response.data,
        meta: response.meta,
      } as {
        data: QuotationResponse[];
        meta: PaginatedQuotationResponse["meta"];
      };
    },
  });
}

/**
 * Hook para obtener una cotización por su ID
 */
export function useQuotation(id: string) {
  return useQuery({
    queryKey: QUOTATIONS_KEYS.detail(id),
    queryFn: async () => {
      const response = await getQuotation(id);
      if (!response.success) {
        throw new Error(response.error || "Error al obtener cotización");
      }
      return response.data;
    },
  });
}

/**
 * Hook para crear una cotización
 */
export function useCreateQuotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (quotation: QuotationCreate) => {
      const response = await createQuotation(quotation);
      if (!response.success) {
        throw new Error(response.error || "Error al crear cotización");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUOTATIONS_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: QUOTATIONS_KEYS.stats() });
      toast.success("Cotización creada exitosamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al crear cotización");
    },
  });
}

/**
 * Hook para actualizar una cotización
 */
export function useUpdateQuotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: QuotationUpdate }) => {
      const response = await updateQuotation(id, data);
      if (!response.success) {
        throw new Error(response.error || "Error al actualizar cotización");
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUOTATIONS_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: QUOTATIONS_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: QUOTATIONS_KEYS.stats() });
      toast.success("Cotización actualizada exitosamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar cotización");
    },
  });
}

/**
 * Hook para eliminar una cotización
 */
export function useDeleteQuotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await deleteQuotation(id);
      if (!response.success) {
        throw new Error(response.error || "Error al eliminar cotización");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUOTATIONS_KEYS.all });
      queryClient.invalidateQueries({ queryKey: QUOTATIONS_KEYS.stats() });
      toast.success("Cotización eliminada exitosamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar cotización");
    },
  });
}

/**
 * Hook para concretar una cotización
 */
export function useConcreteQuotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: QuotationConcrete }) => {
      const response = await concreteQuotation(id, data);
      if (!response.success) {
        throw new Error(response.error || "Error al concretar cotización");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUOTATIONS_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PAYMENTS_KEYS.all });
      toast.success("Cotización concretada exitosamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al concretar cotización");
    },
  });
}

/**
 * Hook para obtener todas las cook para obtener oasdestadísticasas las cotizaciones para las estadísticas
 */
export function useQuotationsForStats(filters?: QuotationFilters) {
  return useQuery({
    queryKey: QUOTATIONS_KEYS.stats(filters),
    queryFn: async () => {
      const response = await getQuotationsForStats(filters);
      if (!response.success) {
        throw new Error(response.error || "Error al obtener cotizaciones para las estadísticas");
      }
      return response.data;
    },
  });
}
