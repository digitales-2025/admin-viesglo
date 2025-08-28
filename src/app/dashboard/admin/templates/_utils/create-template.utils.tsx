import {
  DeliverableTemplateResponseDto,
  MilestoneTemplateResponseDto,
  PhaseTemplateResponseDto,
} from "../_types/templates.types";

// Función para calcular el orden visual basado en la posición
export const calculateVisualOrder = (index: number): string => {
  return (index + 1).toString();
};
// Función para calcular el orden visual de fases (ej: 1.1, 1.2, 2.1, 2.2)
export const calculatePhaseVisualOrder = (
  phase: PhaseTemplateResponseDto & { milestoneId?: string },
  milestones: MilestoneTemplateResponseDto[],
  phases: (PhaseTemplateResponseDto & { milestoneId?: string })[]
): string => {
  // Validar que phase.milestoneId existe
  if (!phase.milestoneId) return "";

  const milestone = milestones.find((m) => m.id === phase.milestoneId);
  if (!milestone) return "";

  const milestoneIndex = milestones.findIndex((m) => m.id === phase.milestoneId);
  const milestoneOrder = milestoneIndex + 1;

  const phasesInMilestone = phases.filter((p) => p.milestoneId === phase.milestoneId);
  const phaseIndex = phasesInMilestone.findIndex((p) => p.id === phase.id);
  const phaseOrder = phaseIndex + 1;

  return `${milestoneOrder}.${phaseOrder}`;
};

// Función para calcular el orden visual de deliverables (ej: 1.1.1, 1.1.2, 1.2.1)
export const calculateDeliverableVisualOrder = (
  deliverable: DeliverableTemplateResponseDto & { phaseId?: string },
  deliverables: (DeliverableTemplateResponseDto & { phaseId?: string })[],
  phases: (PhaseTemplateResponseDto & { milestoneId?: string })[],
  milestones: MilestoneTemplateResponseDto[]
): string => {
  // Si no tiene phaseId, buscar en los deliverables enriquecidos
  const phaseId = deliverable.phaseId || deliverables.find((d) => d.id === deliverable.id)?.phaseId;
  if (!phaseId) return "";

  const phase = phases.find((p) => p.id === phaseId);
  if (!phase) return "";

  const phaseOrder = calculatePhaseVisualOrder(phase, milestones, phases);
  if (!phaseOrder) return "";

  const deliverablesInPhase = deliverables.filter((d) => d.phaseId === phaseId);
  const deliverableIndex = deliverablesInPhase.findIndex((d) => d.id === deliverable.id);
  const deliverableOrder = deliverableIndex + 1;

  return `${phaseOrder}.${deliverableOrder}`;
};

// Extraer milestones, phases y deliverables de los milestones seleccionados
export const extractDataFromSelectedMilestones = (selectedMilestoneObjects: MilestoneTemplateResponseDto[]) => {
  if (!selectedMilestoneObjects || selectedMilestoneObjects.length === 0) {
    return {
      milestones: [],
      phases: [],
      deliverables: [],
    };
  }

  const allMilestones: MilestoneTemplateResponseDto[] = [];
  const allPhases: (PhaseTemplateResponseDto & { milestoneId: string })[] = [];
  const allDeliverables: (DeliverableTemplateResponseDto & { phaseId: string })[] = [];

  selectedMilestoneObjects.forEach((template) => {
    allMilestones.push(template);

    if (template.phases) {
      template.phases.forEach((phase) => {
        allPhases.push({
          ...phase,
          milestoneId: template.id,
        });

        if (phase.deliverables) {
          phase.deliverables.forEach((deliverable) => {
            allDeliverables.push({
              ...deliverable,
              phaseId: phase.id,
            });
          });
        }
      });
    }
  });

  const result = { milestones: allMilestones, phases: allPhases, deliverables: allDeliverables };

  return result;
};
