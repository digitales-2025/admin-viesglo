"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { currentUser, login, logout, updatePassword } from "../_actions/auth.actions";
import { AuthResponse, SignIn, UpdatePassword } from "../_types/auth.types";

export const AUTH_KEYS = {
  user: ["user"],
  lists: () => [...AUTH_KEYS.user, "lists"],
  detail: (id: string) => [...AUTH_KEYS.user, "detail", id],
};

interface AuthState {
  user: AuthResponse | null;
  isLoading: boolean;
  isHydrated: boolean;
  setUser: (user: AuthResponse) => void;
  logout: () => void;
}

/**
 * Hook personalizado para manejar el estado de autenticación
 * Utiliza Zustand para la gestión del estado y persist para mantener los datos en localStorage
 */
export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      isHydrated: false,

      /**
       * Establece los datos del usuario en el estado
       * @param user - Objeto con los datos del perfil del usuario
       */
      setUser: (user: AuthResponse) =>
        set({
          user: {
            ...user,
            roles: user.roles || [],
          },
        }),

      /**
       * Cierra la sesión del usuario actual
       * Realiza una petición al endpoint de logout y limpia el estado
       */
      logout: () => {
        set({ isLoading: true });
        try {
          set({ user: null });
        } catch (error) {
          console.error("Error durante el logout:", error);
          set({ user: null });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "auth-storage", // Nombre del almacenamiento en localStorage
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => {
        return (state) => {
          if (state) {
            state.isHydrated = true;
          }
          return state;
        };
      },
    }
  )
);

/**
 * Hook personalizado para manejar el proceso de inicio de sesión
 */
export function useSignIn() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: SignIn) => {
      const result = await login(credentials);

      if (result.success === false) {
        throw new Error(
          Object.values(result.errors || {})
            .flat()
            .join(", ")
        );
      }

      if (result.error) {
        throw new Error(result.error);
      }

      if (!result.data) {
        throw new Error("No se recibieron datos del servidor");
      }

      return result.data;
    },
    /**
     * Callback ejecutado cuando el inicio de sesión es exitoso
     * Transforma y almacena los datos del usuario en el estado
     * @param response - Respuesta del servidor con los datos del usuario
     */
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: AUTH_KEYS.user });
      toast.success("Inicio de sesión exitoso");
      setTimeout(() => {
        router.push("/");
      }, 1000);
    },
    onError: (error: Error) => {
      toast.error(`Error en inicio de sesión: ${error.message}`);
    },
  });
}

/**
 * Hook personalizado para manejar el proceso de logout
 */
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await logout();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: AUTH_KEYS.user });
      toast.success("Cierre de sesión exitoso");
      router.push("/sign-in");
    },
    onError: (error: Error) => {
      toast.error(`Error en cierre de sesión: ${error.message}`);
    },
  });
}

/**
 * Hook personalizado para obtener el usuario autenticado
 */
export function useCurrentUser() {
  const { data, isLoading, error } = useQuery({
    queryKey: AUTH_KEYS.user,
    queryFn: async () => {
      const response = await currentUser();
      if (!response) {
        throw new Error("No se recibieron datos del servidor");
      }
      return response;
    },
  });
  return { data, isLoading, error };
}

export function useUpdatePassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdatePassword) => {
      const response = await updatePassword(data);
      if (!response.success) {
        throw new Error(response.error || "Error al actualizar la contraseña");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.user });
      toast.success("Contraseña actualizada exitosamente");
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar la contraseña: ${error.message}`);
    },
  });
}
