import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { backend } from "@/lib/api/types/backend";
import { usePagination } from "@/shared/hooks/use-pagination";
import { GenericInfiniteQueryResult } from "@/types/query-filters/generic-infinite-query-result";
import { MilestoneTemplateResponseDto } from "../_types/templates.types";

// Tipo para la query de búsqueda paginada de milestone templates
export type MilestoneTemplateSearchQueryResult = GenericInfiniteQueryResult<MilestoneTemplateResponseDto>;

/**
 * Hook para obtener plantillas de hitos paginadas
 */
export const useMilestoneTemplates = () => {
  const { page, size, setPagination, resetPagination } = usePagination();
  const query = backend.useQuery("get", "/v1/milestone-templates/paginated", {
    params: {
      query: {
        page,
        pageSize: size,
      },
    },
  });

  return { query, setPagination, resetPagination };
};

/**
 * Hook para crear plantilla de hito con isSuccess incluido
 */
export const useCreateMilestoneTemplate = () => {
  const queryClient = useQueryClient();
  const mutation = backend.useMutation("post", "/v1/milestone-templates", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/milestone-templates/paginated"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/milestone-templates/active"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/milestone-templates/by-name"] });
      toast.success("Plantilla de hito creada correctamente");
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
 * Hook para actualizar plantilla de hito con isSuccess incluido
 */
export const useUpdateMilestoneTemplate = () => {
  const queryClient = useQueryClient();
  const mutation = backend.useMutation("put", "/v1/milestone-templates/{id}", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/milestone-templates/paginated"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/milestone-templates/active"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/milestone-templates/by-name"] });
      toast.success("Plantilla de hito actualizada correctamente");
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
 * Hook para eliminar (borrado lógico) plantilla de hito
 */
export const useDeleteMilestoneTemplate = () => {
  const queryClient = useQueryClient();
  return backend.useMutation("patch", "/v1/milestone-templates/{id}/delete", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/milestone-templates/paginated"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/milestone-templates/active"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/milestone-templates/by-name"] });
      toast.success("Plantilla de hito eliminada correctamente");
    },
    onError: (error) => {
      toast.error(error?.error?.userMessage || "Ocurrió un error inesperado");
    },
  });
};

/**
 * Hook para reactivar plantilla de hito
 */
export const useReactivateMilestoneTemplate = () => {
  const queryClient = useQueryClient();
  return backend.useMutation("patch", "/v1/milestone-templates/{id}/reactivate", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/milestone-templates/paginated"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/milestone-templates/active"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/milestone-templates/by-name"] });
      toast.success("Plantilla de hito reactivada correctamente");
    },
    onError: (error) => {
      toast.error(error?.error?.userMessage || "Ocurrió un error inesperado");
    },
  });
};

/**
 * Hook para alternar estado activo de plantilla de hito
 */
export const useToggleMilestoneTemplateActive = () => {
  const queryClient = useQueryClient();
  return backend.useMutation("patch", "/v1/milestone-templates/{id}/toggle-active", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/milestone-templates/paginated"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/milestone-templates/active"] });
      toast.success("Estado de la plantilla de hito actualizado correctamente");
    },
    onError: (error) => {
      toast.error(error?.error?.userMessage || "Ocurrió un error inesperado");
    },
  });
};

/**
 * Hook para obtener plantillas de hitos activas
 */
export const useActiveMilestoneTemplates = () => {
  const query = backend.useQuery("get", "/v1/milestone-templates/active");

  return query;
};

/**
 * Hook para buscar plantillas de hitos por nombre
 */
export const useMilestoneTemplatesByName = (name?: string, limit?: number, enabled = false) => {
  const shouldExecute = enabled;

  const query = backend.useQuery(
    "get",
    "/v1/milestone-templates/by-name",
    {
      params: {
        query: {
          name: name || "",
          ...(limit && { limit }),
        },
      },
    },
    {
      enabled: shouldExecute,
    }
  );

  if (!shouldExecute) {
    return {
      ...query,
      data: [],
      isSuccess: false,
      isFetching: false,
      error: null,
      refetch: query.refetch,
    };
  }

  return {
    ...query,
    isSuccess: query.isSuccess,
    refetch: query.refetch,
  };
};

/**
 * Hook para obtener plantilla de hito por id
 */
export const useMilestoneTemplateById = (id?: string, enabled = false) => {
  const shouldExecute = Boolean(id) && enabled;

  const query = backend.useQuery(
    "get",
    "/v1/milestone-templates/{id}",
    {
      params: {
        path: { id: id ?? "" },
      },
    },
    {
      enabled: shouldExecute,
    }
  );

  if (!shouldExecute) {
    return {
      ...query,
      data: null,
      isSuccess: false,
      isFetching: false,
      error: null,
      refetch: query.refetch,
    };
  }

  return {
    ...query,
    isSuccess: query.isSuccess,
    refetch: query.refetch,
  };
};

// --- FASES ---

/**
 * Hook para agregar fase a plantilla de hito
 */
export const useAddPhaseToMilestoneTemplate = () => {
  const queryClient = useQueryClient();
  const mutation = backend.useMutation("post", "/v1/milestone-templates/{id}/phases", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/milestone-templates/paginated"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/milestone-templates/active"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/milestone-templates/by-name"] });
      toast.success("Fase agregada correctamente");
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
 * Hook para actualizar fase de plantilla de hito
 */
export const useUpdatePhaseOfMilestoneTemplate = () => {
  const queryClient = useQueryClient();
  const mutation = backend.useMutation("put", "/v1/milestone-templates/{id}/phases/{phaseId}", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/milestone-templates/paginated"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/milestone-templates/active"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/milestone-templates/by-name"] });
      toast.success("Fase actualizada correctamente");
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
 * Hook para eliminar fase de plantilla de hito
 */
export const useDeletePhaseOfMilestoneTemplate = () => {
  const queryClient = useQueryClient();
  return backend.useMutation("delete", "/v1/milestone-templates/{id}/phases/{phaseId}", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/milestone-templates/paginated"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/milestone-templates/active"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/milestone-templates/by-name"] });
      toast.success("Fase eliminada correctamente");
    },
    onError: (error) => {
      toast.error(error?.error?.userMessage || "Ocurrió un error inesperado");
    },
  });
};

// --- ENTREGABLES ---

/**
 * Hook para agregar entregable a fase
 */
export const useAddDeliverableToPhase = () => {
  const queryClient = useQueryClient();
  const mutation = backend.useMutation("post", "/v1/milestone-templates/{id}/phases/{phaseId}/deliverables", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/milestone-templates/paginated"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/milestone-templates/active"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/milestone-templates/by-name"] });
      toast.success("Entregable agregado correctamente");
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
 * Hook para actualizar entregable de fase
 */
export const useUpdateDeliverableOfPhase = () => {
  const queryClient = useQueryClient();
  const mutation = backend.useMutation(
    "put",
    "/v1/milestone-templates/{id}/phases/{phaseId}/deliverables/{deliverableId}",
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["get", "/v1/milestone-templates/paginated"] });
        queryClient.invalidateQueries({ queryKey: ["get", "/v1/milestone-templates/active"] });
        queryClient.invalidateQueries({ queryKey: ["get", "/v1/milestone-templates/by-name"] });
        toast.success("Entregable actualizado correctamente");
      },
      onError: (error) => {
        toast.error(error?.error?.userMessage || "Ocurrió un error inesperado");
      },
    }
  );

  return {
    ...mutation,
    isSuccess: mutation.isSuccess,
  };
};

/**
 * Hook para eliminar entregable de fase
 */
export const useDeleteDeliverableOfPhase = () => {
  const queryClient = useQueryClient();
  return backend.useMutation("delete", "/v1/milestone-templates/{id}/phases/{phaseId}/deliverables/{deliverableId}", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/milestone-templates/paginated"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/milestone-templates/active"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/milestone-templates/by-name"] });
      toast.success("Entregable eliminado correctamente");
    },
    onError: (error) => {
      toast.error(error?.error?.userMessage || "Ocurrió un error inesperado");
    },
  });
};

/**
 * Hook para cambiar posición de un elemento (milestone, fase o entregable)
 */
export const useChangePosition = () => {
  const queryClient = useQueryClient();
  const mutation = backend.useMutation("patch", "/v1/milestone-templates/change-position", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/milestone-templates/paginated"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/milestone-templates/active"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/milestone-templates/by-name"] });
      toast.success("Posición cambiada exitosamente");
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

// --- VARIANTES ---

/**
 * Hook para crear variante de plantilla de hito
 * Crea una copia personalizada de una plantilla existente con un nuevo nombre
 */
export const useCreateMilestoneTemplateVariant = () => {
  const queryClient = useQueryClient();
  const mutation = backend.useMutation("post", "/v1/milestone-templates/{id}/variant", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/milestone-templates/paginated"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/milestone-templates/active"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/milestone-templates/by-name"] });
      toast.success("Variante de plantilla creada correctamente");
    },
    onError: (error) => {
      toast.error(error?.error?.userMessage || "Ocurrió un error inesperado al crear la variante");
    },
  });

  return {
    ...mutation,
    isSuccess: mutation.isSuccess,
  };
};

/**
 * Hook para búsqueda paginada de plantillas de hitos con filtros
 */
export const useSearchMilestoneTemplates = () => {
  const [search, setSearch] = useState<string | undefined>(undefined);
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);
  const [preselectedIds, setPreselectedIds] = useState<string[] | undefined>(undefined);
  const { size } = usePagination();

  const query = backend.useInfiniteQuery(
    "get",
    "/v1/milestone-templates/paginated",
    {
      params: {
        query: {
          search,
          page: 1, // Este valor será reemplazado automáticamente por pageParam
          pageSize: size,
          isActive,
          preselectedIds,
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

  // Obtener todas las plantillas de todas las páginas de forma plana
  const allMilestoneTemplates = query.data?.pages.flatMap((page) => page.data) || [];

  const handleSearchChange = useCallback((value: string) => {
    if (value !== "None" && value !== null && value !== undefined) {
      setSearch(value.trim());
    }
  }, []);

  const handleActiveFilter = useCallback((isActive: boolean | undefined) => {
    setIsActive(isActive);
  }, []);

  const handlePreselectedIdsFilter = useCallback((preselectedIds: string[] | undefined) => {
    setPreselectedIds(preselectedIds);
  }, []);

  const clearFilters = useCallback(() => {
    setSearch(undefined);
    setIsActive(undefined);
    setPreselectedIds(undefined);
  }, []);

  const handleScrollEnd = useCallback(() => {
    if (query.hasNextPage) {
      query.fetchNextPage();
    }
  }, [query]);

  return {
    query,
    allMilestoneTemplates, // Todas las plantillas acumuladas
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isLoading: query.isLoading,
    isError: query.isError,
    // Funciones de filtrado
    handleSearchChange,
    handleActiveFilter,
    handlePreselectedIdsFilter,
    clearFilters,
    // Estados de filtros
    search,
    setSearch,
    isActive,
    setIsActive,
    preselectedIds,
    setPreselectedIds,
    // Scroll infinito
    handleScrollEnd,
  };
};
