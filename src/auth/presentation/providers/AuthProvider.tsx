"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useCurrentUser, useLogout } from "@/app/(auth)/sign-in/_hooks/useAuth";
import { AuthUseCase } from "../../application/usecases/AuthUseCase";
import { getUserDashboardPath, User } from "../../domain/entities/User";
import { ForbiddenError, UnauthorizedError } from "../../domain/errors/AuthErrors";
import { ApiAuthRepository } from "../../infrastructure/repositories/ApiAuthRepository";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: string) => Promise<boolean>;
  hasPermission: (permission: string) => Promise<boolean>;
  authorizeUser: (requiredRoles?: string[], requiredPermissions?: string[]) => Promise<User | null>;
  redirectToDashboard: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Creamos una única instancia del repositorio y caso de uso para métodos que no están en useAuth
const authRepository = new ApiAuthRepository();
const authUseCase = new AuthUseCase(authRepository);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Utilizamos el hook useCurrentUser en lugar de la lógica interna
  const { data: currentUserData, isLoading: isUserLoading, error } = useCurrentUser();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const logoutMutation = useLogout();

  useEffect(() => {
    // Cuando los datos del usuario cambian, actualizamos nuestro estado
    if (currentUserData && !isUserLoading) {
      // Adaptar la respuesta al formato que espera nuestra aplicación
      const adaptedUser: User = {
        id: currentUserData.id || "",
        email: currentUserData.email || "",
        name: currentUserData.name || currentUserData.email || "",
        type: currentUserData.type || "admin",
        roles: Array.isArray(currentUserData.roles)
          ? currentUserData.roles.map((role: any) => (typeof role === "string" ? role : role.name))
          : [],
      };

      setUser(adaptedUser);
      setIsAuthenticated(true);
      setIsLoading(false);
    } else if (!isUserLoading && error) {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    } else if (!isUserLoading) {
      // Si no hay error pero tampoco hay usuario
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  }, [currentUserData, isUserLoading, error]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await authUseCase.login(email, password);
      setUser(result.user);
      setIsAuthenticated(true);
      redirectToDashboard();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // Usar el hook de logout en lugar de llamar directamente al usecase
      await logoutMutation.mutateAsync();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const hasRole = async (role: string): Promise<boolean> => {
    if (!user) return false;
    return user.roles.includes(role);
  };

  const hasPermission = async () //permission: string
  : Promise<boolean> => {
    // TODO: Implementar la lógica para verificar si el usuario tiene el permiso
    if (!user) return false;

    // Ejemplo básico: el superadmin tiene todos los permisos
    if (user.roles.includes("superadmin")) {
      return true;
    }

    // En una implementación real, aquí verificaríamos el permiso específico
    return false;
  };

  const authorizeUser = async (requiredRoles?: string[]): Promise<User | null> => {
    // requiredPermissions?: string[]
    // TODO: Implementar la lógica para verificar si el usuario tiene los roles y permisos necesarios
    try {
      if (!user) {
        throw new UnauthorizedError("Usuario no autenticado");
      }

      // Verificar roles
      if (requiredRoles && requiredRoles.length > 0) {
        const hasRequiredRole = requiredRoles.some((role) => user.roles.includes(role));
        if (!hasRequiredRole) {
          throw new ForbiddenError("No tienes los roles necesarios para acceder a este recurso");
        }
      }

      // Verificar tipo de usuario
      if (requiredRoles && requiredRoles.includes(user.type)) {
        throw new ForbiddenError("No tienes el tipo de usuario necesario para acceder a este recurso");
      }

      return user;
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        router.replace("/sign-in");
      } else if (error instanceof ForbiddenError) {
        router.replace("/forbidden");
      }
      console.error("Authorization error:", error);
      return null;
    }
  };

  const redirectToDashboard = () => {
    if (user) {
      const dashboardPath = getUserDashboardPath();
      router.replace(dashboardPath);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
        hasRole,
        hasPermission,
        authorizeUser,
        redirectToDashboard,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};
