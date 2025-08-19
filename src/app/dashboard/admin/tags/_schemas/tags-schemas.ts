import { z } from "zod";

export const createTagSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre de la etiqueta es requerido")
    .max(50, "El nombre no puede tener más de 50 caracteres"),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "El color debe ser un código hexadecimal válido")
    .optional(),
  isActive: z.boolean().optional().default(true),
});

export type CreateTagForm = z.infer<typeof createTagSchema>;
