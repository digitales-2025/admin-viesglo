"use client";

import { Trash } from "lucide-react";

import { ConfirmDialog } from "@/shared/components/ui/confirm-dialog";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { useDeleteCertificate } from "../_hooks/useCertificates";
import { CertificatesMutateDrawer } from "./CertificatesMutateDrawer";

export default function CertificatesDialogs() {
  const { isOpenForModule, data, close } = useDialogStore();
  const { mutate: deleteCertificate } = useDeleteCertificate();
  // Constantes para módulo
  const MODULE = "certificates";

  return (
    <>
      {/* Dialogo de creación */}
      <CertificatesMutateDrawer
        key="certificate-create"
        open={isOpenForModule(MODULE, "create") || isOpenForModule(MODULE, "edit")}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        currentRow={isOpenForModule(MODULE, "edit") ? data : undefined}
      />
      {/* Dialogo de eliminación */}
      <ConfirmDialog
        key="certificate-delete"
        open={isOpenForModule(MODULE, "delete")}
        onOpenChange={(open) => {
          if (!open) close();
        }}
        handleConfirm={() => {
          deleteCertificate(data?.id, {
            onSuccess: () => {
              close();
            },
          });
        }}
        title={
          <div className="flex items-center gap-2">
            <Trash className="h-4 w-4 text-rose-500" />
            Eliminar certificado
          </div>
        }
        desc={
          <>
            Estás a punto de eliminar el certificado <strong className="uppercase text-wrap">{data?.code}</strong>
            <br />
            <span className="text-sm text-muted-foreground">
              Este certificado fue emitido para el usuario{" "}
              <strong className="text-foreground capitalize">
                {data?.nameUser} {data?.lastNameUser}
              </strong>
            </span>
          </>
        }
      />
    </>
  );
}
