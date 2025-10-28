import { Trash } from "lucide-react";

import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { useDeleteDocument } from "../../../../../_hooks/use-project-deliverable-documents";
import { DeliverableDocumentEditorDialog } from "./DeliverableDocumentEditorDialog";

export const MODULE_DELIVERABLE_DOCUMENTS = "deliverable-documents";

interface DeliverableDocumentsOverlaysProps {
  projectId: string;
  phaseId: string;
}

export default function DeliverableDocumentsOverlays({ projectId, phaseId }: DeliverableDocumentsOverlaysProps) {
  const { isOpenForModule, data, close } = useDialogStore();
  const { mutate: deleteDocument, isPending: isDeleting } = useDeleteDocument();

  // Obtener el deliverableId de los datos del dialog store o usar el prop como fallback
  const currentDeliverableId = data?.deliverableId;

  return (
    <>
      {/* Document Editor Dialog */}
      <DeliverableDocumentEditorDialog
        key="document-mutate"
        open={
          isOpenForModule(MODULE_DELIVERABLE_DOCUMENTS, "create") ||
          isOpenForModule(MODULE_DELIVERABLE_DOCUMENTS, "edit")
        }
        onOpenChange={(open) => {
          if (!open) close();
        }}
        currentRow={isOpenForModule(MODULE_DELIVERABLE_DOCUMENTS, "edit") ? data : undefined}
        projectId={projectId}
        phaseId={phaseId}
        deliverableId={currentDeliverableId}
      />

      {/* Delete Document Dialog */}
      <ConfirmDialog
        key="document-delete"
        open={isOpenForModule(MODULE_DELIVERABLE_DOCUMENTS, "delete")}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        handleConfirm={() => {
          if (isDeleting) return;
          if (!data?.id) {
            return;
          }
          deleteDocument(
            {
              params: {
                path: {
                  projectId,
                  phaseId,
                  deliverableId: currentDeliverableId,
                  documentId: data.id,
                },
              },
            },
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
            Eliminar documento
          </div>
        }
        desc={
          <>
            Estás a punto de eliminar el documento <strong className="uppercase text-wrap">{data?.fileName}</strong>.{" "}
            <br />
            Esta acción es irreversible.
          </>
        }
      />
    </>
  );
}
