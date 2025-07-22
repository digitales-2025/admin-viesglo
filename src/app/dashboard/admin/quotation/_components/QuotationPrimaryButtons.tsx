"use client";

import { Plus } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { useDialogStore } from "@/shared/stores/useDialogStore";

export default function QuotationPrimaryButtons() {
  const { open } = useDialogStore();

  // Constante para módulo
  const MODULE = "quotations";

  return (
    <div>
      <>
        <Button
          className="space-x-1"
          onClick={() => {
            open(MODULE, "create");
          }}
        >
          <span>Agregar Cotización</span> <Plus className="h-4 w-4" />
        </Button>
      </>
    </div>
  );
}
