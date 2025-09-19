"use client";

import { useEffect } from "react";
import { Send } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { GenericSheet } from "@/shared/components/ui/generic-responsive-sheet";
import { SheetClose, SheetFooter } from "@/shared/components/ui/sheet";
import { useProjectGroupForm } from "../../_hooks/use-project-group-form";
import { ProjectGroupResponseDto } from "../../_types/project-groups.types";
import ProjectGroupsEditorForm from "./ProjectGroupsEditorForm";

interface ProjectGroupsEditorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: ProjectGroupResponseDto;
}

export default function ProjectGroupsEditorSheet({ open, onOpenChange, currentRow }: ProjectGroupsEditorSheetProps) {
  const isUpdate = !!currentRow;

  const { form, onSubmit, isPending } = useProjectGroupForm({
    isUpdate: isUpdate,
    initialData: currentRow,
    onSuccess: () => {
      onOpenChange(false);
    },
  });

  // Limpiar formulario cuando se cambia entre crear/actualizar
  useEffect(() => {
    if (open) {
      if (!isUpdate) {
        // Si es crear, resetear completamente el formulario
        form.reset({
          name: "",
          description: "",
          status: "activo",
          period: "2024-01",
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
          if (!v) form.reset();
        }
      }}
      title={`${isUpdate ? "Actualizar" : "Crear"} grupo de proyectos`}
      description={
        isUpdate
          ? "Actualiza los datos del grupo de proyectos"
          : "Crea un nuevo grupo de proyectos con su información completa"
      }
      maxWidth="xl"
      titleClassName="text-2xl font-bold capitalize"
      showDefaultFooter={false}
      footer={
        <SheetFooter className="gap-2">
          <Button
            form="project-group-form"
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
                <span className="mr-2">{isUpdate ? "Actualizar grupo" : "Crear grupo"}</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </Button>
          <SheetClose asChild>
            <Button variant="outline" disabled={isPending}>
              Cancelar
            </Button>
          </SheetClose>
        </SheetFooter>
      }
    >
      <ProjectGroupsEditorForm form={form} isUpdate={isUpdate} onSubmit={onSubmit} />
    </GenericSheet>
  );
}
