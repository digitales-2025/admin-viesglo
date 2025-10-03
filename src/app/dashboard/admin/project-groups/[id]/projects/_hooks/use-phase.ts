import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { backend } from "@/lib/api/types/backend";

/**
 * Hook para agregar una fase a un hito
 */
export const useAddPhaseToMilestone = () => {
  const queryClient = useQueryClient();
  const mutation = backend.useMutation("post", "/v1/project-phases/{projectId}/milestones/{milestoneId}/phases", {
    onSuccess: () => {
      // Invalidar queries de milestones del proyecto
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/projects/{projectId}/milestones"] });
      // Invalidar queries de proyectos individuales
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/projects/{id}"] });
      // Invalidar queries de proyectos paginados
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/projects/paginated"] });
      // Invalidar infinite queries de proyectos
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/projects/paginated"] });
      // Invalidar queries de deliverables por fase
      queryClient.invalidateQueries({
        queryKey: ["get", "/v1/project-deliverables/projects/{projectId}/phases/{phaseId}/deliverables"],
      });
      toast.success("Fase agregada correctamente");
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
 * Hook para actualizar una fase
 */
export const useUpdatePhase = () => {
  const queryClient = useQueryClient();
  const mutation = backend.useMutation(
    "put",
    "/v1/project-phases/{projectId}/milestones/{milestoneId}/phases/{phaseId}",
    {
      onSuccess: () => {
        // Invalidar queries de milestones del proyecto
        queryClient.invalidateQueries({ queryKey: ["get", "/v1/projects/{projectId}/milestones"] });
        // Invalidar queries de proyectos individuales
        queryClient.invalidateQueries({ queryKey: ["get", "/v1/projects/{id}"] });
        // Invalidar queries de proyectos paginados
        queryClient.invalidateQueries({ queryKey: ["get", "/v1/projects/paginated"] });
        // Invalidar infinite queries de proyectos
        queryClient.invalidateQueries({ queryKey: ["get", "/v1/projects/paginated"] });
        // Invalidar queries de deliverables por fase
        queryClient.invalidateQueries({
          queryKey: ["get", "/v1/project-deliverables/projects/{projectId}/phases/{phaseId}/deliverables"],
        });
        toast.success("Fase actualizada correctamente");
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
 * Hook para remover una fase
 */
export const useRemovePhase = () => {
  const queryClient = useQueryClient();
  const mutation = backend.useMutation(
    "delete",
    "/v1/project-phases/{projectId}/milestones/{milestoneId}/phases/{phaseId}",
    {
      onSuccess: () => {
        // Invalidar queries de milestones del proyecto
        queryClient.invalidateQueries({ queryKey: ["get", "/v1/projects/{projectId}/milestones"] });
        // Invalidar queries de proyectos individuales
        queryClient.invalidateQueries({ queryKey: ["get", "/v1/projects/{id}"] });
        // Invalidar queries de proyectos paginados
        queryClient.invalidateQueries({ queryKey: ["get", "/v1/projects/paginated"] });
        // Invalidar infinite queries de proyectos
        queryClient.invalidateQueries({ queryKey: ["get", "/v1/projects/paginated"] });
        // Invalidar queries de deliverables por fase
        queryClient.invalidateQueries({
          queryKey: ["get", "/v1/project-deliverables/projects/{projectId}/phases/{phaseId}/deliverables"],
        });
        toast.success("Fase removida correctamente");
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
 * Hook para asignar una fase a un consultor
 */
export const useAssignPhase = () => {
  const queryClient = useQueryClient();
  const mutation = backend.useMutation(
    "patch",
    "/v1/project-phases/{projectId}/milestones/{milestoneId}/phases/{phaseId}/assign",
    {
      onSuccess: () => {
        // Invalidar queries de milestones del proyecto
        queryClient.invalidateQueries({ queryKey: ["get", "/v1/projects/{projectId}/milestones"] });
        // Invalidar queries de proyectos individuales
        queryClient.invalidateQueries({ queryKey: ["get", "/v1/projects/{id}"] });
        // Invalidar queries de proyectos paginados
        queryClient.invalidateQueries({ queryKey: ["get", "/v1/projects/paginated"] });
        // Invalidar infinite queries de proyectos
        queryClient.invalidateQueries({ queryKey: ["get", "/v1/projects/paginated"] });
        // Invalidar queries de deliverables por fase
        queryClient.invalidateQueries({
          queryKey: ["get", "/v1/project-deliverables/projects/{projectId}/phases/{phaseId}/deliverables"],
        });
        toast.success("Fase asignada correctamente");
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
