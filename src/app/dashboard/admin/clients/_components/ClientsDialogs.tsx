"use client";

import { Trash } from "lucide-react";

import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { useDeleteClient } from "../_hooks/useClients";
import { ClientsMutateDrawer } from "./ClientsMutateDrawer";

export default function ClientsDialogs() {
  const { isOpenForModule, data, close } = useDialogStore();
  const { mutate: deleteClient } = useDeleteClient();
  // Constantes para módulo
  const MODULE = "clients";

  return (
    <>
      <ClientsMutateDrawer
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
          deleteClient(data?.id, {
            onSuccess: () => {
              close();
            },
          });
        }}
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
