"use client";

import { useEffect, useState } from "react";

import { useUserTypeGuard } from "@/auth/presentation/hooks/useUserTypeGuard";
import AdminLayout from "@/shared/components/layout/AdminLayout";
import { Shell } from "@/shared/components/layout/Shell";
import { LoadingTransition } from "@/shared/components/ui/loading-transition";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUserTypeGuard(["admin"]);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Solo mostramos el contenido cuando:
    // 1. No está cargando
    // 2. Existe un usuario (está autenticado)
    // 3. Esperamos 500ms para asegurar transiciones suaves
    if (!isLoading && user) {
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 500);

      return () => clearTimeout(timer);
    } else {
      // Reseteamos el estado si no se cumplen las condiciones
      setShowContent(false);
    }
  }, [isLoading, user]);

  // Mientras esté cargando o no haya usuario o no haya pasado el tiempo de espera,
  // mostramos la pantalla de carga
  if (isLoading || !user || !showContent) {
    return <LoadingTransition show={true} message="Verificando acceso..." />;
  }

  return (
    <AdminLayout>
      <Shell>{children}</Shell>
    </AdminLayout>
  );
}
