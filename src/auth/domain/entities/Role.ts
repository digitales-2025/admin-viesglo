export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: "create" | "read" | "update" | "delete" | "manage";
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

// Definición de roles por defecto
export const ROLES = {
  SUPERADMIN: "superadmin",
  ADMIN: "admin",
  MANAGER: "manager",
  CLIENT: "client",
  CLINIC_ADMIN: "clinic_admin",
  CLINIC_STAFF: "clinic_staff",
};
