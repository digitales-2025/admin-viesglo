import { Edit, MoreHorizontal, Trash } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { CertificateResponse } from "../_types/certificates.types";

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="bg-background" size="icon">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem className="cursor-pointer" onClick={handleEdit}>
          Editar
          <DropdownMenuShortcut>
            <Edit className="size-4 mr-2" />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" onClick={handleDelete} disabled={!certificate.isActive}>
          Eliminar
          <DropdownMenuShortcut>
            <Trash className="size-4 mr-2" />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
