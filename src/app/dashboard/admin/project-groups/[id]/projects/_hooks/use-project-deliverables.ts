import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { backend } from "@/lib/api/types/backend";

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
 * Hook para agregar entregable a un hito
 */
export const useAddDeliverable = () => {
  const queryClient = useQueryClient();
  const mutation = backend.useMutation(
    "post",
    "/v1/project-deliverables/projects/{projectId}/milestones/{milestoneId}/deliverables",
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["get", "/v1/projects"] });
        queryClient.invalidateQueries({
          queryKey: ["get", "/v1/project-deliverables/projects/{projectId}/phases/{phaseId}/deliverables"],
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
    "/v1/project-deliverables/projects/{projectId}/milestones/{milestoneId}/deliverables/{deliverableId}",
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["get", "/v1/projects"] });
        queryClient.invalidateQueries({
          queryKey: ["get", "/v1/project-deliverables/projects/{projectId}/phases/{phaseId}/deliverables"],
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
    "/v1/project-deliverables/projects/{projectId}/milestones/{milestoneId}/deliverables/{deliverableId}/assign",
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["get", "/v1/projects"] });
        queryClient.invalidateQueries({
          queryKey: ["get", "/v1/project-deliverables/projects/{projectId}/phases/{phaseId}/deliverables"],
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
    "/v1/project-deliverables/projects/{projectId}/milestones/{milestoneId}/deliverables/{deliverableId}/progress",
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["get", "/v1/projects"] });
        queryClient.invalidateQueries({
          queryKey: ["get", "/v1/project-deliverables/projects/{projectId}/phases/{phaseId}/deliverables"],
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
    "/v1/project-deliverables/projects/{projectId}/milestones/{milestoneId}/deliverables/{deliverableId}/complete",
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["get", "/v1/projects"] });
        queryClient.invalidateQueries({
          queryKey: ["get", "/v1/project-deliverables/projects/{projectId}/phases/{phaseId}/deliverables"],
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
