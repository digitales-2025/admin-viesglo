"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { AUTH_KEYS } from "@/app/(auth)/sign-in/_hooks/useAuth";
import {
  createUser,
  deleteUser,
  getUser,
  getUserPermissions,
  getUsers,
  toggleActiveUser,
  updateUser,
} from "../_actions/user.actions";
import { UserCreate, UserUpdate } from "../_types/user.types";

export const USERS_KEYS = {
  all: ["User"] as const,
  lists: () => [...USERS_KEYS.all, "list"] as const,
  list: (filters: string) => [...USERS_KEYS.lists(), { filters }] as const,
  details: () => [...USERS_KEYS.all, "detail"] as const,
  detail: (id: string) => [...USERS_KEYS.details(), id] as const,
  permissions: () => [...USERS_KEYS.all, "permissions"] as const,
  permissionsDetail: (id: string) => [...USERS_KEYS.permissions(), id] as const,
  search: (filter: string) => [...USERS_KEYS.all, "search", filter] as const,
};

/**
 * Hook para obtener todos los usuarios
 */
export function useUsers() {
  return useQuery({
    queryKey: USERS_KEYS.lists(),
    queryFn: async () => {
      const response = await getUsers();
      if (!response.success) {
        throw new Error(response.error || "Error al obtener usuarios");
      }
      return response.data;
    },
  });
}

/**
 * Hook para obtener un usuario por ID
 */
export function useUser(id: string) {
  return useQuery({
    queryKey: USERS_KEYS.detail(id),
    queryFn: async () => {
      const response = await getUser(id);
      if (!response.success || !response.data) {
        throw new Error(response.error || "Error al obtener usuario");
      }
      return response.data;
    },
    enabled: !!id, // Solo ejecuta la consulta si hay un ID
  });
}

/**
 * Hook para crear un nuevo usuario
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newUser: UserCreate) => {
      const user = await createUser(newUser);
      if (!user.success) {
        throw new Error(user.error || "Error al crear usuario");
      }
      return user.data;
    },
    onSuccess: () => {
      // Invalida consultas para refrescar la lista
      queryClient.invalidateQueries({ queryKey: USERS_KEYS.lists() });
      toast.success("Usuario creado exitosamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al crear usuario");
    },
  });
}

/**
 * Hook para actualizar un usuario
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<UserUpdate> }) => {
      const updateData = { ...data };
      if (updateData.password === "") {
        const { password: _, ...rest } = updateData;
        const updateUserResponse = await updateUser(id, rest);
        if (!updateUserResponse.success) {
          throw new Error(updateUserResponse.error || "Error al actualizar usuario");
        }
        return updateUserResponse.data;
      }
      const updateUserResponse = await updateUser(id, updateData);
      if (!updateUserResponse.success) {
        throw new Error(updateUserResponse.error || "Error al actualizar usuario");
      }
      return updateUserResponse.data;
    },
    onSuccess: (_, variables) => {
      // Invalida consultas para refrescar los datos
      queryClient.invalidateQueries({ queryKey: USERS_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: USERS_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.user });
      toast.success("Usuario actualizado exitosamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar usuario");
    },
  });
}

/**
 * Hook para eliminar un usuario
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await deleteUser(id);
      if (!response.success) {
        throw new Error(response.error || "Error al eliminar usuario");
      }
      return response;
    },
    onSuccess: () => {
      // Invalida consultas para refrescar la lista
      queryClient.invalidateQueries({ queryKey: USERS_KEYS.lists() });
      toast.success("Usuario eliminado exitosamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar usuario");
    },
  });
}

/**
 * Hook para reactivar un usuario
 */
export function useToggleActiveUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await toggleActiveUser(id);
      if (!response.success) {
        throw new Error(response.error || "Error al reactivar usuario");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEYS.lists() });
      toast.success("Usuario reactivado exitosamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al reactivar usuario");
    },
  });
}

// Hook para obtener los permisos de un usuario
export function useUserPermissions(id: string) {
  return useQuery({
    queryKey: USERS_KEYS.permissionsDetail(id),
    queryFn: async () => {
      const response = await getUserPermissions(id);
      if (!response.success) {
        throw new Error(response.error || "Error al obtener permisos del usuario");
      }
      return response.data;
    },
  });
}
