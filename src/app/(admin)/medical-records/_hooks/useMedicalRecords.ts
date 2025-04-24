"use client";

import { useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useCurrentUser } from "@/app/(auth)/sign-in/_hooks/useAuth";
import {
  addDiagnostic,
  createMedicalRecord,
  deleteDiagnostic,
  deleteMedicalRecord,
  downloadAptitudeCertificate,
  downloadMedicalReport,
  getAllMedicalCategories,
  getAptitudeCertificateInfo,
  getDiagnostics,
  getMedicalRecord,
  getMedicalRecords,
  getMedicalReportInfo,
  updateCustomSections,
  updateMedicalRecord,
  updateMedicalRecordDetails,
  uploadAptitudeCertificate,
  uploadMedicalReport,
} from "../_actions/medical-record.action";
import {
  CategoriesList,
  CreateDiagnostic,
  MedicalRecordsFilter,
  MedicalRecordUpdate,
  UpdateCustomSections,
  UpdateMedicalRecordDetails,
} from "../_types/medical-record.types";

export const MEDICAL_RECORDS_KEYS = {
  all: ["medical-records"] as const,
  lists: () => [...MEDICAL_RECORDS_KEYS.all, "list"] as const,
  list: (filters: MedicalRecordsFilter) => [...MEDICAL_RECORDS_KEYS.lists(), { filters }] as const,
  detail: (id: string) => [...MEDICAL_RECORDS_KEYS.all, id] as const,
  diagnostics: (id: string) => [...MEDICAL_RECORDS_KEYS.detail(id), "diagnostics"] as const,
  medicalCategories: () => [...MEDICAL_RECORDS_KEYS.all, "categories"] as const,
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

    if (filters && (filters.categoryId || filters.conditionId || filters.clientId)) {
      console.log(`🔄 Hook useMedicalRecords - filtros activos:`, JSON.stringify(filters, null, 2));
    }
  }, [filters]);

  return useQuery({
    // Incluimos los filtros en la query key para que React Query detecte cambios
    queryKey: [...MEDICAL_RECORDS_KEYS.list(filters || {})],
    queryFn: async () => {
      // Usamos la referencia actual de los filtros para asegurarnos de usar los más recientes
      const currentFilters = filtersRef.current;
      console.log(`🔍 Ejecutando consulta de registros médicos con filtros:`, JSON.stringify(currentFilters, null, 2));
      const response = await getMedicalRecords(currentFilters);
      if (!response.success) {
        console.error(`❌ Error en consulta de registros médicos:`, response.error);
        throw new Error(response.error || "Error al obtener registros médicos");
      }
      console.log(`✅ Consulta exitosa - Registros obtenidos: ${response.data.length}`);
      return response.data;
    },

    // Asegurarnos de que se actualice cuando cambie el ID de usuario
    enabled: !!_userId,
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
      queryClient.invalidateQueries({
        queryKey: [...MEDICAL_RECORDS_KEYS.detail(variables.id)],
      });
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
      queryClient.invalidateQueries({
        queryKey: [...MEDICAL_RECORDS_KEYS.detail(variables.id)],
      });
    },
    onError: (error: Error) => {
      console.error(`❌ Error en la mutación:`, error);
      toast.error(error.message || "Error al actualizar secciones personalizadas");
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
 * Hook para obtener todas las categorías médicas y sus condiciones
 */
export function useMedicalCategories() {
  return useQuery<CategoriesList>({
    queryKey: [...MEDICAL_RECORDS_KEYS.medicalCategories()],
    queryFn: async () => {
      const response = await getAllMedicalCategories();
      if (!response.success) {
        throw new Error(response.error || "Error al obtener categorías médicas");
      }
      return response.data as CategoriesList;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}
