"use client";

import { Plus } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { useDialogStore } from "@/shared/stores/useDialogStore";

export default function ClinicsPrimaryButtons() {
  const { open } = useDialogStore();

  // Constante para módulo
  const MODULE = "clinics";

  return (
    <div className="flex gap-2">
      <Button
        className="space-x-1"
        onClick={() => {
          open(MODULE, "create");
        }}
      >
        <span>Agregar Clínica</span> <Plus size={18} />
      </Button>
    </div>
  );
}
