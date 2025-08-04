"use client";

import { Plus } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { useDialogStore } from "@/shared/stores/useDialogStore";

export default function ClientsPrimaryButtons() {
  const { open } = useDialogStore();

  // Constante para módulo
  const MODULE = "clients";

  return (
    <div>
      <Button
        className="space-x-1"
        onClick={() => {
          open(MODULE, "create");
        }}
      >
        <span>Agregar Cliente</span> <Plus size={18} />
      </Button>
    </div>
  );
}
