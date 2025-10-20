import { components } from "@/lib/api/types/api";

// ===== TIPOS DE DTOs DEL ADDITIONAL-DOCUMENTS CONTROLLER =====

// DTOs de Request (del project-request.dto.ts)
export type CreateAdditionalDocumentDto = components["schemas"]["CreateAdditionalDocumentDto"];
export type UpdateAdditionalDocumentDto = components["schemas"]["UpdateAdditionalDocumentDto"];

// DTOs de Response (del project-response.dto.ts)
export type AdditionalDocumentDto = components["schemas"]["AdditionalDocumentDto"];

// ===== TIPOS DETALLADOS PARA FORMULARIOS =====

// Tipo detallado para formularios (basado en AdditionalDocumentDto)
export type AdditionalDocumentDetailedDto = AdditionalDocumentDto & {
  // Campos adicionales que podrían necesitarse en formularios
  projectId?: string;
  milestoneId?: string;
  phaseId?: string;
  additionalDeliverableId?: string;
};
