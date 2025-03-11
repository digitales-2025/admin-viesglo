import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { Credentials } from "../_actions/auth";
import { currentUser, logout } from "../_actions/auth";

// Claves de consulta
export const AUTH_KEYS = {
  all: ["auth"] as const,
  user: () => [...AUTH_KEYS.all, "user"] as const,
  login: () => [...AUTH_KEYS.all, "login"] as const,
  token: () => [...AUTH_KEYS.all, "token"] as const,
};

// Hook para obtener el usuario actual
export function useCurrentUser() {
  return useQuery({
    queryKey: AUTH_KEYS.user(),
    // Puedes crear un Server Action para esto
    queryFn: async () => {
      const result = await currentUser();
      if (!result.success) {
        throw new Error(result.error || "Error al obtener el usuario");
      }
      return result.user;
    },
    retry: false,
    throwOnError: false,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook para iniciar sesión - conexión directa
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: Credentials) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
        credentials: "include", // Fundamental para las cookies
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Error en la autenticación");
      }

      const data = await response.json();
      return {
        success: true,
        user: data.user, // Solo necesitas el usuario, no los tokens
      };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(AUTH_KEYS.user(), data.user);
    },
  });
}

// Hook para cerrar sesión - usando Server Action
export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      return await logout();
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: AUTH_KEYS.all });
      queryClient.clear();
      router.push("/sign-in");
    },
  });
}
