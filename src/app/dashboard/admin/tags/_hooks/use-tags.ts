import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { backend } from "@/lib/api/types/backend";

/**
 * Hook para crear etiqueta con isSuccess incluido
 */
export const useCreateTag = () => {
  const queryClient = useQueryClient();
  const mutation = backend.useMutation("post", "/v1/tags", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/tags/search"] });
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
