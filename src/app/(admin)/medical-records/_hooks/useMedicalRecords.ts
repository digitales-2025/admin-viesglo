"use client";

import { useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useCurrentUser } from "@/app/(auth)/sign-in/_hooks/useAuth";
import {
  addDiagnostic,
  addDiagnosticValue,
  addMultipleDiagnostics,
  createMedicalRecord,
  deleteDiagnostic,
  deleteMedicalRecord,
  downloadAptitudeCertificate,
  downloadMedicalReport,
  getAptitudeCertificateInfo,
  getDiagnostics,
  getMedicalRecord,
  getMedicalRecords,
  getMedicalReportInfo,
  updateDiagnosticValueName,
  updateMedicalRecord,
  uploadAptitudeCertificate,
  uploadMedicalReport,
} from "../_actions/medical-record.action";
import { CreateDiagnostic, MedicalRecordsFilter, MedicalRecordUpdate } from "../_types/medical-record.types";

export const MEDICAL_RECORDS_KEYS = {
  all: ["medical-records"] as const,
  lists: () => [...MEDICAL_RECORDS_KEYS.all, "list"] as const,
  list: (filters: MedicalRecordsFilter) => [...MEDICAL_RECORDS_KEYS.lists(), { filters }] as const,
  detail: (id: string) => [...MEDICAL_RECORDS_KEYS.all, id] as const,
  diagnostics: (id: string) => [...MEDICAL_RECORDS_KEYS.detail(id), "diagnostics"] as const,
};

/**
 * Hook para obtener todos los registros médicos
 */
export function useMedicalRecords(filters?: MedicalRecordsFilter) {
  // Obtener el ID del usuario actual para incluirlo en la clave de consulta
  const { data: currentUser } = useCurrentUser();
  const _userId = currentUser?.id;

  // Mantenemos una referencia actualizada a los filtros
  const filtersRef = useRef(filters);

  // Actualizamos la referencia cuando cambian los filtros
  useEffect(() => {
    filtersRef.current = filters;

    if (filters && filters.clientId) {
      console.log(`🔄 Hook useMedicalRecords - filtros activos:`, JSON.stringify(filters, null, 2));
    }
  }, [filters]);

  return useQuery({
    // Incluimos los filtros en la query key para que React Query detecte cambios
    queryKey: [...MEDICAL_RECORDS_KEYS.list(filters || {})],
    queryFn: async () => {
      try {
        // Usamos la referencia actual de los filtros para asegurarnos de usar los más recientes
        const currentFilters = filtersRef.current;
        console.log(
          `🔍 Ejecutando consulta de registros médicos con filtros:`,
          JSON.stringify(currentFilters, null, 2)
        );
        const response = await getMedicalRecords(currentFilters);
        if (!response.success) {
          console.error(`❌ Error en consulta de registros médicos:`, response.error);
          throw new Error(response.error || "Error al obtener registros médicos");
        }
        console.log(`✅ Consulta exitosa - Registros obtenidos: ${response.data.length}`);
        return response.data;
      } catch (error) {
        console.error("Error en useMedicalRecords:", error);
        throw error;
      }
    },

    // Asegurarnos de que se actualice cuando cambie el ID de usuario
    enabled: !!_userId,

    // Agregar reintentos para manejar problemas temporales de red
    retry: 2,

    // Mostrar datos obsoletos mientras se recarga
    staleTime: 5 * 60 * 1000, // 5 minutos
    placeholderData: (oldData) => oldData, // Usar datos previos como placeholder mientras se carga
  });
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

      console.log(`📄 Respuesta del servidor:`, response.downloadUrl);

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
          console.error("Error al descargar archivo", error);
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

      console.log(`📄 Respuesta del servidor:`, response.downloadUrl);

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
          console.error("Error al descargar archivo", error);
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
      console.log(`📤 Enviando actualización para registro médico ${id}`);
      const response = await updateMedicalRecord(id, data);
      if (!response.success) {
        console.error(`❌ Error en la respuesta del servidor:`, response.error);
        throw new Error(response.error || "Error al actualizar registro médico");
      }
      console.log(`📥 Respuesta exitosa del servidor:`, JSON.stringify(response.data).substring(0, 200) + "...");
      return response.data;
    },
    onSuccess: (_, variables) => {
      console.log(`🔄 Invalidando consultas después de actualizar registro médico ${variables.id}`);
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
      console.error(`❌ Error en la mutación:`, error);
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
      console.log(`🗑️ Eliminando registro médico ${id}`);
      const response = await deleteMedicalRecord(id);
      if (!response.success) {
        console.error(`❌ Error en la respuesta del servidor:`, response.error);
        throw new Error(response.error || "Error al eliminar registro médico");
      }
      return response;
    },
    onSuccess: (_, id) => {
      console.log(`🔄 Invalidando consultas después de eliminar registro médico ${id}`);
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
      console.error(`❌ Error en la mutación:`, error);
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
      console.log(`➕ Agregando diagnóstico al registro médico ${id}`);
      const response = await addDiagnostic(id, diagnostic);
      if (!response.success) {
        console.error(`❌ Error en la respuesta del servidor:`, response.error);
        throw new Error(response.error || "Error al agregar diagnóstico");
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      console.log(`🔄 Invalidando consultas después de agregar diagnóstico al registro médico ${variables.id}`);
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
      console.error(`❌ Error en la mutación:`, error);
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
      console.log(`🗑️ Eliminando diagnóstico ${diagnosticId} del registro médico ${id}`);
      const response = await deleteDiagnostic(id, diagnosticId);
      if (!response.success) {
        console.error(`❌ Error en la respuesta del servidor:`, response.error);
        throw new Error(response.error || "Error al eliminar diagnóstico");
      }
      return response;
    },
    onSuccess: (_, variables) => {
      console.log(`🔄 Invalidando consultas después de eliminar diagnóstico del registro médico ${variables.id}`);
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
      console.error(`❌ Error en la mutación:`, error);
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
      console.log(`➕ (Hook) Agregando múltiples diagnósticos (${diagnostics.length}) al registro médico ${id}`);

      if (diagnostics.length === 0) {
        console.warn("⚠️ No hay diagnósticos para agregar");
        return [];
      }

      // Verificar estructura de diagnósticos antes de enviar
      diagnostics.forEach((diagnostic, index) => {
        if (!diagnostic.diagnosticId && !diagnostic.diagnosticValueId) {
          console.error(`❌ (Hook) Error: Diagnóstico #${index + 1} sin diagnosticId ni diagnosticValueId`);
        }
        if (!diagnostic.values) {
          const idUsado = diagnostic.diagnosticId || diagnostic.diagnosticValueId;
          console.warn(`⚠️ (Hook) Advertencia: Diagnóstico #${index + 1} (${idUsado}) sin valores`);
        }
      });

      console.log(`📊 (Hook) Datos a enviar:`, JSON.stringify({ diagnostics }, null, 2));

      const response = await addMultipleDiagnostics(id, diagnostics);
      if (!response.success) {
        console.error(`❌ Error en la respuesta del servidor:`, response.error);
        throw new Error(response.error || "Error al agregar diagnósticos");
      }
      console.log(
        `✅ Diagnósticos agregados con éxito. Respuesta:`,
        JSON.stringify(response.data).substring(0, 200) + "..."
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      console.log(`🔄 Invalidando consultas después de agregar diagnósticos al registro médico ${variables.id}`);

      // Invalidar absolutamente todas las consultas relacionadas para forzar una recarga completa

      // 1. Invalidar la consulta de diagnósticos específica
      queryClient.invalidateQueries({
        queryKey: [...MEDICAL_RECORDS_KEYS.diagnostics(variables.id)],
      });

      // 2. Invalidar los detalles del registro médico
      queryClient.invalidateQueries({
        queryKey: [...MEDICAL_RECORDS_KEYS.detail(variables.id)],
      });

      // 3. Invalidar también la lista de registros por si acaso
      queryClient.invalidateQueries({
        queryKey: [...MEDICAL_RECORDS_KEYS.lists()],
      });

      toast.success("Diagnósticos actualizados correctamente");
    },
    onError: (error: Error) => {
      console.error(`❌ Error en la mutación:`, error);
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
