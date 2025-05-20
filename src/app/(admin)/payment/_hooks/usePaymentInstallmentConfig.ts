"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createPaymentInstallmentConfig,
  deleteInstallmentPaymentConfig,
  getPaymentInstallmentConfig,
  updateInstallmentPaymentConfig,
} from "../_actions/payment-installment-config.action";
import { CreatePaymentInstallmentConfig, UpdatePaymentInstallmentConfig } from "../_types/installment-payment.types";

export const PAYMENT_INSTALLMENT_CONFIG_KEYS = {
  all: ["payment-installment-config"] as const,
  lists: () => [...PAYMENT_INSTALLMENT_CONFIG_KEYS.all, "list"] as const,
  list: (filters: string) => [...PAYMENT_INSTALLMENT_CONFIG_KEYS.lists(), { filters }] as const,
  detail: (id: string) => [...PAYMENT_INSTALLMENT_CONFIG_KEYS.all, id] as const,
};

/**
 * Hook para obtener la configuración de pagos de cuotas
 */
export function usePaymentInstallmentConfig(id: string) {
  return useQuery({
    queryKey: PAYMENT_INSTALLMENT_CONFIG_KEYS.detail(id),
    queryFn: async () => {
      const response = await getPaymentInstallmentConfig(id);
      if (!response.success) {
        throw new Error(response.error || "Error al obtener la configuración de pagos de cuotas");
      }
      return response.data;
    },
  });
}

/**
 * Hook para crear una nueva configuración de pagos de cuotas
 */
export function useCreatePaymentInstallmentConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ paymentId, data }: { paymentId: string; data: CreatePaymentInstallmentConfig }) => {
      const response = await createPaymentInstallmentConfig(paymentId, data);
      if (!response.success) {
        throw new Error(response.error || "Error al crear la configuración de pagos de cuotas");
      }
      return response.data;
    },
    onSuccess: (_, { paymentId }) => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_INSTALLMENT_CONFIG_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: PAYMENT_INSTALLMENT_CONFIG_KEYS.detail(paymentId) });
      queryClient.invalidateQueries({ queryKey: PAYMENT_INSTALLMENT_CONFIG_KEYS.all });
      toast.success("Configuración de pagos de cuotas creada correctamente");
    },
    onError: (error) => {
      toast.error(error.message || "Error al crear la configuración de pagos de cuotas");
    },
  });
}

/**
 * Hook para actualizar una configuración de pagos de cuotas
 */
export function useUpdatePaymentInstallmentConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
      paymentId: _,
    }: {
      id: string;
      data: UpdatePaymentInstallmentConfig;
      paymentId: string;
    }) => {
      const response = await updateInstallmentPaymentConfig(id, data);
      if (!response.success) {
        throw new Error(response.error || "Error al actualizar la configuración de pagos de cuotas");
      }
      return response.data;
    },
    onSuccess: (_, { id, paymentId }) => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_INSTALLMENT_CONFIG_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: PAYMENT_INSTALLMENT_CONFIG_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: PAYMENT_INSTALLMENT_CONFIG_KEYS.detail(paymentId) });
      queryClient.invalidateQueries({ queryKey: PAYMENT_INSTALLMENT_CONFIG_KEYS.all });
      toast.success("Configuración de pagos de cuotas actualizada correctamente");
    },
    onError: (error) => {
      toast.error(error.message || "Error al actualizar la configuración de pagos de cuotas");
    },
  });
}

/**
 * Hook para eliminar una configuración de pagos de cuotas
 */
export function useDeletePaymentInstallmentConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const response = await deleteInstallmentPaymentConfig(id);
      if (!response.success) {
        throw new Error(response.error || "Error al eliminar la configuración de pagos de cuotas");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_INSTALLMENT_CONFIG_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: PAYMENT_INSTALLMENT_CONFIG_KEYS.all });
      toast.success("Configuración de pagos de cuotas eliminada correctamente");
    },
    onError: (error) => {
      toast.error(error.message || "Error al eliminar la configuración de pagos de cuotas");
    },
  });
}
