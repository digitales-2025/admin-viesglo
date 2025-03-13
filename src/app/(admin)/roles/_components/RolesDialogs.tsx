"use client";

import { Trash } from "lucide-react";

import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { useDeleteRole } from "../_hooks/useRoles";
import { RolesMutateDrawer } from "./RolesMutateDrawer";

export default function RolesDialogs() {
  const { isOpenForModule, data, close } = useDialogStore();
  const { mutate: deleteRole } = useDeleteRole();
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

      {/* Diálogo para eliminar rol */}
      <ConfirmDialog
        key="task-delete"
        destructive
        open={isOpenForModule(MODULE, "delete")}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        handleConfirm={() => {
          deleteRole(data?.id, {
            onSuccess: () => {
              close();
            },
          });
        }}
        className="max-w-md"
        title={
          <div className="flex items-center gap-2">
            <Trash className="h-4 w-4 text-rose-500" />
            Eliminar rol <strong className=" uppercase ">{data?.name}</strong>
          </div>
        }
        desc={
          <>
            Estás a punto de eliminar el rol <strong>{data?.name}</strong>. <br />
            Esta acción no se puede deshacer.
          </>
        }
        confirmText="Eliminar"
      />
    </>
  );
}
