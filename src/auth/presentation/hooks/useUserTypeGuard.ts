"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { UserType } from "../../domain/entities/User";
import { useAuth } from "../providers/AuthProvider";

/**
 * Hook personalizado para proteger rutas basadas en el tipo de usuario.
 * Redirecciona a la página principal si el usuario no tiene el tipo requerido.
 *
 * @param allowedUserTypes - Array de tipos de usuario permitidos para acceder a la ruta
 */
export function useUserTypeGuard(allowedUserTypes: UserType[]) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Si no está cargando y tenemos información del usuario
    if (!isLoading && user) {
      // Verificar si el tipo de usuario actual está permitido
      const isAllowed = allowedUserTypes.includes(user.type as UserType);

      // Si no está permitido, redirigir a la página principal
      if (!isAllowed) {
        console.log(`Acceso denegado para el tipo de usuario ${user.type}`);
        router.replace("/");
      }
    }
  }, [user, isLoading, router, allowedUserTypes]);

  return { user, isLoading };
}
