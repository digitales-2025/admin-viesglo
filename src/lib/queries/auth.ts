import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authApi, AuthResponse, LoginCredentials } from "@/lib/api/auth";

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
    queryFn: () => authApi.getCurrentUser(),
    // No lanzar errores para cuando el usuario no está autenticado (401)
    retry: false,
    throwOnError: false,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para iniciar sesión
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),

    onSuccess: (data: AuthResponse) => {
      // Actualizar la cache con el usuario actual
      queryClient.setQueryData(AUTH_KEYS.user(), data.user);
    },
  });
}

// Hook para refrescar el token
export function useRefreshToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.refreshToken(),
    onSuccess: (accessToken: string) => {
      queryClient.setQueryData(AUTH_KEYS.token(), { accessToken });
    },
  });
}

// Hook para cerrar sesión
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),

    onSuccess: () => {
      // Limpiar el cache del usuario y otras consultas
      queryClient.removeQueries({ queryKey: AUTH_KEYS.all });
      queryClient.clear(); // Opcional: limpiar todo el cache
    },
  });
}
