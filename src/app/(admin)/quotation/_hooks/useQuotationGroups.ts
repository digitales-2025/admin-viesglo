"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createQuotationGroup,
  deleteQuotationGroup,
  getQuotationGroupById,
  getQuotationGroups,
  updateQuotationGroup,
} from "../_actions/quotation-group.action";
import { QuotationGroupCreate, QuotationGroupUpdate } from "../_types/quotation.types";

export const QUOTATION_GROUP_KEY = {
  all: ["quotation-group"] as const,
  lists: () => [...QUOTATION_GROUP_KEY.all, "list"] as const,
  details: (id: string) => [...QUOTATION_GROUP_KEY.all, "detail", id] as const,
};

/**
 * Hook para obtener todas las cotizaciones agrupadas
 */
export const useQuotationGroups = () => {
  return useQuery({
    queryKey: QUOTATION_GROUP_KEY.lists(),
    queryFn: async () => {
      const { data, error, success } = await getQuotationGroups();
      if (!success) {
        throw new Error(error);
      }
      return data;
    },
  });
};

/**
 * Hook para obtener una cotización agrupada por su ID
 */
export const useQuotationGroupById = (id: string) => {
  return useQuery({
    queryKey: QUOTATION_GROUP_KEY.details(id),
    queryFn: async () => {
      const { data, error, success } = await getQuotationGroupById(id);
      if (!success) {
        throw new Error(error);
      }
      return data;
    },
  });
};

/**
 * Hook para crear una cotización agrupada
 */
export const useCreateQuotationGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (quotationGroup: QuotationGroupCreate) => {
      const { data, error, success } = await createQuotationGroup(quotationGroup);
      if (!success) {
        throw new Error(error);
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUOTATION_GROUP_KEY.lists() });
      toast.success("Cotización agrupada creada correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al crear la cotización agrupada");
    },
  });
};

/**
 * Hook para actualizar una cotización agrupada
 */
export const useUpdateQuotationGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (quotationGroup: QuotationGroupUpdate) => {
      const { data, error, success } = await updateQuotationGroup(quotationGroup);
      if (!success) {
        throw new Error(error);
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUOTATION_GROUP_KEY.lists() });
      toast.success("Cotización agrupada actualizada correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar la cotización agrupada");
    },
  });
};

/**
 * Hook para eliminar una cotización agrupada
 */
export const useDeleteQuotationGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error, success } = await deleteQuotationGroup(id);
      if (!success) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUOTATION_GROUP_KEY.lists() });
      toast.success("Grupo de cotizacion eliminado correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar el grupo de cotizaciones");
    },
  });
};
