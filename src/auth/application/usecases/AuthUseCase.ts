import { AuthResponse, User } from "../../domain/entities/User";
import { ForbiddenError, TokenExpiredError, UnauthorizedError } from "../../domain/errors/AuthErrors";
import { AuthRepository } from "../../domain/repositories/AuthRepository";

export class AuthUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async login(email: string, password: string): Promise<AuthResponse> {
    return this.authRepository.login(email, password);
  }

  async logout(): Promise<void> {
    return this.authRepository.logout();
  }

  async getCurrentUser(): Promise<User> {
    const user = await this.authRepository.getCurrentUser();
    if (!user) {
      throw new UnauthorizedError();
    }
    return user;
  }

  async refreshToken(): Promise<AuthResponse> {
    const result = await this.authRepository.refreshToken();
    if (!result) {
      throw new TokenExpiredError();
    }
    return result;
  }

  async isAuthenticated(): Promise<boolean> {
    return this.authRepository.isAuthenticated();
  }

  async authorizeUser(requiredRoles?: string[], requiredPermissions?: string[]): Promise<User> {
    const user = await this.getCurrentUser();

    // Si no hay roles o permisos requeridos, solo verificamos autenticación
    if ((!requiredRoles || requiredRoles.length === 0) && (!requiredPermissions || requiredPermissions.length === 0)) {
      return user;
    }

    // Verificar roles si están definidos
    if (requiredRoles && requiredRoles.length > 0) {
      const hasRequiredRole = await Promise.all(requiredRoles.map((role) => this.authRepository.hasRole(role))).then(
        (results) => results.some(Boolean)
      );

      if (!hasRequiredRole) {
        throw new ForbiddenError("No tienes los roles necesarios para acceder a este recurso");
      }
    }

    // Verificar permisos si están definidos
    if (requiredPermissions && requiredPermissions.length > 0) {
      const hasRequiredPermission = await Promise.all(
        requiredPermissions.map((permission) => this.authRepository.hasPermission(permission))
      ).then((results) => results.some(Boolean));

      if (!hasRequiredPermission) {
        throw new ForbiddenError("No tienes los permisos necesarios para realizar esta acción");
      }
    }

    return user;
  }
}
