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
import { ProjectActivityResponse } from "../../_types/tracking.types";
import { MODULE_PROJECT_ACTIVITIES } from "./ProjectActivitiesDialogs";

interface ProjectActivitiesActionsProps {
  row: ProjectActivityResponse;
}

export default function ProjectActivitiesActions({ row }: ProjectActivitiesActionsProps) {
  const { open } = useDialogStore();

  const handleEdit = () => {
    open(MODULE_PROJECT_ACTIVITIES, "edit", row);
  };

  const handleDelete = () => {
    open(MODULE_PROJECT_ACTIVITIES, "delete", row);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="bg-background" size="icon">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={handleEdit}>
          Editar
          <DropdownMenuShortcut>
            <Edit className="size-4" />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDelete}>
          Eliminar
          <DropdownMenuShortcut>
            <Trash className="size-4" />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
