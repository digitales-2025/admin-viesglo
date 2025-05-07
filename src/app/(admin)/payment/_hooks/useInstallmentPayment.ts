"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createInstallmentPayment,
  deleteInstallmentPayment,
  getInstallmentPayments,
  toggleInstallmentPayment,
  updateInstallmentPayment,
} from "../_actions/installment-payment.action";
import { InstallmentPaymentCreate, InstallmentPaymentUpdate } from "../_types/installment-payment.types";

export const INSTALLMENT_PAYMENT_KEYS = {
  all: ["installment-payments"] as const,
  lists: () => [...INSTALLMENT_PAYMENT_KEYS.all, "list"] as const,
  list: (filters: string) => [...INSTALLMENT_PAYMENT_KEYS.lists(), { filters }] as const,
  detail: (id: string) => [...INSTALLMENT_PAYMENT_KEYS.all, id] as const,
};

/**
 * Hook para obtener todos los pagos de cuotas
 */
export function useInstallmentPayments(paymentId: string) {
  return useQuery({
    queryKey: INSTALLMENT_PAYMENT_KEYS.list(paymentId),
    queryFn: async () => {
      const response = await getInstallmentPayments(paymentId);
      if (!response.success) {
        throw new Error(response.error || "Error al obtener pagos de cuotas");
      }
      return response.data;
    },
  });
}

/**
 * Hook para crear un pago de cuota
 */
export function useCreateInstallmentPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ paymentId, data }: { paymentId: string; data: InstallmentPaymentCreate }) => {
      const response = await createInstallmentPayment(paymentId, data);
      if (!response.success) {
        throw new Error(response.error || "Error al crear pago de cuota");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INSTALLMENT_PAYMENT_KEYS.lists() });
      toast.success("Pago de cuota creado correctamente");
    },
    onError: (error) => {
      toast.error(error.message || "Error al crear pago de cuota");
    },
  });
}

/**
 * Hook para actualizar un pago de cuota
 */
export function useUpdateInstallmentPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: InstallmentPaymentUpdate }) => {
      const response = await updateInstallmentPayment(id, data);
      if (!response.success) {
        throw new Error(response.error || "Error al actualizar pago de cuota");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INSTALLMENT_PAYMENT_KEYS.lists() });
      toast.success("Pago de cuota actualizado correctamente");
    },
    onError: (error) => {
      toast.error(error.message || "Error al actualizar pago de cuota");
    },
  });
}

/**
 * Hook para eliminar un pago de cuota
 */
export function useDeleteInstallmentPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await deleteInstallmentPayment(id);
      if (!response.success) {
        throw new Error(response.error || "Error al eliminar pago de cuota");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INSTALLMENT_PAYMENT_KEYS.lists() });
      toast.success("Pago de cuota eliminado correctamente");
    },
    onError: (error) => {
      toast.error(error.message || "Error al eliminar pago de cuota");
    },
  });
}

/**
 * Hook para reactivar o desactivar un pago de cuota
 */
export function useToggleInstallmentPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await toggleInstallmentPayment(id);
      if (!response.success) {
        throw new Error(response.error || "Error al reactivar o desactivar pago de cuota");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INSTALLMENT_PAYMENT_KEYS.lists() });
      toast.success("Pago de cuota reactivado o desactivado correctamente");
    },
    onError: (error) => {
      toast.error(error.message || "Error al reactivar o desactivar pago de cuota");
    },
  });
}
