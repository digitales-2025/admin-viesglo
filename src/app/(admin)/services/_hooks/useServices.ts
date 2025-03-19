import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createService, deleteService, getServices, updateService } from "../_actions/services.actions";
import { ServiceCreate, ServiceUpdate } from "../_types/services.types";

export const SERVICES_KEYS = {
  all: ["services"] as const,
  lists: () => [...SERVICES_KEYS.all, "list"] as const,
  list: (filters: string) => [...SERVICES_KEYS.lists(), { filters }] as const,
  detail: (id: string) => [...SERVICES_KEYS.all, id] as const,
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

/**
 * Hook para crear un servicio
 */
export function useCreateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newService: ServiceCreate) => createService(newService),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SERVICES_KEYS.lists() });
      toast.success("Servicio creado exitosamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al crear servicio");
    },
  });
}

/**
 * Hook para actualizar un servicio
 */
export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ServiceUpdate> }) => updateService(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: SERVICES_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: SERVICES_KEYS.detail(variables.id) });
      toast.success("Servicio actualizado exitosamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar servicio");
    },
  });
}

/**
 * Hook para eliminar un servicio
 */
export function useDeleteService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SERVICES_KEYS.lists() });
      toast.success("Servicio eliminado exitosamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar servicio");
    },
  });
}
