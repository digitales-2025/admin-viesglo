"use client";

import { Trash2 } from "lucide-react";

import AlertMessage from "@/shared/components/alerts/Alert";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { useDeleteDiagnosticFromSystem } from "../../medical-records/_hooks/useMedicalRecords";
import { DiagnosticEntity } from "../../medical-records/_types/medical-record.types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: DiagnosticEntity;
}

export default function DiagnosticsDeleteDialog({ open, onOpenChange, currentRow }: Props) {
  const { mutate: deleteDiagnostic, isPending } = useDeleteDiagnosticFromSystem();

  const handleDelete = () => {
    if (currentRow?.id) {
      deleteDiagnostic(currentRow.id, {
        onSuccess: () => {
          onOpenChange(false);
        },
      });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!isPending) {
          onOpenChange(v);
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar Diagnóstico</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas eliminar el diagnóstico "<strong>{currentRow?.name}</strong>"? Esta acción no se
            puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <AlertMessage
          title="Confirmar Eliminación"
          description={`Esta acción eliminará permanentemente el diagnóstico seleccionado${currentRow?.name ? ": " + currentRow.name : ""}.`}
          variant="destructive"
        />
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending ? (
              "Eliminando..."
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
