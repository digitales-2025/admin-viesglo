"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { AUDIT_KEYS } from "@/shared/actions/audit/useAudit";
import {
  createActivityProject,
  deleteActivityProject,
  deleteEvidence,
  downloadEvidence,
  getActivitiesProject,
  updateActivityProject,
  updateTrackingActivity,
  uploadEvidence,
} from "../_actions/activities-project.actions";
import { CreateProjectActivity, TrackingActivityDto, UpdateProjectActivity } from "../_types/tracking.types";
import { OBJECTIVES_PROJECT_KEYS } from "./useObjectivesProject";
import { PROJECT_KEYS } from "./useProject";
import { SERVICES_PROJECT_KEYS } from "./useServicesProject";

export const ACTIVITIES_PROJECT_KEYS = {
  all: ["activities-project"] as const,
  lists: () => [...ACTIVITIES_PROJECT_KEYS.all, "list"] as const,
  list: (filters: string) => [...ACTIVITIES_PROJECT_KEYS.lists(), { filters }] as const,
  detail: (id: string) => [...ACTIVITIES_PROJECT_KEYS.all, id] as const,
};

/**
 * Hook para obtener las actividades de un objetivo de proyecto
 */
export function useActivitiesProject(objectiveId: string) {
  return useQuery({
    queryKey: ACTIVITIES_PROJECT_KEYS.list(objectiveId),
    queryFn: async () => {
      const response = await getActivitiesProject(objectiveId);
      if (!response.success) {
        throw new Error(response.error || "Error al obtener actividades del proyecto");
      }
      return response.data;
    },
  });
}

/**
 * Hook para crear una actividad de un objetivo de proyecto
 */
export function useCreateActivityProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ objectiveId, activity }: { objectiveId: string; activity: CreateProjectActivity }) => {
      const response = await createActivityProject(objectiveId, activity);
      if (!response.success) {
        throw new Error(response.error || "Error al crear actividad del proyecto");
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ACTIVITIES_PROJECT_KEYS.list(variables.objectiveId) });
      queryClient.invalidateQueries({ queryKey: OBJECTIVES_PROJECT_KEYS.list(variables.objectiveId) });
      queryClient.invalidateQueries({ queryKey: OBJECTIVES_PROJECT_KEYS.detail(variables.objectiveId) });
      queryClient.invalidateQueries({ queryKey: OBJECTIVES_PROJECT_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: SERVICES_PROJECT_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: AUDIT_KEYS.list(variables.objectiveId) });
      toast.success("Actividad creada correctamente");
    },
    onError: (error) => {
      toast.error(error.message || "Error al crear actividad del proyecto");
    },
  });
}

/**
 * Hook para actualizar una actividad de un objetivo de proyecto
 */
export function useUpdateActivityProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      objectiveId: _,
      activityId,
      activity,
    }: {
      objectiveId: string;
      activityId: string;
      activity: UpdateProjectActivity;
    }) => {
      const response = await updateActivityProject(activityId, activity);
      if (!response.success) {
        throw new Error(response.error || "Error al actualizar actividad del proyecto");
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ACTIVITIES_PROJECT_KEYS.list(variables.objectiveId) });
      queryClient.invalidateQueries({ queryKey: OBJECTIVES_PROJECT_KEYS.list(variables.objectiveId) });
      queryClient.invalidateQueries({ queryKey: AUDIT_KEYS.list(variables.objectiveId) });
      toast.success("Actividad actualizada correctamente");
    },
    onError: () => {
      toast.error("Error al actualizar actividad del proyecto");
    },
  });
}

/**
 * Hook para eliminar una actividad de un objetivo de proyecto
 */
export function useDeleteActivityProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ objectiveId: _, activityId }: { objectiveId: string; activityId: string }) => {
      const response = await deleteActivityProject(activityId);
      if (!response.success) {
        throw new Error(response.error || "Error al eliminar actividad del proyecto");
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ACTIVITIES_PROJECT_KEYS.list(variables.objectiveId) });
      queryClient.invalidateQueries({ queryKey: OBJECTIVES_PROJECT_KEYS.list(variables.objectiveId) });
      queryClient.invalidateQueries({ queryKey: OBJECTIVES_PROJECT_KEYS.detail(variables.objectiveId) });
      queryClient.invalidateQueries({ queryKey: OBJECTIVES_PROJECT_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: SERVICES_PROJECT_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: AUDIT_KEYS.list(variables.objectiveId) });
      toast.success("Actividad eliminada correctamente");
    },
    onError: () => {
      toast.error("Error al eliminar actividad del proyecto");
    },
  });
}

/**
 * Hook para actualizar el responsable de una actividad de un objetivo de proyecto
 */
export function useUpdateTrackingActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      objectiveId: _,
      activityId,
      trackingActivity,
    }: {
      objectiveId: string;
      activityId: string;
      trackingActivity: TrackingActivityDto;
    }) => {
      const response = await updateTrackingActivity(activityId, trackingActivity);
      if (!response.success) {
        throw new Error(response.error || "Error al actualizar la actividad");
      }
    },
    onMutate: async ({ objectiveId, activityId, trackingActivity }) => {
      // Cancelar consultas salientes para evitar que sobrescriban nuestra actualización optimista
      await queryClient.cancelQueries({ queryKey: ACTIVITIES_PROJECT_KEYS.list(objectiveId) });

      // Guardar el estado anterior
      const previousActivities = queryClient.getQueryData(ACTIVITIES_PROJECT_KEYS.list(objectiveId));

      // Actualizar el cache optimistamente
      queryClient.setQueryData(ACTIVITIES_PROJECT_KEYS.list(objectiveId), (old: any) => {
        if (!old) return old;
        return old.map((activity: any) => {
          if (activity.id === activityId) {
            return {
              ...activity,
              trackingActivity,
            };
          }
          return activity;
        });
      });

      // Retornar el contexto con el estado anterior
      return { previousActivities };
    },
    onError: (error, _, context) => {
      // Si hay un error, revertir a los datos anteriores
      if (context?.previousActivities) {
        queryClient.setQueryData(ACTIVITIES_PROJECT_KEYS.list(_.objectiveId), context.previousActivities);
      }
      toast.error(error.message || "Error al actualizar el responsable de la actividad");
    },
    onSuccess: (_, variables) => {
      // pero podemos recargar para asegurarnos de tener la última información
      queryClient.invalidateQueries({ queryKey: ACTIVITIES_PROJECT_KEYS.list(variables.objectiveId) });
      queryClient.invalidateQueries({ queryKey: OBJECTIVES_PROJECT_KEYS.list(variables.objectiveId) });
      queryClient.invalidateQueries({ queryKey: OBJECTIVES_PROJECT_KEYS.detail(variables.objectiveId) });
      queryClient.invalidateQueries({ queryKey: OBJECTIVES_PROJECT_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: SERVICES_PROJECT_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: AUDIT_KEYS.all });
      toast.success("Responsable actualizado correctamente");
    },
  });
}

export function useUploadEvidence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      objectiveId: _,
      activityId,
      evidence,
    }: {
      objectiveId: string;
      activityId: string;
      evidence: File;
    }) => {
      const response = await uploadEvidence(activityId, evidence);
      if (!response.success) {
        throw new Error(response.error || "Error al subir evidencia");
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ACTIVITIES_PROJECT_KEYS.list(variables.objectiveId) });
      queryClient.invalidateQueries({ queryKey: OBJECTIVES_PROJECT_KEYS.list(variables.objectiveId) });
      queryClient.invalidateQueries({ queryKey: AUDIT_KEYS.list(variables.objectiveId) });
      toast.success("Evidencia subida correctamente");
    },
    onError: (error) => {
      toast.error(error.message || "Error al subir evidencia");
    },
  });
}

export function useDeleteEvidence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ objectiveId: _, activityId }: { objectiveId: string; activityId: string }) => {
      const response = await deleteEvidence(activityId);
      if (!response.success) {
        throw new Error(response.error || "Error al eliminar evidencia");
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ACTIVITIES_PROJECT_KEYS.list(variables.objectiveId) });
      queryClient.invalidateQueries({ queryKey: OBJECTIVES_PROJECT_KEYS.list(variables.objectiveId) });
      queryClient.invalidateQueries({ queryKey: AUDIT_KEYS.list(variables.objectiveId) });
      toast.success("Evidencia eliminada correctamente");
    },
    onError: (error) => {
      toast.error(error.message || "Error al eliminar evidencia");
    },
  });
}

export function useDownloadEvidence() {
  return useMutation({
    mutationFn: async ({ objectiveId: _, activityId }: { objectiveId: string; activityId: string }) => {
      const response = await downloadEvidence(activityId);
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
          toast.success("Evidencia descargada correctamente");
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
