import { jwtDecode } from "jwt-decode";

import { AuthResponse, User, UserType } from "../../domain/entities/User";
import { InvalidCredentialsError } from "../../domain/errors/AuthErrors";
import { AuthRepository } from "../../domain/repositories/AuthRepository";

interface JWTPayload {
  exp: number;
  user_id: string;
  roles: string[];
  type: UserType;
}

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:5000/api/v1";

export class ApiAuthRepository implements AuthRepository {
  private user: User | null = null;
  private accessTokenValue: string | null = null;
  private refreshTokenValue: string | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.accessTokenValue = this.getCookie("access_token");
      this.refreshTokenValue = this.getCookie("refresh_token");
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${BACKEND_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include", // Para que el navegador guarde las cookies
      });

      if (!response.ok) {
        throw new InvalidCredentialsError();
      }

      const data = await response.json();

      // Adaptar la respuesta al formato que espera nuestra aplicación
      const adaptedUser: User = {
        id: data.id,
        email: data.email,
        name: data.fullName || data.name || data.email,
        type: data.type || "admin",
        roles: Array.isArray(data.roles)
          ? data.roles.map((role: any) => (typeof role === "string" ? role : role.name))
          : [],
      };

      this.user = adaptedUser;

      // Extraer tokens de las cookies después del login exitoso
      this.accessTokenValue = this.getCookie("access_token");
      this.refreshTokenValue = this.getCookie("refresh_token");

      return {
        user: adaptedUser,
        statusCode: data.statusCode || response.status,
      };
    } catch (error) {
      console.error("Login error:", error);
      throw error instanceof Error ? error : new Error("Error en el inicio de sesión");
    }
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${BACKEND_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      // Limpiar datos locales
      this.user = null;
      this.accessTokenValue = null;
      this.refreshTokenValue = null;

      // Eliminar cookies del navegador
      if (typeof window !== "undefined") {
        document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "logged_in=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      }
    } catch (error) {
      console.error("Logout error:", error);
      throw error instanceof Error ? error : new Error("Error al cerrar sesión");
    }
  }

  async refreshToken(): Promise<AuthResponse | null> {
    if (!this.refreshTokenValue) {
      return null;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `refresh_token=${this.refreshTokenValue}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      // Adaptar la respuesta al formato que espera nuestra aplicación
      const adaptedUser: User = {
        id: data.id,
        email: data.email,
        name: data.fullName || data.name || data.email,
        type: data.type || "admin",
        roles: Array.isArray(data.roles)
          ? data.roles.map((role: any) => (typeof role === "string" ? role : role.name))
          : [],
      };

      this.user = adaptedUser;

      // Actualizar tokens desde cookies
      this.accessTokenValue = this.getCookie("access_token");
      this.refreshTokenValue = this.getCookie("refresh_token");

      return {
        user: adaptedUser,
        statusCode: data.statusCode || response.status,
      };
    } catch (error) {
      console.error("Refresh token error:", error);
      return null;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    // Si ya tenemos el usuario en memoria, lo devolvemos
    if (this.user) {
      return this.user;
    }

    // Si no tenemos token de acceso, no hay usuario autenticado
    if (!this.accessTokenValue) {
      return null;
    }

    try {
      // Verificar si el token está expirado
      if (this.isTokenExpired(this.accessTokenValue)) {
        // Intentar refrescar el token
        const refreshResult = await this.refreshToken();
        if (!refreshResult) {
          return null;
        }
        return refreshResult.user;
      }

      // Obtener los datos del usuario desde la API
      const response = await fetch(`${BACKEND_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${this.accessTokenValue}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      // Adaptar la respuesta al formato que espera nuestra aplicación
      const adaptedUser: User = {
        id: data.id,
        email: data.email,
        name: data.fullName || data.name || data.email,
        type: data.type || "admin",
        roles: Array.isArray(data.roles)
          ? data.roles.map((role: any) => (typeof role === "string" ? role : role.name))
          : [],
      };

      this.user = adaptedUser;
      return adaptedUser;
    } catch (error) {
      console.error("Get current user error:", error);
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return !!user;
  }

  async hasPermission(): Promise<boolean> {
    // Esta es una implementación simple basada en roles
    const user = await this.getCurrentUser();
    if (!user) {
      return false;
    }

    // Ejemplo básico: el superadmin tiene todos los permisos
    if (user.roles.includes("superadmin")) {
      return true;
    }

    // En una implementación real, aquí verificaríamos el permiso específico
    // consultando a la API o utilizando un mapeo local de roles a permisos
    return false;
  }

  async hasRole(role: string): Promise<boolean> {
    const user = await this.getCurrentUser();
    if (!user) {
      return false;
    }
    return user.roles.includes(role);
  }

  private isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode<JWTPayload>(token);
      const expirationTime = decoded.exp * 1000; // Convertir a milisegundos
      return Date.now() >= expirationTime;
    } catch {
      return true; // Si hay error al decodificar, consideramos que el token es inválido
    }
  }

  private getCookie(name: string): string | null {
    if (typeof window === "undefined") {
      return null;
    }

    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? match[2] : null;
  }
}
