"use client";

import { Plus } from "lucide-react";

import { EnumAction, EnumResource } from "@/app/dashboard/admin/settings/_types/roles.types";
import { PermissionProtected } from "@/shared/components/protected-component";
import { Button } from "@/shared/components/ui/button";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { MODULE_DELIVERABLES_PHASE } from "./deliverables-phase-overlays/DeliverablesPhaseOverlays";

interface DeliverablesPhasePrimaryButtonsProps {
  milestoneStatus: string;
}

export default function DeliverablesPhasePrimaryButtons({ milestoneStatus }: DeliverablesPhasePrimaryButtonsProps) {
  const { open } = useDialogStore();

  const handleCreateDeliverable = () => {
    open(MODULE_DELIVERABLES_PHASE, "create");
  };

  return (
    <PermissionProtected
      permissions={[
        { resource: EnumResource.deliverables, action: EnumAction.update },
        { resource: EnumResource.deliverables, action: EnumAction.delete },
      ]}
      requireAll={false}
      hideOnUnauthorized={true}
    >
      <Button
        onClick={handleCreateDeliverable}
        className="flex items-center gap-2"
        disabled={milestoneStatus !== "PLANNING"}
      >
        <Plus className="h-4 w-4" />
        Nuevo Entregable
      </Button>
    </PermissionProtected>
  );
}
