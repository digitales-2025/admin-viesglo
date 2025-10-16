import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";

import { backend } from "@/lib/api/types/backend";
import { usePagination } from "@/shared/hooks/use-pagination";

/**
 * Claves de cache para entregables
 */
export const DELIVERABLES_KEYS = {
  all: ["deliverables"] as const,
  lists: () => [...DELIVERABLES_KEYS.all, "list"] as const,
  list: (projectId: string, phaseId: string) => [...DELIVERABLES_KEYS.lists(), projectId, phaseId] as const,
  paginated: (projectId: string, phaseId: string) =>
    [...DELIVERABLES_KEYS.lists(), projectId, phaseId, "paginated"] as const,
  detail: (projectId: string, phaseId: string, deliverableId: string) =>
    [...DELIVERABLES_KEYS.all, projectId, phaseId, deliverableId] as const,
};

/**
 * Hook para obtener entregables por fase
 */
export const usePhaseDeliverables = (projectId: string, phaseId: string) => {
  const query = backend.useQuery("get", "/v1/project-deliverables/projects/{projectId}/phases/{phaseId}/deliverables", {
    params: {
      path: {
        projectId,
        phaseId,
      },
    },
    enabled: !!projectId && !!phaseId,
  });

  return { query };
};

/**
 * Hook para obtener entregables por fase con paginación y filtros
 */
export const usePhaseDeliverablesPaginated = (projectId: string, phaseId: string) => {
  const [search, setSearch] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<"REGISTERED" | "IN_PROCESS" | "FINISHED" | undefined>(undefined);
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | undefined>(undefined);
  const [assignedToId, setAssignedToId] = useState<string | undefined>(undefined);
  const [hasDocuments, setHasDocuments] = useState<boolean | undefined>(undefined);
  const [isCompleted, setIsCompleted] = useState<boolean | undefined>(undefined);
  const [sortField, setSortField] = useState<"name" | "lastName" | "email" | "createdAt" | "updatedAt" | undefined>(
    undefined
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>(undefined);
  const { page, size, setPagination, resetPagination } = usePagination();

  const query = backend.useQuery(
    "get",
    "/v1/project-deliverables/projects/{projectId}/phases/{phaseId}/deliverables/paginated",
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
          priority,
          assignedToId,
          hasDocuments,
          isCompleted,
          sortField,
          sortOrder,
        },
      },
      enabled: !!projectId && !!phaseId,
    }
  );

  // Función interna para actualizar el search (sin debounce)
  const updateSearch = useCallback((value: string) => {
    if (value !== "None" && value !== null && value !== undefined) {
      setSearch(value.trim());
    }
  }, []);

  // Función con debounce para el search (igual que en AutoComplete)
  const debouncedSearch = useDebouncedCallback((value: string) => {
    updateSearch(value);
  }, 300);

  const handleSearchChange = useCallback(
    (value: string) => {
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  const handleStatusFilter = useCallback((status: "REGISTERED" | "IN_PROCESS" | "FINISHED" | undefined) => {
    setStatus(status);
  }, []);

  const handlePriorityFilter = useCallback((priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | undefined) => {
    setPriority(priority);
  }, []);

  const handleAssignedToFilter = useCallback((assignedToId: string | undefined) => {
    setAssignedToId(assignedToId);
  }, []);

  const handleHasDocumentsFilter = useCallback((hasDocuments: boolean | undefined) => {
    setHasDocuments(hasDocuments);
  }, []);

  const handleIsCompletedFilter = useCallback((isCompleted: boolean | undefined) => {
    setIsCompleted(isCompleted);
  }, []);

  const handleSortChange = useCallback(
    (
      field: "name" | "lastName" | "email" | "createdAt" | "updatedAt" | undefined,
      order: "asc" | "desc" | undefined
    ) => {
      setSortField(field);
      setSortOrder(order);
    },
    []
  );

  const clearFilters = useCallback(() => {
    setSearch(undefined);
    setStatus(undefined);
    setPriority(undefined);
    setAssignedToId(undefined);
    setHasDocuments(undefined);
    setIsCompleted(undefined);
    setSortField(undefined);
    setSortOrder(undefined);
  }, []);

  return {
    query,
    setPagination,
    resetPagination,
    phase: query.data?.phase,
    deliverables: query.data?.deliverables || [],
    meta: query.data?.meta,
    // Funciones de filtrado
    handleSearchChange,
    handleStatusFilter,
    handlePriorityFilter,
    handleAssignedToFilter,
    handleHasDocumentsFilter,
    handleIsCompletedFilter,
    handleSortChange,
    clearFilters,
    // Estados de filtros
    search,
    setSearch,
    status,
    setStatus,
    priority,
    setPriority,
    assignedToId,
    setAssignedToId,
    hasDocuments,
    setHasDocuments,
    isCompleted,
    setIsCompleted,
    sortField,
    setSortField,
    sortOrder,
    setSortOrder,
  };
};

/**
 * Hook para agregar entregable a una fase
 */
export const useAddDeliverable = () => {
  const queryClient = useQueryClient();
  const mutation = backend.useMutation(
    "post",
    "/v1/project-deliverables/projects/{projectId}/phases/{phaseId}/deliverables",
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["get", "/v1/projects"] });
        queryClient.invalidateQueries({
          queryKey: ["get", "/v1/project-deliverables/projects/{projectId}/phases/{phaseId}/deliverables"],
        });
        queryClient.invalidateQueries({
          queryKey: ["get", "/v1/project-deliverables/projects/{projectId}/phases/{phaseId}/deliverables/paginated"],
        });
        toast.success("Entregable agregado correctamente");
      },
      onError: (error) => {
        toast.error(error?.error?.userMessage || "Ocurrió un error inesperado");
      },
    }
  );

  return {
    ...mutation,
    isSuccess: mutation.isSuccess,
  };
};

/**
 * Hook para actualizar entregable
 */
export const useUpdateDeliverable = () => {
  const queryClient = useQueryClient();
  const mutation = backend.useMutation(
    "put",
    "/v1/project-deliverables/projects/{projectId}/phases/{phaseId}/deliverables/{deliverableId}",
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["get", "/v1/projects"] });
        queryClient.invalidateQueries({
          queryKey: ["get", "/v1/project-deliverables/projects/{projectId}/phases/{phaseId}/deliverables"],
        });
        queryClient.invalidateQueries({
          queryKey: ["get", "/v1/project-deliverables/projects/{projectId}/phases/{phaseId}/deliverables/paginated"],
        });
        toast.success("Entregable actualizado correctamente");
      },
      onError: (error) => {
        toast.error(error?.error?.userMessage || "Ocurrió un error inesperado");
      },
    }
  );

  return {
    ...mutation,
    isSuccess: mutation.isSuccess,
  };
};

/**
 * Hook para asignar entregable a un usuario
 */
export const useAssignDeliverable = () => {
  const queryClient = useQueryClient();
  const mutation = backend.useMutation(
    "patch",
    "/v1/project-deliverables/projects/{projectId}/phases/{phaseId}/deliverables/{deliverableId}/assign",
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["get", "/v1/projects"] });
        queryClient.invalidateQueries({
          queryKey: ["get", "/v1/project-deliverables/projects/{projectId}/phases/{phaseId}/deliverables"],
        });
        queryClient.invalidateQueries({
          queryKey: ["get", "/v1/project-deliverables/projects/{projectId}/phases/{phaseId}/deliverables/paginated"],
        });
        toast.success("Entregable asignado correctamente");
      },
      onError: (error) => {
        toast.error(error?.error?.userMessage || "Ocurrió un error inesperado");
      },
    }
  );

  return {
    ...mutation,
    isSuccess: mutation.isSuccess,
  };
};

/**
 * Hook para actualizar progreso de entregable
 */
export const useUpdateDeliverableProgress = () => {
  const queryClient = useQueryClient();
  const mutation = backend.useMutation(
    "patch",
    "/v1/project-deliverables/projects/{projectId}/phases/{phaseId}/deliverables/{deliverableId}/progress",
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["get", "/v1/projects"] });
        queryClient.invalidateQueries({
          queryKey: ["get", "/v1/project-deliverables/projects/{projectId}/phases/{phaseId}/deliverables"],
        });
        queryClient.invalidateQueries({
          queryKey: ["get", "/v1/project-deliverables/projects/{projectId}/phases/{phaseId}/deliverables/paginated"],
        });
        toast.success("Progreso del entregable actualizado correctamente");
      },
      onError: (error) => {
        toast.error(error?.error?.userMessage || "Ocurrió un error inesperado");
      },
    }
  );

  return {
    ...mutation,
    isSuccess: mutation.isSuccess,
  };
};

/**
 * Hook para completar entregable
 */
export const useCompleteDeliverable = () => {
  const queryClient = useQueryClient();
  const mutation = backend.useMutation(
    "patch",
    "/v1/project-deliverables/projects/{projectId}/phases/{phaseId}/deliverables/{deliverableId}/complete",
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["get", "/v1/projects"] });
        queryClient.invalidateQueries({
          queryKey: ["get", "/v1/project-deliverables/projects/{projectId}/phases/{phaseId}/deliverables"],
        });
        queryClient.invalidateQueries({
          queryKey: ["get", "/v1/project-deliverables/projects/{projectId}/phases/{phaseId}/deliverables/paginated"],
        });
        toast.success("Entregable completado correctamente");
      },
      onError: (error) => {
        toast.error(error?.error?.userMessage || "Ocurrió un error inesperado");
      },
    }
  );

  return {
    ...mutation,
    isSuccess: mutation.isSuccess,
  };
};

/**
 * Hook para establecer precedente de entregable
 */
export const useSetPrecedent = () => {
  const queryClient = useQueryClient();
  const mutation = backend.useMutation(
    "patch",
    "/v1/project-deliverables/projects/{projectId}/phases/{phaseId}/deliverables/{deliverableId}/precedent",
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["get", "/v1/projects"] });
        queryClient.invalidateQueries({
          queryKey: ["get", "/v1/project-deliverables/projects/{projectId}/phases/{phaseId}/deliverables"],
        });
        queryClient.invalidateQueries({
          queryKey: ["get", "/v1/project-deliverables/projects/{projectId}/phases/{phaseId}/deliverables/paginated"],
        });
        toast.success("Precedente establecido correctamente");
      },
      onError: (error) => {
        toast.error(error?.error?.userMessage || "Ocurrió un error inesperado");
      },
    }
  );

  return {
    ...mutation,
    isSuccess: mutation.isSuccess,
  };
};

/**
 * Hook para remover precedente de entregable
 */
export const useRemovePrecedent = () => {
  const queryClient = useQueryClient();
  return backend.useMutation(
    "delete",
    "/v1/project-deliverables/projects/{projectId}/phases/{phaseId}/deliverables/{deliverableId}/precedent",
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["get", "/v1/project-deliverables/projects/{projectId}/phases/{phaseId}/deliverables"],
        });
        queryClient.invalidateQueries({
          queryKey: ["get", "/v1/project-deliverables/projects/{projectId}/phases/{phaseId}/deliverables/paginated"],
        });
        queryClient.invalidateQueries({ queryKey: ["get", "/v1/projects/{id}"] });
        toast.success("Precedente removido correctamente");
      },
      onError: (error: any) => {
        toast.error(error?.error?.userMessage || "Ocurrió un error inesperado");
      },
    }
  );
};

export const useDeleteDeliverable = () => {
  const queryClient = useQueryClient();
  return backend.useMutation(
    "delete",
    "/v1/project-deliverables/projects/{projectId}/phases/{phaseId}/deliverables/{deliverableId}",
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["get", "/v1/project-deliverables/projects/{projectId}/phases/{phaseId}/deliverables"],
        });
        queryClient.invalidateQueries({
          queryKey: ["get", "/v1/project-deliverables/projects/{projectId}/phases/{phaseId}/deliverables/paginated"],
        });
        queryClient.invalidateQueries({ queryKey: ["get", "/v1/projects/{id}"] });
        toast.success("Entregable eliminado correctamente");
      },
      onError: (error: any) => {
        toast.error(error?.error?.userMessage || "Ocurrió un error inesperado");
      },
    }
  );
};

/**
 * Hook para toggle del estado de aprobación de un entregable
 */
export const useToggleDeliverableApproval = () => {
  const queryClient = useQueryClient();
  const mutation = backend.useMutation(
    "patch",
    "/v1/project-deliverables/projects/{projectId}/phases/{phaseId}/deliverables/{deliverableId}/toggle-approval",
    {
      onSuccess: (data) => {
        // Invalidar todas las queries relacionadas con entregables
        queryClient.invalidateQueries({ queryKey: ["get", "/v1/projects"] });
        queryClient.invalidateQueries({
          queryKey: ["get", "/v1/project-deliverables/projects/{projectId}/phases/{phaseId}/deliverables"],
        });
        queryClient.invalidateQueries({
          queryKey: ["get", "/v1/project-deliverables/projects/{projectId}/phases/{phaseId}/deliverables/paginated"],
        });

        // Mostrar mensaje de éxito basado en el nuevo estado
        const isApproved = data.data?.isApproved;
        const message = isApproved ? "Entregable aprobado correctamente" : "Entregable desaprobado correctamente";

        toast.success(message);
      },
      onError: (error) => {
        toast.error(error?.error?.userMessage || "Ocurrió un error inesperado");
      },
    }
  );

  return {
    ...mutation,
    isSuccess: mutation.isSuccess,
  };
};
