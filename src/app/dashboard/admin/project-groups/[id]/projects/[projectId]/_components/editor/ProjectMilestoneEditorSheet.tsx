import { useEffect } from "react";
import { Send } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { GenericSheet } from "@/shared/components/ui/generic-responsive-sheet";
import { SheetClose, SheetFooter } from "@/shared/components/ui/sheet";
import { useMilestoneForm } from "../../_hooks/use-milestone-form";
import ProjectMilestoneEditorForm from "./ProjectMilestoneEditorForm";

interface ProjectMilestoneEditorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: {
    id?: string;
    name?: string;
    startDate?: string;
    endDate?: string;
  };
  projectId: string;
}

export default function ProjectMilestoneEditorSheet({
  open,
  onOpenChange,
  currentRow,
  projectId,
}: ProjectMilestoneEditorSheetProps) {
  const isUpdate = !!currentRow?.id;

  // Usar el hook centralizado de formulario
  const { form, isPending, onSubmit } = useMilestoneForm({
    isUpdate,
    initialData: currentRow,
    onSuccess: () => onOpenChange(false),
    projectId,
  });

  // Limpiar formulario cuando se cambia entre crear/actualizar
  useEffect(() => {
    if (open) {
      if (!isUpdate) {
        // Si es crear, resetear completamente el formulario
        form.reset({
          name: "",
          startDate: undefined,
          endDate: undefined,
        });
      }
    }
  }, [open, isUpdate, form]);

  return (
    <GenericSheet
      open={open}
      onOpenChange={(v) => {
        if (!isPending) {
          onOpenChange(v);
          if (!v) {
            form.reset();
          }
        }
      }}
      title={`${isUpdate ? "Actualizar" : "Crear"} hito`}
      titleClassName="text-2xl font-bold capitalize"
      description={
        isUpdate
          ? "Actualiza el hito proporcionando la información necesaria."
          : "Agrega un nuevo hito proporcionando la información necesaria."
      }
      maxWidth="lg"
      showDefaultFooter={false}
      footer={
        <SheetFooter className="gap-2">
          <Button
            form="milestone-form"
            type="submit"
            disabled={isPending}
            className="min-w-[180px] flex items-center justify-center"
          >
            {isPending ? (
              <>
                <span className="mr-2">Guardando...</span>
                <Send className="w-4 h-4 opacity-0" />
              </>
            ) : (
              <>
                <span className="mr-2">{isUpdate ? "Actualizar Hito" : "Crear Hito"}</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </Button>
          <SheetClose asChild>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancelar
            </Button>
          </SheetClose>
        </SheetFooter>
      }
    >
      <ProjectMilestoneEditorForm form={form} onSubmit={onSubmit} isPending={isPending} />
    </GenericSheet>
  );
}
