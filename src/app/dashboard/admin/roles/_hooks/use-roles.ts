"use client";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { backend } from "@/lib/api/types/backend";
import { usePagination } from "@/shared/hooks/use-pagination";

export const useRoles = () => {
  const { page, size, setPagination, resetPagination } = usePagination();
  const query = backend.useQuery("get", "/v1/roles/paginated", {
    params: {
      query: {
        page,
        size: size,
      },
    },
  });

  return { query, setPagination, resetPagination };
};

/**
 * Hook para obtener todos los roles activos (sin paginación, excluye roles del sistema)
 */
export const useAllRoles = () => {
  const query = backend.useQuery("get", "/v1/roles/all");
  return query;
};

/**
 * Hook para obtener el detalle de un rol por ID
 */
export const useRoleDetail = (id: string, enabled = true) => {
  const query = backend.useQuery(
    "get",
    "/v1/roles/{id}",
    {
      params: {
        path: { id },
      },
    },
    {
      enabled: !!id && enabled,
    }
  );

  return query;
};

/**
 * Hook para crear un nuevo rol
 */
export const useCreateRole = () => {
  const queryClient = useQueryClient();
  const mutation = backend.useMutation("post", "/v1/roles", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/roles/paginated"] });
      toast.success("Rol creado exitosamente");
    },
    onError: (error) => {
      toast.error(error?.error?.userMessage || "Error al crear rol");
    },
  });

  return {
    ...mutation,
    isSuccess: mutation.isSuccess,
  };
};

/**
 * Hook para actualizar un rol
 */
export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  const mutation = backend.useMutation("patch", "/v1/roles/{id}", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/roles/paginated"] });
      toast.success("Rol actualizado exitosamente");
    },
    onError: (error) => {
      toast.error(error?.error?.userMessage || "Error al actualizar rol");
    },
  });

  return {
    ...mutation,
    isSuccess: mutation.isSuccess,
  };
};

/**
 * Hook para alternar estado activo/inactivo de un rol
 */
export const useToggleActiveRole = () => {
  const queryClient = useQueryClient();
  const mutation = backend.useMutation("patch", "/v1/roles/{id}/toggle-active", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/roles/paginated"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/roles/all"] });
      toast.success("Estado de rol actualizado correctamente");
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
