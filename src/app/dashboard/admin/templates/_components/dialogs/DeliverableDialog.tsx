"use client";

import { ResponsiveDialog } from "@/shared/components/ui/resposive-dialog";
import { useMediaQuery } from "@/shared/hooks/use-media-query";
import { useDeliverableTemplateForm } from "../../_hooks/use-deliverable-template-form";
import { DeliverableFormData } from "../../_schemas/projectTemplates.schemas";
import {
  DeliverableTemplateResponseDto,
  MilestoneTemplateResponseDto,
  PhaseTemplateResponseDto,
} from "../../_types/templates.types";
import DeliverableForm from "./DeliverableForm";

interface DeliverableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd?: (deliverable: DeliverableFormData) => void;
  onUpdate?: (deliverable: DeliverableFormData) => void;
  phases: (PhaseTemplateResponseDto & { milestoneId: string })[];
  deliverables: (DeliverableTemplateResponseDto & { phaseId: string })[];
  milestoneTemplates: MilestoneTemplateResponseDto[];
  initialData?: DeliverableTemplateResponseDto & { phaseId?: string };
  isUpdate?: boolean;
  onSuccess?: () => void;
  onAddMilestoneRef?: (milestoneId: string) => void; // Nueva prop para agregar milestone ref
}

export function DeliverableDialog({
  open,
  onOpenChange,
  onAdd,
  onUpdate,
  phases,
  deliverables,
  milestoneTemplates,
  initialData,
  isUpdate = false,
  onSuccess,
  onAddMilestoneRef,
}: DeliverableDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Para crear nuevos entregables, no necesitamos parámetros iniciales
  // Los valores se seleccionarán en el form
  const { form, onSubmit } = useDeliverableTemplateForm({
    isUpdate,
    initialData,
    onSuccess: () => {
      onOpenChange(false);
      onSuccess?.();
    },
  });

  const handleSubmit = (data: DeliverableFormData, selectedMilestoneId?: string, selectedPhaseId?: string) => {
    if (isUpdate && onUpdate) {
      onUpdate(data);
    } else if (onAdd) {
      onAdd(data);

      // Si es un nuevo deliverable y tenemos un milestone seleccionado, agregar automáticamente el milestone ref
      if (selectedMilestoneId && onAddMilestoneRef) {
        onAddMilestoneRef(selectedMilestoneId);
      }
    }
    onSubmit(data, selectedMilestoneId, selectedPhaseId);
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      isDesktop={isDesktop}
      showTrigger={false}
      title={isUpdate ? "Editar Entregable" : "Crear Nuevo Entregable"}
      description={
        isUpdate
          ? "Modifica la información del entregable seleccionado. Cambia los campos necesarios y guarda los cambios."
          : "Completa el formulario para crear un nuevo entregable y así agregarlo a la plantilla del proyecto."
      }
      dialogContentClassName="sm:max-w-4xl max-h-[90vh] px-0"
      dialogScrollAreaClassName="h-full max-h-[80vh] px-0"
      drawerScrollAreaClassName="h-[40vh] px-0"
    >
      <div className="pt-2">
        <DeliverableForm
          form={form}
          onSubmit={handleSubmit}
          onClose={() => onOpenChange(false)}
          phases={phases}
          deliverables={deliverables}
          milestoneTemplates={milestoneTemplates}
          isUpdate={isUpdate}
          initialData={initialData}
        />
      </div>
    </ResponsiveDialog>
  );
}
