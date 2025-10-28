import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { backend } from "@/lib/api/types/backend";
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

  console.log("🟣 [useSearchProjectTemplates] Query params:", { search, isActive, size });

  const query = backend.useInfiniteQuery(
    "get",
    "/v1/project-templates/paginated",
    {
      params: {
        query: {
          search,
          page: 1, // Este valor será reemplazado automáticamente por pageParam
          pageSize: size,
          isActive,
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
  const allTemplates = query.data?.pages.flatMap((page) => page.data) || [];

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
    console.log("🟣 [useSearchProjectTemplates] handleIsActiveFilter llamado con:", isActive);
    setIsActive(isActive);
  }, []);

  const clearFilters = useCallback(() => {
    setSearch(undefined);
    setIsActive(undefined);
  }, []);

  return {
    query,
    allTemplates, // Todas las plantillas acumuladas
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isLoading: query.isLoading,
    isError: query.isError,
    // Funciones de filtrado
    handleSearchChange,
    handleIsActiveFilter,
    clearFilters,
    // Estados de filtros
    search,
    setSearch,
    isActive,
    setIsActive,
    // Scroll infinito
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
