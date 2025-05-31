"use client";

import { Trash } from "lucide-react";

import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { useDeleteUser } from "../_hooks/useUsers";
import { UserMutateDrawer } from "./UsersMutateDrawer";

export default function UsersDialogs() {
  const { isOpenForModule, data, close } = useDialogStore();
  const { mutate: deleteUser } = useDeleteUser();
  // Constantes para módulo
  const MODULE = "users";

  return (
    <>
      {/* Diálogo para crear/editar usuario */}
      <UserMutateDrawer
        key="user-mutate"
        open={isOpenForModule(MODULE, "create") || isOpenForModule(MODULE, "edit")}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        currentRow={isOpenForModule(MODULE, "edit") ? data : undefined}
      />

      {/* Diálogo para eliminar rol */}
      <ConfirmDialog
        key="user-delete"
        open={isOpenForModule(MODULE, "delete")}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        handleConfirm={() => {
          deleteUser(data?.id, {
            onSuccess: () => {
              close();
            },
          });
        }}
        className="max-w-md"
        title={
          <div className="flex items-center gap-2">
            <Trash className="h-4 w-4 text-rose-500" />
            Eliminar usuario <strong className=" uppercase ">{data?.fullName}</strong>
          </div>
        }
        desc={
          <>
            Estás a punto de eliminar el usuario <strong>{data?.fullName}</strong>. <br />
            Esta acción no se puede deshacer.
          </>
        }
        confirmText="Eliminar"
        cancelBtnText="Cancelar"
      />
    </>
  );
}
