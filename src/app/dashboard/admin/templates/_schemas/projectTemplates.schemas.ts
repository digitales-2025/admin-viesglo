import { z } from "zod";

import { DeliverablePriority } from "../_types/templates.types";

export const DeliverablePrecedenceSchema = z.object({
  deliverableId: z.string().min(1, "El ID del entregable precedente es requerido"),
});

export const DeliverableTemplateSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(1, "El nombre del entregable es requerido")
    .max(100, "El nombre no puede tener más de 100 caracteres"),
  description: z.string().max(500, "La descripción no puede tener más de 500 caracteres").optional(),
  priority: z.nativeEnum(DeliverablePriority),
  precedence: z.array(DeliverablePrecedenceSchema).optional(),
});

export const PhaseTemplateSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(1, "El nombre de la fase es requerido")
    .max(100, "El nombre no puede tener más de 100 caracteres"),
  description: z.string().max(500, "La descripción no puede tener más de 500 caracteres").optional(),
  deliverables: z.array(DeliverableTemplateSchema).optional(),
});

export const MilestoneTemplateSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede tener más de 100 caracteres"),
  description: z.string().max(500, "La descripción no puede tener más de 500 caracteres").optional(),
  isActive: z.boolean().optional(),
  phases: z.array(PhaseTemplateSchema).optional(),
});

// Schema para milestone template ref (como se usa en project templates)
export const MilestoneTemplateRefSchema = z.object({
  milestoneTemplateId: z.string().min(1, "El ID de la plantilla de hito es requerido"),
  isRequired: z.boolean().optional().default(false),
  customName: z
    .string()
    .max(100, "El nombre personalizado no puede tener más de 100 caracteres")
    .optional()
    .nullable()
    .transform((val) => (val === null ? undefined : val)),
  customizations: z
    .record(z.any())
    .optional()
    .nullable()
    .transform((val) => (val === null ? undefined : val)),
});

export const CreateProjectTemplateSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede tener más de 100 caracteres"),
  description: z.string().max(500, "La descripción no puede tener más de 500 caracteres").optional(),
  isActive: z.boolean().optional(),
  milestones: z.array(MilestoneTemplateRefSchema).optional(),
  tagIds: z.array(z.string()).optional(),
});

// Schema para milestone templates (sin phases anidados)
export const milestoneSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede tener más de 100 caracteres"),
  description: z.string().max(500, "La descripción no puede tener más de 500 caracteres").optional(),
});

// Schema para phases (sin milestoneId - viene de URL)
export const phaseSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre de la fase es requerido")
    .max(100, "El nombre no puede tener más de 100 caracteres"),
  description: z.string().max(500, "La descripción no puede tener más de 500 caracteres").optional(),
});

// Schema para deliverables (sin phaseId - viene de URL)
export const deliverableSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre del entregable es requerido")
    .max(100, "El nombre no puede tener más de 100 caracteres"),
  description: z.string().max(500, "La descripción no puede tener más de 500 caracteres").optional(),
  priority: z.nativeEnum(DeliverablePriority),
  precedence: z.array(DeliverablePrecedenceSchema).optional(),
});

// Schemas para crear milestone templates completos (con phases y deliverables)
export const createMilestoneTemplateWithPhasesSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede tener más de 100 caracteres"),
  description: z.string().max(500, "La descripción no puede tener más de 500 caracteres").optional(),
  isActive: z.boolean().optional(),
  phases: z.array(PhaseTemplateSchema).optional(),
});

export const updateMilestoneTemplateWithPhasesSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede tener más de 100 caracteres")
    .optional(),
  description: z.string().max(500, "La descripción no puede tener más de 500 caracteres").optional(),
  isActive: z.boolean().optional(),
  phases: z.array(PhaseTemplateSchema).optional(),
});

export type DeliverableTemplate = z.infer<typeof DeliverableTemplateSchema>;
export type PhaseTemplate = z.infer<typeof PhaseTemplateSchema>;
export type MilestoneTemplate = z.infer<typeof MilestoneTemplateSchema>;
export type CreateProjectTemplate = z.infer<typeof CreateProjectTemplateSchema>;

export type MilestoneFormData = z.infer<typeof milestoneSchema>;
export type PhaseFormData = z.infer<typeof phaseSchema>;
export type DeliverableFormData = z.infer<typeof deliverableSchema>;
export type MilestoneTemplateRefFormData = z.infer<typeof MilestoneTemplateRefSchema>;

// Schema para el formulario de milestone ref con campos adicionales
export const milestoneRefFormSchema = z.object({
  milestoneTemplateId: z.string().min(1, "El ID de la plantilla de hito es requerido"),
  isRequired: z.boolean().default(false),
  customName: z.string().max(100, "El nombre personalizado no puede tener más de 100 caracteres").optional(),
  customizations: z.record(z.any()).optional(),
});

export type MilestoneRefFormData = z.infer<typeof milestoneRefFormSchema>;

export type CreateMilestoneTemplateWithPhases = z.infer<typeof createMilestoneTemplateWithPhasesSchema>;
export type UpdateMilestoneTemplateWithPhases = z.infer<typeof updateMilestoneTemplateWithPhasesSchema>;
