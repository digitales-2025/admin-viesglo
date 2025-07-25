"use client";

import { useProfile } from "@/app/(public)/auth/sign-in/_hooks/use-auth";
import { Loading } from "@/shared/components/loading";
import ProfileForm from "../_components/ProfileForm";

export default function ProfilePage() {
  const user = useProfile();

  if (!user?.data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loading variant="spinner" size="lg" text="Cargando perfil..." />
      </div>
    );
  }

  return (
    <div className="w-full">
      <ProfileForm data={{ ...user.data, isSuperAdmin: user.isSuperAdmin }} />
    </div>
  );
}
