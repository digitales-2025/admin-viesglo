"use client";

import { useDialogStore } from "@/shared/stores/useDialogStore";
import { RolesMutateDrawer } from "./RolesMutateDrawer";

export default function RolesDialogs() {
  const { isOpenForModule, data, close } = useDialogStore();
  // Constantes para módulo
  const MODULE = "roles";

  return (
    <>
      {/* Diálogo para crear/editar rol */}
      <RolesMutateDrawer
        key="rol-mutate"
        open={isOpenForModule(MODULE, "create") || isOpenForModule(MODULE, "edit")}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        currentRow={isOpenForModule(MODULE, "edit") ? data : undefined}
      />

      {/* Aquí se pueden agregar más diálogos según sea necesario */}
      {/* Por ejemplo, diálogo de confirmación para eliminar, diálogo para ver detalles, etc. */}
    </>
  );
}
