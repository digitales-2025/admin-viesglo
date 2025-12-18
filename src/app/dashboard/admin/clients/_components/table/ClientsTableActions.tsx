import { Edit, MoreHorizontal, RotateCcw, Trash } from "lucide-react";

import { EnumAction, EnumResource } from "@/app/dashboard/admin/settings/_types/roles.types";
import { PermissionProtected } from "@/shared/components/protected-component";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { useReactivateClient } from "../../_hooks/use-clients";
import { ClientProfileResponseDto } from "../../_types/clients.types";

interface ClientsTableActionsProps {
  client: ClientProfileResponseDto;
}

export default function ClientsTableActions({ client }: ClientsTableActionsProps) {
  const { open } = useDialogStore();
  const { mutate: reactivateClient, isPending: isReactivating } = useReactivateClient();
  const MODULE = "clients";

  const handleEdit = () => open(MODULE, "edit", client);
  const handleDelete = () => open(MODULE, "delete", client);
  const handleReactivate = () => reactivateClient({ params: { path: { id: client.id } } });

  return (
    <PermissionProtected
      permissions={[
        { resource: EnumResource.clients, action: EnumAction.update },
        { resource: EnumResource.clients, action: EnumAction.delete },
        { resource: EnumResource.clients, action: EnumAction.reactivate },
      ]}
      requireAll={false}
      hideOnUnauthorized={true}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="bg-background" size="icon">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <PermissionProtected
            permissions={[
              { resource: EnumResource.clients, action: EnumAction.update },
              { resource: EnumResource.clients, action: EnumAction.delete },
            ]}
            requireAll={false}
            hideOnUnauthorized={true}
          >
            <DropdownMenuItem className="cursor-pointer" onClick={handleEdit}>
              Editar
              <DropdownMenuShortcut>
                <Edit className="size-4 mr-2" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </PermissionProtected>

          {client.isActive ? (
            <PermissionProtected
              permissions={[{ resource: EnumResource.clients, action: EnumAction.delete }]}
              requireAll={false}
              hideOnUnauthorized={true}
            >
              <DropdownMenuItem className="cursor-pointer" onClick={handleDelete}>
                Eliminar
                <DropdownMenuShortcut>
                  <Trash className="size-4 mr-2" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </PermissionProtected>
          ) : (
            <PermissionProtected
              permissions={[{ resource: EnumResource.clients, action: EnumAction.reactivate }]}
              requireAll={false}
              hideOnUnauthorized={true}
            >
              <DropdownMenuItem className="cursor-pointer" onClick={handleReactivate} disabled={isReactivating}>
                {isReactivating ? (
                  <>
                    Reactivando...
                    <DropdownMenuShortcut>
                      <RotateCcw className="size-4 mr-2 text-primary opacity-0" />
                    </DropdownMenuShortcut>
                  </>
                ) : (
                  <>
                    Reactivar
                    <DropdownMenuShortcut>
                      <RotateCcw className="size-4 mr-2 text-primary" />
                    </DropdownMenuShortcut>
                  </>
                )}
              </DropdownMenuItem>
            </PermissionProtected>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </PermissionProtected>
  );
}
