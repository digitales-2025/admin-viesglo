"use client";

import { Clock, RotateCcw, X } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { ResponsiveDialog } from "@/shared/components/ui/resposive-dialog";
import { TemplateDraftData } from "../../_stores/template-draft.store";

interface RecoveryDialogProps {
  isOpen: boolean;
  onConfirm: (data: TemplateDraftData) => void;
  onDismiss: () => void;
  draftData: TemplateDraftData;
  isDesktop: boolean;
}

export function RecoveryDialog({ isOpen, onConfirm, onDismiss, draftData, isDesktop }: RecoveryDialogProps) {
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMilestoneCount = () => {
    return draftData.milestones?.length || 0;
  };

  const getTagCount = () => {
    return draftData.tagIds?.length || 0;
  };

  return (
    <ResponsiveDialog
      open={isOpen}
      onOpenChange={onDismiss}
      isDesktop={isDesktop}
      title="Recuperar borrador encontrado"
      description="Se encontró un borrador guardado automáticamente. ¿Quieres recuperarlo?"
      showTrigger={false}
      dialogContentClassName="sm:max-w-[600px] px-0"
      dialogScrollAreaClassName="h-full max-h-[80vh] px-0"
      drawerContentClassName="max-h-[55vh]"
      drawerScrollAreaClassName="h-full px-0"
    >
      <div className="space-y-6 pb-4">
        {/* Información temporal */}
        <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <Clock className="h-5 w-5 text-primary" />
          <div>
            <p className="font-semibold text-primary">Borrador guardado automáticamente</p>
            <p className="text-sm text-muted-foreground">{formatTimestamp(draftData.timestamp)}</p>
          </div>
        </div>

        {/* Resumen visual */}
        <div className="space-y-4">
          <h4 className="font-semibold text-foreground">Resumen del borrador:</h4>

          {/* Nombre y descripción */}
          {draftData.name && (
            <div className="p-3 bg-muted/50 rounded-md">
              <p className="font-medium text-foreground">{draftData.name}</p>
              {draftData.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {draftData.description.length > 80
                    ? `${draftData.description.substring(0, 80)}...`
                    : draftData.description}
                </p>
              )}
            </div>
          )}

          {/* Contadores visuales */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-primary/5 rounded-md border border-primary/20 text-center">
              <div className="text-2xl font-bold text-primary">{getMilestoneCount()}</div>
              <div className="text-sm text-muted-foreground">
                {getMilestoneCount() === 1 ? "Milestone" : "Milestones"}
              </div>
            </div>

            <div className="p-3 bg-primary/5 rounded-md border border-primary/20 text-center">
              <div className="text-2xl font-bold text-primary">{getTagCount()}</div>
              <div className="text-sm text-muted-foreground">{getTagCount() === 1 ? "Etiqueta" : "Etiquetas"}</div>
            </div>
          </div>
        </div>

        {/* Modo edición */}
        {draftData.isUpdate && draftData.templateId && (
          <div className="p-3 bg-amber-50 rounded-md border border-amber-200">
            <p className="text-sm text-amber-800 font-medium">
              <strong>Modo edición:</strong> Este borrador corresponde a una plantilla existente.
            </p>
          </div>
        )}

        {/* Botones */}
        <div className="flex flex-col gap-3 pt-4">
          <Button variant="outline" onClick={onDismiss} className="flex-1">
            <X className="h-4 w-4 mr-2" />
            Descartar borrador
          </Button>
          <Button onClick={() => onConfirm(draftData)} className="flex-1 bg-primary hover:bg-primary/90">
            <RotateCcw className="h-4 w-4 mr-2" />
            Recuperar datos
          </Button>
        </div>
      </div>
    </ResponsiveDialog>
  );
}
