"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createActivityProject,
  deleteActivityProject,
  getActivitiesProject,
  updateActivityProject,
} from "../_actions/activities-project.actions";
import { CreateProjectActivity, UpdateProjectActivity } from "../_types/tracking.types";
import { OBJECTIVES_PROJECT_KEYS } from "./useObjectivesProject";

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
      toast.success("Actividad eliminada correctamente");
    },
    onError: () => {
      toast.error("Error al eliminar actividad del proyecto");
    },
  });
}
