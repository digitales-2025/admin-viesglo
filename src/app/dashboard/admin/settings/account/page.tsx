import React from "react";

import { useProfile } from "@/app/(public)/auth/sign-in/_hooks/use-auth";
import { Loading } from "@/shared/components/loading";
import AccountForm from "./_components/AccountForm";

export default function AccountPage() {
  const user = useProfile();

  if (!user?.data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loading variant="spinner" size="lg" text="Cargando perfil..." />
      </div>
    );
  }

  return <AccountForm data={{ ...user.data, isSuperAdmin: user.isSuperAdmin }} />;
}
