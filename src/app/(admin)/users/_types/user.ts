import { components } from "@/lib/api/types/api";

// Tipo original de la API
type OriginalUser = components["schemas"]["UserResponseDto"];

// Tipo modificado con permissionIds como string[] en lugar de string[][]
export type User = Omit<OriginalUser, "permissionIds"> & {
  permissionIds: string[];
  roleIds: string[];
};

export type UserCreate = Omit<components["schemas"]["CreateUserDto"], "permissionIds"> & {
  permissionIds: string[];
  roleIds: string[];
};

export type UserUpdate = Omit<components["schemas"]["UpdateUserDto"], "permissionIds"> & {
  permissionIds: string[];
  roleIds: string[];
};

export type Permission = components["schemas"]["PermissionResponseDto"];
