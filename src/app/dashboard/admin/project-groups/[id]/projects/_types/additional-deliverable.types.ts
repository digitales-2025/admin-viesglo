import { components } from "@/lib/api/types/api";

// ===== TIPOS DE DTOs DEL ADDITIONAL-DELIVERABLES CONTROLLER =====

// DTOs de Request (del project-request.dto.ts)
export type CreateAdditionalDeliverableRequestDto = components["schemas"]["CreateAdditionalDeliverableRequestDto"];
export type UpdateAdditionalDeliverableRequestDto = components["schemas"]["UpdateAdditionalDeliverableRequestDto"];
export type UpdateAdditionalDeliverableProgressRequestDto =
  components["schemas"]["UpdateAdditionalDeliverableProgressRequestDto"];
export type SetAdditionalDeliverableActualDatesRequestDto =
  components["schemas"]["SetAdditionalDeliverableActualDatesRequestDto"];

// DTOs de Response (del project-response.dto.ts)
export type AdditionalDeliverableResponseDto = components["schemas"]["AdditionalDeliverableResponseDto"];
export type AdditionalDeliverableOperationResponseDto =
  components["schemas"]["AdditionalDeliverableOperationResponseDto"];
export type AdditionalDeliverablesPaginatedResponseDto =
  components["schemas"]["AdditionalDeliverablesPaginatedResponseDto"];
export type AdditionalDeliverableActualDatesResponseDto =
  components["schemas"]["AdditionalDeliverableActualDatesResponseDto"];

// ===== TIPOS DETALLADOS PARA FORMULARIOS =====

// Tipo detallado para formularios (basado en AdditionalDeliverableResponseDto)
export type AdditionalDeliverableDetailedResponseDto = AdditionalDeliverableResponseDto & {
  // Campos adicionales que podrían necesitarse en formularios
  projectId?: string;
  milestoneId?: string;
  phaseId?: string;
};
