import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { backend } from "@/lib/api/types/backend";

/**
 * Hook base para establecer fechas reales de un entregable adicional
 * Permite establecer fecha de inicio, fecha de fin, o ambas
 */
const useSetAdditionalDeliverableActualDatesBase = () => {
  const queryClient = useQueryClient();

  return backend.useMutation("put", "/v1/additional-deliverable-actual-dates/{id}/actual-dates", {
    onSuccess: (data, variables) => {
      // Invalidar queries relacionadas para actualizar la UI
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/projects/{id}"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/projects/{projectId}/milestones"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/projects/paginated"] });

      // Invalidar queries de entregables adicionales
      queryClient.invalidateQueries({
        queryKey: ["get", "/v1/additional-deliverables/projects/{projectId}/phases/{phaseId}/additional-deliverables"],
      });
      queryClient.invalidateQueries({
        queryKey: [
          "get",
          "/v1/additional-deliverables/projects/{projectId}/phases/{phaseId}/additional-deliverables/paginated",
        ],
      });

      // Invalidar queries de entregables normales (para recalcular progreso)
      queryClient.invalidateQueries({
        queryKey: ["get", "/v1/project-deliverables/projects/{projectId}/phases/{phaseId}/deliverables"],
      });
      queryClient.invalidateQueries({
        queryKey: ["get", "/v1/project-deliverables/projects/{projectId}/phases/{phaseId}/deliverables/paginated"],
      });

      // Invalidar queries de milestones
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/project-milestones/{projectId}/milestones"] });

      // Determinar el mensaje de éxito basado en las fechas establecidas
      const hasStartDate = !!variables.body.actualStartDate;
      const hasEndDate = !!variables.body.actualEndDate;

      let message = "Fechas del entregable adicional actualizadas correctamente";

      if (hasStartDate && hasEndDate) {
        message = "Fechas de inicio y fin del entregable adicional establecidas correctamente";
      } else if (hasStartDate) {
        message = "Fecha de inicio del entregable adicional establecida correctamente";
      } else if (hasEndDate) {
        message = "Fecha de fin del entregable adicional establecida correctamente";
      }

      toast.success(message);
    },
    onError: (error) => {
      toast.error(
        error?.error?.userMessage || "Ocurrió un error inesperado al establecer fechas del entregable adicional"
      );
    },
  });
};

/**
 * Hook para establecer fechas reales de un entregable adicional (ambas o individuales)
 */
export const useSetAdditionalDeliverableActualDates = () => {
  return useSetAdditionalDeliverableActualDatesBase();
};

/**
 * Hook para establecer solo la fecha de inicio real de un entregable adicional
 */
export const useSetAdditionalDeliverableActualStartDate = () => {
  const baseMutation = useSetAdditionalDeliverableActualDatesBase();

  return {
    ...baseMutation,
    mutate: (additionalDeliverableId: string, actualStartDate: string) => {
      return baseMutation.mutate({
        params: { path: { id: additionalDeliverableId } },
        body: {
          actualStartDate,
        },
      });
    },
  };
};

/**
 * Hook para establecer solo la fecha de fin real de un entregable adicional
 */
export const useSetAdditionalDeliverableActualEndDate = () => {
  const baseMutation = useSetAdditionalDeliverableActualDatesBase();

  return {
    ...baseMutation,
    mutate: (additionalDeliverableId: string, actualEndDate: string) => {
      return baseMutation.mutate({
        params: { path: { id: additionalDeliverableId } },
        body: {
          actualEndDate,
        },
      });
    },
  };
};
