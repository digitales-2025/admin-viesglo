"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/auth/presentation/providers/AuthProvider";
import AlertMessage from "@/shared/components/alerts/Alert";
import AdminDashboard from "@/shared/components/dashboard/AdminDashboard";
import ClientDashboard from "@/shared/components/dashboard/ClientDashboard";
import ClinicDashboard from "@/shared/components/dashboard/ClinicDashboard";
import { LoadingTransition } from "@/shared/components/ui/loading-transition";

export default function HomePage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Solo redirigir si hemos terminado de cargar y no hay usuario autenticado
    if (!isLoading && !isAuthenticated) {
      router.replace("/sign-in");
    }
  }, [isLoading, isAuthenticated, router]);

  // Mostrar loading mientras se determina el estado de autenticación
  if (isLoading) {
    return <LoadingTransition show={true} message="Verificando autenticación..." />;
  }

  // Si no está autenticado, mostrar loading mientras se redirige
  if (!isAuthenticated || !user) {
    return <LoadingTransition show={true} message="Redirigiendo..." />;
  }

  // Renderizar el dashboard según el tipo de usuario
  // Los layouts específicos ya tienen su propia protección con useUserTypeGuard
  switch (user.type) {
    case "admin":
      return <AdminDashboard />;
    case "client":
      return <ClientDashboard />;
    case "clinic":
      return <ClinicDashboard />;
    default:
      // Mostrar error para tipos de usuario no reconocidos
      return (
        <AlertMessage
          variant="destructive"
          title="Tipo de usuario no reconocido"
          description="Por favor, contacta al administrador o intenta iniciar sesión nuevamente."
        />
      );
  }
}
