"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createActivityProject,
  deleteActivityProject,
  getActivitiesProject,
  updateActivityProject,
  updateTrackingActivity,
} from "../_actions/activities-project.actions";
import { CreateProjectActivity, TrackingActivityDto, UpdateProjectActivity } from "../_types/tracking.types";
import { OBJECTIVES_PROJECT_KEYS } from "./useObjectivesProject";
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
      toast.success("Responsable actualizado correctamente");
    },
  });
}
