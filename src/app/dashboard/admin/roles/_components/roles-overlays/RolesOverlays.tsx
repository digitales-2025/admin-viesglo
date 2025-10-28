"use client";

import { Trash } from "lucide-react";

import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { useToggleActiveRole } from "../../_hooks/use-roles";
import { RolesEditorSheet } from "../editor/RolesEditorSheet";

export default function RolesOverlays() {
  const { isOpenForModule, data, close } = useDialogStore();
  const { mutate: toggleActiveRole, isPending: isToggling } = useToggleActiveRole();
  const MODULE = "roles";

  return (
    <>
      {/* Diálogo para crear/editar rol */}
      <RolesEditorSheet
        key="rol-mutate"
        open={isOpenForModule(MODULE, "create") || isOpenForModule(MODULE, "edit")}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        currentRow={isOpenForModule(MODULE, "edit") ? data : undefined}
      />

      {/* Diálogo para desactivar rol */}
      <ConfirmDialog
        key="rol-toggle-active"
        open={isOpenForModule(MODULE, "delete")}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        handleConfirm={() => {
          if (isToggling) return;
          if (!data?.id) return;
          toggleActiveRole(
            { params: { path: { id: data.id } } },
            {
              onSuccess: () => {
                close();
              },
            }
          );
        }}
        isLoading={isToggling}
        className="max-w-md"
        title={
          <div className="flex items-center gap-2">
            <Trash className="h-4 w-4 text-rose-500" />
            Desactivar rol <strong className="uppercase">{data?.name}</strong>
          </div>
        }
        desc={
          <>
            Estás a punto de <strong>desactivar</strong> el rol <strong>{data?.name}</strong>. <br />
            Esta acción no se puede deshacer y el rol será removido de los usuarios.
          </>
        }
        confirmText="Desactivar"
        cancelBtnText="Cancelar"
      />
    </>
  );
}
