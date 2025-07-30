import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { backend } from "@/lib/api/types/backend";
import { usePagination } from "@/shared/hooks/use-pagination";

/**
 * Hook para obtener usuarios paginados
 */
export const useUsers = () => {
  const { page, size, setPagination, resetPagination } = usePagination();
  const query = backend.useQuery("get", "/v1/users/paginated", {
    params: {
      query: {
        page,
        size,
        // Puedes agregar search, roleId, sortField, sortOrder si lo necesitas
      },
    },
  });

  return { query, setPagination, resetPagination };
};

/**
 * Hook para obtener todos los usuarios activos (no paginado)
 */
export const useAllActiveUsers = () => {
  return backend.useQuery("get", "/v1/users");
};

/**
 * Hook para obtener el perfil del usuario actual
 */
export const useMyProfile = () => {
  return backend.useQuery("get", "/v1/users/me");
};

/**
 * Hook para obtener usuario por ID
 */
export const useUserById = (id: string, enabled = true) => {
  return backend.useQuery(
    "get",
    "/v1/users/{id}",
    {
      params: { path: { id } },
    },
    { enabled: !!id && enabled }
  );
};

/**
 * Hook para crear usuario
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  const mutation = backend.useMutation("post", "/v1/users", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/users/paginated"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/users"] });
      toast.success("Usuario creado correctamente");
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
 * Hook para actualizar usuario
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const mutation = backend.useMutation("patch", "/v1/users/{id}", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/users/paginated"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/users"] });
      toast.success("Usuario actualizado correctamente");
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
 * Hook para alternar estado activo/inactivo de usuario
 */
export const useToggleActiveUser = () => {
  const queryClient = useQueryClient();
  const mutation = backend.useMutation("patch", "/v1/users/{id}/toggle-active", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/users/paginated"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/users"] });
      toast.success("Estado de usuario actualizado correctamente");
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
 * Hook para cambiar la contraseña de un usuario (solo admin)
 */
export const useChangeUserPassword = () => {
  const queryClient = useQueryClient();
  const mutation = backend.useMutation("patch", "/v1/users/{id}/change-password", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/users/paginated"] });
      toast.success("Contraseña cambiada correctamente");
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
