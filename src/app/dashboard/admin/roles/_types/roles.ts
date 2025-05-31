import { components } from "@/lib/api/types/api";

// Tipo original de la API
type OriginalRole = components["schemas"]["RoleResponseDto"];

// Tipo modificado con permissionIds como string[] en lugar de string[][]
export type Role = Omit<OriginalRole, "permissionIds"> & {
  permissionIds: string[];
};

export type RoleCreate = Omit<components["schemas"]["CreateRoleDto"], "permissionIds"> & {
  permissionIds: string[];
};

export type RoleUpdate = Omit<components["schemas"]["UpdateRoleDto"], "permissionIds"> & {
  permissionIds: string[];
};

export type Permission = components["schemas"]["PermissionResponseDto"];
