"use client";

import { redirect } from "next/navigation";

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

  // Manejar todos los estados de carga/autenticación de una vez
  if (isLoading || !isAuthenticated || !user) {
    const message = isLoading ? "Verificando autenticación..." : "Redirigiendo...";

    // Si no está autenticado y no está cargando, redirigir
    if (!isLoading && !isAuthenticated) {
      redirect("/sign-in");
    }

    return <LoadingTransition show={true} message={message} />;
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
