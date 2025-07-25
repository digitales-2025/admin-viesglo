"use client";

import { useProfile } from "@/app/(public)/auth/sign-in/_hooks/use-auth";
import { Loading } from "@/shared/components/loading";
import SecurityForm from "../_components/SecurityForm";

export default function SecurityPage() {
  const user = useProfile();

  if (!user?.data) {
    return (
      <div className="min-h-[60vh] flex-1 items-center justify-center">
        <Loading variant="spinner" size="lg" text="Cargando perfil..." />
      </div>
    );
  }
  return (
    <div className="w-full">
      <SecurityForm data={{ ...user.data, isSuperAdmin: user.isSuperAdmin }} />
    </div>
  );
}
