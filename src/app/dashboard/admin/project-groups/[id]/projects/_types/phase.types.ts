import { components } from "@/lib/api/types/api";

// ===== TIPOS DE DTOs DEL PROJECT-PHASE CONTROLLER =====

// DTOs de Request (del project-request.dto.ts)
export type AddPhaseRequestDto = components["schemas"]["AddPhaseRequestDto"];
export type UpdatePhaseRequestDto = components["schemas"]["UpdatePhaseRequestDto"];
export type AssignPhaseRequestDto = components["schemas"]["AssignPhaseRequestDto"];

// DTOs de Response (del project-response.dto.ts)
export type PhaseOperationResponseDto = components["schemas"]["PhaseOperationResponseDto"];
