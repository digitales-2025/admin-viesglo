import { z } from "zod";

/**
 * Schema para validación de campos requeridos del proyecto
 */
export const projectRequiredFieldsSchema = z.object({
  bondDate: z.string().optional(),
  hasCurrentAccount: z.boolean().optional(),
  proinnovateContract: z.string().optional(),
  bondType: z.enum(["INTERNAL", "EXTERNAL"]).optional(),
  approvedConsultant: z.boolean().optional(),
});

/**
 * Schema para validación de campos opcionales del proyecto
 */
export const projectOptionalFieldsSchema = z.object({
  milestone1Payment: z.string().optional(),
  milestone2Payment: z.string().optional(),
  certificationDate: z.string().optional(),
});

/**
 * Schema principal para validación de campos del proyecto
 */
export const projectFieldsSchema = z.object({
  requiredFields: projectRequiredFieldsSchema.optional(),
  optionalFields: projectOptionalFieldsSchema.optional(),
});

/**
 * Tipo inferido del schema de campos del proyecto
 */
export type ProjectFieldsForm = z.infer<typeof projectFieldsSchema>;

/**
 * Tipo inferido del schema de campos requeridos
 */
export type ProjectRequiredFieldsForm = z.infer<typeof projectRequiredFieldsSchema>;

/**
 * Tipo inferido del schema de campos opcionales
 */
export type ProjectOptionalFieldsForm = z.infer<typeof projectOptionalFieldsSchema>;
