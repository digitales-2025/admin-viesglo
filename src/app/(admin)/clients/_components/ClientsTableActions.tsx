import { Edit, MoreHorizontal, Trash } from "lucide-react";

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
import { ClientWithClinicResponse } from "../_types/clients.types";
import { EnumAction, EnumResource } from "../../roles/_utils/groupedPermission";

interface ClientsTableActionsProps {
  client: ClientWithClinicResponse;
}

export default function ClientsTableActions({ client }: ClientsTableActionsProps) {
  const { open } = useDialogStore();

  // Constante para módulo
  const MODULE = "clients";

  const handleEdit = () => {
    open(MODULE, "edit", client);
  };

  const handleDelete = () => {
    open(MODULE, "delete", client);
  };

  return (
    <ProtectedComponent
      requiredPermissions={[
        { resource: EnumResource.clients, action: EnumAction.update },
        { resource: EnumResource.clients, action: EnumAction.delete },
      ]}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="bg-background" size="icon">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <ProtectedComponent requiredPermissions={[{ resource: EnumResource.clients, action: EnumAction.update }]}>
            <DropdownMenuItem className="cursor-pointer" onClick={handleEdit}>
              Editar
              <DropdownMenuShortcut>
                <Edit className="size-4 mr-2" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </ProtectedComponent>
          <ProtectedComponent requiredPermissions={[{ resource: EnumResource.clients, action: EnumAction.delete }]}>
            <DropdownMenuItem className="cursor-pointer" onClick={handleDelete}>
              Eliminar
              <DropdownMenuShortcut>
                <Trash className="size-4 mr-2" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </ProtectedComponent>
        </DropdownMenuContent>
      </DropdownMenu>
    </ProtectedComponent>
  );
}
