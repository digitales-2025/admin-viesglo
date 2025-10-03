import { components } from "@/lib/api/types/api";

// Tipos generados automáticamente desde el backend
export type UserResponse = components["schemas"]["UserResponseDto"];
export type UserProfile = components["schemas"]["UserProfileDto"];
export type Role = components["schemas"]["RoleResponseDto"];

// Para crear y actualizar usuario, puedes definir así si tienes los DTOs:
export type UserCreate = components["schemas"]["CreateUserRequestDto"];
export type UserUpdate = components["schemas"]["UpdateUserRequestDto"];
export type ChangePasswordRequest = components["schemas"]["ChangePasswordRequestDto"];

export type PaginatedUserResponse = components["schemas"]["PaginatedUserResponseDto"];

// DTOs de Filtros para búsqueda paginada
export type UserPaginatedFilterDto = {
  page?: number;
  pageSize?: number;
  search?: string;
  sortField?: "name" | "lastName" | "email" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
  roleId?: string;
  systemRolePosition?: number;
  isActive?: boolean;
};

// Enums para roles del sistema
export enum SystemRolePosition {
  MANAGEMENT = 1,
  PLANNER = 2,
  CONSULTANT = 3,
}
