// Tipo original de la API
type OriginalRole = any;

// Tipo modificado con permissionIds como string[] en lugar de string[][]
export type Role = Omit<OriginalRole, "permissionIds"> & {
  permissionIds: string[];
};

export type RoleCreate = Omit<any, "permissionIds"> & {
  permissionIds: string[];
};

export type RoleUpdate = Omit<any, "permissionIds"> & {
  permissionIds: string[];
};

export type Permission = any;
