"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createUser, deleteUser, getUser, getUsers, updateUser } from "../_actions/user.actions";
import { UserCreate, UserUpdate } from "../_types/user.types";

export const USERS_KEYS = {
  all: ["User"] as const,
  lists: () => [...USERS_KEYS.all, "list"] as const,
  list: (filters: string) => [...USERS_KEYS.lists(), { filters }] as const,
  details: () => [...USERS_KEYS.all, "detail"] as const,
  detail: (id: string) => [...USERS_KEYS.details(), id] as const,
  permissions: () => [...USERS_KEYS.all, "permissions"] as const,
  permissionsDetail: (id: string) => [...USERS_KEYS.permissions(), id] as const,
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
    mutationFn: ({ id, data }: { id: string; data: Partial<UserUpdate> }) => {
      const updateData = { ...data };
      if (updateData.password === "") {
        const { password: _, ...rest } = updateData;
        return updateUser(id, rest);
      }
      return updateUser(id, updateData);
    },
    onSuccess: (data, variables) => {
      // Invalida consultas para refrescar los datos
      queryClient.invalidateQueries({ queryKey: USERS_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: USERS_KEYS.detail(variables.id) });
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
    mutationFn: (id: string) => deleteUser(id),
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
