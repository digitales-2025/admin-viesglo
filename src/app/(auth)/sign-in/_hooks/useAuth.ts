import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ENDPOINTS } from "@/lib/http/endpoints";
import { http } from "@/lib/http/methods";
import type { Credentials } from "../_actions/auth";

// Base URL para las peticiones directas de autenticación
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

// Claves de consulta
export const AUTH_KEYS = {
  all: ["auth"] as const,
  user: () => [...AUTH_KEYS.all, "user"] as const,
  login: () => [...AUTH_KEYS.all, "login"] as const,
  token: () => [...AUTH_KEYS.all, "token"] as const,
};

/**
 * Hook para iniciar sesión desde el cliente
 *
 * NOTA: Esta operación debe SIEMPRE ejecutarse en el cliente.
 * Por eso usamos fetch directo en lugar de httpClient.
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: Credentials) => {
      // IMPORTANTE: Esta petición se ejecuta DIRECTAMENTE desde el navegador
      const response = await fetch(`${API_URL}${ENDPOINTS.LOGIN}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
        credentials: "include", // Fundamental para cookies HTTP-only
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Error de inicio de sesión");
      }

      const data = await response.json();
      return data;
    },
    onSuccess: () => {
      // Invalidar consultas relevantes después del login
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}

/**
 * Hook para cerrar sesión desde el cliente
 *
 * NOTA: Esta operación debe SIEMPRE ejecutarse en el cliente.
 * Por eso usamos fetch directo en lugar de httpClient.
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // IMPORTANTE: Esta petición se ejecuta DIRECTAMENTE desde el navegador
      const response = await fetch(`${API_URL}${ENDPOINTS.LOGOUT}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Fundamental para cookies HTTP-only
      });

      if (!response.ok) {
        throw new Error("Error al cerrar sesión");
      }

      return await response.json().catch(() => ({}));
    },
    onSuccess: () => {
      // Limpiar cache de consultas después del logout
      queryClient.clear();
    },
  });
}

/**
 * Hook para obtener el usuario actual
 *
 * NOTA: Para operaciones normales que no son de autenticación directa,
 * usamos httpClient que ya tiene integrado el manejo de refresh token
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      // Usamos httpClient que ya tiene la lógica de refresh token integrada
      // y funciona correctamente desde el cliente
      return await http.get(ENDPOINTS.ME);
    },
    retry: false, // No reintentamos automáticamente para evitar bucles
  });
}
