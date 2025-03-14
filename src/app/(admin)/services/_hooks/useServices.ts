import { useQuery } from "@tanstack/react-query";

import { getServices } from "../_actions/services.actions";

export const SERVICES_KEYS = {
  all: ["services"] as const,
  lists: () => [...SERVICES_KEYS.all, "list"] as const,
  list: (filters: string) => [...SERVICES_KEYS.lists(), { filters }] as const,
};

/**
 * Hook para obtener todos los servicios
 */
export function useServices() {
  return useQuery({
    queryKey: SERVICES_KEYS.lists(),
    queryFn: async () => {
      const response = await getServices();
      if (!response.success) {
        throw new Error(response.error || "Error al obtener servicios");
      }
      return response.data;
    },
  });
}
