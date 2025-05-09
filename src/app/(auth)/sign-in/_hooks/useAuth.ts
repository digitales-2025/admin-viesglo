"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { MEDICAL_RECORDS_KEYS } from "@/app/(admin)/medical-records/_hooks/useMedicalRecords";
import { currentUser, getUserPermissions, login, logout, updatePassword } from "../_actions/auth.actions";
import { AuthResponse, SignIn, UpdatePassword } from "../_types/auth.types";

export const AUTH_KEYS = {
  user: ["user"],
  lists: () => [...AUTH_KEYS.user, "lists"],
  detail: (id: string) => [...AUTH_KEYS.user, "detail", id],
  permissions: () => [...AUTH_KEYS.user, "permission"],
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
            roles: Array.isArray(user.roles)
              ? user.roles.map((role: any) => (typeof role === "string" ? role : role.name))
              : [],
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
      try {
        const result = await login(credentials);
        if (result.success === false) {
          throw new Error(result.error);
        }

        if (result.error) {
          throw new Error(result.error);
        }

        if (!result.data) {
          throw new Error("No se recibieron datos del servidor");
        }

        return result;
      } catch (error) {
        throw new Error(error as string);
      }
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: AUTH_KEYS.user });
      await queryClient.invalidateQueries({ queryKey: MEDICAL_RECORDS_KEYS.lists() });
      toast.success("Inicio de sesión exitoso");
      setTimeout(() => {
        // Usar la URL de redirección devuelta por la acción login si está disponible
        const redirectUrl = result.redirectUrl || "/";
        router.push(redirectUrl);
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
  return useQuery({
    queryKey: AUTH_KEYS.user,
    queryFn: async () => {
      const response = await currentUser();
      if (!response.success) {
        await logout();
        throw new Error(response.error || "Error al obtener el usuario");
      }
      return response.data;
    },
  });
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

export function useAuthPermissions() {
  return useQuery({
    queryKey: AUTH_KEYS.permissions(),
    queryFn: async () => {
      const response = await getUserPermissions();
      if (!response.success) {
        throw new Error(response.error || "Error al obtener los permisos del usuario");
      }
      return response.data;
    },
  });
}
