"use client";

import { Trash } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { useDeleteDeliverableOfPhase, useDeletePhaseOfMilestoneTemplate } from "../../_hooks/use-milestone-templates";
import { CreateProjectTemplate, DeliverableFormData, PhaseFormData } from "../../_schemas/projectTemplates.schemas";
import {
  DeliverableTemplateResponseDto,
  MilestoneTemplateRefRequestDto,
  MilestoneTemplateResponseDto,
  PhaseTemplateResponseDto,
} from "../../_types/templates.types";
import {
  handleAddMilestoneRefConfig,
  handleUpdateMilestoneRefConfig,
} from "../../_utils/handlers/milestone-ref-template.handlers.utils";
import { DeliverableDialog } from "../dialogs/DeliverableDialog";
import { MilestoneRefDialog } from "../dialogs/MilestoneRefDialog";
import { PhaseDialog } from "../dialogs/PhaseDialog";

interface TemplatesOverlaysProps {
  form: UseFormReturn<CreateProjectTemplate>;
  milestones: MilestoneTemplateResponseDto[];
  phases: (PhaseTemplateResponseDto & { milestoneId: string })[];
  deliverables: (DeliverableTemplateResponseDto & { phaseId: string })[];
  onUpdatePhase?: (data: PhaseFormData, selectedMilestoneId?: string) => void;
  onUpdateDeliverable?: (data: DeliverableFormData) => void;
  onAddMilestoneRef?: (milestoneId: string) => void;
  onSuccess?: () => void;
  onDeletePhase?: (phaseId: string) => void;
  onDeleteDeliverable?: (deliverableId: string) => void;
  updateMilestones: (milestones: MilestoneTemplateRefRequestDto[]) => void;
  onAddPhaseWithResponse?: (response: MilestoneTemplateResponseDto) => void;
  onAddDeliverableWithResponse?: (response: MilestoneTemplateResponseDto) => void;
}

export default function TemplatesOverlays({
  form,
  milestones,
  phases,
  deliverables,
  onUpdatePhase,
  onUpdateDeliverable,
  onAddMilestoneRef,
  onSuccess,
  onDeletePhase,
  onDeleteDeliverable,
  updateMilestones,
  onAddPhaseWithResponse,
  onAddDeliverableWithResponse,
}: TemplatesOverlaysProps) {
  const { isOpenForModule, data, close } = useDialogStore();
  const { mutate: deletePhase, isPending: isDeletingPhase } = useDeletePhaseOfMilestoneTemplate();
  const { mutate: deleteDeliverable, isPending: isDeletingDeliverable } = useDeleteDeliverableOfPhase();

  // Constantes para módulos
  const PHASE_MODULE = "phase-templates";
  const DELIVERABLE_MODULE = "deliverable-templates";
  const MILESTONE_REF_MODULE = "milestone-ref-config";
  const PHASE_DELETE_MODULE = "phase-delete";
  const DELIVERABLE_DELETE_MODULE = "deliverable-delete";

  return (
    <>
      <MilestoneRefDialog
        key="milestone-ref-dialog"
        open={isOpenForModule(MILESTONE_REF_MODULE, "create") || isOpenForModule(MILESTONE_REF_MODULE, "edit")}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        onAdd={(data) => {
          handleAddMilestoneRefConfig(data, form, updateMilestones);
          close();
        }}
        onUpdate={(data) => {
          handleUpdateMilestoneRefConfig(data, form, updateMilestones);
          close();
        }}
        initialData={
          isOpenForModule(MILESTONE_REF_MODULE, "edit") && data?.milestoneTemplateId
            ? (form.getValues().milestones?.find((ref) => ref.milestoneTemplateId === data.milestoneTemplateId) as any)
            : undefined
        }
        isUpdate={isOpenForModule(MILESTONE_REF_MODULE, "edit")}
        onSuccess={() => {
          onSuccess?.();
          close();
        }}
      />

      <PhaseDialog
        key="phase-dialog"
        open={isOpenForModule(PHASE_MODULE, "create") || isOpenForModule(PHASE_MODULE, "edit")}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        onAdd={(_, __) => {
          close();
        }}
        onUpdate={(data, selectedMilestoneId) => {
          onUpdatePhase?.(data, selectedMilestoneId);
          close();
        }}
        milestones={milestones} // Pasar milestones disponibles
        initialData={isOpenForModule(PHASE_MODULE, "edit") ? data : undefined}
        isUpdate={isOpenForModule(PHASE_MODULE, "edit")}
        onSuccess={(response) => {
          // Si es una creación exitosa, usar la respuesta del backend
          if (response && !isOpenForModule(PHASE_MODULE, "edit")) {
            onAddPhaseWithResponse?.(response);
          }
          onSuccess?.();
          close();
        }}
      />

      <DeliverableDialog
        key="deliverable-dialog"
        open={isOpenForModule(DELIVERABLE_MODULE, "create") || isOpenForModule(DELIVERABLE_MODULE, "edit")}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        onAdd={() => {
          close();
        }}
        onUpdate={(data) => {
          onUpdateDeliverable?.(data);
          close();
        }}
        phases={phases} // Pasar phases disponibles
        deliverables={deliverables} // Pasar deliverables disponibles
        milestoneTemplates={milestones} // Pasar milestone templates disponibles
        initialData={isOpenForModule(DELIVERABLE_MODULE, "edit") ? data : undefined}
        isUpdate={isOpenForModule(DELIVERABLE_MODULE, "edit")}
        onAddMilestoneRef={onAddMilestoneRef} // Pasar la función para agregar milestone ref
        onSuccess={(response) => {
          // Si es una creación exitosa, usar la respuesta del backend
          if (response && !isOpenForModule(DELIVERABLE_MODULE, "edit")) {
            onAddDeliverableWithResponse?.(response);
          }
          onSuccess?.();
          close();
        }}
      />

      {/* Confirm Dialog for Phase Deletion */}
      <ConfirmDialog
        key="phase-delete"
        open={isOpenForModule(PHASE_DELETE_MODULE, "delete")}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        handleConfirm={() => {
          if (isDeletingPhase) return;
          if (!data?.milestoneTemplateId || !data?.phaseId) {
            return;
          }
          deletePhase(
            {
              params: {
                path: {
                  id: data.milestoneTemplateId,
                  phaseId: data.phaseId,
                },
              },
            },
            {
              onSuccess: () => {
                close();
                onSuccess?.();
                // Actualizar el estado local después de eliminar la fase
                if (data?.phaseId) {
                  onDeletePhase?.(data.phaseId);
                }
              },
            }
          );
        }}
        isLoading={isDeletingPhase}
        confirmText="Eliminar"
        destructive
        title={
          <div className="flex items-center gap-2">
            <Trash className="h-4 w-4 text-rose-500" />
            Eliminar fase
          </div>
        }
        desc={
          <>
            Estás a punto de eliminar la fase <strong className="uppercase text-wrap">{data?.phaseName}</strong>. <br />
            Esta acción es irreversible y eliminará todos los entregables asociados.
          </>
        }
      />

      {/* Confirm Dialog for Deliverable Deletion */}
      <ConfirmDialog
        key="deliverable-delete"
        open={isOpenForModule(DELIVERABLE_DELETE_MODULE, "delete")}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        handleConfirm={() => {
          if (isDeletingDeliverable) return;
          if (!data?.milestoneTemplateId || !data?.phaseId || !data?.deliverableId) {
            return;
          }
          deleteDeliverable(
            {
              params: {
                path: {
                  id: data.milestoneTemplateId,
                  phaseId: data.phaseId,
                  deliverableId: data.deliverableId,
                },
              },
            },
            {
              onSuccess: () => {
                close();
                onSuccess?.();
                // Actualizar el estado local después de eliminar el entregable
                if (data?.deliverableId) {
                  onDeleteDeliverable?.(data.deliverableId);
                }
              },
            }
          );
        }}
        isLoading={isDeletingDeliverable}
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
            Estás a punto de eliminar el entregable{" "}
            <strong className="uppercase text-wrap">{data?.deliverableName}</strong>. <br />
            Esta acción es irreversible.
          </>
        }
      />
    </>
  );
}
