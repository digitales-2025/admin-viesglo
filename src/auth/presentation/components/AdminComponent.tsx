"use client";

import { ReactNode, useEffect, useState } from "react";

import { LoadingOverlay } from "@/shared/components/loading-overlay";
import { useAuth } from "../providers/AuthProvider";

// Estados posibles de autorización
type AuthState = "LOADING" | "AUTHORIZED" | "UNAUTHORIZED";

interface AdminComponentProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Componente que muestra su contenido solo si el usuario es administrador.
 *
 * @example
 * <AdminComponent fallback={<p>No tienes permiso para ver este contenido</p>}>
 *   <AdminControls />
 * </AdminComponent>
 */
export function AdminComponent({ children, fallback = null }: AdminComponentProps) {
  const { user, isLoading: authLoading } = useAuth();
  const [authState, setAuthState] = useState<AuthState>("LOADING");

  useEffect(() => {
    // Si el usuario está cargando, mantenemos en LOADING
    if (authLoading) {
      setAuthState("LOADING");
      return;
    }

    // Si no hay usuario, no está autorizado
    if (!user) {
      setAuthState("UNAUTHORIZED");
      return;
    }

    // Verificamos si el usuario es administrador
    const isAdmin = user?.roles?.includes("superadmin") || false;

    if (isAdmin) {
      setAuthState("AUTHORIZED");
    } else {
      setAuthState("UNAUTHORIZED");
    }
  }, [user, authLoading]);

  // Renderizamos según el estado actual
  switch (authState) {
    case "LOADING":
      return <LoadingOverlay isLoading={true} fullScreen={true} />;
    case "AUTHORIZED":
      return <>{children}</>;
    case "UNAUTHORIZED":
      return <>{fallback}</>;
  }
}
