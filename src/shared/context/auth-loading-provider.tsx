"use client";

import { LoadingTransition } from "../components/ui/loading-transition";
import { useAuthLoading } from "../hooks/use-auth-loading";
import { useRouteLoading } from "../hooks/use-route-loading";

export function AuthLoadingProvider() {
  const { isLoading, message } = useAuthLoading();

  // Hook que detecta cambios de ruta y oculta el loading automáticamente
  useRouteLoading();

  if (!isLoading) return null;

  return <LoadingTransition show={isLoading} message={message} />;
}
