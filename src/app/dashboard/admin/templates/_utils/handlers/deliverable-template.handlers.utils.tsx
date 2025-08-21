import { DialogType } from "@/shared/stores/useDialogStore";
import { useChangePosition } from "../../_hooks";
import { DeliverableTemplateResponseDto, MilestoneTemplateResponseDto } from "../../_types/templates.types";

// Hook para manejar la edición de entregables
export const useHandleEditDeliverable = () => {
  return (
    deliverable: DeliverableTemplateResponseDto,
    deliverables: (DeliverableTemplateResponseDto & { phaseId: string })[],
    setDeliverableToEdit: (deliverable: DeliverableTemplateResponseDto & { phaseId: string }) => void,
    open: (module: string, type: DialogType, data?: any) => void
  ) => {
    // Buscar el entregable completo con phaseId en el array de deliverables
    const deliverableWithPhaseId = deliverables.find((d) => d.id === deliverable.id);
    if (deliverableWithPhaseId) {
      setDeliverableToEdit(deliverableWithPhaseId);
      open("deliverable-templates", "edit", deliverableWithPhaseId);
    } else {
      // Si no se encuentra, crear un objeto con phaseId vacío
      const deliverableWithEmptyPhaseId = { ...deliverable, phaseId: "" };
      setDeliverableToEdit(deliverableWithEmptyPhaseId);
      open("deliverable-templates", "edit", deliverableWithEmptyPhaseId);
    }
  };
};

// Hook para manejar la eliminación de entregables
export const useHandleDeleteDeliverable = () => {
  return (
    deliverableId: string,
    deliverables: (DeliverableTemplateResponseDto & { phaseId: string })[],
    setDeliverables: (deliverables: (DeliverableTemplateResponseDto & { phaseId: string })[]) => void
  ) => {
    setDeliverables(deliverables.filter((d) => d.id !== deliverableId));
  };
};

// Hook para manejar el drag and drop de entregables
export const useHandleDeliverableDragEnd = () => {
  const changePosition = useChangePosition();

  return (
    result: any,
    selectedPhase: string | null,
    deliverables: (DeliverableTemplateResponseDto & { phaseId: string })[],
    selectedMilestoneObjects: MilestoneTemplateResponseDto[],
    updateSelectedMilestoneObjects: (milestoneObjects: any) => void
  ) => {
    if (!result.destination) return;

    // Si no hay phase seleccionado, no hacer nada
    if (!selectedPhase) return;

    const visibleDeliverables = deliverables.filter((d) => d.phaseId === selectedPhase);
    const movedDeliverable = visibleDeliverables[result.source.index];

    if (!movedDeliverable) return;

    changePosition.mutate(
      {
        body: {
          positionId: movedDeliverable.id,
          type: "deliverable" as const,
          newPosition: result.destination.index,
        },
      },
      {
        onSuccess: (data) => {
          // Actualizar selectedMilestoneObjects con la respuesta del backend
          const updatedMilestoneObjects = selectedMilestoneObjects.map((milestone) => {
            if (milestone.id === data.id) {
              return data; // Reemplazar con los datos actualizados del backend
            }
            return milestone;
          });

          // Actualizar el estado
          updateSelectedMilestoneObjects(updatedMilestoneObjects);
        },
        onError: () => {},
      }
    );
  };
};
