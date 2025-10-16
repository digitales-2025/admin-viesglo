import { Calendar, CheckCheck, Trash } from "lucide-react";

import { IncidentDialog } from "@/app/dashboard/admin/incidents/_components";
import { ConfettiSideCannons } from "@/shared/components/ui/confetti-side-cannons";
import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { useDeleteDeliverable, useToggleDeliverableApproval } from "../../../../../_hooks/use-project-deliverables";
import { DeliverableEditorSheet } from "../editor/DeliverableEditorSheet";

export const MODULE_DELIVERABLES_PHASE = "deliverables-phase";

interface DeliverablesPhaseOverlaysProps {
  projectId: string;
  phaseId: string;
  onDeliverableEndDateConfirm?: (deliverableId: string, endDate: Date) => void; // Callback para confirmar fecha de fin
}

export default function DeliverablesPhaseOverlays({
  projectId,
  phaseId,
  onDeliverableEndDateConfirm,
}: DeliverablesPhaseOverlaysProps) {
  const { isOpenForModule, data, close } = useDialogStore();
  const { mutate: deleteDeliverable, isPending: isDeleting } = useDeleteDeliverable();
  const { mutate: toggleApproval, isPending: isApproving } = useToggleDeliverableApproval();

  // Obtener milestoneId del prop o de los datos del dialog store (siguiendo el patrón de PhasesProjectOverlays)
  const currentMilestoneId = data?.milestoneId;

  // Derivar IDs actuales desde el store (deliverable seleccionado)
  const currentDeliverableId = (data as any)?.id as string | undefined;

  return (
    <>
      <DeliverableEditorSheet
        key="deliverable-mutate"
        open={
          isOpenForModule(MODULE_DELIVERABLES_PHASE, "create") || isOpenForModule(MODULE_DELIVERABLES_PHASE, "edit")
        }
        onOpenChange={(open) => {
          if (!open) close();
        }}
        currentRow={isOpenForModule(MODULE_DELIVERABLES_PHASE, "edit") ? data : undefined}
        projectId={projectId}
        phaseId={phaseId}
      />

      {/* Incident Dialog */}
      {isOpenForModule(MODULE_DELIVERABLES_PHASE, "create-incident") && currentDeliverableId && (
        <IncidentDialog
          key="phase-incident"
          open={true}
          onOpenChange={(open) => {
            if (!open) close();
          }}
          currentRow={{
            projectId,
            milestoneId: currentMilestoneId,
            phaseId,
            deliverableId: currentDeliverableId,
          }}
        />
      )}

      {/* Approve Dialog */}
      <ConfirmDialog
        key="deliverable-approve"
        open={isOpenForModule(MODULE_DELIVERABLES_PHASE, "approve")}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        handleConfirm={() => {
          if (isApproving) return;
          if (!data?.id) {
            return;
          }
          toggleApproval(
            {
              params: {
                path: {
                  projectId,
                  phaseId,
                  deliverableId: data.id,
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
        isLoading={isApproving}
        confirmText="Validar"
        title={
          <div className="flex items-center gap-2">
            <CheckCheck className="h-4 w-4" />
            Confirmar validación
          </div>
        }
        desc={
          <>
            Esta acción hace que el entregable <strong className="uppercase text-wrap">{data?.name}</strong> se
            establezca en el cronograma de la planificación.
            <br />
            ¿Estás seguro de que deseas continuar?
          </>
        }
      />

      <ConfirmDialog
        key="deliverable-delete"
        open={isOpenForModule(MODULE_DELIVERABLES_PHASE, "delete")}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        handleConfirm={() => {
          if (isDeleting) return;
          if (!data?.id) {
            return;
          }
          deleteDeliverable(
            {
              params: {
                path: {
                  projectId,
                  phaseId,
                  deliverableId: data.id,
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
            Eliminar entregable
          </div>
        }
        desc={
          <>
            Estás a punto de eliminar el entregable <strong className="uppercase text-wrap">{data?.name}</strong>.{" "}
            <br />
            Esta acción es irreversible.
          </>
        }
      />

      {/* Confirm End Date Dialog */}
      <ConfirmDialog
        key="deliverable-confirm-end-date"
        open={isOpenForModule(MODULE_DELIVERABLES_PHASE, "confirm-end-date")}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        handleConfirm={() => {
          if (!data?.id || !data?.endDate) {
            return;
          }

          // Ejecutar callback si se proporciona
          if (onDeliverableEndDateConfirm) {
            onDeliverableEndDateConfirm(data.id, new Date(data.endDate));
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
            Confirmar finalización del entregable
          </div>
        }
        desc={
          <>
            ¿Confirmas que el entregable <strong className="uppercase text-wrap">{data?.name}</strong> se ha completado
            en la fecha <strong>{data?.endDate ? new Date(data.endDate).toLocaleDateString("es-ES") : ""}</strong>?
            <br />
            <br />
            <span className="text-sm text-muted-foreground">
              Esta acción marcará oficialmente la finalización del entregable.
            </span>
          </>
        }
      />
    </>
  );
}
