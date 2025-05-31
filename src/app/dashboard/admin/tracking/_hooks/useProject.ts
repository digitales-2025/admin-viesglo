"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createProject,
  deleteProject,
  getProjects,
  getProjectsByFilters,
  getProjectsPaginated,
  toggleProjectActive,
  updateProject,
} from "../_actions/project.actions";
import { CreateProject, ProjectFilters, UpdateProjectWithoutServices } from "../_types/tracking.types";

export const PROJECT_KEYS = {
  all: ["projects"] as const,
  lists: () => [...PROJECT_KEYS.all, "list"] as const,
  list: (filters: string) => [...PROJECT_KEYS.lists(), { filters }] as const,
  paginated: (filters: string) => [...PROJECT_KEYS.lists(), "paginated", { filters }] as const,
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
    mutationFn: async ({ id, data }: { id: string; data: UpdateProjectWithoutServices }) => {
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

/**
 * Hook para toggle active estado de un proyecto
 */
export function useToggleProjectActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await toggleProjectActive(id);
      if (!response.success) {
        throw new Error(response.error || "Error al cambiar estado del proyecto");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.lists() });
      toast.success("Estado del proyecto actualizado correctamente");
    },
    onError: () => {
      toast.error("Error al cambiar estado del proyecto");
    },
  });
}

/**
 * Hook para obtener proyectos segun filtros
 */
export function useProjectsByFilters(filters: ProjectFilters) {
  return useQuery({
    queryKey: PROJECT_KEYS.list(JSON.stringify(filters)),
    queryFn: async () => {
      const response = await getProjectsByFilters(filters);
      if (!response.success) {
        throw new Error(response.error || "Error al obtener proyectos");
      }
      return response.data;
    },
  });
}

/**
 * Hook para obtener proyectos paginados según filtros
 * @param filters Filtros de búsqueda
 * @param initialLimit Número de resultados por página
 * @returns Query infinita con los proyectos paginados
 */
export function useProjectsPaginated(filters: ProjectFilters, initialLimit: number = 10) {
  return useInfiniteQuery({
    queryKey: PROJECT_KEYS.paginated(JSON.stringify(filters)),
    queryFn: async ({ pageParam = 1 }) => {
      // Llamar a la función de acción con los filtros y la paginación por separado
      const response = await getProjectsPaginated(filters, pageParam, initialLimit);
      if (!response.success || !response.data) {
        throw new Error(response.error || "Error al obtener proyectos paginados");
      }
      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      // Si la página actual es menor que el total de páginas, devolver la siguiente página
      const currentPage = lastPage.meta?.currentPage ?? 0;
      const totalPages = lastPage.meta?.totalPages ?? 0;

      if (currentPage < totalPages) {
        return currentPage + 1;
      }
      // Si no hay más páginas, devolver undefined para indicar que no hay más datos
      return undefined;
    },
  });
}
