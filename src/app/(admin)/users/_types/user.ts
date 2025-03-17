import { components } from "@/lib/api/types/api";

// Tipo original de la API
type OriginalUser = components["schemas"]["UserResponseDto"];

// Tipo modificado con permissionIds como string[] en lugar de string[][]
export type User = Omit<OriginalUser, "roleIds"> & {
  roleIds: string[];
};

export type UserCreate = Omit<components["schemas"]["CreateUserDto"], "roleIds"> & {
  roleIds: string[];
};

export type UserUpdate = Omit<components["schemas"]["UpdateUserDto"], "roleIds"> & {
  roleIds: string[];
};

export type Role = components["schemas"]["RoleResponseDto"];
