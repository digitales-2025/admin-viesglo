"use client";

import { Plus } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { MODULE_DELIVERABLES_PHASE } from "./deliverables-phase-overlays/DeliverablesPhaseOverlays";

export default function DeliverablesPhasePrimaryButtons() {
  const { open } = useDialogStore();

  const handleCreateDeliverable = () => {
    open(MODULE_DELIVERABLES_PHASE, "create");
  };

  return (
    <Button onClick={handleCreateDeliverable} className="flex items-center gap-2">
      <Plus className="h-4 w-4" />
      Nuevo Entregable
    </Button>
  );
}
