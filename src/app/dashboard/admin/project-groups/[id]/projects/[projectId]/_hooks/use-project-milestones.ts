import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { backend } from "@/lib/api/types/backend";

/**
 * Hook para crear milestone
 */
export const useCreateMilestone = () => {
  const queryClient = useQueryClient();
  const mutation = backend.useMutation("post", "/v1/project-milestones/{projectId}/milestones", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/projects/{projectId}/milestones"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/projects/{id}"] });
      toast.success("Hito creado correctamente");
    },
    onError: (error) => {
      toast.error(error?.error?.userMessage || "Ocurrió un error inesperado");
    },
  });

  return {
    ...mutation,
    isSuccess: mutation.isSuccess,
  };
};

/**
 * Hook para actualizar milestone
 */
export const useUpdateMilestone = () => {
  const queryClient = useQueryClient();
  const mutation = backend.useMutation("put", "/v1/project-milestones/{projectId}/milestones/{milestoneId}", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/projects/{projectId}/milestones"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/projects/{id}"] });
      toast.success("Hito actualizado correctamente");
    },
    onError: (error) => {
      toast.error(error?.error?.userMessage || "Ocurrió un error inesperado");
    },
  });

  return {
    ...mutation,
    isSuccess: mutation.isSuccess,
  };
};

/**
 * Hook para eliminar milestone
 */
export const useDeleteMilestone = () => {
  const queryClient = useQueryClient();
  return backend.useMutation("delete", "/v1/project-milestones/{projectId}/milestones/{milestoneId}", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/projects/{projectId}/milestones"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/projects/{id}"] });
      toast.success("Hito eliminado correctamente");
    },
    onError: (error) => {
      toast.error(error?.error?.userMessage || "Ocurrió un error inesperado");
    },
  });
};

/**
 * Hook para actualizar estado de milestone
 */
export const useUpdateMilestoneStatus = () => {
  const queryClient = useQueryClient();
  return backend.useMutation("patch", "/v1/project-milestones/{projectId}/milestones/{milestoneId}/status", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/projects/{projectId}/milestones"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/projects/{id}"] });
      toast.success("Estado del hito actualizado correctamente");
    },
    onError: (error) => {
      toast.error(error?.error?.userMessage || "Ocurrió un error inesperado");
    },
  });
};

/**
 * Hook para asignar milestone
 */
export const useAssignMilestone = () => {
  const queryClient = useQueryClient();
  return backend.useMutation("patch", "/v1/project-milestones/{projectId}/milestones/{milestoneId}/assign", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/projects/{projectId}/milestones"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/projects/{id}"] });
      toast.success("Hito asignado correctamente");
    },
    onError: (error) => {
      toast.error(error?.error?.userMessage || "Ocurrió un error inesperado");
    },
  });
};
