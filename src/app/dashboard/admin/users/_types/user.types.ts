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
