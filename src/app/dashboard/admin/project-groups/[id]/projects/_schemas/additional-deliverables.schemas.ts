import { z } from "zod";

export const additionalDeliverableSchema = z.object({
  // Campos básicos del entregable adicional
  name: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  description: z.string().max(500, "La descripción no puede exceder 500 caracteres").optional(),
});

export type AdditionalDeliverableForm = z.infer<typeof additionalDeliverableSchema>;
