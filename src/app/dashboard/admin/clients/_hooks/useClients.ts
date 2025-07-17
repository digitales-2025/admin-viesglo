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
 * Hook para obtener clientes activos
 */
export const useActiveClients = () => {
  return backend.useQuery("get", "/v1/clients/active");
};

/**
 * Hook para obtener cliente por ID
 */
export const useClientById = (id: string) => {
  return backend.useQuery("get", "/v1/clients/{id}", {
    params: {
      path: { id },
    },
  });
};

/**
 * Hook para obtener cliente por RUC
 */
export const useClientByRuc = (ruc: string) => {
  return backend.useQuery("get", "/v1/clients/ruc/{ruc}", {
    params: {
      path: { ruc },
    },
  });
};

/**
 * Hook para consultar info SUNAT por RUC
 */
export const useSunatInfoByRuc = (ruc: string) => {
  return backend.useQuery("get", "/v1/clients/sunat/{ruc}", {
    params: {
      path: { ruc },
    },
  });
};

/**
 * Hook para crear cliente
 */
export const useCreateClient = () => {
  const queryClient = useQueryClient();
  return backend.useMutation("post", "/v1/clients", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/clients/paginated"] });
      toast.success("Cliente creado correctamente");
    },
    onError: (error) => {
      toast.error(error?.error?.message || "Ocurrió un error inesperado");
    },
  });
};

/**
 * Hook para actualizar cliente
 */
export const useUpdateClient = () => {
  const queryClient = useQueryClient();
  return backend.useMutation("put", "/v1/clients/{id}", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/clients/paginated"] });
      toast.success("Cliente actualizado correctamente");
    },
    onError: (error) => {
      toast.error(error?.error?.message || "Ocurrió un error inesperado");
    },
  });
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

/**
 * Hook para agregar contacto a cliente
 */
export const useAddContactToClient = () => {
  const queryClient = useQueryClient();
  return backend.useMutation("post", "/v1/clients/{id}/contacts", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/clients/paginated"] });
      toast.success("Contacto agregado correctamente");
    },
    onError: (error) => {
      toast.error(error?.error?.message || "Ocurrió un error inesperado");
    },
  });
};

/**
 * Hook para actualizar contacto de cliente
 */
export const useUpdateContactOfClient = () => {
  const queryClient = useQueryClient();
  return backend.useMutation("put", "/v1/clients/{id}/contacts/{email}", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/clients/paginated"] });
      toast.success("Contacto actualizado correctamente");
    },
    onError: (error) => {
      toast.error(error?.error?.message || "Ocurrió un error inesperado");
    },
  });
};

/**
 * Hook para activar/desactivar contacto de cliente
 */
export const useToggleActiveContactOfClient = () => {
  const queryClient = useQueryClient();
  return backend.useMutation("patch", "/v1/clients/{id}/contacts/{email}/toggle-active", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/clients/paginated"] });
      toast.success("Contacto actualizado correctamente");
    },
    onError: (error) => {
      toast.error(error?.error?.message || "Ocurrió un error inesperado");
    },
  });
};
