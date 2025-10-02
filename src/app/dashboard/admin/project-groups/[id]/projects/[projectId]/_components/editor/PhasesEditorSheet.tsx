import { useEffect } from "react";
import { Send } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { GenericSheet } from "@/shared/components/ui/generic-responsive-sheet";
import { SheetClose, SheetFooter } from "@/shared/components/ui/sheet";
import { usePhaseForm } from "../../../_hooks/use-phase-form";
import { PhaseDetailedResponseDto } from "../../../_types";
import PhasesEditorForm from "./PhasesEditorForm";

interface PhasesEditorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: PhaseDetailedResponseDto;
  projectId: string;
  milestoneId: string;
  phaseId?: string; // Para actualización
}

export default function PhasesEditorSheet({
  open,
  onOpenChange,
  currentRow,
  projectId,
  milestoneId,
  phaseId,
}: PhasesEditorSheetProps) {
  const isUpdate = !!currentRow?.id && !!phaseId;

  // Hook unificado para fases (siguiendo el patrón de use-project-form)
  const { form, isPending, onSubmit } = usePhaseForm({
    isUpdate,
    initialData: currentRow,
    projectId,
    milestoneId,
    phaseId: phaseId || "",
    onSuccess: () => onOpenChange(false),
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
          sourceTemplateId: undefined,
          consultantId: undefined,
        });
      }
    }
  }, [open, isUpdate]);

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
      title={`${isUpdate ? "Actualizar" : "Crear"} fase`}
      titleClassName="text-2xl font-bold capitalize"
      description={
        isUpdate
          ? "Actualiza la fase proporcionando la información necesaria."
          : "Agrega una nueva fase proporcionando la información necesaria."
      }
      maxWidth="lg"
      showDefaultFooter={false}
      footer={
        <SheetFooter className="gap-2">
          <Button
            form="phases-form"
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
                <span className="mr-2">{isUpdate ? "Actualizar Fase" : "Crear Fase"}</span>
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
      <PhasesEditorForm form={form} onSubmit={onSubmit} isPending={isPending} />
    </GenericSheet>
  );
}
