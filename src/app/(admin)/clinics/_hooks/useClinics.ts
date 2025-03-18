"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createClinic, deleteClinic, getClinics, updateClinic } from "../_actions/clinics.actions";
import { ClinicUpdate } from "../_types/clinics.types";

export const CLINICS_KEYS = {
  all: ["clinics"] as const,
  lists: () => [...CLINICS_KEYS.all, "list"] as const,
  list: (filters: string) => [...CLINICS_KEYS.lists(), { filters }] as const,
  detail: (id: string) => [...CLINICS_KEYS.all, id] as const,
};

/**
 * Hook para obtener todas las clínicas
 */
export function useClinics() {
  return useQuery({
    queryKey: CLINICS_KEYS.lists(),
    queryFn: async () => {
      const response = await getClinics();
      if (!response.success) {
        throw new Error(response.error || "Error al obtener clínicas");
      }
      return response.data;
    },
  });
}

/**
 * Hook para crear una clínica
 */
export function useCreateClinic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createClinic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLINICS_KEYS.lists() });
      toast.success("Clínica creada exitosamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al crear clínica");
    },
  });
}

/**
 * Hook para actualizar una clínica
 */
export function useUpdateClinic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ClinicUpdate> }) => updateClinic(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLINICS_KEYS.lists() });
      toast.success("Clínica actualizada exitosamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar clínica");
    },
  });
}

/**
 * Hook para eliminar una clínica
 */
export function useDeleteClinic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteClinic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLINICS_KEYS.lists() });
      toast.success("Clínica eliminada exitosamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar clínica");
    },
  });
}
