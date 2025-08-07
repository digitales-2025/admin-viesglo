"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { backend } from "@/lib/api/types/backend";
import { usePagination } from "@/shared/hooks/use-pagination";
import {
  createRole,
  deleteRole,
  getRole,
  getRolePermissions,
  toggleActiveRole,
  updateRole,
} from "../_actions/roles.actions";
import { RoleCreate, RoleUpdate } from "../_types/roles";

// Claves de consulta para roles
export const ROLES_KEYS = {
  all: ["roles"] as const,
  lists: () => [...ROLES_KEYS.all, "list"] as const,
  list: (filters: string) => [...ROLES_KEYS.lists(), { filters }] as const,
  details: () => [...ROLES_KEYS.all, "detail"] as const,
  detail: (id: string) => [...ROLES_KEYS.details(), id] as const,
  permissions: () => [...ROLES_KEYS.all, "permissions"] as const,
  permissionsDetail: (id: string) => [...ROLES_KEYS.permissions(), id] as const,
};

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
 * Hook para obtener un rol por ID
 */
export function useRole(id: string) {
  return useQuery({
    queryKey: ROLES_KEYS.detail(id),
    queryFn: async () => {
      const response = await getRole(id);
      if (!response.success || !response.data) {
        throw new Error(response.error || "Error al obtener rol");
      }
      return response.data;
    },
    enabled: !!id, // Solo ejecuta la consulta si hay un ID
  });
}

/**
 * Hook para crear un nuevo rol
 */
export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newRole: RoleCreate) => createRole(newRole),
    onSuccess: () => {
      // Invalida consultas para refrescar la lista
      queryClient.invalidateQueries({ queryKey: ROLES_KEYS.lists() });
      toast.success("Rol creado exitosamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al crear rol");
    },
  });
}

/**
 * Hook para actualizar un rol
 */
export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RoleUpdate> }) => updateRole(id, data),
    onSuccess: (data, variables) => {
      // Invalida consultas para refrescar los datos
      queryClient.invalidateQueries({ queryKey: ROLES_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: ROLES_KEYS.detail(variables.id) });
      toast.success("Rol actualizado exitosamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar rol");
    },
  });
}

/**
 * Hook para eliminar un rol
 */
export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await deleteRole(id);
      if (!response.success) {
        throw new Error(response.error || "Error al eliminar rol");
      }
      return response;
    },
    onSuccess: () => {
      // Invalida consultas para refrescar la lista
      queryClient.invalidateQueries({ queryKey: ROLES_KEYS.lists() });
      toast.success("Rol eliminado exitosamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar rol");
    },
  });
}

/**
 * Hook para toggle el rol de un usuario
 */
export function useToggleActiveRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await toggleActiveRole(id);
      if (!response.success) {
        throw new Error(response.error || "Error al toggle el rol de un usuario");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROLES_KEYS.lists() });
      toast.success("Rol activado exitosamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al toggle el rol de un usuario");
    },
  });
}

/**
 * Hook para obtener los permisos de un rol
 */
export function useRolePermissions(id: string) {
  return useQuery({
    queryKey: ROLES_KEYS.permissionsDetail(id),
    queryFn: async () => {
      try {
        const response = await getRolePermissions(id);

        if (!response.success) {
          throw new Error(response.error || "Error al obtener permisos del rol");
        }

        return response.data;
      } catch (error) {
        throw error;
      }
    },
    enabled: !!id,
    staleTime: 0, // Siempre obtener datos frescos
    gcTime: 1000 * 60 * 5, // Caché por 5 minutos
  });
}
