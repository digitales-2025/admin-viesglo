"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createServiceFromTemplate,
  createServiceProject,
  deleteServiceProject,
  getServiceById,
  getServicesProject,
  updateServiceProject,
} from "../_actions/services-project.actions";
import { CreateProjectService, UpdateProjectService } from "../_types/tracking.types";
import { PROJECT_KEYS } from "./useProject";

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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: SERVICES_PROJECT_KEYS.list(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.paginated(variables.projectId) });
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
      serviceId,
      service,
      projectId: _,
    }: {
      serviceId: string;
      service: UpdateProjectService;
      projectId: string;
    }) => {
      const response = await updateServiceProject(serviceId, service);
      if (!response.success) {
        throw new Error(response.error || "Error al actualizar servicio del proyecto");
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidar la lista de servicios del proyecto usando projectId
      queryClient.invalidateQueries({ queryKey: SERVICES_PROJECT_KEYS.list(variables.projectId) });
      // También invalidamos las listas de proyectos para reflejar cambios en los conteos
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.lists() });
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
export function useDeleteServiceProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ serviceId }: { serviceId: string }) => {
      const response = await deleteServiceProject(serviceId);
      if (!response.success) {
        throw new Error(response.error || "Error al eliminar servicio del proyecto");
      }
      return response;
    },
    onSuccess: () => {
      // Invalidamos todas las listas de servicios de proyectos
      queryClient.invalidateQueries({ queryKey: SERVICES_PROJECT_KEYS.lists() });
      // También invalidamos las listas de proyectos para reflejar cambios en los conteos
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.lists() });
      toast.success("Servicio eliminado correctamente");
    },
    onError: () => {
      toast.error("Error al eliminar servicio del proyecto");
    },
  });
}

/**
 * Hook para crear servicios desde plantillas para un proyecto
 */
export function useCreateServiceFromTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      projectId,
      services,
    }: {
      projectId: string;
      services: {
        serviceId: string;
        objectives?: {
          objectiveId?: string;
          activities?: {
            activityId?: string;
          }[];
        }[];
      }[];
    }) => {
      const response = await createServiceFromTemplate(projectId, services);
      if (!response.success) {
        throw new Error(response.error || "Error al crear servicios desde plantilla");
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: SERVICES_PROJECT_KEYS.list(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.paginated(variables.projectId) });
      toast.success("Servicios creados correctamente");
    },
    onError: () => {
      toast.error("Error al crear servicios desde plantilla");
    },
  });
}

/**
 * Obtener un servicio de un proyecto por su Id
 */
export function useServiceById(serviceId: string) {
  return useQuery({
    queryKey: SERVICES_PROJECT_KEYS.detail(serviceId),
    queryFn: async () => {
      const response = await getServiceById(serviceId);
      if (!response.success) {
        throw new Error(response.error || "Error al obtener servicio por ID");
      }
      return response.data;
    },
  });
}
