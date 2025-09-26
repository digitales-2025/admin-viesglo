"use client";

import { Plus } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { useDialogStore } from "@/shared/stores/useDialogStore";

export default function ProjectsPrimaryButtons() {
  const { open } = useDialogStore();

  // Constante para módulo
  const MODULE = "projects";

  return (
    <div>
      <Button
        className="space-x-1"
        onClick={() => {
          open(MODULE, "create");
        }}
      >
        <Plus size={18} />
        <span>Nuevo Proyecto</span>
      </Button>
    </div>
  );
}
