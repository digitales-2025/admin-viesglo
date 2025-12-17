import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { backend } from "@/lib/api/types/backend";
import { invalidateProjectAndMilestoneQueries } from "../../_utils/query-invalidation";

/**
 * Hook para crear milestone
 */
export const useCreateMilestone = () => {
  const queryClient = useQueryClient();
  const mutation = backend.useMutation("post", "/v1/project-milestones/{projectId}/milestones", {
    onSuccess: () => {
      invalidateProjectAndMilestoneQueries(queryClient);
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
      invalidateProjectAndMilestoneQueries(queryClient);
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
      invalidateProjectAndMilestoneQueries(queryClient);
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
      invalidateProjectAndMilestoneQueries(queryClient);
      toast.success("Estado del hito actualizado correctamente");
    },
    onError: (error) => {
      toast.error(error?.error?.userMessage || "Ocurrió un error inesperado");
    },
  });
};

/**
 * Hook para asignar/desasignar milestone
 */
export const useAssignMilestone = () => {
  const queryClient = useQueryClient();
  return backend.useMutation("patch", "/v1/project-milestones/{projectId}/milestones/{milestoneId}/assign", {
    onSuccess: (data, variables) => {
      invalidateProjectAndMilestoneQueries(queryClient);

      // Determinar si se está asignando o desasignando basado en consultantId
      const isUnassigning =
        !variables.body.consultantId ||
        variables.body.consultantId.trim() === "" ||
        variables.body.consultantId === null;
      const message = isUnassigning ? "Hito desasignado correctamente" : "Hito asignado correctamente";

      toast.success(message);
    },
    onError: (error) => {
      toast.error(error?.error?.userMessage || "Ocurrió un error inesperado");
    },
  });
};
