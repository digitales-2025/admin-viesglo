"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createCertificate,
  deleteCertificate,
  getCertificate,
  getCertificateByCode,
  getCertificates,
  updateCertificate,
} from "../_actions/certificates.actions";

export const CERTIFICATES_KEYS = {
  all: ["certificates"] as const,
  lists: () => [...CERTIFICATES_KEYS.all, "list"] as const,
  list: (filters: string) => [...CERTIFICATES_KEYS.lists(), { filters }] as const,
  detail: (id: string) => [...CERTIFICATES_KEYS.all, id] as const,
};

/**
 * Hook para obtener todos los certificados
 */
export function useCertificates() {
  return useQuery({
    queryKey: CERTIFICATES_KEYS.lists(),
    queryFn: async () => {
      const response = await getCertificates();
      if (!response.success) {
        throw new Error(response.error || "Error al obtener certificados");
      }
      return response.data;
    },
  });
}

/**
 * Hook para crear un certificado
 */
export function useCreateCertificate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await createCertificate(formData);
      if (!response.success) {
        throw new Error(response.error || "Error al crear certificado");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CERTIFICATES_KEYS.lists() });
      toast.success("Certificado creado correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al crear certificado");
    },
  });
}

/**
 * Hook para actualizar un certificado
 */
export function useUpdateCertificate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
      const response = await updateCertificate(id, data);
      if (!response.success) {
        throw new Error(response.error || "Error al actualizar certificado");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CERTIFICATES_KEYS.lists() });
      toast.success("Certificado actualizado correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar certificado");
    },
  });
}

/**
 * Hook para eliminar un certificado
 */
export function useDeleteCertificate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await deleteCertificate(id);
      if (!response.success) {
        throw new Error(response.error || "Error al eliminar certificado");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CERTIFICATES_KEYS.lists() });
      toast.success("Certificado eliminado correctamente");
    },
    onError: () => {
      toast.error("Error al eliminar certificado");
    },
  });
}

/**
 * Hook para obtener un certificado por su código
 */
export function useGetCertificateByCode(code: string) {
  return useQuery({
    queryKey: CERTIFICATES_KEYS.detail(code),
    queryFn: async () => {
      const response = await getCertificateByCode(code);
      if (!response.success) {
        throw new Error(response.error || "Error al obtener certificado por código");
      }
      return response.data;
    },
  });
}

/**
 * Hook para obtener un certificado por su ID
 */
export function useGetCertificateById(id: string) {
  return useQuery({
    queryKey: CERTIFICATES_KEYS.detail(id),
    queryFn: async () => {
      const response = await getCertificate(id);
      if (!response.success) {
        throw new Error(response.error || "Error al obtener certificado por ID");
      }
      return response.data;
    },
  });
}
