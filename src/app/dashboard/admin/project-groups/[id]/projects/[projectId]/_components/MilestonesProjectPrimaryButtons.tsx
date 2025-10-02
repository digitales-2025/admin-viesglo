import { PlusCircle } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { MODULE_MILESTONES_PROJECT } from "./milestones-project-overlays/MilestonesProjectOverlays";

export default function MilestonesProjectPrimaryButtons() {
  const { open } = useDialogStore();

  return (
    <div>
      <Button
        className="space-x-1"
        onClick={() => {
          open(MODULE_MILESTONES_PROJECT, "create");
        }}
      >
        <PlusCircle />
        Agregar hito
      </Button>
    </div>
  );
}
