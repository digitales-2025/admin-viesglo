import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { backend } from "@/lib/api/types/backend";
import { usePagination } from "@/shared/hooks/use-pagination";
import { ProjectPaginatedFilterDto } from "../_types";
import { ProjectDelayLevelEnum, ProjectStatusEnum, ProjectTypeEnum } from "../_types/project.enums";

// Tipo para los campos de ordenamiento permitidos
export type ProjectSortField =
  | "status"
  | "name"
  | "createdAt"
  | "updatedAt"
  | "endDate"
  | "startDate"
  | "overallProgress";

/**
 * Hook para obtener proyectos paginados con filtros
 */
export const useProjects = (filters?: Partial<ProjectPaginatedFilterDto>) => {
  const { page, size, setPagination, resetPagination } = usePagination();
  const query = backend.useQuery("get", "/v1/projects/paginated", {
    params: {
      query: {
        page,
        pageSize: size,
        ...filters, // ✅ Incluir filtros opcionales
      },
    },
  });

  return { query, setPagination, resetPagination };
};

/**
 * Hook para buscar proyectos con infinite query (búsqueda infinita)
 */
export const useSearchProjects = () => {
  const [search, setSearch] = useState<string | undefined>(undefined);
  const [clientId, setClientId] = useState<string | undefined>(undefined);
  const [projectGroupId, setProjectGroupId] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<ProjectStatusEnum[]>([]);
  const [projectType, setProjectType] = useState<ProjectTypeEnum[]>([]);
  const [delayLevel, setDelayLevel] = useState<ProjectDelayLevelEnum[]>([]);
  const [projectSortField, setProjectSortField] = useState<ProjectSortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const { size } = usePagination();
  const [ids, setIds] = useState<string[] | undefined>(undefined);

  const query = backend.useInfiniteQuery(
    "get",
    "/v1/projects/paginated",
    {
      params: {
        query: {
          search,
          page: 1, // Este valor será reemplazado automáticamente por pageParam
          pageSize: size,
          clientId,
          projectGroupId,
          status: status.length > 0 ? status : undefined,
          projectType: projectType.length > 0 ? projectType : undefined,
          delayLevel: delayLevel.length > 0 ? delayLevel : undefined,
          projectSortField,
          sortOrder,
          ids,
        },
      },
    },
    {
      getNextPageParam: (lastPage) => {
        // Si hay más páginas disponibles, devolver el siguiente número de página
        if (lastPage.meta.page < lastPage.meta.totalPages) {
          return lastPage.meta.page + 1;
        }
        return undefined; // No hay más páginas
      },
      getPreviousPageParam: (firstPage) => {
        // Si no estamos en la primera página, devolver la página anterior
        if (firstPage.meta.page > 1) {
          return firstPage.meta.page - 1;
        }
        return undefined; // No hay páginas anteriores
      },
      initialPageParam: 1,
      pageParamName: "page", // Esto le dice a openapi-react-query que use "page" como parámetro de paginación
    }
  );

  // Obtener todos los elementos de todas las páginas de forma plana
  const allProjects = query.data?.pages.flatMap((page) => page.data) || [];

  const handleSearchByIds = (ids: string[]) => {
    setIds(ids);
  };

  const handleScrollEnd = useCallback(() => {
    if (query.hasNextPage) {
      query.fetchNextPage();
    }
  }, [query]);

  const handleSearchChange = useCallback((value: string) => {
    if (value !== "None" && value !== null && value !== undefined) {
      setSearch(value.trim());
    }
  }, []);

  const handleClientFilter = useCallback((clientId: string | undefined) => {
    setClientId(clientId);
  }, []);

  const handleProjectGroupFilter = useCallback((projectGroupId: string | undefined) => {
    setProjectGroupId(projectGroupId);
  }, []);

  const handleStatusFilter = useCallback((statuses: ProjectStatusEnum[]) => {
    setStatus(statuses);
  }, []);

  const handleProjectTypeFilter = useCallback((projectTypes: ProjectTypeEnum[]) => {
    setProjectType(projectTypes);
  }, []);

  const handleDelayLevelFilter = useCallback((delayLevels: ProjectDelayLevelEnum[]) => {
    setDelayLevel(delayLevels);
  }, []);

  const handleSortChange = useCallback((field: ProjectSortField, order: "asc" | "desc") => {
    setProjectSortField(field);
    setSortOrder(order);
  }, []);

  const clearFilters = useCallback(() => {
    setSearch(undefined);
    setClientId(undefined);
    setProjectGroupId(undefined);
    setStatus([]);
    setProjectType([]);
    setDelayLevel([]);
    setProjectSortField("createdAt");
    setSortOrder("desc");
    setIds(undefined);
  }, []);

  return {
    query,
    allProjects, // Todos los proyectos acumulados
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isLoading: query.isLoading,
    isError: query.isError,
    // Funciones de filtrado
    handleSearchByIds,
    handleSearchChange,
    handleClientFilter,
    handleProjectGroupFilter,
    handleStatusFilter,
    handleProjectTypeFilter,
    handleDelayLevelFilter,
    handleSortChange,
    clearFilters,
    // Estados de filtros
    search,
    setSearch,
    clientId,
    projectGroupId,
    status,
    projectType,
    delayLevel,
    // Estados de filtros para arrays
    selectedStatuses: status,
    selectedProjectTypes: projectType,
    selectedDelayLevels: delayLevel,
    // Estados de ordenamiento
    projectSortField,
    sortOrder,
    // Scroll infinito
    handleScrollEnd,
  };
};

/**
 * Hook para crear proyecto con isSuccess incluido
 */
export const useCreateProject = () => {
  const queryClient = useQueryClient();
  const mutation = backend.useMutation("post", "/v1/projects", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/projects/paginated"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/projects"] });
      toast.success("Proyecto creado correctamente");
    },
    onError: (error) => {
      toast.error(error?.error?.userMessage || "Ocurrió un error inesperado");
    },
  });

  return {
    ...mutation,
    isSuccess: mutation.isSuccess,
  };
};

/**
 * Hook para actualizar proyecto con isSuccess incluido
 */
export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  const mutation = backend.useMutation("put", "/v1/projects/{id}", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/projects/paginated"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/projects"] });
      toast.success("Proyecto actualizado correctamente");
    },
    onError: (error) => {
      toast.error(error?.error?.userMessage || "Ocurrió un error inesperado");
    },
  });

  return {
    ...mutation,
    isSuccess: mutation.isSuccess,
  };
};

/**
 * Hook para eliminar (borrado lógico) proyecto
 */
export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  return backend.useMutation("patch", "/v1/projects/{id}/delete", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/projects/paginated"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/projects"] });
      toast.success("Proyecto eliminado correctamente");
    },
    onError: (error) => {
      toast.error(error?.error?.userMessage || "Ocurrió un error inesperado");
    },
  });
};

/**
 * Hook para reactivar proyecto
 */
export const useReactivateProject = () => {
  const queryClient = useQueryClient();
  return backend.useMutation("patch", "/v1/projects/{id}/reactivate", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/projects/paginated"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/projects"] });
      toast.success("Proyecto reactivado correctamente");
    },
    onError: (error) => {
      toast.error(error?.error?.userMessage || "Ocurrió un error inesperado");
    },
  });
};

/**
 * Hook para obtener proyecto por ID
 */
export const useProjectById = (id: string) => {
  const query = backend.useQuery("get", "/v1/projects/{id}", {
    params: { path: { id } },
    enabled: !!id,
  });

  return { query };
};

/**
 * Hook para obtener proyectos por estado
 */
export const useProjectsByStatus = (status: string) => {
  const query = backend.useQuery("get", "/v1/projects/status/{status}", {
    params: { path: { status } },
    enabled: !!status,
  });

  return { query };
};

/**
 * Hook para obtener proyectos por tipo
 */
export const useProjectsByType = (type: string) => {
  const query = backend.useQuery("get", "/v1/projects/type/{type}", {
    params: { path: { type } },
    enabled: !!type,
  });

  return { query };
};

/**
 * Hook para actualizar estado de proyecto
 */
export const useUpdateProjectStatus = () => {
  const queryClient = useQueryClient();
  const mutation = backend.useMutation("patch", "/v1/projects/{id}/status", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/projects/paginated"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/projects"] });
      toast.success("Estado del proyecto actualizado correctamente");
    },
    onError: (error) => {
      toast.error(error?.error?.userMessage || "Ocurrió un error inesperado");
    },
  });

  return {
    ...mutation,
    isSuccess: mutation.isSuccess,
  };
};

/**
 * Hook para obtener hitos de un proyecto
 */
export const useProjectMilestones = (projectId: string) => {
  const query = backend.useQuery("get", "/v1/projects/{projectId}/milestones", {
    params: { path: { projectId } },
    enabled: !!projectId,
  });

  return { query };
};

/**
 * Hook para actualizar campos del proyecto (requeridos y opcionales)
 */
export const useUpdateProjectFields = () => {
  const queryClient = useQueryClient();
  const mutation = backend.useMutation("patch", "/v1/projects/{projectId}/fields", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/projects/paginated"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/projects"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/projects/{id}"] });
      toast.success("Campos del proyecto actualizados correctamente");
    },
    onError: (error) => {
      toast.error(error?.error?.userMessage || "Ocurrió un error inesperado al actualizar campos");
    },
  });

  return {
    ...mutation,
    isSuccess: mutation.isSuccess,
  };
};
