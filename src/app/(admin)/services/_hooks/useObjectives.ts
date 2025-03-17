import { useQuery, useQueryClient } from "@tanstack/react-query";

import { getObjectivesByServiceId } from "../_actions/objectives.actions";

export const OBJECTIVES_KEYS = {
  all: ["objectives"] as const,
  lists: () => [...OBJECTIVES_KEYS.all, "list"] as const,
  list: (filters: string) => [...OBJECTIVES_KEYS.lists(), { filters }] as const,
};

export const useObjectivesByServiceId = (serviceId: string) => {
  return useQuery({
    queryKey: OBJECTIVES_KEYS.list(serviceId),
    queryFn: async () => {
      const response = await getObjectivesByServiceId(serviceId);
      if (!response.success) {
        throw new Error(response.error || "Error al obtener objetivos");
      }
      return response.data;
    },
    enabled: !!serviceId,
  });
};

export const useInvalidateObjectives = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: OBJECTIVES_KEYS.all });
  };
};
