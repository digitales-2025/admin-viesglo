"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createRole, deleteRole, getRole, getRoles, updateRole } from "../_actions/roles.actions";
import { Role } from "../_types/roles";

// Claves de consulta para roles
export const ROLES_KEYS = {
  all: ["roles"] as const,
  lists: () => [...ROLES_KEYS.all, "list"] as const,
  list: (filters: string) => [...ROLES_KEYS.lists(), { filters }] as const,
  details: () => [...ROLES_KEYS.all, "detail"] as const,
  detail: (id: string) => [...ROLES_KEYS.details(), id] as const,
};

/**
 * Hook para obtener todos los roles
 */
export function useRoles() {
  return useQuery({
    queryKey: ROLES_KEYS.lists(),
    queryFn: async () => {
      const response = await getRoles();
      if (!response.success) {
        throw new Error(response.error || "Error al obtener roles");
      }
      return response.data;
    },
  });
}

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
    mutationFn: (newRole: Omit<Role, "id" | "createdAt" | "updatedAt">) => createRole(newRole),
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
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Role, "id" | "createdAt" | "updatedAt">> }) =>
      updateRole(id, data),
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
    mutationFn: (id: string) => deleteRole(id),
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
