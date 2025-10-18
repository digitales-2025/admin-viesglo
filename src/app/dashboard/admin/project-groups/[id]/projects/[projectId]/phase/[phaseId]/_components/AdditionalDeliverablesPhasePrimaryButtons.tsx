"use client";

import { Plus } from "lucide-react";

import { EnumAction, EnumResource } from "@/app/dashboard/admin/settings/_types/roles.types";
import { PermissionProtected } from "@/shared/components/protected-component";
import { Button } from "@/shared/components/ui/button";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { MODULE_ADDITIONAL_DELIVERABLES_PHASE } from "./additional-deliverables-phase-overlays/AdditionalDeliverablesPhaseOverlays";

interface AdditionalDeliverablesPhasePrimaryButtonsProps {
  milestoneStatus: string;
  projectId: string;
  phaseId: string;
}

export default function AdditionalDeliverablesPhasePrimaryButtons({
  milestoneStatus,
  projectId,
  phaseId,
}: AdditionalDeliverablesPhasePrimaryButtonsProps) {
  const { open } = useDialogStore();

  const handleCreateAdditionalDeliverable = () => {
    open(MODULE_ADDITIONAL_DELIVERABLES_PHASE, "create", {
      projectId,
      phaseId,
    });
  };

  return (
    <PermissionProtected
      permissions={[
        { resource: EnumResource.deliverables, action: EnumAction.write },
        { resource: EnumResource.deliverables, action: EnumAction.manage },
      ]}
      requireAll={false}
      hideOnUnauthorized={true}
    >
      <Button
        onClick={handleCreateAdditionalDeliverable}
        className="flex items-center gap-2"
        disabled={milestoneStatus === "OFFICIALLY_APPROVED"}
      >
        <Plus className="h-4 w-4" />
        Nuevo Entregable Adicional
      </Button>
    </PermissionProtected>
  );
}
