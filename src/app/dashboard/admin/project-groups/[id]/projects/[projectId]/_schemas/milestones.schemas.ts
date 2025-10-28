import { z } from "zod";

export const milestoneSchema = z.object({
  name: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type MilestoneForm = z.infer<typeof milestoneSchema>;
