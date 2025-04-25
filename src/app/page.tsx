"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useCurrentUser } from "@/app/(auth)/sign-in/_hooks/useAuth";
import { useAuth } from "@/auth/presentation/providers/AuthProvider";
import AdminDashboard from "@/shared/components/dashboard/AdminDashboard";
import ClientDashboard from "@/shared/components/dashboard/ClientDashboard";
import ClinicDashboard from "@/shared/components/dashboard/ClinicDashboard";
import { LoadingTransition } from "@/shared/components/ui/loading-transition";

export default function HomePage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { isLoading: isCurrentUserLoading, error } = useCurrentUser();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  // Flag que combina los estados de carga
  const isLoading = isAuthLoading || isCurrentUserLoading;

  useEffect(() => {
    // Verificar si el usuario no está autenticado después de cargar
    if (!isLoading && !user) {
      router.replace("/sign-in");
    }

    // Marcar que estamos en el cliente para evitar errores de hidratación
    setIsClient(true);
  }, [isLoading, user, router]);

  // Mostrar el error si ocurre
  useEffect(() => {
    if (error) {
      console.error("Error cargando el usuario:", error);
    }
  }, [error]);

  // Mostrar el LoadingTransition mientras carga o ejecutándose en el servidor
  if (isLoading || !isClient) {
    return <LoadingTransition show={true} message="Cargando información..." />;
  }

  // Si no hay usuario, no renderizar nada (la redirección se maneja en el useEffect)
  if (!user) {
    return null;
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
      // Esto no debería ocurrir, pero por seguridad redirigimos a login
      router.replace("/sign-in");
      return null;
  }
}
