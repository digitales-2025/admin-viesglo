import { useQuery } from "@tanstack/react-query";

import { getPermissions } from "../_actions/permissions.actions";

// Claves de consulta para roles
export const PERMISSIONS_KEYS = {
  all: ["permissions"] as const,
  lists: () => [...PERMISSIONS_KEYS.all, "list"] as const,
  list: (filters: string) => [...PERMISSIONS_KEYS.lists(), { filters }] as const,
};

/**
 * Hook para obtener los permisos
 */
export function usePermissions() {
  return useQuery({
    queryKey: PERMISSIONS_KEYS.lists(),
    queryFn: async () => {
      const response = await getPermissions();
      if (!response.success) {
        throw new Error(response.error || "Error al obtener permisos");
      }
      return response.data;
    },
  });
}
