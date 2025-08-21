"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@/shared/components/ui/button";

export default function ProjectTemplatesPrimaryButtons() {
  const router = useRouter();

  return (
    <div>
      <Button
        className="space-x-1"
        onClick={() => {
          router.push("/dashboard/admin/templates/create");
        }}
      >
        <span>Agregar Plantilla</span> <Plus size={18} />
      </Button>
    </div>
  );
}
