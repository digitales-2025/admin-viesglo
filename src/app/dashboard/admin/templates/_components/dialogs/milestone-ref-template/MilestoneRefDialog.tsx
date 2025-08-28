"use client";

import { ResponsiveDialog } from "@/shared/components/ui/resposive-dialog";
import { useMediaQuery } from "@/shared/hooks/use-media-query";
import { useMilestoneRefForm } from "../../../_hooks/use-milestone-ref-form";
import { MilestoneRefFormData } from "../../../_schemas/projectTemplates.schemas";
import { MilestoneTemplateRefRequestDto } from "../../../_types/templates.types";
import MilestoneRefForm from "./MilestoneRefForm";

interface MilestoneRefDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd?: (milestoneRef: MilestoneRefFormData) => void;
  onUpdate?: (milestoneRef: MilestoneRefFormData) => void;
  initialData?: MilestoneTemplateRefRequestDto;
  isUpdate?: boolean;
  onSuccess?: () => void;
}

export function MilestoneRefDialog({
  open,
  onOpenChange,
  onAdd,
  onUpdate,
  initialData,
  isUpdate = false,
  onSuccess,
}: MilestoneRefDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const { form, isPending } = useMilestoneRefForm({
    isUpdate,
    initialData,
    onSuccess: () => {
      onOpenChange(false);
      onSuccess?.();
    },
  });

  const handleSubmit = (data: MilestoneRefFormData) => {
    if (isUpdate && onUpdate) {
      onUpdate(data);
    } else if (onAdd) {
      onAdd(data);
    }
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      isDesktop={isDesktop}
      showTrigger={false}
      title={isUpdate ? "Editar Configuración de Hito" : "Configurar Hito de Plantilla"}
      description={
        isUpdate
          ? "Modifica la configuración del hito seleccionado. Cambia los campos necesarios y guarda los cambios."
          : "Configura un hito para tu plantilla de proyecto. Selecciona el milestone template y personaliza su configuración."
      }
      dialogContentClassName="sm:max-w-md px-0"
      dialogScrollAreaClassName="h-full max-h-[80vh] px-0"
      drawerScrollAreaClassName="h-[40vh] px-0"
    >
      <div className="pt-2">
        <MilestoneRefForm
          form={form}
          onSubmit={handleSubmit}
          onClose={() => onOpenChange(false)}
          isPending={isPending}
          isUpdate={isUpdate}
          initialData={initialData}
        />
      </div>
    </ResponsiveDialog>
  );
}
