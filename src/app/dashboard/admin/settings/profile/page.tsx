"use client";

import { useProfile } from "@/app/(public)/auth/sign-in/_hooks/use-auth";
import { Loading } from "@/shared/components/loading";
import ProfileForm from "../_components/ProfileForm";

export default function ProfilePage() {
  const user = useProfile();

  // ✅ Mostrar loading mientras se carga
  if (user.isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loading variant="spinner" size="lg" text="Cargando perfil..." />
      </div>
    );
  }

  // ✅ Si no está autenticado, redirigir o mostrar mensaje
  if (user.isUnauthenticated || !user.data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Sesión expirada</h2>
          <p className="text-gray-600 mb-4">Tu sesión ha expirado. Por favor, inicia sesión nuevamente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <ProfileForm data={{ ...user.data, isSuperAdmin: user.isSuperAdmin }} />
    </div>
  );
}
