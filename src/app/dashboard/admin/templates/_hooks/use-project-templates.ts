import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { backend } from "@/lib/api/types/backend";
import { usePagination } from "@/shared/hooks/use-pagination";

/**
 * Hook para obtener plantillas paginadas
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
 * Hook para crear plantilla con isSuccess incluido
 */
export const useCreateProjectTemplate = () => {
  const queryClient = useQueryClient();
  const mutation = backend.useMutation("post", "/v1/project-templates", {
    onSuccess: () => {
      // Invalidar la query de la lista paginada
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/project-templates/paginated"] });
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
