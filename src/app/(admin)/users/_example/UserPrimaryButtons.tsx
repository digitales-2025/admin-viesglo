"use client";

import { FileInput, Plus } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { useDialogStore } from "@/shared/stores/useDialogStore";

export default function UserPrimaryButtons() {
  const { open } = useDialogStore();

  // Constante para módulo
  const MODULE = "users";

  return (
    <div className="flex gap-2">
      <Button className="space-x-1" onClick={() => open(MODULE, "create")}>
        <span>Agregar Usuario</span> <Plus size={18} />
      </Button>

      <Button variant="outline" className="space-x-1" onClick={() => open(MODULE, "import")}>
        <span>Importar Usuarios</span> <FileInput size={18} />
      </Button>
    </div>
  );
}
