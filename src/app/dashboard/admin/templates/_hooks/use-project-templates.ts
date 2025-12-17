import { useCallback, useMemo, useState } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { backend, fetchClient } from "@/lib/api/types/backend";
import { usePagination } from "@/shared/hooks/use-pagination";

/**
 * Hook para obtener plantillas paginadas (versión simple)
 */
export const useProjectTemplates = () => {
  const { page, size, setPagination, resetPagination } = usePagination();
  const query = backend.useQuery("get", "/v1/project-templates/paginated", {
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
 * Hook para búsqueda paginada de plantillas con filtros
 */
export const useSearchProjectTemplates = () => {
  const [search, setSearch] = useState<string | undefined>(undefined);
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);
  const { size } = usePagination();

  const query = useInfiniteQuery({
    queryKey: ["get", "/v1/project-templates/paginated", { search, isActive, size }],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await fetchClient.GET("/v1/project-templates/paginated", {
        params: {
          query: {
            search,
            page: pageParam,
            pageSize: size,
            isActive,
          },
        },
      });
      if (response.error) throw response.error;
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage?.meta) return undefined;
      const { page, totalPages } = lastPage.meta;
      if (typeof page !== "number" || typeof totalPages !== "number") return undefined;
      return page < totalPages ? page + 1 : undefined;
    },
    getPreviousPageParam: (firstPage) => {
      if (!firstPage?.meta) return undefined;
      const { page } = firstPage.meta;
      if (typeof page !== "number") return undefined;
      return page > 1 ? page - 1 : undefined;
    },
    initialPageParam: 1,
  });

  // Protección completa con useMemo
  const allTemplates = useMemo(() => {
    return query.data?.pages?.flatMap((page) => page?.data || []) || [];
  }, [query.data?.pages]);

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

  const handleIsActiveFilter = useCallback((isActive: boolean | undefined) => {
    setIsActive(isActive);
  }, []);

  const clearFilters = useCallback(() => {
    setSearch(undefined);
    setIsActive(undefined);
  }, []);

  return {
    query,
    allTemplates,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isLoading: query.isLoading,
    isError: query.isError,
    handleSearchChange,
    handleIsActiveFilter,
    clearFilters,
    search,
    setSearch,
    isActive,
    setIsActive,
    handleScrollEnd,
  };
};

/**
 * Hook para crear plantilla con isSuccess incluido
 */
export const useCreateProjectTemplate = () => {
  const queryClient = useQueryClient();
  const mutation = backend.useMutation("post", "/v1/project-templates", {
    onSuccess: () => {
      // Invalidar la query de la lista paginada
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/project-templates/paginated"] });
      // Invalidar la query de búsqueda paginada
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/project-templates/paginated", "infinite"] });
      // Invalidar la query de las plantillas activas
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/project-templates/active"] });
      toast.success("Plantilla creada correctamente");
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
 * Hook para actualizar plantilla con isSuccess incluido
 */
export const useUpdateProjectTemplate = () => {
  const queryClient = useQueryClient();
  const mutation = backend.useMutation("put", "/v1/project-templates/{id}", {
    onSuccess: () => {
      // Invalidar la query de la lista paginada
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/project-templates/paginated"] });
      // Invalidar la query de búsqueda paginada
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/project-templates/paginated", "infinite"] });
      // Invalidar la query de las plantillas activas
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/project-templates/active"] });
      // El refetch se manejará desde el formulario
      toast.success("Plantilla actualizada correctamente");
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
 * Hook para eliminar (borrado lógico) plantilla
 */
export const useDeleteProjectTemplate = () => {
  const queryClient = useQueryClient();
  return backend.useMutation("patch", "/v1/project-templates/{id}/delete", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/project-templates/paginated"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/project-templates/paginated", "infinite"] });
      toast.success("Plantilla eliminada correctamente");
    },
    onError: (error) => {
      toast.error(error?.error?.userMessage || "Ocurrió un error inesperado");
    },
  });
};

/**
 * Hook para reactivar plantilla
 */
export const useReactivateProjectTemplate = () => {
  const queryClient = useQueryClient();
  return backend.useMutation("patch", "/v1/project-templates/{id}/reactivate", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/project-templates/paginated"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/project-templates/paginated", "infinite"] });
      toast.success("Plantilla reactivada correctamente");
    },
    onError: (error) => {
      toast.error(error?.error?.userMessage || "Ocurrió un error inesperado");
    },
  });
};

/**
 * Hook para obtener plantillas activas
 */
export const useActiveProjectTemplates = () => {
  const query = backend.useQuery("get", "/v1/project-templates/active");

  return query;
};

/**
 * Hook para obtener plantilla por id
 */
export const useTemplateById = (id?: string, enabled = false) => {
  const shouldExecute = Boolean(id) && enabled;

  const query = backend.useQuery(
    "get",
    "/v1/project-templates/{id}",
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

/**
 * Hook para obtener plantilla detallada por id (con milestone templates completos)
 */
export const useTemplateDetailedById = (id?: string, enabled = false) => {
  const shouldExecute = Boolean(id) && enabled;

  const query = backend.useQuery(
    "get",
    "/v1/project-templates/{id}/detailed",
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
