"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useCurrentUser } from "@/app/(auth)/sign-in/_hooks/useAuth";
import {
  activateDiagnosticInSystem,
  addDiagnostic,
  addDiagnosticValue,
  addMultipleDiagnostics,
  createDiagnosticInSystem,
  createMedicalRecord,
  deactivateDiagnosticInSystem,
  deleteDiagnostic,
  deleteDiagnosticFromSystem,
  deleteMedicalRecord,
  downloadAptitudeCertificate,
  downloadMedicalReport,
  getActiveDiagnostics,
  getAllAvailableDiagnostics,
  getAllDiagnosticsForTable,
  getAptitudeCertificateInfo,
  getDiagnostics,
  getMedicalRecord,
  getMedicalRecords,
  getMedicalReportInfo,
  toggleIncludeReportsDiagnostic,
  updateDiagnosticInSystem,
  updateDiagnosticValueName,
  updateMedicalRecord,
  uploadAptitudeCertificate,
  uploadMedicalReport,
} from "../_actions/medical-record.action";
import {
  CreateDiagnostic,
  MedicalRecordsFilter,
  MedicalRecordUpdate,
  PaginationMeta,
  SystemCreateDiagnosticRequest,
  SystemUpdateDiagnosticRequest,
} from "../_types/medical-record.types";

export const MEDICAL_RECORDS_KEYS = {
  all: ["medical-records"] as const,
  lists: () => [...MEDICAL_RECORDS_KEYS.all, "list"] as const,
  list: (filters: MedicalRecordsFilter) => [...MEDICAL_RECORDS_KEYS.lists(), { filters }] as const,
  detail: (id: string) => [...MEDICAL_RECORDS_KEYS.all, id] as const,
  diagnostics: (id: string) => [...MEDICAL_RECORDS_KEYS.detail(id), "diagnostics"] as const,
  availableDiagnostics: () => [...MEDICAL_RECORDS_KEYS.all, "available-diagnostics"] as const,
  allDiagnostics: () => [...MEDICAL_RECORDS_KEYS.all, "all-diagnostics"] as const,
  activeDiagnostics: () => [...MEDICAL_RECORDS_KEYS.all, "active-diagnostics"] as const,
};

/**
 * Hook para obtener todos los registros médicos
 */
export function useMedicalRecords(filters?: MedicalRecordsFilter) {
  const { data: currentUser } = useCurrentUser();
  const _userId = currentUser?.id;

  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);

  const queryResult = useQuery({
    queryKey: [...MEDICAL_RECORDS_KEYS.list(filters || { page: 1, limit: 10 })],
    queryFn: async () => {
      try {
        const response = await getMedicalRecords(filters);
        if (!response.success) {
          throw new Error(response.error || "Error al obtener registros médicos");
        }

        if (response.meta) {
          setPaginationMeta(response.meta as PaginationMeta);
        }

        return response.data;
      } catch (error) {
        throw error;
      }
    },
    enabled: !!_userId,
    retry: 2,
    staleTime: 5 * 60 * 1000,
    placeholderData: (oldData) => oldData,
  });

  return {
    ...queryResult,
    paginationMeta,
  };
}

/**
 * Hook para obtener un registro médico por su ID
 */
export function useMedicalRecord(id: string) {
  // Obtener el ID del usuario actual para incluirlo en la clave de consulta
  const { data: currentUser } = useCurrentUser();
  const _userId = currentUser?.id;

  return useQuery({
    queryKey: [...MEDICAL_RECORDS_KEYS.detail(id)],
    queryFn: async () => {
      const response = await getMedicalRecord(id);
      if (!response.success) {
        throw new Error(response.error || "Error al obtener registro médico");
      }
      return response.data;
    },
    // refetchOnMount: true,
    // refetchOnWindowFocus: true,
  });
}

/**
 * Hook para crear un registro médico
 */
export function useCreateMedicalRecord() {
  const queryClient = useQueryClient();
  // Obtener el ID del usuario actual
  const { data: currentUser } = useCurrentUser();
  const _userId = currentUser?.id;

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await createMedicalRecord(formData as any);
      if (!response.success) {
        throw new Error(response.error || "Error al crear registro médico");
      }
      return response.data;
    },
    onSuccess: () => {
      // Invalidamos la lista de registros médicos
      queryClient.invalidateQueries({
        queryKey: [...MEDICAL_RECORDS_KEYS.lists()],
      });
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
        throw new Error(response.error || "Error al descargar evidencia");
      }

      // Si tenemos una URL de descarga, forzamos la descarga directa
      if (response.downloadUrl) {
        try {
          // Realiza una petición fetch al endpoint de descarga
          const downloadResponse = await fetch(response.downloadUrl, {
            method: "GET",
            credentials: "include", // Importante para que las cookies se envíen con la solicitud
          });

          if (!downloadResponse.ok) {
            throw new Error("Error al obtener el archivo para descargar");
          }

          // Obtener el blob de la respuesta
          const blob = await downloadResponse.blob();

          // Crear una URL para el blob
          const url = window.URL.createObjectURL(blob);

          // Crear un enlace invisible para la descarga
          const link = document.createElement("a");
          link.style.display = "none";
          link.href = url;
          // Usar el nombre de archivo proporcionado por el servidor, o un nombre por defecto
          link.download = response.filename || "evidence";

          // Añadir el enlace al documento, hacer clic y eliminarlo
          document.body.appendChild(link);
          link.click();

          // Limpiar recursos después de un breve retraso
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);
          }, 100);

          // Mostrar mensaje de éxito
          toast.success("Certificado de aptitud médica descargado correctamente");
        } catch (error) {
          toast.error("Error al descargar el archivo");
          throw error;
        }
      } else {
        // Si no hay URL de descarga
        toast.success("Archivo procesado correctamente");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Error al descargar evidencia");
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
        throw new Error(response.error || "Error al descargar evidencia");
      }

      // Si tenemos una URL de descarga, forzamos la descarga directa
      if (response.downloadUrl) {
        try {
          // Realiza una petición fetch al endpoint de descarga
          const downloadResponse = await fetch(response.downloadUrl, {
            method: "GET",
            credentials: "include", // Importante para que las cookies se envíen con la solicitud
          });

          if (!downloadResponse.ok) {
            throw new Error("Error al obtener el archivo para descargar");
          }

          // Obtener el blob de la respuesta
          const blob = await downloadResponse.blob();

          // Crear una URL para el blob
          const url = window.URL.createObjectURL(blob);

          // Crear un enlace invisible para la descarga
          const link = document.createElement("a");
          link.style.display = "none";
          link.href = url;
          // Usar el nombre de archivo proporcionado por el servidor, o un nombre por defecto
          link.download = response.filename || "evidence";

          // Añadir el enlace al documento, hacer clic y eliminarlo
          document.body.appendChild(link);
          link.click();

          // Limpiar recursos después de un breve retraso
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);
          }, 100);

          // Mostrar mensaje de éxito
          toast.success("Certificado de aptitud médica descargado correctamente");
        } catch (error) {
          toast.error("Error al descargar el archivo");
          throw error;
        }
      } else {
        // Si no hay URL de descarga
        toast.success("Archivo procesado correctamente");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Error al descargar evidencia");
    },
  });
}

/**
 * Hook para actualizar un registro médico
 */
export function useUpdateMedicalRecord() {
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();
  const _userId = currentUser?.id;

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: MedicalRecordUpdate }) => {
      const response = await updateMedicalRecord(id, data);
      if (!response.success) {
        throw new Error(response.error || "Error al actualizar registro médico");
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidar la consulta del registro específico
      queryClient.invalidateQueries({
        queryKey: [...MEDICAL_RECORDS_KEYS.detail(variables.id)],
      });
      // Invalidar la lista de registros
      queryClient.invalidateQueries({
        queryKey: [...MEDICAL_RECORDS_KEYS.lists()],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar registro médico");
    },
  });
}

/**
 * Hook para eliminar un registro médico
 */
export function useDeleteMedicalRecord() {
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();
  const _userId = currentUser?.id;

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await deleteMedicalRecord(id);
      if (!response.success) {
        throw new Error(response.error || "Error al eliminar registro médico");
      }
      return response;
    },
    onSuccess: (_, id) => {
      // Invalidar la consulta del registro específico
      queryClient.invalidateQueries({
        queryKey: [...MEDICAL_RECORDS_KEYS.detail(id)],
      });
      // Invalidar la lista de registros
      queryClient.invalidateQueries({
        queryKey: [...MEDICAL_RECORDS_KEYS.lists()],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar registro médico");
    },
  });
}

/**
 * Hook para obtener todos los diagnósticos de un registro médico
 */
export function useDiagnostics(id: string) {
  return useQuery({
    queryKey: [...MEDICAL_RECORDS_KEYS.diagnostics(id)],
    queryFn: async () => {
      const response = await getDiagnostics(id);
      if (!response.success) {
        throw new Error(response.error || "Error al obtener diagnósticos");
      }
      return response.data;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook para agregar un diagnóstico a un registro médico
 */
export function useAddDiagnostic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, diagnostic }: { id: string; diagnostic: CreateDiagnostic }) => {
      const response = await addDiagnostic(id, diagnostic);
      if (!response.success) {
        throw new Error(response.error || "Error al agregar diagnóstico");
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidar la consulta de diagnósticos del registro específico
      queryClient.invalidateQueries({
        queryKey: [...MEDICAL_RECORDS_KEYS.diagnostics(variables.id)],
      });
      // Invalidar la consulta del registro específico
      queryClient.invalidateQueries({
        queryKey: [...MEDICAL_RECORDS_KEYS.detail(variables.id)],
      });
      toast.success("Diagnóstico agregado correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al agregar diagnóstico");
    },
  });
}

/**
 * Hook para eliminar un diagnóstico de un registro médico
 */
export function useDeleteDiagnostic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, diagnosticId }: { id: string; diagnosticId: string }) => {
      const response = await deleteDiagnostic(id, diagnosticId);
      if (!response.success) {
        throw new Error(response.error || "Error al eliminar diagnóstico");
      }
      return response;
    },
    onSuccess: (_, variables) => {
      // Invalidar la consulta de diagnósticos del registro específico
      queryClient.invalidateQueries({
        queryKey: [...MEDICAL_RECORDS_KEYS.diagnostics(variables.id)],
      });
      // Invalidar la consulta del registro específico
      queryClient.invalidateQueries({
        queryKey: [...MEDICAL_RECORDS_KEYS.detail(variables.id)],
      });
      toast.success("Diagnóstico eliminado correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar diagnóstico");
    },
  });
}

/**
 * Hook para agregar múltiples diagnósticos a un registro médico
 */
export function useAddMultipleDiagnostics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, diagnostics }: { id: string; diagnostics: any[] }) => {
      if (diagnostics.length === 0) {
        return [];
      }

      const response = await addMultipleDiagnostics(id, diagnostics);
      if (!response.success) {
        throw new Error(response.error || "Error al agregar diagnósticos");
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...MEDICAL_RECORDS_KEYS.diagnostics(variables.id)],
      });
      queryClient.invalidateQueries({
        queryKey: [...MEDICAL_RECORDS_KEYS.detail(variables.id)],
      });
      queryClient.invalidateQueries({
        queryKey: [...MEDICAL_RECORDS_KEYS.lists()],
      });

      toast.success("Diagnósticos actualizados correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al agregar diagnósticos");
    },
  });
}

/**
 * Hook para agregar un valor de diagnóstico personalizado a un registro médico
 */
export function useAddDiagnosticValue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name, values }: { id: string; name: string; values: string[] }) => {
      const response = await addDiagnosticValue(id, name, values);
      if (!response.success) {
        throw new Error(response.error || "Error al agregar diagnóstico personalizado");
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidar consultas para forzar recargar los datos
      queryClient.invalidateQueries({
        queryKey: [...MEDICAL_RECORDS_KEYS.diagnostics(variables.id)],
      });
      queryClient.invalidateQueries({
        queryKey: [...MEDICAL_RECORDS_KEYS.detail(variables.id)],
      });
    },
  });
}

/**
 * Hook para actualizar el nombre de un valor de diagnóstico personalizado
 */
export function useUpdateDiagnosticValueName() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      diagnosticValueId,
      name,
    }: {
      diagnosticValueId: string;
      name: string;
      medicalRecordId: string;
    }) => {
      const response = await updateDiagnosticValueName(diagnosticValueId, name);
      if (!response.success) {
        throw new Error(response.error || "Error al actualizar el nombre del diagnóstico personalizado");
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidar consultas para forzar recargar los datos
      queryClient.invalidateQueries({
        queryKey: [...MEDICAL_RECORDS_KEYS.diagnostics(variables.medicalRecordId)],
      });
      queryClient.invalidateQueries({
        queryKey: [...MEDICAL_RECORDS_KEYS.detail(variables.medicalRecordId)],
      });
    },
  });
}

/**
 * Hook para obtener todos los diagnósticos disponibles para los filtros
 */
export function useAvailableDiagnostics() {
  return useQuery({
    queryKey: MEDICAL_RECORDS_KEYS.availableDiagnostics(),
    queryFn: async () => {
      const response = await getAllAvailableDiagnostics();
      if (!response.success) {
        throw new Error(response.error || "Error al obtener diagnósticos disponibles");
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // Cachear por 5 minutos
  });
}

/**
 * Hook para obtener todos los diagnósticos activos
 */
export function useActiveDiagnostics() {
  return useQuery({
    queryKey: MEDICAL_RECORDS_KEYS.activeDiagnostics(),
    queryFn: async () => {
      const response = await getActiveDiagnostics();
      if (!response.success) {
        throw new Error(response.error || "Error al obtener diagnósticos activos");
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // Cachear por 5 minutos
  });
}

/**
 * Hook para obtener todos los diagnósticos disponibles para los filtros
 */
export function useAllDiagnostics() {
  return useQuery({
    queryKey: MEDICAL_RECORDS_KEYS.allDiagnostics(),
    queryFn: async () => {
      const response = await getAllDiagnosticsForTable();
      if (!response.success) {
        throw new Error(response.error || "Error al obtener diagnósticos disponibles");
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // Cachear por 5 minutos
  });
}

/**
 * Hook para eliminar un diagnóstico del sistema
 */
export function useDeleteDiagnosticFromSystem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (diagnosticId: string) => {
      const response = await deleteDiagnosticFromSystem(diagnosticId);
      if (!response.success) {
        throw new Error(response.error || "Error al eliminar diagnóstico");
      }
      return response;
    },
    onSuccess: () => {
      // Invalidar la lista de diagnósticos disponibles
      queryClient.invalidateQueries({
        queryKey: MEDICAL_RECORDS_KEYS.availableDiagnostics(),
      });
      toast.success("Diagnóstico eliminado correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar diagnóstico");
    },
  });
}

/**
 * Hook para actualizar un diagnóstico en el sistema
 */
export function useUpdateDiagnosticInSystem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ diagnosticId, data }: { diagnosticId: string; data: SystemUpdateDiagnosticRequest }) => {
      const response = await updateDiagnosticInSystem(diagnosticId, data);
      if (!response.success) {
        throw new Error(response.error || "Error al actualizar diagnóstico");
      }
      return response.data;
    },
    onSuccess: () => {
      // Invalidar la lista de diagnósticos disponibles para que se refresque
      queryClient.invalidateQueries({
        queryKey: MEDICAL_RECORDS_KEYS.allDiagnostics(),
      });
      queryClient.invalidateQueries({
        queryKey: MEDICAL_RECORDS_KEYS.availableDiagnostics(),
      });
      toast.success("Diagnóstico actualizado correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar diagnóstico");
    },
  });
}

/**
 * Hook para crear un nuevo diagnóstico en el sistema
 */
export function useCreateDiagnosticInSystem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SystemCreateDiagnosticRequest) => {
      const response = await createDiagnosticInSystem(data);
      if (!response.success) {
        throw new Error(response.error || "Error al crear diagnóstico");
      }
      return response.data;
    },
    onSuccess: () => {
      // Invalidar la lista de diagnósticos disponibles
      queryClient.invalidateQueries({
        queryKey: MEDICAL_RECORDS_KEYS.allDiagnostics(),
      });
      toast.success("Diagnóstico creado correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al crear diagnóstico");
    },
  });
}

/**
 * Hook para activar un diagnóstico en el sistema
 */
export function useActivateDiagnosticInSystem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (diagnosticId: string) => {
      const response = await activateDiagnosticInSystem(diagnosticId);
      if (!response.success) {
        throw new Error(response.error || "Error al activar diagnóstico");
      }
      return response.data; // Devuelve el diagnóstico activado
    },
    onSuccess: (_data) => {
      // Invalidar la lista de diagnósticos disponibles para que se refresque
      queryClient.invalidateQueries({
        queryKey: MEDICAL_RECORDS_KEYS.allDiagnostics(),
      });
      queryClient.invalidateQueries({
        queryKey: MEDICAL_RECORDS_KEYS.availableDiagnostics(),
      });
      queryClient.invalidateQueries({
        queryKey: MEDICAL_RECORDS_KEYS.activeDiagnostics(),
      });

      toast.success("Diagnóstico activado correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al activar diagnóstico");
    },
  });
}

/**
 * Hook para desactivar un diagnóstico en el sistema
 */
export function useDeactivateDiagnosticInSystem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (diagnosticId: string) => {
      const response = await deactivateDiagnosticInSystem(diagnosticId);
      if (!response.success) {
        throw new Error(response.error || "Error al desactivar diagnóstico");
      }
      return response.data; // Devuelve el diagnóstico desactivado
    },
    onSuccess: () => {
      // Invalidar la lista de diagnósticos disponibles para que se refresque
      queryClient.invalidateQueries({
        queryKey: MEDICAL_RECORDS_KEYS.allDiagnostics(),
      });
      queryClient.invalidateQueries({
        queryKey: MEDICAL_RECORDS_KEYS.availableDiagnostics(),
      });
      toast.success("Diagnóstico desactivado correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al desactivar diagnóstico");
    },
  });
}

export function useToggleIncludeReportsDiagnostic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (diagnosticId: string) => {
      const response = await toggleIncludeReportsDiagnostic(diagnosticId);
      if (!response.success) {
        throw new Error(response.error || "Error al cambiar el estado de inclusión en informes");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: MEDICAL_RECORDS_KEYS.allDiagnostics(),
      });
      queryClient.invalidateQueries({
        queryKey: MEDICAL_RECORDS_KEYS.availableDiagnostics(),
      });
      toast.success("Diagnóstico actualizado correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al cambiar el estado de inclusión en informes");
    },
  });
}
