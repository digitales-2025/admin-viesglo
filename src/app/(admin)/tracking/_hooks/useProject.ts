"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createProject, deleteProject, getProjects, updateProject } from "../_actions/project.actions";
import { CreateProject, UpdateProject } from "../_types/tracking.types";

export const PROJECT_KEYS = {
  all: ["projects"] as const,
  lists: () => [...PROJECT_KEYS.all, "list"] as const,
  list: (filters: string) => [...PROJECT_KEYS.lists(), { filters }] as const,
  detail: (id: string) => [...PROJECT_KEYS.all, id] as const,
};

/**
 * Hook para obtener todos los proyectos
 */
export function useProjects() {
  return useQuery({
    queryKey: PROJECT_KEYS.lists(),
    queryFn: async () => {
      const response = await getProjects();
      if (!response.success) {
        throw new Error(response.error || "Error al obtener proyectos");
      }
      return response.data;
    },
  });
}

/**
 * Hook para crear un nuevo proyecto
 */
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProject) => {
      const response = await createProject(data);
      if (!response.success) {
        throw new Error(response.error || "Error al crear proyecto");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.lists() });
      toast.success("Proyecto creado correctamente");
    },
    onError: () => {
      toast.error("Error al crear proyecto");
    },
  });
}

/**
 * Hook para actualizar un proyecto existente
 */
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<UpdateProject> }) => {
      const response = await updateProject(id, data);
      if (!response.success) {
        throw new Error(response.error || "Error al actualizar proyecto");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.lists() });
      toast.success("Proyecto actualizado correctamente");
    },
    onError: () => {
      toast.error("Error al actualizar proyecto");
    },
  });
}

/**
 * Hook para eliminar un proyecto existente
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await deleteProject(id);
      if (!response.success) {
        throw new Error(response.error || "Error al eliminar proyecto");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.lists() });
      toast.success("Proyecto eliminado correctamente");
    },
    onError: () => {
      toast.error("Error al eliminar proyecto");
    },
  });
}
