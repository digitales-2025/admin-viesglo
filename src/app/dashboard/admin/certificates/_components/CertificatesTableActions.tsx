import { Edit, IterationCcw, MoreHorizontal, Trash } from "lucide-react";

import { ProtectedComponent } from "@/auth/presentation/components/ProtectedComponent";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { useReactivateCertificate } from "../_hooks/useCertificates";
import { CertificateResponse } from "../_types/certificates.types";
import { EnumAction, EnumResource } from "../../roles/_utils/groupedPermission";

interface CertificatesTableActionsProps {
  certificate: CertificateResponse;
}

export default function CertificatesTableActions({ certificate }: CertificatesTableActionsProps) {
  const { open } = useDialogStore();

  // Constante para módulo
  const MODULE = "certificates";

  const handleEdit = (e: any) => {
    e.stopPropagation();
    open(MODULE, "edit", certificate);
  };

  const handleDelete = (e: any) => {
    e.stopPropagation();
    open(MODULE, "delete", certificate);
  };

  const { mutate: reactivateCertificate, isPending: isReactivating } = useReactivateCertificate();

  const handleReactivate = (e: any) => {
    e.stopPropagation();
    reactivateCertificate(certificate.id);
  };

  return (
    <ProtectedComponent
      requiredPermissions={[
        { resource: EnumResource.certificate, action: EnumAction.update },
        { resource: EnumResource.certificate, action: EnumAction.delete },
      ]}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="bg-background" size="icon">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <ProtectedComponent requiredPermissions={[{ resource: EnumResource.certificate, action: EnumAction.update }]}>
            <DropdownMenuItem className="cursor-pointer" onClick={handleEdit}>
              Editar
              <DropdownMenuShortcut>
                <Edit className="size-4 mr-2" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </ProtectedComponent>
          {certificate.isActive ? (
            <ProtectedComponent
              requiredPermissions={[{ resource: EnumResource.certificate, action: EnumAction.delete }]}
            >
              <DropdownMenuItem className="cursor-pointer" onClick={handleDelete} disabled={!certificate.isActive}>
                Eliminar
                <DropdownMenuShortcut>
                  <Trash className="size-4 mr-2" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </ProtectedComponent>
          ) : (
            <ProtectedComponent
              requiredPermissions={[{ resource: EnumResource.certificate, action: EnumAction.delete }]}
            >
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={handleReactivate}
                disabled={certificate.isActive || isReactivating}
              >
                Reactivar
                <DropdownMenuShortcut>
                  <IterationCcw className="size-4 mr-2 text-yellow-600" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </ProtectedComponent>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </ProtectedComponent>
  );
}
