import { MilestoneTemplateResponseDto } from "../../_types/templates.types";

export const handleMilestoneDragEnd = (
  result: any,
  milestones: MilestoneTemplateResponseDto[],
  setMilestones: (milestones: MilestoneTemplateResponseDto[]) => void
) => {
  if (!result.destination) return;

  const items = Array.from(milestones);
  const [reorderedItem] = items.splice(result.source.index, 1);
  items.splice(result.destination.index, 0, reorderedItem);

  setMilestones(items);
};

export const handleDeleteMilestone = (
  milestoneId: string,
  milestones: MilestoneTemplateResponseDto[],
  setMilestones: (milestones: MilestoneTemplateResponseDto[]) => void
) => {
  setMilestones(milestones.filter((m) => m.id !== milestoneId));
};
