import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { backend } from "@/lib/api/types/backend";
import { usePagination } from "@/shared/hooks/use-pagination";
import { GenericInfiniteQueryResult } from "@/types/query-filters/generic-infinite-query-result";
import { TagResponseDto } from "../_types/tags.types";

// Tipo para la query de búsqueda paginada de tags
export type TagSearchQueryResult = GenericInfiniteQueryResult<TagResponseDto>;

/**
 * Hook para crear etiqueta con isSuccess incluido
 */
export const useCreateTag = () => {
  const queryClient = useQueryClient();
  const mutation = backend.useMutation("post", "/v1/tags", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/tags/search"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/tags/paginated"] });
      toast.success("Etiqueta creada correctamente");
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
 * Hook para actualizar etiqueta con isSuccess incluido
 */
export const useUpdateTag = () => {
  const queryClient = useQueryClient();
  const mutation = backend.useMutation("put", "/v1/tags/{id}", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/tags/search"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/tags/paginated"] });
      toast.success("Etiqueta actualizada correctamente");
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
 * Hook para eliminar etiqueta
 */
export const useDeleteTag = () => {
  const queryClient = useQueryClient();
  return backend.useMutation("delete", "/v1/tags/{id}", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/tags/search"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/tags/paginated"] });
      toast.success("Etiqueta eliminada correctamente");
    },
    onError: (error) => {
      toast.error(error?.error?.userMessage || "Ocurrió un error inesperado");
    },
  });
};

/**
 * Hook para obtener etiqueta por id
 */
export const useTagById = (id?: string, enabled = false) => {
  const shouldExecute = Boolean(id) && enabled;

  const query = backend.useQuery(
    "get",
    "/v1/tags/{id}",
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
 * Hook para búsqueda paginada de etiquetas con filtros
 */
export const useSearchTags = () => {
  const [search, setSearch] = useState<string | undefined>(undefined);
  const [color, setColor] = useState<string | undefined>(undefined);
  const [preselectedIds, setPreselectedIds] = useState<string[] | undefined>(undefined);
  const { size } = usePagination();

  const query = backend.useInfiniteQuery(
    "get",
    "/v1/tags/paginated",
    {
      params: {
        query: {
          search,
          page: 1, // Este valor será reemplazado automáticamente por pageParam
          pageSize: size,
          color,
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

  // Obtener todas las etiquetas de todas las páginas de forma plana
  const allTags = query.data?.pages.flatMap((page) => page.data) || [];

  const handleSearchChange = useCallback((value: string) => {
    if (value !== "None" && value !== null && value !== undefined) {
      setSearch(value.trim());
    }
  }, []);

  const handleColorFilter = useCallback((color: string | undefined) => {
    setColor(color);
  }, []);

  const handlePreselectedIdsFilter = useCallback((preselectedIds: string[] | undefined) => {
    setPreselectedIds(preselectedIds);
  }, []);

  const clearFilters = useCallback(() => {
    setSearch(undefined);
    setColor(undefined);
    setPreselectedIds(undefined);
  }, []);

  const handleScrollEnd = useCallback(() => {
    if (query.hasNextPage) {
      query.fetchNextPage();
    }
  }, [query]);

  return {
    query,
    allTags, // Todas las etiquetas acumuladas
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isLoading: query.isLoading,
    isError: query.isError,
    // Funciones de filtrado
    handleSearchChange,
    handleColorFilter,
    handlePreselectedIdsFilter,
    clearFilters,
    // Estados de filtros
    search,
    setSearch,
    color,
    setColor,
    preselectedIds,
    setPreselectedIds,
    // Scroll infinito
    handleScrollEnd,
  };
};

/**
 * Hook para buscar etiquetas por nombre (autocomplete)
 */
export const useTagsByName = (name: string, limit?: number, enabled = false) => {
  const shouldExecute = enabled;

  const query = backend.useQuery(
    "get",
    "/v1/tags/search",
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
