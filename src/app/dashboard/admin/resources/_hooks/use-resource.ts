import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { backend } from "@/lib/api/types/backend";
import { usePagination } from "@/shared/hooks/use-pagination";

/**
 * Hook para obtener recursos paginados
 */
export const useResources = () => {
  const { page, size, setPagination, resetPagination } = usePagination();
  const query = backend.useQuery("get", "/v1/resources/paginated", {
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
 * Hook para obtener todos los recursos activos (no paginado)
 */
export const useAllActiveResources = () => {
  return backend.useQuery("get", "/v1/resources");
};

/**
 * Hook para obtener recurso por ID
 */
export const useResourceById = (resourceId: string, enabled = true) => {
  return backend.useQuery(
    "get",
    "/v1/resources/{resourceId}",
    {
      params: { path: { resourceId } },
    },
    { enabled: !!resourceId && enabled }
  );
};

/**
 * Hook para crear recurso con isSuccess incluido
 */
export const useCreateResource = () => {
  const queryClient = useQueryClient();
  const mutation = backend.useMutation("post", "/v1/resources", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/resources/paginated"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/resources"] });
      toast.success("Recurso creado correctamente");
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
 * Hook para actualizar recurso con isSuccess incluido
 */
export const useUpdateResource = () => {
  const queryClient = useQueryClient();
  const mutation = backend.useMutation("patch", "/v1/resources/{resourceId}", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/resources/paginated"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/resources"] });
      toast.success("Recurso actualizado correctamente");
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
 * Hook para eliminar recurso
 */
export const useDeleteResource = () => {
  const queryClient = useQueryClient();
  return backend.useMutation("delete", "/v1/resources/{resourceId}", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/resources/paginated"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/resources"] });
      toast.success("Recurso eliminado correctamente");
    },
    onError: (error) => {
      toast.error(error?.error?.userMessage || "Ocurrió un error inesperado");
    },
  });
};

/**
 * Hook para reactivar recurso
 */
export const useReactivateResource = () => {
  const queryClient = useQueryClient();
  return backend.useMutation("patch", "/v1/resources/{resourceId}/reactivate", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/resources/paginated"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/resources"] });
      toast.success("Recurso reactivado correctamente");
    },
    onError: (error) => {
      toast.error(error?.error?.userMessage || "Ocurrió un error inesperado");
    },
  });
};
