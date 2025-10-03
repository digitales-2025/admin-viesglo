"use client";

import { useCallback } from "react";

import { CreateProjectTemplate } from "../_schemas/projectTemplates.schemas";
import { MilestoneTemplateResponseDto } from "../_types/templates.types";
import { TagResponseDto } from "../../tags/_types/tags.types";

interface UseDraftRecoveryProps {
  setSelectedTags: (tags: string[]) => void;
  setSelectedTagObjects: (tags: TagResponseDto[]) => void;
  setSelectedMilestones: (milestones: string[]) => void;
  setSelectedMilestoneObjects: (milestones: MilestoneTemplateResponseDto[]) => void;
  allTags?: TagResponseDto[];
  allMilestones?: MilestoneTemplateResponseDto[];
}

export const useDraftRecovery = ({
  setSelectedTags,
  setSelectedTagObjects,
  setSelectedMilestones,
  setSelectedMilestoneObjects,
  allTags = [],
  allMilestones = [],
}: UseDraftRecoveryProps) => {
  const recoverDraftData = useCallback(
    (formData: CreateProjectTemplate) => {
      // Recuperar tags
      if (formData.tagIds && formData.tagIds.length > 0) {
        setSelectedTags(formData.tagIds);

        // Encontrar los objetos completos de tags
        const tagObjects = allTags.filter((tag) => formData.tagIds!.includes(tag.id));
        setSelectedTagObjects(tagObjects);
      } else {
        setSelectedTags([]);
        setSelectedTagObjects([]);
      }

      // Recuperar milestones
      if (formData.milestones && formData.milestones.length > 0) {
        const milestoneIds = formData.milestones.map((m) => m.milestoneTemplateId);
        setSelectedMilestones(milestoneIds);

        // Encontrar los objetos completos de milestones
        const milestoneObjects = allMilestones.filter((milestone) => milestoneIds.includes(milestone.id));
        setSelectedMilestoneObjects(milestoneObjects);
      } else {
        setSelectedMilestones([]);
        setSelectedMilestoneObjects([]);
      }
    },
    [setSelectedTags, setSelectedTagObjects, setSelectedMilestones, setSelectedMilestoneObjects, allTags, allMilestones]
  );

  return { recoverDraftData };
};
