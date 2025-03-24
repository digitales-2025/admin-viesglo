import { components } from "@/lib/api/types/api";

// Tipo original de la API
export type UserResponseOriginal = components["schemas"]["UserResponseDto"];
export type User = UserResponseOriginal & { roles: Role[] };

export type UserCreate = Omit<components["schemas"]["CreateUserDto"], "roleIds"> & {
  roleIds: string[];
};

export type UserUpdate = Omit<components["schemas"]["UpdateUserDto"], "roleIds"> & {
  roleIds: string[];
};

export type Role = components["schemas"]["RoleResponseDto"];
