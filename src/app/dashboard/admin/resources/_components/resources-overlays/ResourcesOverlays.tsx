"use client";

import { Trash } from "lucide-react";

import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { useDeleteResource } from "../../_hooks/use-resource";
import ResourcesEditorSheet from "../editor/ResourcesEditorSheet";

export default function ResourcesOverlays() {
  const { isOpenForModule, data, close } = useDialogStore();
  const { mutate: deleteResource, isPending: isDeleting } = useDeleteResource();
  // Constantes para módulo
  const MODULE = "resources";

  return (
    <>
      <ResourcesEditorSheet
        key="resource-mutate"
        open={isOpenForModule(MODULE, "create") || isOpenForModule(MODULE, "edit")}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        currentRow={isOpenForModule(MODULE, "edit") ? data : undefined}
      />

      <ConfirmDialog
        key="resource-delete"
        open={isOpenForModule(MODULE, "delete")}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        handleConfirm={() => {
          if (isDeleting) return;
          if (!data?.id) {
            return;
          }
          deleteResource(
            { params: { path: { resourceId: data.id } } },
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
            Eliminar recurso
          </div>
        }
        desc={
          <>
            Estás a punto de eliminar el recurso <strong className="uppercase text-wrap">{data?.name}</strong>. <br />
          </>
        }
      />
    </>
  );
}
