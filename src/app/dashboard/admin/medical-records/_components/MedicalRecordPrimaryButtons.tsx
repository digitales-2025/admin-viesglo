"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@/shared/components/ui/button";

export default function MedicalRecordPrimaryButtons() {
  const router = useRouter();

  return (
    <div className="flex items-center space-x-2">
      <Button onClick={() => router.push("/dashboard/admin/medical-records/new")}>
        <Plus className="mr-2 h-4 w-4" />
        Nuevo Registro Médico
      </Button>
    </div>
  );
}
