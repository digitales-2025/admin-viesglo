import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createObjective,
  deleteObjective,
  getObjectivesByServiceId,
  updateObjective,
} from "../_actions/objectives.actions";
import { ObjectiveCreate, ObjectiveUpdate } from "../_types/services.types";
import { SERVICES_KEYS } from "./useServices";

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
        throw new Error(response.error || "No se pudieron obtener los objetivos del servicio");
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

/**
 * Hook para crear un objetivo
 */
export const useCreateObjective = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newObjective: ObjectiveCreate) => {
      const response = await createObjective(newObjective);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OBJECTIVES_KEYS.all });
      queryClient.invalidateQueries({ queryKey: SERVICES_KEYS.lists() });
      toast.success("Objetivo creado exitosamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "No se pudo crear el objetivo. Por favor, intente nuevamente");
    },
  });
};

/**
 * Hook para actualizar un objetivo
 */
export const useUpdateObjective = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ObjectiveUpdate> }) => {
      const response = await updateObjective(id, data);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OBJECTIVES_KEYS.all });
      toast.success("Objetivo actualizado exitosamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "No se pudo actualizar el objetivo. Por favor, intente nuevamente");
    },
  });
};

/**
 * Hook para eliminar un objetivo
 */
export const useDeleteObjective = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await deleteObjective(id);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: OBJECTIVES_KEYS.all });
      toast.success("Objetivo eliminado exitosamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "No se pudo eliminar el objetivo. Por favor, intente nuevamente");
    },
  });
};
