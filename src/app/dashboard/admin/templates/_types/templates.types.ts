import { components } from "@/lib/api/types/api";

// Tipos de DTOs usados en plantillas (mapeados desde los schemas del cliente HTTP)
export type TagResponseDto = components["schemas"]["TagResponseDto"];
export type MilestoneTemplateRefResponseDto = components["schemas"]["MilestoneTemplateRefResponseDto"];
export type MilestoneTemplateRefRequestDto = components["schemas"]["MilestoneTemplateRefRequestDto"];
export type ProjectTemplateResponseDto = components["schemas"]["ProjectTemplateResponseDto"];
export type DeliverablePrecedenceResponseDto = components["schemas"]["DeliverablePrecedenceResponseDto"];
export type DeliverableTemplateResponseDto = components["schemas"]["DeliverableTemplateResponseDto"];
export type PhaseTemplateResponseDto = components["schemas"]["PhaseTemplateResponseDto"];
export type MilestoneTemplateResponseDto = components["schemas"]["MilestoneTemplateResponseDto"];
export type PaginatedProjectTemplateResponseDto = components["schemas"]["PaginatedProjectTemplateResponseDto"];
export type ProjectTemplateDetailedResponseDto = components["schemas"]["ProjectTemplateDetailedResponseDto"];

// Enum de prioridad de entregable (definido localmente)
export enum DeliverablePriority {
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
}
