"use client";

import React from "react";
import { Calendar, Trash } from "lucide-react";

import { ConfettiSideCannons } from "@/shared/components/ui/confetti-side-cannons";
import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { useDeleteAdditionalDeliverable } from "../../../../../_hooks/use-additional-deliverables";
import { AdditionalDeliverableDetailedResponseDto } from "../../../../../_types";
import { AdditionalDeliverableEditorSheet } from "../editor/AdditionalDeliverableEditorSheet";

// Definir los tipos de overlays disponibles
export type AdditionalDeliverablesPhaseOverlayType =
  | "create"
  | "edit"
  | "delete"
  | "confirm-end-date"
  | "manage-documents";

// Definir el módulo de overlays
export const MODULE_ADDITIONAL_DELIVERABLES_PHASE = "additional-deliverables-phase";

// Definir la interfaz para los datos de los overlays
export interface AdditionalDeliverablesPhaseOverlayData {
  create?: {
    projectId: string;
    phaseId: string;
  };
  edit?: AdditionalDeliverableDetailedResponseDto;
  delete?: AdditionalDeliverableDetailedResponseDto;
  "confirm-end-date"?: AdditionalDeliverableDetailedResponseDto & {
    endDate: string;
  };
  "manage-documents"?: AdditionalDeliverableDetailedResponseDto;
}

interface AdditionalDeliverablesPhaseOverlaysProps {
  projectId: string;
  phaseId: string;
  onAdditionalDeliverableEndDateConfirm?: (additionalDeliverableId: string, endDate: Date) => void;
}

// Componente principal para los overlays
export default function AdditionalDeliverablesPhaseOverlays({
  projectId,
  phaseId,
  onAdditionalDeliverableEndDateConfirm,
}: AdditionalDeliverablesPhaseOverlaysProps) {
  const { isOpenForModule, data, close } = useDialogStore();
  const { mutation: deleteAdditionalDeliverableMutation } = useDeleteAdditionalDeliverable();
  const isDeleting = deleteAdditionalDeliverableMutation.isPending;

  return (
    <>
      {/* Editor Sheet para crear/editar entregables adicionales */}
      <AdditionalDeliverableEditorSheet
        key="additional-deliverable-mutate"
        open={
          isOpenForModule(MODULE_ADDITIONAL_DELIVERABLES_PHASE, "create") ||
          isOpenForModule(MODULE_ADDITIONAL_DELIVERABLES_PHASE, "edit")
        }
        onOpenChange={(open) => {
          if (!open) close();
        }}
        currentRow={isOpenForModule(MODULE_ADDITIONAL_DELIVERABLES_PHASE, "edit") ? data : undefined}
        projectId={projectId}
        phaseId={phaseId}
      />

      {/* Delete Dialog */}
      <ConfirmDialog
        key="additional-deliverable-delete"
        open={isOpenForModule(MODULE_ADDITIONAL_DELIVERABLES_PHASE, "delete")}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        handleConfirm={() => {
          if (isDeleting) return;
          if (!data?.id) {
            return;
          }
          deleteAdditionalDeliverableMutation.mutate(
            {
              params: {
                path: {
                  projectId,
                  phaseId,
                  additionalDeliverableId: data.id,
                },
              },
            },
            {
              onSuccess: () => {
                close();
              },
            }
          );
        }}
        isLoading={isDeleting}
        confirmText="Eliminar"
        destructive
        title={
          <div className="flex items-center gap-2">
            <Trash className="h-4 w-4 text-rose-500" />
            Eliminar entregable adicional
          </div>
        }
        desc={
          <>
            Estás a punto de eliminar el entregable adicional{" "}
            <strong className="uppercase text-wrap">{data?.name}</strong>. <br />
            Esta acción es irreversible.
          </>
        }
      />

      {/* Confirm End Date Dialog */}
      <ConfirmDialog
        key="additional-deliverable-confirm-end-date"
        open={isOpenForModule(MODULE_ADDITIONAL_DELIVERABLES_PHASE, "confirm-end-date")}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        handleConfirm={() => {
          if (!data?.id || !data?.endDate) {
            return;
          }

          // Ejecutar callback si se proporciona
          if (onAdditionalDeliverableEndDateConfirm) {
            onAdditionalDeliverableEndDateConfirm(data.id, new Date(data.endDate));
          }

          close();
        }}
        isLoading={false}
        confirmText={
          <ConfettiSideCannons
            buttonText="Confirmar finalización"
            asChild={true}
            onTrigger={() => {
              // El confetti se dispara automáticamente al hacer clic
            }}
          />
        }
        title={
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Confirmar finalización del entregable adicional
          </div>
        }
        desc={
          <>
            ¿Confirmas que el entregable adicional <strong className="uppercase text-wrap">{data?.name}</strong> se ha
            completado en la fecha{" "}
            <strong>{data?.endDate ? new Date(data.endDate).toLocaleDateString("es-ES") : ""}</strong>?
            <br />
            <br />
            <span className="text-sm text-muted-foreground">
              Esta acción marcará oficialmente la finalización del entregable adicional.
            </span>
          </>
        }
      />
    </>
  );
}
