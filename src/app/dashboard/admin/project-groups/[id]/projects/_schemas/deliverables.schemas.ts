import { z } from "zod";

import { DeliverablePriorityEnum } from "../_types";

export const deliverableSchema = z.object({
  // Campos básicos del entregable
  name: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  description: z.string().max(500, "La descripción no puede exceder 500 caracteres").optional(),

  // Fechas
  startDate: z.string().optional(),
  endDate: z.string().optional(),

  // Peso y prioridad
  weight: z.number().min(0, "El peso no puede ser menor a 0").max(100, "El peso no puede ser mayor a 100").optional(),
  priority: z.nativeEnum(DeliverablePriorityEnum).optional(),
});

export type DeliverableForm = z.infer<typeof deliverableSchema>;
