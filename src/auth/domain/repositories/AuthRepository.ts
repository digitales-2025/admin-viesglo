import { AuthResponse, User } from "../entities/User";

export interface AuthRepository {
  login(email: string, password: string): Promise<AuthResponse>;
  logout(): Promise<void>;
  refreshToken(): Promise<AuthResponse | null>;
  getCurrentUser(): Promise<User | null>;
  isAuthenticated(): Promise<boolean>;
  hasPermission(permission: string): Promise<boolean>;
  hasRole(role: string): Promise<boolean>;
}
