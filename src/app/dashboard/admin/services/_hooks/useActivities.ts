import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createActivity,
  deleteActivity,
  getActivitiesByObjectiveId,
  updateActivity,
} from "../_actions/activities.actions";
import { ActivityCreate, ActivityUpdate } from "../_types/services.types";
import { OBJECTIVES_KEYS } from "./useObjectives";
import { SERVICES_KEYS } from "./useServices";

export const ACTIVITIES_KEYS = {
  all: ["activities"] as const,
  lists: () => [...ACTIVITIES_KEYS.all, "list"] as const,
  list: (filters: string) => [...ACTIVITIES_KEYS.lists(), { filters }] as const,
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
    enabled: !!objectiveId,
  });
};

/**
 * Hook para crear una actividad
 */
export const useCreateActivity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (activity: ActivityCreate) => {
      const response = await createActivity(activity);
      if (!response.success) {
        throw new Error(response.error || "Error al crear actividad");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACTIVITIES_KEYS.all });
      queryClient.invalidateQueries({ queryKey: OBJECTIVES_KEYS.all });
      queryClient.invalidateQueries({ queryKey: SERVICES_KEYS.lists() });
      toast.success("Actividad creada exitosamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al crear actividad");
    },
  });
};

/**
 * Hook para actualizar una actividad
 */
export const useUpdateActivity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ActivityUpdate> }) => {
      const response = await updateActivity(id, data);
      if (!response.success) {
        throw new Error(response.error || "Error al actualizar actividad");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACTIVITIES_KEYS.all });
      queryClient.invalidateQueries({ queryKey: OBJECTIVES_KEYS.all });
      queryClient.invalidateQueries({ queryKey: SERVICES_KEYS.lists() });
      toast.success("Actividad actualizada exitosamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar actividad");
    },
  });
};

/**
 * Hook para eliminar una actividad
 */
export const useDeleteActivity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await deleteActivity(id);
      if (!response.success) {
        throw new Error(response.error || "Error al eliminar actividad");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACTIVITIES_KEYS.all });
      queryClient.invalidateQueries({ queryKey: OBJECTIVES_KEYS.all });
      queryClient.invalidateQueries({ queryKey: SERVICES_KEYS.lists() });
      toast.success("Actividad eliminada exitosamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar actividad");
    },
  });
};
