"use client";

import { Trash } from "lucide-react";

import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { useDeleteProjectTemplate } from "../../_hooks/use-project-templates";

export default function ProjectTemplatesOverlays() {
  const { isOpenForModule, data, close } = useDialogStore();
  const { mutate: deleteProjectTemplate, isPending: isDeleting } = useDeleteProjectTemplate();
  // Constantes para módulo
  const MODULE = "templates";

  return (
    <>
      <ConfirmDialog
        key="template-delete"
        open={isOpenForModule(MODULE, "delete")}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        handleConfirm={() => {
          if (isDeleting) return;
          if (!data?.id) {
            return;
          }
          deleteProjectTemplate(
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
