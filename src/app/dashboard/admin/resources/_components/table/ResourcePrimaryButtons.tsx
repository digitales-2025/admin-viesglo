"use client";

import { Plus } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { useDialogStore } from "@/shared/stores/useDialogStore";

export default function ResourcePrimaryButtons() {
  const { open } = useDialogStore();

  // Constante para módulo
  const MODULE = "resources";

  return (
    <div>
      <Button
        className="space-x-1"
        onClick={() => {
          open(MODULE, "create");
        }}
      >
        <span>Agregar Recurso</span> <Plus size={18} />
      </Button>
    </div>
  );
}
