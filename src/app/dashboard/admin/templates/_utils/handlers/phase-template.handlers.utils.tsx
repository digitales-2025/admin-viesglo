import { DialogType } from "@/shared/stores/useDialogStore";
import { useChangePosition } from "../../_hooks";
import { MilestoneTemplateResponseDto, PhaseTemplateResponseDto } from "../../_types/templates.types";

// Hook para manejar la edición de fases
export const useHandleEditPhase = () => {
  return (
    phase: PhaseTemplateResponseDto,
    open: (module: string, type: DialogType, data?: any) => void,
    phases: (PhaseTemplateResponseDto & { milestoneId: string })[],
    setPhaseToEdit: (phase: PhaseTemplateResponseDto & { milestoneId: string }) => void
  ) => {
    // Buscar la fase completa con milestoneId en el array de phases
    const phaseWithMilestoneId = phases.find((p) => p.id === phase.id);
    if (phaseWithMilestoneId) {
      setPhaseToEdit(phaseWithMilestoneId);
      open("phase-templates", "edit", phaseWithMilestoneId);
    } else {
      // Si no se encuentra, crear un objeto con milestoneId vacío
      const phaseWithEmptyMilestoneId = { ...phase, milestoneId: "" };
      setPhaseToEdit(phaseWithEmptyMilestoneId);
      open("phase-templates", "edit", phaseWithEmptyMilestoneId);
    }
  };
};

// Hook para manejar la eliminación de fases
export const useHandleDeletePhase = () => {
  return (
    phaseId: string,
    phases: (PhaseTemplateResponseDto & { milestoneId: string })[],
    setPhases: (phases: (PhaseTemplateResponseDto & { milestoneId: string })[]) => void
  ) => {
    setPhases(phases.filter((p) => p.id !== phaseId));
  };
};

// Hook para manejar el drag and drop de fases
export const useHandlePhaseDragEnd = () => {
  const changePosition = useChangePosition();

  return (
    result: any,
    selectedMilestone: string | null,
    phases: (PhaseTemplateResponseDto & { milestoneId: string })[],
    selectedMilestoneObjects: MilestoneTemplateResponseDto[],
    updateSelectedMilestoneObjects: (milestoneObjects: MilestoneTemplateResponseDto[]) => void
  ) => {
    if (!result.destination) return;

    // Si no hay milestone seleccionado, no hacer nada
    if (!selectedMilestone) return;

    const visiblePhases = phases.filter((p) => p.milestoneId === selectedMilestone);
    const movedPhase = visiblePhases[result.source.index];

    if (!movedPhase) return;

    changePosition.mutate(
      {
        body: {
          positionId: movedPhase.id,
          type: "phase" as const,
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
