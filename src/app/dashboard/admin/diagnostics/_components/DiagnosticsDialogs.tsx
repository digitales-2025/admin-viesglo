"use client";

import { useEffect, useState } from "react";

import { useDialogStore } from "@/shared/stores/useDialogStore";
import { DiagnosticEntity } from "../../medical-records/_types/medical-record.types";
import DiagnosticsDeleteDialog from "./DiagnosticsDeleteDialog";
// import { useDiagnosticsStore } from "../_store/diagnostics.store"; // Eliminado
import DiagnosticsMutateDrawer from "./DiagnosticsMutateDrawer";

export default function DiagnosticsDialogs() {
  // Estado local para controlar el drawer/dialog y el currentRow
  const [isMutateDrawerOpen, setIsMutateDrawerOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState<DiagnosticEntity | undefined>(undefined);

  // Estado global de diálogos/drawers (controlado por useDialogStore)
  const {
    module: globalModule,
    data: globalData,
    isOpen: isGlobalDialogOpen,
    type: globalDialogType,
    close: closeGlobalDialog,
  } = useDialogStore();

  useEffect(() => {
    if (isGlobalDialogOpen && globalModule === "diagnostics") {
      const action = globalDialogType?.split("/")[1] || (globalData ? "edit" : "create");

      if (action === "create") {
        setCurrentRow(undefined);
        setIsMutateDrawerOpen(true);
      } else if (action === "edit" && globalData) {
        setCurrentRow(globalData as DiagnosticEntity);
        setIsMutateDrawerOpen(true);
      } else if (action === "delete" && globalData) {
        setCurrentRow(globalData as DiagnosticEntity);
        setIsDeleteDialogOpen(true);
      }
    } else if (!isGlobalDialogOpen && globalModule === "diagnostics") {
      if (isMutateDrawerOpen) setIsMutateDrawerOpen(false);
      if (isDeleteDialogOpen) setIsDeleteDialogOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGlobalDialogOpen, globalModule, globalDialogType, globalData]); // No incluir setters locales aquí para evitar loops

  const handleMutateDrawerOpenChange = (isOpen: boolean) => {
    setIsMutateDrawerOpen(isOpen);
    if (!isOpen) {
      closeGlobalDialog();
      setCurrentRow(undefined);
    }
  };

  const handleDeleteDialogOpenChange = (isOpen: boolean) => {
    setIsDeleteDialogOpen(isOpen);
    if (!isOpen) {
      closeGlobalDialog();
      setCurrentRow(undefined);
    }
  };

  return (
    <>
      <DiagnosticsMutateDrawer
        open={isMutateDrawerOpen}
        onOpenChange={handleMutateDrawerOpenChange}
        currentRow={currentRow}
      />
      <DiagnosticsDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={handleDeleteDialogOpenChange}
        currentRow={currentRow}
      />
    </>
  );
}
