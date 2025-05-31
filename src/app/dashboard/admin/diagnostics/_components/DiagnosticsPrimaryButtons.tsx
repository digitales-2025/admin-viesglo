"use client";

import { Plus } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { useDialogStore } from "@/shared/stores/useDialogStore";

// import { useDiagnosticsStore } from "../_store/diagnostics.store"; // Ya no se usa directamente aquí

export default function DiagnosticsPrimaryButtons() {
  // const { setOpenMutateDrawer, setCurrentRow } = useDiagnosticsStore(); // Ya no se usa directamente aquí
  const { open } = useDialogStore();

  const handleCreate = () => {
    open("diagnostics", "create");
  };

  return (
    <Button
      onClick={handleCreate}
      // onClick={() => {
      //   setCurrentRow(undefined);
      //   setOpenMutateDrawer(true);
      // }}
    >
      <Plus className="mr-2 h-4 w-4" />
      Nuevo diagnóstico
    </Button>
  );
}
