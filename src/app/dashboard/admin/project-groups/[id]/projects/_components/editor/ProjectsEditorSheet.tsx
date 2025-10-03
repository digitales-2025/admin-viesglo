import { Send } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { GenericSheet } from "@/shared/components/ui/generic-responsive-sheet";
import { SheetClose, SheetFooter } from "@/shared/components/ui/sheet";
import { useProjectForm } from "../../_hooks/use-project-form";
import { ProjectResponseDto } from "../../_types";
import ProjectsEditorForm from "./ProjectsEditorForm";

interface ProjectsEditorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: ProjectResponseDto;
  projectGroupId: string;
}

export default function ProjectsEditorSheet({
  open,
  onOpenChange,
  currentRow,
  projectGroupId,
}: ProjectsEditorSheetProps) {
  const isUpdate = !!currentRow?.id;

  // Usar el hook centralizado de formulario
  const { form, isPending, onSubmit } = useProjectForm({
    isUpdate,
    initialData: currentRow,
    onSuccess: () => onOpenChange(false),
    projectGroupId,
  });

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
      title={`${isUpdate ? "Actualizar" : "Crear"} proyecto`}
      titleClassName="text-2xl font-bold capitalize"
      description={
        isUpdate
          ? "Actualiza el proyecto proporcionando la información necesaria."
          : "Agrega un nuevo proyecto proporcionando la información necesaria."
      }
      maxWidth="xl"
      showDefaultFooter={false}
      footer={
        <SheetFooter className="gap-2">
          <Button
            form="projects-form"
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
                <span className="mr-2">{isUpdate ? "Actualizar Proyecto" : "Crear Proyecto"}</span>
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
      <ProjectsEditorForm form={form} onSubmit={onSubmit} isUpdate={isUpdate} isPending={isPending} />
    </GenericSheet>
  );
}
