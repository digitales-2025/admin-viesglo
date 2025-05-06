import { Download } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { ClientWithResponse } from "../_types/client.types";

interface ClientsTableActionsProps {
  client: ClientWithResponse;
}

export default function ClientsTableActions({ client }: ClientsTableActionsProps) {
  const downloadFile = (url: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.download = "";
    link.click();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="bg-background" size="icon">
          <Download className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => downloadFile(client.medical)}>Descargar aptitud médica</DropdownMenuItem>
        <DropdownMenuItem onClick={() => downloadFile(client.report)}>Descargar informe médico</DropdownMenuItem>
        <DropdownMenuItem onClick={() => downloadFile(client.report)}>Ver registro clínico</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
