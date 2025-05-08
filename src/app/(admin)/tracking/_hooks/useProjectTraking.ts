"use client";

import { useQuery } from "@tanstack/react-query";

import { getUsersProjects } from "../../users/_actions/user.actions";
import { USERS_KEYS } from "../../users/_hooks/useUsers";

/**
 * Hook para obtener todos los usuarios
 */
export function useUsersProject() {
  return useQuery({
    queryKey: USERS_KEYS.lists(),
    queryFn: async () => {
      const response = await getUsersProjects();
      if (!response.success) {
        throw new Error(response.error || "Error al obtener usuarios");
      }
      return response.data;
    },
  });
}
