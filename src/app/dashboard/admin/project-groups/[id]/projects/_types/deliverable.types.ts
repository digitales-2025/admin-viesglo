import { components } from "@/lib/api/types/api";

// ===== TIPOS DE DTOs DEL PROJECT-DELIVERABLES CONTROLLER =====

// DTOs de Request (del project-request.dto.ts)
export type AddDeliverableRequestDto = components["schemas"]["AddDeliverableRequestDto"];
export type UpdateDeliverableRequestDto = components["schemas"]["UpdateDeliverableRequestDto"];
export type AssignDeliverableRequestDto = components["schemas"]["AssignDeliverableRequestDto"];
export type UpdateProgressRequestDto = components["schemas"]["UpdateProgressRequestDto"];

// DTOs de Response (del project-response.dto.ts)
export type DeliverableOperationResponseDto = components["schemas"]["DeliverableOperationResponseDto"];
