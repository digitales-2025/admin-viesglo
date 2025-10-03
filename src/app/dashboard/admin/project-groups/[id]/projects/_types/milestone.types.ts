import { components } from "@/lib/api/types/api";

// ===== TIPOS DE DTOs DEL PROJECT-MILESTONES CONTROLLER =====

// DTOs de Request (del project-request.dto.ts)
export type AddMilestoneRequestDto = components["schemas"]["AddMilestoneRequestDto"];
export type UpdateMilestoneRequestDto = components["schemas"]["UpdateMilestoneRequestDto"];
export type UpdateMilestoneStatusRequestDto = components["schemas"]["UpdateMilestoneStatusRequestDto"];
export type AssignMilestoneRequestDto = components["schemas"]["AssignMilestoneRequestDto"];

// DTOs de Response (del project-response.dto.ts)
export type MilestoneOperationResponseDto = components["schemas"]["MilestoneOperationResponseDto"];
