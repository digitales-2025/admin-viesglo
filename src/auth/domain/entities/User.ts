export type UserType = "admin" | "client" | "clinic";

export interface User {
  id: string;
  email: string;
  name: string;
  type: UserType;
  roles: string[];
}

export interface AuthResponse {
  user: User;
  statusCode: number;
}

export const getUserDashboardPath = (): string => {
  // Todas las redirecciones van a la misma ruta base
  // El contenido se mostrará según el tipo de usuario
  return "/";
};
