"use client";

import { useEffect } from "react";
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
  updateCustomSections,
  updateMedicalRecordDetails,
  uploadAptitudeCertificate,
  uploadMedicalReport,
} from "../_actions/medical-record.action";
import { MedicalRecordCreate, UpdateCustomSections, UpdateMedicalRecordDetails } from "../_types/medical-record.types";

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

/**
 * Hook para obtener y actualizar los detalles de un registro médico
 */
export function useMedicalRecordDetails(id: string) {
  const queryClient = useQueryClient();

  console.log(`🔍 Obteniendo detalles del registro médico con ID: ${id}`);

  // Reutilizamos el hook existente para obtener los datos del registro médico
  const { data, isLoading, error } = useMedicalRecord(id);

  // Log cuando los datos cambian
  useEffect(() => {
    if (data) {
      console.log(`✅ Datos del registro médico obtenidos:`, JSON.stringify(data).substring(0, 200) + "...");
      console.log(`📋 customData disponible:`, data.customData ? "Sí" : "No");
      console.log(`🔢 Tipo de customData:`, typeof data.customData);
    } else if (error) {
      console.error(`❌ Error al obtener datos del registro médico:`, error);
    }
  }, [data, error]);

  // Creamos una mutación para actualizar los detalles del registro médico
  const updateMedicalRecord = useMutation({
    mutationFn: async ({ id, details }: { id: string; details: UpdateMedicalRecordDetails }) => {
      console.log(`📤 Enviando actualización para registro médico ${id}`);
      const response = await updateMedicalRecordDetails(id, details);
      if (!response.success) {
        console.error(`❌ Error en la respuesta del servidor:`, response.error);
        throw new Error(response.error || "Error al actualizar detalles del registro médico");
      }
      console.log(`📥 Respuesta exitosa del servidor:`, JSON.stringify(response.data).substring(0, 200) + "...");
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidamos la consulta para forzar una recarga de los datos
      console.log(`🔄 Invalidando consulta para forzar recarga de datos del registro ${variables.id}`);
      queryClient.invalidateQueries({ queryKey: MEDICAL_RECORDS_KEYS.detail(variables.id) });
      toast.success("Detalles del registro médico actualizados correctamente");
    },
    onError: (error: Error) => {
      console.error(`❌ Error en la mutación:`, error);
      toast.error(error.message || "Error al actualizar detalles del registro médico");
    },
  });

  return {
    data,
    isLoading,
    error,
    updateMedicalRecord,
  };
}

/**
 * Hook para actualizar las secciones personalizadas de un registro médico
 */
export function useUpdateCustomSections() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, customSections }: { id: string; customSections: UpdateCustomSections }) => {
      console.log(`📤 Enviando actualización de secciones personalizadas para registro médico ${id}`);
      const response = await updateCustomSections(id, customSections);
      if (!response.success) {
        console.error(`❌ Error en la respuesta del servidor:`, response.error);
        throw new Error(response.error || "Error al actualizar secciones personalizadas");
      }
      console.log(`📥 Respuesta exitosa del servidor:`, JSON.stringify(response.data).substring(0, 200) + "...");
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidamos la consulta para forzar una recarga de los datos
      console.log(`🔄 Invalidando consulta para forzar recarga de datos del registro ${variables.id}`);
      queryClient.invalidateQueries({ queryKey: MEDICAL_RECORDS_KEYS.detail(variables.id) });
      toast.success("Secciones personalizadas actualizadas correctamente");
    },
    onError: (error: Error) => {
      console.error(`❌ Error en la mutación:`, error);
      toast.error(error.message || "Error al actualizar secciones personalizadas");
    },
  });
}
