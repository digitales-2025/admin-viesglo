"use client";

import { useEffect } from "react";
import { Send } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { GenericSheet } from "@/shared/components/ui/generic-responsive-sheet";
import { SheetClose, SheetFooter } from "@/shared/components/ui/sheet";
import { useResourceForm } from "../../_hooks/use-resource-form";
import { ResourceResponseDto } from "../../_types/resources.types";
import ResourcesEditorForm from "./ResourcesEditorForm";

interface ResourcesEditorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: ResourceResponseDto;
}

export default function ResourcesEditorSheet({ open, onOpenChange, currentRow }: ResourcesEditorSheetProps) {
  const isUpdate = !!currentRow;

  const { form, onSubmit, isPending } = useResourceForm({
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
          category: "DIRECT_COSTS",
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
      title={`${isUpdate ? "Actualizar" : "Crear"} recurso`}
      description={isUpdate ? "Actualiza los datos del recurso" : "Crea un nuevo recurso con su información completa"}
      maxWidth="xl"
      titleClassName="text-2xl font-bold capitalize"
      showDefaultFooter={false}
      footer={
        <SheetFooter className="gap-2">
          <Button
            form="resource-form"
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
                <span className="mr-2">{isUpdate ? "Actualizar recurso" : "Crear recurso"}</span>
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
      <ResourcesEditorForm form={form} isUpdate={isUpdate} onSubmit={onSubmit} />
    </GenericSheet>
  );
}
