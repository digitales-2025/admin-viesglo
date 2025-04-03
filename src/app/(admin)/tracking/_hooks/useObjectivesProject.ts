"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createObjectiveProject,
  deleteObjectiveProject,
  getObjectivesProject,
  updateObjectiveProject,
} from "../_actions/objectives-project.actions";
import { CreateProjectObjective, UpdateProjectObjective } from "../_types/tracking.types";

export const OBJECTIVES_PROJECT_KEYS = {
  all: ["objectives-project"] as const,
  lists: () => [...OBJECTIVES_PROJECT_KEYS.all, "list"] as const,
  list: (filters: string) => [...OBJECTIVES_PROJECT_KEYS.lists(), { filters }] as const,
  detail: (id: string) => [...OBJECTIVES_PROJECT_KEYS.all, id] as const,
};

/**
 * Hook para obtener los objetivos de un proyecto
 */
export function useObjectivesProject(serviceId: string) {
  return useQuery({
    queryKey: OBJECTIVES_PROJECT_KEYS.list(serviceId),
    queryFn: async () => {
      const response = await getObjectivesProject(serviceId);
      if (!response.success) {
        throw new Error(response.error || "Error al obtener objetivos del proyecto");
      }
      return response.data;
    },
  });
}

/**
 * Hook para crear un objetivo de un proyecto
 */
export function useCreateObjectiveProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ serviceId, objective }: { serviceId: string; objective: CreateProjectObjective }) => {
      const response = await createObjectiveProject(serviceId, objective);
      if (!response.success) {
        throw new Error(response.error || "Error al crear objetivo del proyecto");
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: OBJECTIVES_PROJECT_KEYS.list(variables.serviceId) });
      toast.success("Objetivo creado correctamente");
    },
    onError: () => {
      toast.error("Error al crear objetivo del proyecto");
    },
  });
}

/**
 * Hook para actualizar un objetivo de un proyecto
 */
export function useUpdateObjectiveProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      serviceId,
      objectiveId,
      objective,
    }: {
      serviceId: string;
      objectiveId: string;
      objective: UpdateProjectObjective;
    }) => {
      const response = await updateObjectiveProject(serviceId, objectiveId, objective);
      if (!response.success) {
        throw new Error(response.error || "Error al actualizar objetivo del proyecto");
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: OBJECTIVES_PROJECT_KEYS.list(variables.serviceId) });
      toast.success("Objetivo actualizado correctamente");
    },
    onError: () => {
      toast.error("Error al actualizar objetivo del proyecto");
    },
  });
}

/**
 * Hook para eliminar un objetivo de un proyecto
 */
export function useDeleteObjectiveProject(projectId: string, objectiveId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await deleteObjectiveProject(projectId, objectiveId);
      if (!response.success) {
        throw new Error(response.error || "Error al eliminar objetivo del proyecto");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OBJECTIVES_PROJECT_KEYS.list(projectId) });
      toast.success("Objetivo eliminado correctamente");
    },
    onError: () => {
      toast.error("Error al eliminar objetivo del proyecto");
    },
  });
}
