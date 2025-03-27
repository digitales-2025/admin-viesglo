import { Edit, Mail, MoreHorizontal, RectangleEllipsis, Trash } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { ClientResponse } from "../_types/clients.types";

interface ClientsTableActionsProps {
  client: ClientResponse;
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
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" className="cursor-pointer relative text-slate-400">
              <Mail className="size-5" strokeWidth={1.5} />
              <RectangleEllipsis
                className="size-4 absolute top-1/2 left-1/2 fill-white dark:fill-black stroke-slate-400"
                strokeWidth={1.5}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Enviar credenciales de acceso</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
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
          <DropdownMenuItem className="cursor-pointer" onClick={handleDelete}>
            Eliminar
            <DropdownMenuShortcut>
              <Trash className="size-4 mr-2" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
