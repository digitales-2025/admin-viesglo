import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { IncidentPaginatedFilterDto } from "@/app/dashboard/admin/incidents/_types/incidents.types";
import { backend } from "@/lib/api/types/backend";

/**
 * Claves de cache para incidencias
 */
export const INCIDENTS_KEYS = {
  all: ["incidents"] as const,
  lists: () => [...INCIDENTS_KEYS.all, "list"] as const,
  list: (filters: IncidentPaginatedFilterDto) => [...INCIDENTS_KEYS.lists(), { filters }] as const,
  detail: (id: string) => [...INCIDENTS_KEYS.all, id] as const,
  byDeliverable: (deliverableId: string) => [...INCIDENTS_KEYS.all, "deliverable", deliverableId] as const,
};

/**
 * Hook para obtener incidencias paginadas
 */
export function useIncidents(filters: IncidentPaginatedFilterDto = {}, options: { enabled?: boolean } = {}) {
  // Asegurar compatibilidad con tipos de OpenAPI para sortField
  const allowedSortFields = ["email", "name", "lastName", "createdAt", "updatedAt"] as const;
  const sortFieldParam = allowedSortFields.includes(filters.sortField as any)
    ? (filters.sortField as (typeof allowedSortFields)[number])
    : undefined;

  // Construimos el query object de forma incremental para satisfacer el tipado de OpenAPI
  const queryParams: Record<string, unknown> = {
    page: filters.page,
    pageSize: filters.pageSize,
    search: filters.search,
    isResolved: filters.isResolved,
    createdById: filters.createdById,
    resolvedById: filters.resolvedById,
    sortField: sortFieldParam,
    sortOrder: filters.sortOrder,
  };
  if (filters.projectId) queryParams.projectId = filters.projectId;
  if (filters.milestoneId) queryParams.milestoneId = filters.milestoneId;
  if (filters.phaseId) queryParams.phaseId = filters.phaseId;
  if (filters.deliverableId) queryParams.deliverableId = filters.deliverableId;

  return backend.useQuery(
    "get",
    "/v1/incidents",
    {
      params: {
        query: queryParams as any,
      },
    },
    {
      staleTime: 30000,
      refetchOnWindowFocus: false,
      ...options,
    }
  );
}

/**
 * Hook para obtener incidencias por entregable
 */
export function useIncidentsByDeliverable(
  deliverableId: string,
  projectId?: string,
  milestoneId?: string,
  phaseId?: string,
  enabled: boolean = true
) {
  // Solo habilitar cuando tengamos todos los IDs requeridos
  const shouldEnable = Boolean(enabled && deliverableId && projectId && milestoneId && phaseId);
  return useIncidents(
    {
      deliverableId,
      projectId,
      milestoneId,
      phaseId,
      page: 1,
      pageSize: 100, // Obtener todas las incidencias del entregable
      sortField: "date",
      sortOrder: "desc",
    },
    { enabled: shouldEnable }
  );
}

/**
 * Hook para obtener una incidencia por ID
 */
export function useIncidentById(id: string) {
  return backend.useQuery(
    "get",
    "/v1/incidents/{id}",
    {
      params: { path: { id } },
    },
    {
      enabled: !!id,
      staleTime: 30000,
      refetchOnWindowFocus: false,
    }
  );
}

/**
 * Hook para crear una incidencia
 */
export function useCreateIncident() {
  const queryClient = useQueryClient();

  return backend.useMutation("post", "/v1/incidents", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/incidents"] });
      toast.success("Incidencia creada correctamente");
    },
    onError: (error: any) => {
      toast.error(error?.error?.userMessage || "Ocurrió un error inesperado");
    },
  });
}

/**
 * Hook para actualizar una incidencia
 */
export function useUpdateIncident() {
  const queryClient = useQueryClient();

  return backend.useMutation("patch", "/v1/incidents/{id}", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/incidents/{id}"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/incidents"] });
      toast.success("Incidencia actualizada correctamente");
    },
    onError: (error: any) => {
      toast.error(error?.error?.userMessage || "Ocurrió un error inesperado");
    },
  });
}

/**
 * Hook para eliminar una incidencia
 */
export function useDeleteIncident() {
  const queryClient = useQueryClient();

  return backend.useMutation("delete", "/v1/incidents/{id}", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/incidents"] });
      toast.success("Incidencia eliminada correctamente");
    },
    onError: (error: any) => {
      toast.error(error?.error?.userMessage || "Ocurrió un error inesperado");
    },
  });
}

/**
 * Hook para resolver una incidencia
 */
export function useResolveIncident() {
  const queryClient = useQueryClient();

  return backend.useMutation("patch", "/v1/incidents/{id}/resolve", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/incidents/{id}"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/incidents"] });
      toast.success("Incidencia resuelta correctamente");
    },
    onError: (error: any) => {
      toast.error(error?.error?.userMessage || "Ocurrió un error inesperado");
    },
  });
}

/**
 * Hook para reabrir una incidencia
 */
export function useReopenIncident() {
  const queryClient = useQueryClient();

  return backend.useMutation("patch", "/v1/incidents/{id}/reopen", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/incidents/{id}"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/incidents"] });
      toast.success("Incidencia reabierta correctamente");
    },
    onError: (error: any) => {
      toast.error(error?.error?.userMessage || "Ocurrió un error inesperado");
    },
  });
}
