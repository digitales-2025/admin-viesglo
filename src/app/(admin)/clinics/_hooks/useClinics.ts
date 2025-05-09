"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createClinic,
  deleteClinic,
  getClinic,
  getClinics,
  toggleActiveClinic,
  updateClinic,
} from "../_actions/clinics.actions";
import { ClinicCreate, ClinicUpdate } from "../_types/clinics.types";

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
 * Hook para obtener una clínica por ID
 */
export function useClinic(id: string | undefined) {
  // Debugging

  return useQuery({
    queryKey: CLINICS_KEYS.detail(id || "unknown"),
    queryFn: async () => {
      // Validar que existe un ID válido
      if (!id) {
        console.error("Se intentó obtener una clínica sin proporcionar un ID");
        throw new Error("ID de clínica no proporcionado");
      }

      const response = await getClinic(id);

      if (!response.success) {
        throw new Error(response.error || "Error al obtener clínica");
      }
      return response.data;
    },
    enabled: !!id, // Solo ejecutar si hay un ID
    retry: 1, // Limitar reintentos para evitar sobrecarga
  });
}

/**
 * Hook para crear una clínica
 */
export function useCreateClinic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ClinicCreate) => {
      const response = await createClinic(data);
      if (!response.success) {
        throw new Error(response.error || "Error al crear clínica");
      }
      return response.data;
    },
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
    mutationFn: async ({ id, data }: { id: string; data: Partial<ClinicUpdate> }) => {
      const response = await updateClinic(id, data);
      if (!response.success) {
        throw new Error(response.error || "Error al actualizar clínica");
      }
      return response.data;
    },
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
    mutationFn: async (id: string) => {
      const response = await deleteClinic(id);
      if (!response.success) {
        throw new Error(response.error || "Error al eliminar clínica");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLINICS_KEYS.lists() });
      toast.success("Clínica eliminada exitosamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar clínica");
    },
  });
}

/**
 * Hook para activar o desactivar una clínica
 */
export function useToggleActiveClinic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await toggleActiveClinic(id);
      if (!response.success) {
        throw new Error(response.error || "Error al activar o desactivar clínica");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLINICS_KEYS.lists() });
      toast.success("Clínica activada exitosamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al activar o desactivar clínica");
    },
  });
}
