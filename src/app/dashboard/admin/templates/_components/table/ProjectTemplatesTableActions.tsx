import { useRouter } from "next/navigation";
import { Edit, MoreHorizontal, RotateCcw, Trash } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { useReactivateProjectTemplate } from "../../_hooks/use-project-templates";
import { ProjectTemplateResponseDto } from "../../_types/templates.types";

interface ProjectTemplatesTableActionsProps {
  projectTemplate: ProjectTemplateResponseDto;
}

export default function ProjectTemplatesTableActions({ projectTemplate }: ProjectTemplatesTableActionsProps) {
  const { open } = useDialogStore();
  const { mutate: reactivateClient, isPending: isReactivating } = useReactivateProjectTemplate();
  const MODULE = "templates";

  const router = useRouter();
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    open(MODULE, "delete", projectTemplate);
  };

  const handleReactivate = (e: React.MouseEvent) => {
    e.stopPropagation();
    reactivateClient({ params: { path: { id: projectTemplate.id } } });
  };

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/dashboard/admin/templates/${projectTemplate.id}/view`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/dashboard/admin/templates/${projectTemplate.id}/edit`);
  };

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" onClick={handleTriggerClick}>
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={handleView}>Ver</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={handleEdit}>
          Editar
          <DropdownMenuShortcut>
            <Edit className="size-4 mr-2" />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        {projectTemplate.isActive ? (
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
