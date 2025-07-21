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
      toast.error(error?.error?.message || "Ocurrió un error inesperado");
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
      toast.error(error?.error?.message || "Ocurrió un error inesperado");
    },
  });

  return {
    ...mutation,
    isSuccess: mutation.isSuccess,
  };
};

/**
 * Hook para consultar info SUNAT por RUC
 */
export const useSunatInfoByRuc = (ruc: string, enabled = false) => {
  const shouldFetch = enabled && ruc.length === 11;

  const query = backend.useQuery("get", "/v1/clients/sunat/{ruc}", {
    params: {
      path: { ruc },
    },
    enabled: shouldFetch,
  });

  return {
    ...query,
    isSuccess: query.isSuccess,
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
      toast.error(error?.error?.message || "Ocurrió un error inesperado");
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
      toast.error(error?.error?.message || "Ocurrió un error inesperado");
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
      toast.error(error?.error?.message || "Ocurrió un error inesperado");
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
      toast.error(error?.error?.message || "Ocurrió un error inesperado");
    },
  });
};
