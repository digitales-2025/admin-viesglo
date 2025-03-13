import { Download, UserPlus } from "lucide-react";

import { Button } from "@/shared/components/ui/button";

export function UsersPrimaryButtons() {
  return (
    <div className="flex gap-2">
      <Button variant="outline" className="space-x-1">
        <span>Nuevo Usuario</span>
        <UserPlus size={18} />
      </Button>
      <Button variant="outline" className="space-x-1">
        <span>Descargar</span> <Download size={18} />
      </Button>
    </div>
  );
}
