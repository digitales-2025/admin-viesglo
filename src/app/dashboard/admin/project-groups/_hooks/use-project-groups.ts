import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { usePagination } from "@/shared/hooks/use-pagination";
import {
  CreateProjectGroupRequestDto,
  PaginatedProjectGroupResponseDto,
  ProjectGroupResponseDto,
  UpdateProjectGroupRequestDto,
} from "../_types/project-groups.types";

/**
 * Hook principal para gestionar grupos de proyectos
 *
 * Características:
 * - Paginación automática con estado persistente
 * - Búsqueda por nombre (opcional)
 * - Cache inteligente para evitar consultas innecesarias
 * - Reinicio automático a página 1 al buscar
 */
export const useProjectGroups = () => {
  const { page, size, setPagination, resetPagination } = usePagination();
  const [search, setSearch] = useState<string>("");

  const query = useQuery({
    queryKey: ["project-groups", "paginated", { page, size, search }],
    queryFn: async (): Promise<PaginatedProjectGroupResponseDto> => {
      // Construir parámetros de consulta para el backend
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: size.toString(),
        ...(search ? { search } : {}),
      });

      const response = await fetch(`http://localhost:5000/v1/project-groups/paginated?${params}`);
      if (!response.ok) {
        throw new Error(`Error al obtener grupos de proyectos: ${response.status} ${response.statusText}`);
      }
      return response.json();
    },
    // Optimizaciones de cache: datos frescos por 30s, no refetch al cambiar ventana
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const applySearch = (term: string) => {
    // Reinicia a la primera página cuando se aplica una nueva búsqueda
    setPagination({ newPage: 1, newSize: size });
    setSearch(term);
  };

  return { query, setPagination, resetPagination, applySearch, currentSearch: search, page, size };
};

/**
 * Hook para obtener todos los grupos de proyectos activos (no paginado)
 */
export const useAllActiveProjectGroups = () => {
  return useQuery({
    queryKey: ["project-groups", "active"],
    queryFn: async (): Promise<ProjectGroupResponseDto[]> => {
      const response = await fetch("http://localhost:5000/v1/project-groups");
      if (!response.ok) {
        throw new Error(`Error al obtener grupos de proyectos activos: ${response.status} ${response.statusText}`);
      }
      return response.json();
    },
  });
};

/**
 * Hook para obtener grupo de proyectos por ID
 */
export const useProjectGroupById = (projectGroupId: string, enabled = true) => {
  return useQuery({
    queryKey: ["project-groups", projectGroupId],
    queryFn: async (): Promise<ProjectGroupResponseDto> => {
      const response = await fetch(`http://localhost:5000/v1/project-groups/${projectGroupId}`);
      if (!response.ok) {
        throw new Error(`Error al obtener el grupo de proyectos: ${response.status} ${response.statusText}`);
      }
      return response.json();
    },
    enabled: !!projectGroupId && enabled,
  });
};

/**
 * Hook para crear grupo de proyectos con isSuccess incluido
 */
export const useCreateProjectGroup = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: CreateProjectGroupRequestDto): Promise<ProjectGroupResponseDto> => {
      const response = await fetch("http://localhost:5000/v1/project-groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al crear el grupo de proyectos");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-groups", "paginated"] });
      queryClient.invalidateQueries({ queryKey: ["project-groups", "active"] });
      toast.success("Grupo de proyectos creado correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Ocurrió un error inesperado");
    },
  });

  return {
    ...mutation,
    isSuccess: mutation.isSuccess,
  };
};

/**
 * Hook para actualizar grupo de proyectos con isSuccess incluido
 */
export const useUpdateProjectGroup = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateProjectGroupRequestDto;
    }): Promise<ProjectGroupResponseDto> => {
      const response = await fetch(`http://localhost:5000/v1/project-groups/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al actualizar el grupo de proyectos");
      }

      return response.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["project-groups", "paginated"] });
      queryClient.invalidateQueries({ queryKey: ["project-groups", "active"] });
      queryClient.invalidateQueries({ queryKey: ["project-groups", id] });
      toast.success("Grupo de proyectos actualizado correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Ocurrió un error inesperado");
    },
  });

  return {
    ...mutation,
    isSuccess: mutation.isSuccess,
  };
};

/**
 * Hook para eliminar grupo de proyectos
 */
export const useDeleteProjectGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<ProjectGroupResponseDto> => {
      const response = await fetch(`http://localhost:5000/v1/project-groups/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al eliminar el grupo de proyectos");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-groups", "paginated"] });
      queryClient.invalidateQueries({ queryKey: ["project-groups", "active"] });
      toast.success("Grupo de proyectos eliminado correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Ocurrió un error inesperado");
    },
  });
};

/**
 * Hook para reactivar grupo de proyectos
 */
export const useReactivateProjectGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<ProjectGroupResponseDto> => {
      const response = await fetch(`http://localhost:5000/v1/project-groups/${id}/reactivate`, {
        method: "PATCH",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al reactivar el grupo de proyectos");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-groups", "paginated"] });
      queryClient.invalidateQueries({ queryKey: ["project-groups", "active"] });
      toast.success("Grupo de proyectos reactivado correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Ocurrió un error inesperado");
    },
  });
};

/**
 * Hook para obtener proyectos de un grupo específico
 */
export const useProjectsOfGroup = (projectGroupId: string, enabled = true) => {
  return useQuery({
    queryKey: ["project-groups", projectGroupId, "projects"],
    queryFn: async () => {
      const response = await fetch(`http://localhost:5000/v1/project-groups/${projectGroupId}/projects`);
      if (!response.ok) {
        throw new Error(`Error al obtener los proyectos del grupo: ${response.status} ${response.statusText}`);
      }
      return response.json();
    },
    enabled: !!projectGroupId && enabled,
  });
};
