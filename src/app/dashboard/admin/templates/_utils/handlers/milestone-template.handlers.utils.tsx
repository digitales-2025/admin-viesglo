import { UseFormReturn } from "react-hook-form";

import { CreateProjectTemplate } from "../../_schemas/projectTemplates.schemas";
import { MilestoneTemplateResponseDto } from "../../_types/templates.types";

export const handleMilestoneDragEnd = (
  result: any,
  milestones: MilestoneTemplateResponseDto[],
  setMilestones: (milestones: MilestoneTemplateResponseDto[]) => void,
  form?: UseFormReturn<CreateProjectTemplate>
) => {
  if (!result.destination) return;

  const items = Array.from(milestones);
  const [reorderedItem] = items.splice(result.source.index, 1);
  items.splice(result.destination.index, 0, reorderedItem);

  setMilestones(items);

  // Si se proporciona el formulario, actualizar también la posición en milestoneRefs
  if (form) {
    const currentMilestoneRefs = form.getValues().milestones || [];

    // Reordenar los milestoneRefs según el nuevo orden de milestones
    // Mantener todas las configuraciones existentes, solo cambiar el orden
    const reorderedMilestoneRefs = items.map((milestone) => {
      const existingRef = currentMilestoneRefs.find((ref) => ref.milestoneTemplateId === milestone.id);
      if (existingRef) {
        return existingRef;
      } else {
        return {
          milestoneTemplateId: milestone.id,
          isRequired: false,
          customName: undefined,
          customizations: undefined,
        };
      }
    });

    // Actualizar el formulario con el nuevo orden
    form.setValue("milestones", reorderedMilestoneRefs, { shouldValidate: true });
  }
};

export const handleDeleteMilestone = (
  milestoneId: string,
  milestones: MilestoneTemplateResponseDto[],
  setMilestones: (milestones: MilestoneTemplateResponseDto[]) => void
) => {
  setMilestones(milestones.filter((m) => m.id !== milestoneId));
};
