import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { backend } from "@/lib/api/types/backend";
import { usePagination } from "@/shared/hooks/use-pagination";

/**
 * Hook para obtener clientes paginados
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
