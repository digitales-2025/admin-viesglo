"use client";

import { Plus } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { useDialogStore } from "@/shared/stores/useDialogStore";

export default function RegistersPrimaryButtons() {
  const { open } = useDialogStore();

  // Constante para módulo
  const MODULE = "registers";

  return (
    <div className="flex gap-2">
      <Button
        className="space-x-1"
        onClick={() => {
          open(MODULE, "create");
        }}
      >
        <span>Agregar Registro</span> <Plus size={18} />
      </Button>
    </div>
  );
}
