import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { backend } from "@/lib/api/types/backend";

/**
 * Hook base para establecer fechas reales de un entregable
 * Permite establecer fecha de inicio, fecha de fin, o ambas
 */
const useSetDeliverableActualDatesBase = () => {
  const queryClient = useQueryClient();

  return backend.useMutation("put", "/v1/deliverables/{id}/actual-dates", {
    onSuccess: (data, variables) => {
      // Invalidar queries relacionadas para actualizar la UI
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/projects/{id}"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/projects/{projectId}/milestones"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/projects/paginated"] });

      // Invalidar queries de entregables
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

      let message = "Fechas del entregable actualizadas correctamente";

      if (hasStartDate && hasEndDate) {
        message = "Fechas de inicio y fin del entregable establecidas correctamente";
      } else if (hasStartDate) {
        message = "Fecha de inicio del entregable establecida correctamente";
      } else if (hasEndDate) {
        message = "Fecha de fin del entregable establecida correctamente";
      }

      toast.success(message);
    },
    onError: (error) => {
      toast.error(error?.error?.userMessage || "Ocurrió un error inesperado al establecer fechas");
    },
  });
};

/**
 * Hook para establecer fechas reales de un entregable (ambas o individuales)
 */
export const useSetDeliverableActualDates = () => {
  return useSetDeliverableActualDatesBase();
};

/**
 * Hook para establecer solo la fecha de inicio real de un entregable
 */
export const useSetDeliverableActualStartDate = () => {
  const baseMutation = useSetDeliverableActualDatesBase();

  return {
    ...baseMutation,
    mutate: (deliverableId: string, actualStartDate: string) => {
      return baseMutation.mutate({
        params: { path: { id: deliverableId } },
        body: {
          actualStartDate,
        },
      });
    },
  };
};

/**
 * Hook para establecer solo la fecha de fin real de un entregable
 */
export const useSetDeliverableActualEndDate = () => {
  const baseMutation = useSetDeliverableActualDatesBase();

  return {
    ...baseMutation,
    mutate: (deliverableId: string, actualEndDate: string) => {
      return baseMutation.mutate({
        params: { path: { id: deliverableId } },
        body: {
          actualEndDate,
        },
      });
    },
  };
};
