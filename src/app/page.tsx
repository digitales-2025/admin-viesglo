"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/auth/presentation/providers/AuthProvider";
import AlertMessage from "@/shared/components/alerts/Alert";
import AdminDashboard from "@/shared/components/dashboard/AdminDashboard";
import ClientDashboard from "@/shared/components/dashboard/ClientDashboard";
import ClinicDashboard from "@/shared/components/dashboard/ClinicDashboard";
import { LoadingTransition } from "@/shared/components/ui/loading-transition";

const DASHBOARD_COMPONENTS = {
  admin: AdminDashboard,
  client: ClientDashboard,
  clinic: ClinicDashboard,
} as const;

export default function HomePage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  // Manejar la redirección de forma controlada
  const handleRedirect = useCallback(() => {
    if (!isNavigating && !isLoading && !isAuthenticated) {
      setIsNavigating(true);
      // Usar push en lugar de redirect para evitar problemas de revalidación
      router.push("/sign-in");
    }
  }, [isNavigating, isLoading, isAuthenticated, router]);

  useEffect(() => {
    handleRedirect();
  }, [handleRedirect]);

  // Si estamos en proceso de navegación o cargando, mostrar el estado de carga
  if (isNavigating || isLoading || !user) {
    return <LoadingTransition show={true} message={isLoading ? "Verificando autenticación..." : "Redirigiendo..."} />;
  }

  // Verificar autenticación después de cargar
  if (!isAuthenticated) {
    return (
      <AlertMessage
        variant="destructive"
        title="Sesión no válida"
        description="Tu sesión ha expirado o no es válida. Serás redirigido..."
      />
    );
  }

  // Obtener el componente del dashboard según el tipo de usuario
  const DashboardComponent = DASHBOARD_COMPONENTS[user.type];

  // Si no existe un dashboard para el tipo de usuario, mostrar error
  if (!DashboardComponent) {
    return (
      <AlertMessage
        variant="destructive"
        title="Tipo de usuario no reconocido"
        description="Por favor, contacta al administrador o intenta iniciar sesión nuevamente."
      />
    );
  }

  // Renderizar el dashboard correspondiente
  return <DashboardComponent />;
}
