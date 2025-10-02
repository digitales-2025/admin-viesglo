import { z } from "zod";

// Schema base para todas las operaciones de fases
export const phasesSchema = z.object({
  // Campos básicos de la fase
  name: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres")
    .optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),

  // Para creación desde plantilla
  sourceTemplateId: z.string().optional(),

  // Para asignación
  consultantId: z.string().min(1, "El ID del consultor es requerido").optional(),
});

// Schema específico para agregar fase (name es requerido)
export const addPhaseSchema = phasesSchema.required({ name: true });

// Schema específico para asignar fase (consultantId es requerido)
export const assignPhaseSchema = phasesSchema.required({ consultantId: true });

export type PhasesForm = z.infer<typeof phasesSchema>;
export type AddPhaseForm = z.infer<typeof addPhaseSchema>;
export type AssignPhaseForm = z.infer<typeof assignPhaseSchema>;
