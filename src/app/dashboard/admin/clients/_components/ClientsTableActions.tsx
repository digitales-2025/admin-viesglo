import { Edit, MoreHorizontal, RotateCcw, Trash } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { useDeleteClient, useReactivateClient } from "../_hooks/use-clients";
import { ClientProfileResponseDto } from "../_types/clients.types";

interface ClientsTableActionsProps {
  client: ClientProfileResponseDto;
}

export default function ClientsTableActions({ client }: ClientsTableActionsProps) {
  const { open } = useDialogStore();

  const { mutate: deleteClient, isPending: isDeleting } = useDeleteClient();
  const { mutate: reactivateClient, isPending: isReactivating } = useReactivateClient();

  const MODULE = "clients";

  const handleEdit = () => {
    open(MODULE, "edit", client);
  };

  const handleDelete = () => {
    deleteClient({ id: client.id });
  };

  const handleReactivate = () => {
    reactivateClient({ id: client.id });
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
        {client.isActive ? (
          <DropdownMenuItem className="cursor-pointer" onClick={handleDelete} disabled={isDeleting}>
            Eliminar
            <DropdownMenuShortcut>
              <Trash className="size-4 mr-2" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem className="cursor-pointer" onClick={handleReactivate} disabled={isReactivating}>
            Reactivar
            <DropdownMenuShortcut>
              <RotateCcw className="size-4 mr-2 text-yellow-500" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
