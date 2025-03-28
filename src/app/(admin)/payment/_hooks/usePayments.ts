"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getPayment, getPayments, markPaymentStatus, updatePaymentStatus } from "../_actions/payment.action";
import { MarkPaymentStatus, UpdatePaymentStatus } from "../_types/payment.types";

export const PAYMENTS_KEYS = {
  all: ["payments"] as const,
  lists: () => [...PAYMENTS_KEYS.all, "list"] as const,
  list: (filters: string) => [...PAYMENTS_KEYS.lists(), { filters }] as const,
  detail: (id: string) => [...PAYMENTS_KEYS.all, id] as const,
};

/**
 * Hook para obtener todos los pagos
 */
export function usePayments() {
  return useQuery({
    queryKey: PAYMENTS_KEYS.lists(),
    queryFn: async () => {
      const response = await getPayments();
      if (!response.success) {
        throw new Error(response.error || "Error al obtener pagos");
      }
      return response.data;
    },
  });
}

/**
 * Hook para obtener un pago por su ID
 */
export function usePayment(id: string) {
  return useQuery({
    queryKey: PAYMENTS_KEYS.detail(id),
    queryFn: async () => {
      const response = await getPayment(id);
      if (!response.success) {
        throw new Error(response.error || "Error al obtener pago");
      }
      return response.data;
    },
  });
}

/**
 * Hook para actualizar el estado de un pago
 */
export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdatePaymentStatus }) => {
      const response = await updatePaymentStatus(id, data);
      if (!response.success) {
        throw new Error(response.error || "Error al actualizar estado del pago");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENTS_KEYS.all });
      toast.success("Estado del pago actualizado exitosamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar estado del pago");
    },
  });
}

/**
 * Hook para marcar el estado de un pago como pagado/no pagado
 */
export function useMarkPaymentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: MarkPaymentStatus }) => {
      const response = await markPaymentStatus(id, data);
      if (!response.success) {
        throw new Error(response.error || "Error al marcar estado del pago");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENTS_KEYS.all });
      toast.success("Estado del pago actualizado exitosamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al marcar estado del pago");
    },
  });
}
