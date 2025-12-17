import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { backend } from "@/lib/api/types/backend";
import { usePagination } from "@/shared/hooks/use-pagination";

/**
 * Hook para obtener usuarios paginados (versión simple)
 */
export const useUsers = () => {
  const { page, size, setPagination, resetPagination } = usePagination();
  const query = backend.useQuery("get", "/v1/users/paginated", {
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
 * Hook para búsqueda paginada de usuarios con filtros
 */
export const useSearchUsers = () => {
  const [search, setSearch] = useState<string | undefined>(undefined);
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);
  const [roleId, setRoleId] = useState<string | undefined>(undefined);
  const [systemRolePositions, setSystemRolePositions] = useState<(1 | 2 | 3)[] | undefined>(undefined);
  const { size } = usePagination();

  const query = backend.useInfiniteQuery(
    "get",
    "/v1/users/paginated",
    {
      params: {
        query: {
          search,
          page: 1, // Este valor será reemplazado automáticamente por pageParam
          pageSize: size,
          isActive,
          roleId,
          systemRolePositions,
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

  // Obtener todos los usuarios de todas las páginas de forma plana
  const allUsers = query.data?.pages.flatMap((page) => page.data) || [];

  const handleSearchChange = useCallback((value: string) => {
    if (value !== "None" && value !== null && value !== undefined) {
      setSearch(value.trim());
    }
  }, []);

  const handleIsActiveFilter = useCallback((isActive: boolean | undefined) => {
    setIsActive(isActive);
  }, []);

  const handleRoleIdFilter = useCallback((roleId: string | undefined) => {
    setRoleId(roleId);
  }, []);

  const handleSystemRolePositionsFilter = useCallback((positions: (1 | 2 | 3)[] | undefined) => {
    setSystemRolePositions(positions);
  }, []);

  const clearFilters = useCallback(() => {
    setSearch(undefined);
    setIsActive(undefined);
    setRoleId(undefined);
    setSystemRolePositions(undefined);
  }, []);

  const handleScrollEnd = useCallback(() => {
    if (query.hasNextPage) {
      query.fetchNextPage();
    }
  }, [query]);

  return {
    query,
    allUsers, // Todos los usuarios acumulados
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isLoading: query.isLoading,
    isError: query.isError,
    // Funciones de filtrado
    handleSearchChange,
    handleIsActiveFilter,
    handleRoleIdFilter,
    handleSystemRolePositionsFilter,
    clearFilters,
    // Estados de filtros
    search,
    setSearch,
    isActive,
    setIsActive,
    roleId,
    setRoleId,
    systemRolePositions,
    setSystemRolePositions,
    // Scroll infinito
    handleScrollEnd,
  };
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
