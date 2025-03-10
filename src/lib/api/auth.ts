import { ENDPOINTS } from "@/lib/http/endpoints";
import { http } from "@/lib/http/methods";
import { refreshAccessToken } from "@/lib/http/token-service";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface TokenResponse {
  accessToken: string;
}

export const authApi = {
  // Iniciar sesión
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => http.post(ENDPOINTS.LOGIN, credentials),

  // Cerrar sesión
  logout: async (): Promise<void> => http.post(ENDPOINTS.LOGOUT),

  // Obtener datos del usuario actual
  getCurrentUser: async (): Promise<User> => http.get(ENDPOINTS.ME),

  // Refrescar token
  refreshToken: async (): Promise<string> => refreshAccessToken(),
};
