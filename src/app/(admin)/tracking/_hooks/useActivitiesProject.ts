"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createActivityProject, getActivitiesProject } from "../_actions/activities-project.actions";
import { CreateProjectActivity } from "../_types/tracking.types";

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
    mutationFn: ({ objectiveId, activity }: { objectiveId: string; activity: CreateProjectActivity }) =>
      createActivityProject(objectiveId, activity),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ACTIVITIES_PROJECT_KEYS.list(variables.objectiveId) });
      toast.success("Actividad creada correctamente");
    },
    onError: () => {
      toast.error("Error al crear actividad del proyecto");
    },
  });
}
