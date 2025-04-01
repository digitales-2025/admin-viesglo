"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createServiceProject,
  deleteServiceProject,
  getServicesProject,
  updateServiceProject,
} from "../_actions/services-project.actions";
import { CreateProjectService, UpdateProjectService } from "../_types/tracking.types";

export const SERVICES_PROJECT_KEYS = {
  all: ["services-project"] as const,
  lists: () => [...SERVICES_PROJECT_KEYS.all, "list"] as const,
  list: (filters: string) => [...SERVICES_PROJECT_KEYS.lists(), { filters }] as const,
  detail: (id: string) => [...SERVICES_PROJECT_KEYS.all, id] as const,
};

/**
 * Hook para obtener los servicios asignados a un proyecto
 */
export function useServicesProject(projectId: string) {
  return useQuery({
    queryKey: SERVICES_PROJECT_KEYS.list(projectId),
    queryFn: async () => {
      const response = await getServicesProject(projectId);
      if (!response.success) {
        throw new Error(response.error || "Error al obtener servicios del proyecto");
      }
      return response.data;
    },
  });
}

/**
 * Hook para crear un servicio asignado a un proyecto
 */
export function useCreateServiceProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, service }: { projectId: string; service: CreateProjectService }) => {
      const response = await createServiceProject(projectId, service);
      if (!response.success) {
        throw new Error(response.error || "Error al crear servicio del proyecto");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SERVICES_PROJECT_KEYS.lists() });
      toast.success("Servicio creado correctamente");
    },
    onError: () => {
      toast.error("Error al crear servicio del proyecto");
    },
  });
}

/**
 * Hook para actualizar un servicio asignado a un proyecto
 */
export function useUpdateServiceProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      projectId,
      serviceId,
      service,
    }: {
      projectId: string;
      serviceId: string;
      service: UpdateProjectService;
    }) => {
      const response = await updateServiceProject(projectId, serviceId, service);
      if (!response.success) {
        throw new Error(response.error || "Error al actualizar servicio del proyecto");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SERVICES_PROJECT_KEYS.lists() });
      toast.success("Servicio actualizado correctamente");
    },
    onError: () => {
      toast.error("Error al actualizar servicio del proyecto");
    },
  });
}

/**
 * Hook para eliminar un servicio asignado a un proyecto
 */
export function useDeleteServiceProject(projectId: string, serviceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await deleteServiceProject(projectId, serviceId);
      if (!response.success) {
        throw new Error(response.error || "Error al eliminar servicio del proyecto");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SERVICES_PROJECT_KEYS.list(projectId) });
      toast.success("Servicio eliminado correctamente");
    },
    onError: () => {
      toast.error("Error al eliminar servicio del proyecto");
    },
  });
}
