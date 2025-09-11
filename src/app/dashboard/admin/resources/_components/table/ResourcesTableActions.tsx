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
import { useReactivateResource } from "../../_hooks/use-resource";
import { ResourceResponseDto } from "../../_types/resources.types";

interface ResourcesTableActionsProps {
  resource: ResourceResponseDto;
}

export default function ResourcesTableActions({ resource }: ResourcesTableActionsProps) {
  const { open } = useDialogStore();
  const { mutate: reactivateResource, isPending: isReactivating } = useReactivateResource();
  const MODULE = "resources";

  const handleEdit = () => open(MODULE, "edit", resource);
  const handleDelete = () => open(MODULE, "delete", resource);
  const handleReactivate = () => reactivateResource({ params: { path: { resourceId: resource.id } } });

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
        {resource.isActive ? (
          <DropdownMenuItem className="cursor-pointer" onClick={handleDelete}>
            Eliminar
            <DropdownMenuShortcut>
              <Trash className="size-4 mr-2" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        ) : (
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
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
