import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { backend } from "@/lib/api/types/backend";
import { usePagination } from "@/shared/hooks/use-pagination";

/**
 * Hook para obtener clientes paginados (versión simple)
 */
export const useClients = () => {
  const { page, size, setPagination, resetPagination } = usePagination();
  const query = backend.useQuery("get", "/v1/clients/paginated", {
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
 * Hook para búsqueda paginada de clientes con filtros
 */
export const useSearchClients = () => {
  const [search, setSearch] = useState<string | undefined>(undefined);
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);
  const [clientId, setClientId] = useState<string | undefined>(undefined);
  const [state, setState] = useState<string | undefined>(undefined);
  const [condition, setCondition] = useState<string | undefined>(undefined);
  const { size } = usePagination();

  const query = backend.useInfiniteQuery(
    "get",
    "/v1/clients/paginated",
    {
      params: {
        query: {
          search,
          page: 1, // Este valor será reemplazado automáticamente por pageParam
          pageSize: size,
          isActive,
          clientId,
          state,
          condition,
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

  // Obtener todos los clientes de todas las páginas de forma plana
  const allClients = query.data?.pages.flatMap((page) => page.data) || [];

  const handleSearchChange = useCallback((value: string) => {
    if (value !== "None" && value !== null && value !== undefined) {
      setSearch(value.trim());
    }
  }, []);

  const handleIsActiveFilter = useCallback((isActive: boolean | undefined) => {
    setIsActive(isActive);
  }, []);

  const handleClientIdFilter = useCallback((clientId: string | undefined) => {
    setClientId(clientId);
  }, []);

  const handleStateFilter = useCallback((state: string | undefined) => {
    setState(state);
  }, []);

  const handleConditionFilter = useCallback((condition: string | undefined) => {
    setCondition(condition);
  }, []);

  const clearFilters = useCallback(() => {
    setSearch(undefined);
    setIsActive(undefined);
    setClientId(undefined);
    setState(undefined);
    setCondition(undefined);
  }, []);

  const handleScrollEnd = useCallback(() => {
    if (query.hasNextPage) {
      query.fetchNextPage();
    }
  }, [query]);

  return {
    query,
    allClients, // Todos los clientes acumulados
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isLoading: query.isLoading,
    isError: query.isError,
    // Funciones de filtrado
    handleSearchChange,
    handleIsActiveFilter,
    handleClientIdFilter,
    handleStateFilter,
    handleConditionFilter,
    clearFilters,
    // Estados de filtros
    search,
    setSearch,
    isActive,
    setIsActive,
    clientId,
    setClientId,
    state,
    setState,
    condition,
    setCondition,
    // Scroll infinito
    handleScrollEnd,
  };
};

/**
 * Hook para crear cliente con isSuccess incluido
 */
export const useCreateClient = () => {
  const queryClient = useQueryClient();
  const mutation = backend.useMutation("post", "/v1/clients", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/clients/paginated"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/clients/active"] });
      toast.success("Cliente creado correctamente");
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
 * Hook para actualizar cliente con isSuccess incluido
 */
export const useUpdateClient = () => {
  const queryClient = useQueryClient();
  const mutation = backend.useMutation("put", "/v1/clients/{id}", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/clients/paginated"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/clients/active"] });
      toast.success("Cliente actualizado correctamente");
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
 * Hook para consultar info SUNAT por RUC - COMPLETAMENTE ARREGLADO
 */
export const useSunatInfoByRuc = (ruc: string, enabled = false) => {
  const isValidRuc = typeof ruc === "string" && ruc.length === 11 && /^\d{11}$/.test(ruc);
  const shouldExecute = isValidRuc && enabled;

  // El hook SIEMPRE se llama, pero solo ejecuta la consulta si shouldExecute
  const query = backend.useQuery(
    "get",
    "/v1/clients/perudev/sunat/{ruc}",
    {
      params: {
        path: { ruc: isValidRuc ? ruc : "" }, // Valor dummy si no es válido
      },
    },
    {
      enabled: shouldExecute,
    }
  );

  // Si no se ejecuta, normaliza el resultado
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
 * Hook para agregar contacto a cliente
 */
export const useAddContactToClient = () => {
  const queryClient = useQueryClient();
  const mutation = backend.useMutation("post", "/v1/clients/{id}/contacts", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/clients/paginated"] });
      toast.success("Contacto agregado correctamente");
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
 * Hook para actualizar contacto de cliente
 */
export const useUpdateContactOfClient = () => {
  const queryClient = useQueryClient();
  const mutation = backend.useMutation("put", "/v1/clients/{id}/contacts/{email}", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/clients/paginated"] });
      toast.success("Contacto actualizado correctamente");
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
 * Hook para eliminar (borrado lógico) cliente
 */
export const useDeleteClient = () => {
  const queryClient = useQueryClient();
  return backend.useMutation("patch", "/v1/clients/{id}/delete", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/clients/paginated"] });
      toast.success("Cliente eliminado correctamente");
    },
    onError: (error) => {
      toast.error(error?.error?.userMessage || "Ocurrió un error inesperado");
    },
  });
};

/**
 * Hook para reactivar cliente
 */
export const useReactivateClient = () => {
  const queryClient = useQueryClient();
  return backend.useMutation("patch", "/v1/clients/{id}/reactivate", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/clients/paginated"] });
      toast.success("Cliente reactivado correctamente");
    },
    onError: (error) => {
      toast.error(error?.error?.userMessage || "Ocurrió un error inesperado");
    },
  });
};

/**
 * Hook para activar/desactivar contacto de cliente
 */
export const useToggleActiveContact = () => {
  const queryClient = useQueryClient();
  return backend.useMutation("patch", "/v1/clients/{id}/contacts/{email}/toggle-active", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/clients/paginated"] });
      toast.success("Estado del contacto actualizado correctamente");
    },
    onError: (error) => {
      toast.error(error?.error?.userMessage || "Ocurrió un error inesperado");
    },
  });
};

/**
 * Hook para agregar dirección a cliente
 */
export const useAddAddressToClient = () => {
  const queryClient = useQueryClient();
  const mutation = backend.useMutation("post", "/v1/clients/{id}/addresses", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/clients/paginated"] });
      toast.success("Dirección agregada correctamente");
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
 * Hook para actualizar dirección de cliente
 */
export const useUpdateAddressOfClient = () => {
  const queryClient = useQueryClient();
  const mutation = backend.useMutation("put", "/v1/clients/{id}/addresses/{addressId}", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/clients/paginated"] });
      toast.success("Dirección actualizada correctamente");
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
 * Hook para activar/desactivar dirección de cliente
 */
export const useToggleActiveAddress = () => {
  const queryClient = useQueryClient();
  return backend.useMutation("patch", "/v1/clients/{id}/addresses/{addressId}/toggle-active", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/clients/paginated"] });
      toast.success("Estado de la dirección actualizado correctamente");
    },
    onError: (error) => {
      toast.error(error?.error?.userMessage || "Ocurrió un error inesperado");
    },
  });
};

/**
 * Hook para obtener cliente por ID
 */
export const useClientById = (id: string) => {
  const query = backend.useQuery("get", "/v1/clients/{id}", {
    params: { path: { id } },
    enabled: !!id,
  });

  return { query };
};
