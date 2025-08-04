"use client";

import { Trash } from "lucide-react";

import { useProfile } from "@/app/(public)/auth/sign-in/_hooks/use-auth";
import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { useToggleActiveUser } from "../../_hooks/use-users";
import { UsersEditorSheet } from "../editor/UsersEditorSheet";

export default function UsersOverlays() {
  const { isOpenForModule, data, close } = useDialogStore();
  const user = useProfile();
  const { mutate: deleteUser } = useToggleActiveUser();
  // Constantes para módulo
  const MODULE = "users";

  return (
    <>
      {/* Diálogo para crear/editar usuario */}
      <UsersEditorSheet
        key="user-mutate"
        open={isOpenForModule(MODULE, "create") || isOpenForModule(MODULE, "edit")}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        currentRow={isOpenForModule(MODULE, "edit") ? data : undefined}
        actualUserId={isOpenForModule(MODULE, "edit") ? (user.data?.id ?? "") : undefined}
      />

      {/* Diálogo para eliminar rol */}
      <ConfirmDialog
        key="user-delete"
        open={isOpenForModule(MODULE, "delete")}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        handleConfirm={() => {
          deleteUser(
            { params: { path: { id: data?.id } } },
            {
              onSuccess: () => {
                close();
              },
            }
          );
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
