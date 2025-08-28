"use client";

import { ResponsiveDialog } from "@/shared/components/ui/resposive-dialog";
import { useMediaQuery } from "@/shared/hooks/use-media-query";
import { usePhaseTemplateForm } from "../../../_hooks/use-phase-template-form";
import { PhaseFormData } from "../../../_schemas/projectTemplates.schemas";
import { MilestoneTemplateResponseDto, PhaseTemplateResponseDto } from "../../../_types/templates.types";
import PhaseForm from "./PhaseForm";

interface PhaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd?: (phase: PhaseFormData, selectedMilestoneId?: string) => void;
  onUpdate?: (phase: PhaseFormData) => void;
  milestones: MilestoneTemplateResponseDto[];
  initialData?: PhaseTemplateResponseDto & { milestoneId?: string };
  isUpdate?: boolean;
  onSuccess?: (response?: MilestoneTemplateResponseDto) => void;
}

export function PhaseDialog({
  open,
  onOpenChange,
  onAdd,
  onUpdate,
  milestones,
  initialData,
  isUpdate = false,
  onSuccess,
}: PhaseDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const { form, onSubmit, isPending } = usePhaseTemplateForm({
    isUpdate,
    initialData,
    onSuccess: (response) => {
      onOpenChange(false);
      onSuccess?.(response);
    },
  });

  const handleSubmit = (data: PhaseFormData, selectedMilestoneId?: string) => {
    if (isUpdate && onUpdate) {
      onUpdate(data);
    } else if (onAdd) {
      onAdd(data, selectedMilestoneId);
    }
    onSubmit(data, selectedMilestoneId);
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      isDesktop={isDesktop}
      showTrigger={false}
      title={isUpdate ? "Editar Fase" : "Crear Nueva Fase"}
      description={
        isUpdate ? "Completa los campos para actualizar la fase" : "Completa los campos para crear una nueva fase"
      }
      dialogContentClassName="sm:max-w-md px-0"
      dialogScrollAreaClassName="h-full max-h-[80vh] px-0"
      drawerContentClassName="max-h-[60vh]"
      drawerScrollAreaClassName="h-full px-0"
    >
      <div className="pt-2 pb-4">
        <PhaseForm
          form={form}
          onSubmit={handleSubmit}
          onClose={() => onOpenChange(false)}
          milestones={milestones}
          isPending={isPending}
          isUpdate={isUpdate}
          initialData={initialData}
        />
      </div>
    </ResponsiveDialog>
  );
}
