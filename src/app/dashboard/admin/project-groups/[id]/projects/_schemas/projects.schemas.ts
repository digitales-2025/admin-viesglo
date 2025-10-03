import { z } from "zod";

import { ProjectStatusEnum, ProjectTypeEnum } from "../_types";

export const projectsSchema = z.object({
  // Campos básicos del proyecto
  name: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  description: z.string().max(500, "La descripción no puede exceder 500 caracteres").optional(),
  projectType: z.nativeEnum(ProjectTypeEnum),
  status: z.nativeEnum(ProjectStatusEnum).optional(),

  // Relaciones
  clientId: z.string().min(1, "El cliente es requerido"),
  coordinatorId: z.string().min(1, "El coordinador es requerido"),
  projectGroupId: z.string().optional(),

  // Plantillas
  projectTemplateId: z.string().optional(),
  selectedMilestones: z
    .array(
      z.object({
        milestoneTemplateId: z.string(),
        selectedPhases: z
          .array(
            z.object({
              phaseTemplateId: z.string(),
              selectedDeliverables: z.array(z.string()),
            })
          )
          .min(1, "Debe seleccionar al menos una fase"),
      })
    )
    .optional(),

  // Etiquetas
  projectTagIds: z.array(z.string()).optional(),

  // Fechas
  startDate: z.string().optional(),
  endDate: z.string().optional(),

  // Roles comerciales
  commercialExecutive: z.string().max(100, "El ejecutivo comercial no puede exceder 100 caracteres").optional(),
  implementingCompany: z.string().max(100, "La empresa implementadora no puede exceder 100 caracteres").optional(),
  externalReviewer: z.string().max(100, "El revisor externo no puede exceder 100 caracteres").optional(),
});

export type ProjectsForm = z.infer<typeof projectsSchema>;
