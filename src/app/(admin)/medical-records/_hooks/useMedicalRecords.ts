"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createMedicalRecord,
  downloadAptitudeCertificate,
  downloadMedicalReport,
  getAptitudeCertificateInfo,
  getMedicalRecord,
  getMedicalRecords,
  getMedicalReportInfo,
  uploadAptitudeCertificate,
  uploadMedicalReport,
} from "../_actions/medical-record.action";
import { MedicalRecordCreate } from "../_types/medical-record.types";

export const MEDICAL_RECORDS_KEYS = {
  all: ["medical-records"] as const,
  lists: () => [...MEDICAL_RECORDS_KEYS.all, "list"] as const,
  list: (filters: string) => [...MEDICAL_RECORDS_KEYS.lists(), { filters }] as const,
  detail: (id: string) => [...MEDICAL_RECORDS_KEYS.all, id] as const,
};

/**
 * Hook para obtener todos los registros médicos
 */
export function useMedicalRecords(clientId?: string) {
  return useQuery({
    queryKey: clientId ? MEDICAL_RECORDS_KEYS.list(`clientId=${clientId}`) : MEDICAL_RECORDS_KEYS.lists(),
    queryFn: async () => {
      const response = await getMedicalRecords(clientId);
      if (!response.success) {
        throw new Error(response.error || "Error al obtener registros médicos");
      }
      return response.data;
    },
  });
}

/**
 * Hook para obtener un registro médico por su ID
 */
export function useMedicalRecord(id: string) {
  return useQuery({
    queryKey: MEDICAL_RECORDS_KEYS.detail(id),
    queryFn: async () => {
      const response = await getMedicalRecord(id);
      if (!response.success) {
        throw new Error(response.error || "Error al obtener registro médico");
      }
      return response.data;
    },
  });
}

/**
 * Hook para crear un registro médico
 */
export function useCreateMedicalRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (medicalRecord: MedicalRecordCreate) => {
      const response = await createMedicalRecord(medicalRecord);
      if (!response.success) {
        throw new Error(response.error || "Error al crear registro médico");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEDICAL_RECORDS_KEYS.lists() });
      toast.success("Registro médico creado exitosamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al crear registro médico");
    },
  });
}

/**
 * Hook para obtener información del certificado de aptitud médica
 */
export function useAptitudeCertificateInfo(id: string) {
  return useQuery({
    queryKey: [...MEDICAL_RECORDS_KEYS.detail(id), "aptitude-certificate-info"],
    queryFn: async () => {
      const response = await getAptitudeCertificateInfo(id);
      if (!response.success) {
        throw new Error(response.error || "Error al obtener información del certificado");
      }
      return response.data;
    },
  });
}

/**
 * Hook para obtener información del informe médico
 */
export function useMedicalReportInfo(id: string) {
  return useQuery({
    queryKey: [...MEDICAL_RECORDS_KEYS.detail(id), "medical-report-info"],
    queryFn: async () => {
      const response = await getMedicalReportInfo(id);
      if (!response.success) {
        throw new Error(response.error || "Error al obtener información del informe médico");
      }
      return response.data;
    },
  });
}

/**
 * Hook para subir o reemplazar el certificado de aptitud médica
 */
export function useUploadAptitudeCertificate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      const response = await uploadAptitudeCertificate(id, file);
      if (!response.success) {
        throw new Error(response.error || "Error al subir el certificado de aptitud médica");
      }
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...MEDICAL_RECORDS_KEYS.detail(variables.id), "aptitude-certificate-info"],
      });
      toast.success("Certificado de aptitud médica subido exitosamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al subir el certificado de aptitud médica");
    },
  });
}

/**
 * Hook para subir o reemplazar el informe médico
 */
export function useUploadMedicalReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      const response = await uploadMedicalReport(id, file);
      if (!response.success) {
        throw new Error(response.error || "Error al subir el informe médico");
      }
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...MEDICAL_RECORDS_KEYS.detail(variables.id), "medical-report-info"],
      });
      toast.success("Informe médico subido exitosamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al subir el informe médico");
    },
  });
}

/**
 * Hook para descargar el certificado de aptitud médica
 */
export function useDownloadAptitudeCertificate() {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await downloadAptitudeCertificate(id);
      if (!response.success) {
        toast.error("Error al obtener documento");
        return response;
      }
      return response;
    },
    onSuccess: (response) => {
      if (response.success && response.data && response.filename) {
        const url = window.URL.createObjectURL(response.data);
        const a = document.createElement("a");
        a.href = url;
        a.download = response.filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        toast.success("Documento obtenido correctamente");
      }
    },
  });
}

/**
 * Hook para descargar el informe médico
 */
export function useDownloadMedicalReport() {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await downloadMedicalReport(id);
      if (!response.success) {
        toast.error("Error al obtener documento");
        return response;
      }
      return response;
    },
    onSuccess: (response) => {
      if (response.success && response.data && response.filename) {
        const url = window.URL.createObjectURL(response.data);
        const a = document.createElement("a");
        a.href = url;
        a.download = response.filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        toast.success("Documento obtenido correctamente");
      }
    },
  });
}
