"use client";

import { Plus } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { MODULE_QUOTATION_GROUP } from "./QuotationGroupDialogs";

export default function QuotationGroupPrimaryButtons() {
  const { open } = useDialogStore();

  // Constante para módulo

  return (
    <div className="flex gap-2">
      <>
        <Button
          className="space-x-1"
          onClick={() => {
            open(MODULE_QUOTATION_GROUP, "create");
          }}
        >
          Crear grupo de cotizaciones
          <Plus className="h-4 w-4" />
        </Button>
      </>
    </div>
  );
}
