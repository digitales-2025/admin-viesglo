"use client";

import { UseFormReturn } from "react-hook-form";

import { useDialogStore } from "@/shared/stores/useDialogStore";
import { CreateProjectTemplate, DeliverableFormData, PhaseFormData } from "../../_schemas/projectTemplates.schemas";
import {
  DeliverableTemplateResponseDto,
  MilestoneTemplateRefRequestDto,
  MilestoneTemplateResponseDto,
  PhaseTemplateResponseDto,
} from "../../_types/templates.types";
import {
  handleAddMilestoneRefConfig,
  handleUpdateMilestoneRefConfig,
} from "../../_utils/handlers/milestone-ref-template.handlers.utils";
import { DeliverableDialog } from "../dialogs/DeliverableDialog";
import { MilestoneRefDialog } from "../dialogs/MilestoneRefDialog";
import { PhaseDialog } from "../dialogs/PhaseDialog";

interface TemplatesOverlaysProps {
  form: UseFormReturn<CreateProjectTemplate>;
  milestones: MilestoneTemplateResponseDto[];
  phases: (PhaseTemplateResponseDto & { milestoneId: string })[];
  deliverables: (DeliverableTemplateResponseDto & { phaseId: string })[];
  onAddPhase?: (data: PhaseFormData) => void;
  onUpdatePhase?: (data: PhaseFormData) => void;
  onAddDeliverable?: (data: DeliverableFormData) => void;
  onUpdateDeliverable?: (data: DeliverableFormData) => void;
  onAddMilestoneRef?: (milestoneId: string) => void;
  onSuccess?: () => void;
  updateMilestones: (milestones: MilestoneTemplateRefRequestDto[]) => void;
}

export default function TemplatesOverlays({
  form,
  milestones,
  phases,
  deliverables,
  onAddPhase,
  onUpdatePhase,
  onAddDeliverable,
  onUpdateDeliverable,
  onAddMilestoneRef,
  onSuccess,
  updateMilestones,
}: TemplatesOverlaysProps) {
  const { isOpenForModule, data, close } = useDialogStore();

  // Constantes para módulos
  const PHASE_MODULE = "phase-templates";
  const DELIVERABLE_MODULE = "deliverable-templates";
  const MILESTONE_REF_MODULE = "milestone-ref-config";

  return (
    <>
      <MilestoneRefDialog
        key="milestone-ref-dialog"
        open={isOpenForModule(MILESTONE_REF_MODULE, "create") || isOpenForModule(MILESTONE_REF_MODULE, "edit")}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        onAdd={(data) => {
          handleAddMilestoneRefConfig(data, form, updateMilestones);
          close();
        }}
        onUpdate={(data) => {
          handleUpdateMilestoneRefConfig(data, form, updateMilestones);
          close();
        }}
        initialData={
          isOpenForModule(MILESTONE_REF_MODULE, "edit") && data?.milestoneTemplateId
            ? (form.getValues().milestones?.find((ref) => ref.milestoneTemplateId === data.milestoneTemplateId) as any)
            : undefined
        }
        isUpdate={isOpenForModule(MILESTONE_REF_MODULE, "edit")}
        onSuccess={() => {
          onSuccess?.();
          close();
        }}
      />

      <PhaseDialog
        key="phase-dialog"
        open={isOpenForModule(PHASE_MODULE, "create") || isOpenForModule(PHASE_MODULE, "edit")}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        onAdd={(data) => {
          onAddPhase?.(data);
          close();
        }}
        onUpdate={(data) => {
          onUpdatePhase?.(data);
          close();
        }}
        milestones={milestones} // Pasar milestones disponibles
        initialData={isOpenForModule(PHASE_MODULE, "edit") ? data : undefined}
        isUpdate={isOpenForModule(PHASE_MODULE, "edit")}
        onSuccess={() => {
          onSuccess?.();
          close();
        }}
      />

      <DeliverableDialog
        key="deliverable-dialog"
        open={isOpenForModule(DELIVERABLE_MODULE, "create") || isOpenForModule(DELIVERABLE_MODULE, "edit")}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        onAdd={(data) => {
          onAddDeliverable?.(data);
          close();
        }}
        onUpdate={(data) => {
          onUpdateDeliverable?.(data);
          close();
        }}
        phases={phases} // Pasar phases disponibles
        deliverables={deliverables} // Pasar deliverables disponibles
        milestoneTemplates={milestones} // Pasar milestone templates disponibles
        initialData={isOpenForModule(DELIVERABLE_MODULE, "edit") ? data : undefined}
        isUpdate={isOpenForModule(DELIVERABLE_MODULE, "edit")}
        onAddMilestoneRef={onAddMilestoneRef} // Pasar la función para agregar milestone ref
        onSuccess={() => {
          onSuccess?.();
          close();
        }}
      />
    </>
  );
}
