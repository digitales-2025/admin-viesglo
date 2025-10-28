import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";

import { backend } from "@/lib/api/types/backend";
import { usePagination } from "@/shared/hooks/use-pagination";

/**
 * Claves de cache para entregables adicionales
 */
export const ADDITIONAL_DELIVERABLES_KEYS = {
  all: ["additional-deliverables"] as const,
  lists: () => [...ADDITIONAL_DELIVERABLES_KEYS.all, "list"] as const,
  list: (projectId: string, phaseId: string) => [...ADDITIONAL_DELIVERABLES_KEYS.lists(), projectId, phaseId] as const,
  paginated: (projectId: string, phaseId: string) =>
    [...ADDITIONAL_DELIVERABLES_KEYS.lists(), projectId, phaseId, "paginated"] as const,
  detail: (projectId: string, phaseId: string, additionalDeliverableId: string) =>
    [...ADDITIONAL_DELIVERABLES_KEYS.all, projectId, phaseId, additionalDeliverableId] as const,
};

/**
 * Hook para obtener entregables adicionales por fase
 */
export const usePhaseAdditionalDeliverables = (projectId: string, phaseId: string) => {
  const query = backend.useQuery(
    "get",
    "/v1/additional-deliverables/projects/{projectId}/phases/{phaseId}/additional-deliverables",
    {
      params: {
        path: {
          projectId,
          phaseId,
        },
      },
      enabled: !!projectId && !!phaseId,
    }
  );

  return { query };
};

/**
 * Hook para obtener entregables adicionales por fase con paginación y filtros
 */
export const usePhaseAdditionalDeliverablesPaginated = (projectId: string, phaseId: string) => {
  const [search, setSearch] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<"REGISTERED" | "IN_PROCESS" | "FINISHED" | undefined>(undefined);
  const [hasDocuments, setHasDocuments] = useState<boolean | undefined>(undefined);
  const [isCompleted, setIsCompleted] = useState<boolean | undefined>(undefined);
  const [sortField, setSortField] = useState<"name" | "createdAt" | "updatedAt" | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>(undefined);

  const { page, size, setPagination, resetPagination } = usePagination();

  const debouncedSearch = useDebouncedCallback((value: string) => {
    setSearch(value);
    setPagination({ newPage: 1, newSize: size });
  }, 300);

  const query = backend.useQuery(
    "get",
    "/v1/additional-deliverables/projects/{projectId}/phases/{phaseId}/additional-deliverables",
    {
      params: {
        path: {
          projectId,
          phaseId,
        },
        query: {
          page,
          pageSize: size,
          search,
          status,
          hasDocuments,
          isCompleted,
          sortField,
          sortOrder,
        },
      },
      enabled: !!projectId && !!phaseId,
    }
  );

  return {
    query,
    setPagination,
    meta: query.data?.meta,
    // Funciones de filtrado
    handleSearchChange: debouncedSearch,
    handleSortChange: useCallback(
      (field: "name" | "createdAt" | "updatedAt" | undefined, order: "asc" | "desc" | undefined) => {
        setSortField(field);
        setSortOrder(order);
      },
      []
    ),
    clearFilters: useCallback(() => {
      setSearch(undefined);
      setStatus(undefined);
      setHasDocuments(undefined);
      setIsCompleted(undefined);
      setSortField(undefined);
      setSortOrder(undefined);
      setPagination({ newPage: 1, newSize: size });
    }, [setPagination, size]),
    // Estados de filtros
    search,
    filters: {
      search,
      status,
      hasDocuments,
      isCompleted,
      sortField,
      sortOrder,
    },
    pagination: {
      page,
      size,
      setPagination,
      resetPagination,
    },
    actions: {
      setSearch: debouncedSearch,
      setStatus,
      setHasDocuments,
      setIsCompleted,
      setSortField,
      setSortOrder,
      resetFilters: useCallback(() => {
        setSearch(undefined);
        setStatus(undefined);
        setHasDocuments(undefined);
        setIsCompleted(undefined);
        setSortField(undefined);
        setSortOrder(undefined);
        setPagination({ newPage: 1, newSize: size });
      }, [setPagination, size]),
    },
  };
};

/**
 * Hook para agregar un entregable adicional
 */
export const useAddAdditionalDeliverable = () => {
  const queryClient = useQueryClient();

  const mutation = backend.useMutation(
    "post",
    "/v1/additional-deliverables/projects/{projectId}/phases/{phaseId}/additional-deliverables",
    {
      onSuccess: () => {
        // Invalidar todas las queries de entregables adicionales para este endpoint
        queryClient.invalidateQueries({
          queryKey: [
            "get",
            "/v1/additional-deliverables/projects/{projectId}/phases/{phaseId}/additional-deliverables",
          ],
        });

        // Invalidar cache de entregables normales (para recalcular progreso)
        queryClient.invalidateQueries({
          queryKey: ["get", "/v1/deliverables/projects/{projectId}/phases/{phaseId}/deliverables"],
        });

        // Invalidar cache del proyecto (para recalcular progreso general)
        queryClient.invalidateQueries({
          queryKey: ["get", "/v1/projects/{projectId}"],
        });

        toast.success("Entregable adicional creado exitosamente");
      },
      onError: (error) => {
        console.error("Error creating additional deliverable:", error);
        toast.error("Error al crear el entregable adicional");
      },
    }
  );

  return { mutation };
};

/**
 * Hook para actualizar un entregable adicional
 */
export const useUpdateAdditionalDeliverable = () => {
  const queryClient = useQueryClient();

  const mutation = backend.useMutation(
    "put",
    "/v1/additional-deliverables/projects/{projectId}/phases/{phaseId}/additional-deliverables/{additionalDeliverableId}",
    {
      onSuccess: () => {
        // Invalidar todas las queries de entregables adicionales para este endpoint
        queryClient.invalidateQueries({
          queryKey: [
            "get",
            "/v1/additional-deliverables/projects/{projectId}/phases/{phaseId}/additional-deliverables",
          ],
        });

        // Invalidar cache específico del entregable adicional si existe
        queryClient.invalidateQueries({
          queryKey: [
            "get",
            "/v1/additional-deliverables/projects/{projectId}/phases/{phaseId}/additional-deliverables/{additionalDeliverableId}",
          ],
        });

        // Invalidar cache del proyecto (para recalcular progreso general)
        queryClient.invalidateQueries({
          queryKey: ["get", "/v1/projects/{projectId}"],
        });

        toast.success("Entregable adicional actualizado exitosamente");
      },
      onError: (error) => {
        console.error("Error updating additional deliverable:", error);
        toast.error("Error al actualizar el entregable adicional");
      },
    }
  );

  return { mutation };
};

/**
 * Hook para actualizar el progreso de un entregable adicional
 */
export const useUpdateAdditionalDeliverableProgress = () => {
  const queryClient = useQueryClient();

  const mutation = backend.useMutation(
    "patch",
    "/v1/additional-deliverables/projects/{projectId}/phases/{phaseId}/additional-deliverables/{additionalDeliverableId}/progress",
    {
      onSuccess: () => {
        // Invalidar todas las queries de entregables adicionales para este endpoint
        queryClient.invalidateQueries({
          queryKey: [
            "get",
            "/v1/additional-deliverables/projects/{projectId}/phases/{phaseId}/additional-deliverables",
          ],
        });

        // Invalidar cache específico del entregable adicional si existe
        queryClient.invalidateQueries({
          queryKey: [
            "get",
            "/v1/additional-deliverables/projects/{projectId}/phases/{phaseId}/additional-deliverables/{additionalDeliverableId}",
          ],
        });

        // Invalidar cache de entregables normales (para recalcular progreso)
        queryClient.invalidateQueries({
          queryKey: ["get", "/v1/deliverables/projects/{projectId}/phases/{phaseId}/deliverables"],
        });

        // Invalidar cache del proyecto (para recalcular progreso general)
        queryClient.invalidateQueries({
          queryKey: ["get", "/v1/projects/{projectId}"],
        });

        toast.success("Progreso del entregable adicional actualizado exitosamente");
      },
      onError: (error) => {
        console.error("Error updating additional deliverable progress:", error);
        toast.error("Error al actualizar el progreso del entregable adicional");
      },
    }
  );

  return { mutation };
};

/**
 * Hook para eliminar un entregable adicional
 */
export const useDeleteAdditionalDeliverable = () => {
  const queryClient = useQueryClient();

  const mutation = backend.useMutation(
    "delete",
    "/v1/additional-deliverables/projects/{projectId}/phases/{phaseId}/additional-deliverables/{additionalDeliverableId}",
    {
      onSuccess: () => {
        // Remover del cache específico del entregable adicional
        queryClient.removeQueries({
          queryKey: [
            "get",
            "/v1/additional-deliverables/projects/{projectId}/phases/{phaseId}/additional-deliverables/{additionalDeliverableId}",
          ],
        });

        // Invalidar todas las queries de entregables adicionales para este endpoint
        queryClient.invalidateQueries({
          queryKey: [
            "get",
            "/v1/additional-deliverables/projects/{projectId}/phases/{phaseId}/additional-deliverables",
          ],
        });

        // Invalidar cache de entregables normales (para recalcular progreso)
        queryClient.invalidateQueries({
          queryKey: ["get", "/v1/deliverables/projects/{projectId}/phases/{phaseId}/deliverables"],
        });

        // Invalidar cache del proyecto (para recalcular progreso general)
        queryClient.invalidateQueries({
          queryKey: ["get", "/v1/projects/{projectId}"],
        });

        toast.success("Entregable adicional eliminado exitosamente");
      },
      onError: (error) => {
        console.error("Error deleting additional deliverable:", error);
        toast.error("Error al eliminar el entregable adicional");
      },
    }
  );

  return { mutation };
};
