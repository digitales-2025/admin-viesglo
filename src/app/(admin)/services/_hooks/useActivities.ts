import { useQuery } from "@tanstack/react-query";

import { getActivitiesByObjectiveId } from "../_actions/activities.actions";

export const ACTIVITIES_KEYS = {
  all: ["activities"] as const,
  list: (objectiveId: string) => [...ACTIVITIES_KEYS.all, objectiveId] as const,
};

export const useActivitiesByObjectiveId = (objectiveId: string) => {
  return useQuery({
    queryKey: ACTIVITIES_KEYS.list(objectiveId),
    queryFn: async () => {
      const response = await getActivitiesByObjectiveId(objectiveId);
      if (!response.success) {
        throw new Error(response.error || "Error al obtener actividades");
      }
      return response.data;
    },
  });
};
