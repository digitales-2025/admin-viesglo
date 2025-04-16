export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export class UnauthorizedError extends AuthError {
  constructor(message = "No estás autorizado para acceder a este recurso") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AuthError {
  constructor(message = "No tienes permiso para realizar esta acción") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class TokenExpiredError extends AuthError {
  constructor(message = "Tu sesión ha expirado, por favor inicia sesión nuevamente") {
    super(message);
    this.name = "TokenExpiredError";
  }
}

export class InvalidCredentialsError extends AuthError {
  constructor(message = "Credenciales inválidas") {
    super(message);
    this.name = "InvalidCredentialsError";
  }
}
