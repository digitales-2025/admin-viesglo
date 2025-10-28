"use client";

import { Trash } from "lucide-react";

import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { useDeleteClient } from "../../_hooks/use-clients";
import { ClientsEditorSheet } from "../editor/ClientsEditorSheet";

export default function ClientsOverlays() {
  const { isOpenForModule, data, close } = useDialogStore();
  const { mutate: deleteClient, isPending: isDeleting } = useDeleteClient();
  // Constantes para módulo
  const MODULE = "clients";

  return (
    <>
      <ClientsEditorSheet
        key="client-mutate"
        open={isOpenForModule(MODULE, "create") || isOpenForModule(MODULE, "edit")}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        currentRow={isOpenForModule(MODULE, "edit") ? data : undefined}
      />

      <ConfirmDialog
        key="client-delete"
        open={isOpenForModule(MODULE, "delete")}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        handleConfirm={() => {
          if (isDeleting) return;
          if (!data?.id) {
            return;
          }
          deleteClient(
            { params: { path: { id: data.id } } },
            {
              onSuccess: () => {
                close();
              },
            }
          );
        }}
        isLoading={isDeleting}
        confirmText="Eliminar"
        destructive
        title={
          <div className="flex items-center gap-2">
            <Trash className="h-4 w-4 text-rose-500" />
            Eliminar cliente
          </div>
        }
        desc={
          <>
            Estás a punto de eliminar el cliente <strong className="uppercase text-wrap">{data?.name}</strong>. <br />
            Esta acción es irreversible.
          </>
        }
      />
    </>
  );
}
