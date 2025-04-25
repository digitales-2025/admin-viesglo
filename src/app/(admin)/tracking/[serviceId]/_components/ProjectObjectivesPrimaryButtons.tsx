import { PlusCircle } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { MODULE_PROJECT_OBJECTIVES } from "./ProjectObjectivesDialogs";

export default function ProjectObjectivesPrimaryButtons() {
  const { open } = useDialogStore();

  return (
    <div>
      <Button
        className="space-x-1"
        onClick={() => {
          open(MODULE_PROJECT_OBJECTIVES, "create");
        }}
      >
        <PlusCircle />
        Agregar objetivo
      </Button>
    </div>
  );
}
