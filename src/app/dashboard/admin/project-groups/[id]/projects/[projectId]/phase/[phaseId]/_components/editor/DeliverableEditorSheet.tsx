import { useEffect } from "react";
import { Send } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { GenericSheet } from "@/shared/components/ui/generic-responsive-sheet";
import { SheetClose, SheetFooter } from "@/shared/components/ui/sheet";
import { useDeliverableForm } from "../../../../../_hooks/use-deliverable-form";
import { DeliverableDetailedResponseDto } from "../../../../../_types";
import DeliverableEditorForm from "./DeliverableEditorForm";

interface DeliverableEditorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: DeliverableDetailedResponseDto;
  projectId: string;
  phaseId: string;
}

export function DeliverableEditorSheet({
  open,
  onOpenChange,
  currentRow,
  projectId,
  phaseId,
}: DeliverableEditorSheetProps) {
  const isUpdate = !!currentRow?.id;

  // Usar el hook centralizado de formulario
  const { form, isPending, onSubmit } = useDeliverableForm({
    isUpdate,
    initialData: currentRow,
    onSuccess: () => onOpenChange(false),
    projectId,
    phaseId,
  });

  // Limpiar formulario cuando se cambia entre crear/actualizar
  useEffect(() => {
    if (open) {
      if (!isUpdate) {
        // Si es crear, resetear completamente el formulario
        form.reset({
          name: "",
          description: "",
          startDate: undefined,
          endDate: undefined,
          weight: undefined,
          priority: undefined,
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
      title={`${isUpdate ? "Actualizar" : "Crear"} entregable`}
      titleClassName="text-2xl font-bold capitalize"
      description={
        isUpdate
          ? "Actualiza el entregable proporcionando la información necesaria."
          : "Agrega un nuevo entregable proporcionando la información necesaria."
      }
      maxWidth="lg"
      showDefaultFooter={false}
      footer={
        <SheetFooter className="gap-2">
          <Button
            form="deliverable-form"
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
                <span className="mr-2">{isUpdate ? "Actualizar Entregable" : "Crear Entregable"}</span>
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
      <DeliverableEditorForm form={form} onSubmit={onSubmit} isPending={isPending} />
    </GenericSheet>
  );
}
