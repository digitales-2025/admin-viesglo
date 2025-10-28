import { z } from "zod";

import { EnumAction, EnumResource } from "../../settings/_types/roles.types";

// Esquema para un permiso individual usando tus enums
export const permissionSchema = z.object({
  resource: z.nativeEnum(EnumResource),
  action: z.nativeEnum(EnumAction),
});

// Esquema único para crear/actualizar rol
export const roleSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede tener más de 50 caracteres"),
  description: z
    .string()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(500, "La descripción no puede tener más de 500 caracteres"),
  permissions: z.array(permissionSchema).min(1, "Debe especificar al menos un permiso"),
});

export type RoleForm = z.infer<typeof roleSchema>;
export type PermissionForm = z.infer<typeof permissionSchema>;
