import { Edit, MoreHorizontal, Trash } from "lucide-react";

import { EnumAction, EnumResource } from "@/app/(admin)/roles/_utils/groupedPermission";
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
import { ProjectActivityResponse } from "../../_types/tracking.types";
import { MODULE_PROJECT_ACTIVITIES } from "./ProjectActivitiesDialogs";

interface ProjectActivitiesActionsProps {
  row: ProjectActivityResponse;
}

export default function ProjectActivitiesActions({ row }: ProjectActivitiesActionsProps) {
  const { open } = useDialogStore();

  const handleEdit = () => {
    const dataWithObjectiveId = {
      ...row,
      objectiveId: row.projectObjectiveId,
    };

    open(MODULE_PROJECT_ACTIVITIES, "edit", dataWithObjectiveId);
  };

  const handleDelete = () => {
    const dataWithObjectiveId = {
      ...row,
      objectiveId: row.projectObjectiveId,
    };

    open(MODULE_PROJECT_ACTIVITIES, "delete", dataWithObjectiveId);
  };

  return (
    <ProtectedComponent
      requiredPermissions={[
        { resource: EnumResource.projects, action: EnumAction.edit },
        { resource: EnumResource.projects, action: EnumAction.delete },
      ]}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="bg-background" size="icon">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <ProtectedComponent requiredPermissions={[{ resource: EnumResource.projects, action: EnumAction.edit }]}>
            <DropdownMenuItem onClick={handleEdit}>
              Editar
              <DropdownMenuShortcut>
                <Edit className="size-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </ProtectedComponent>
          <ProtectedComponent requiredPermissions={[{ resource: EnumResource.projects, action: EnumAction.delete }]}>
            <DropdownMenuItem onClick={handleDelete}>
              Eliminar
              <DropdownMenuShortcut>
                <Trash className="size-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </ProtectedComponent>
        </DropdownMenuContent>
      </DropdownMenu>
    </ProtectedComponent>
  );
}
