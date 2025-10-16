"use client";

import React from "react";

import { ResponsiveDialog } from "@/shared/components/ui/resposive-dialog";
import { useMediaQuery } from "@/shared/hooks/use-media-query";
import { DeliverableDocumentDto } from "../../../../../_types";
import { DeliverableDocumentEditorForm } from "./DeliverableDocumentEditorForm";

interface DeliverableDocumentEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: DeliverableDocumentDto;
  projectId: string;
  phaseId: string;
  deliverableId: string;
}

export function DeliverableDocumentEditorDialog({
  open,
  onOpenChange,
  currentRow,
  projectId,
  phaseId,
  deliverableId,
}: DeliverableDocumentEditorDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      isDesktop={isDesktop}
      title={currentRow ? "Editar Documento" : "Agregar Documento"}
      description={
        currentRow ? "Modifica la información del documento del entregable" : "Agrega un nuevo documento al entregable"
      }
      dialogContentClassName="sm:px-0"
      dialogScrollAreaClassName="h-full max-h-[90vh]"
      drawerContentClassName="px-0"
      drawerScrollAreaClassName="h-[60vh]"
    >
      <DeliverableDocumentEditorForm
        currentRow={currentRow}
        projectId={projectId}
        phaseId={phaseId}
        deliverableId={deliverableId}
        onOpenChange={onOpenChange}
      />
    </ResponsiveDialog>
  );
}
