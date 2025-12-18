"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { EnumAction, EnumResource } from "@/app/dashboard/admin/settings/_types/roles.types";
import { PermissionProtected } from "@/shared/components/protected-component";
import { Button } from "@/shared/components/ui/button";

export default function ProjectTemplatesPrimaryButtons() {
  const router = useRouter();

  return (
    <div>
      <PermissionProtected
        permissions={[{ resource: EnumResource.projects, action: EnumAction.create }]}
        hideOnUnauthorized={true}
      >
        <Button
          className="space-x-1"
          onClick={() => {
            router.push("/dashboard/admin/templates/create");
          }}
        >
          <span>Agregar Plantilla</span> <Plus size={18} />
        </Button>
      </PermissionProtected>
    </div>
  );
}
