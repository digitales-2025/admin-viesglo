import { components } from "@/lib/api/types/api";

// ===== TIPOS DE DTOs DEL PROJECTS CONTROLLER =====

// DTOs de Request (del project-request.dto.ts)
export type CreateProjectRequestDto = components["schemas"]["CreateProjectRequestDto"];
export type UpdateProjectRequestDto = components["schemas"]["UpdateProjectRequestDto"];
export type UpdateProjectStatusRequestDto = components["schemas"]["UpdateProjectStatusRequestDto"];

// DTOs de Filtros (del project-paginated-filter.dto.ts)
// TODO: Actualizar cuando se regenere el api.ts desde el backend
export type ProjectPaginatedFilterDto = {
  page?: number;
  pageSize?: number;
  search?: string;
  sortField?: "name" | "lastName" | "email" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
  clientId?: string;
  projectGroupId?: string;
  status?: string[];
  projectType?: string[];
};

// DTOs de Response (del project-response.dto.ts)
export type ProjectResponseDto = components["schemas"]["ProjectResponseDto"];
export type ProjectDetailedResponseDto = components["schemas"]["ProjectDetailedResponseDto"];
export type MilestoneDetailedResponseDto = components["schemas"]["MilestoneDetailedResponseDto"];
export type PhaseDetailedResponseDto = components["schemas"]["PhaseDetailedResponseDto"];
export type DeliverableDetailedResponseDto = components["schemas"]["DeliverableDetailedResponseDto"];
export type ProjectOperationResponseDto = components["schemas"]["ProjectOperationResponseDto"];
export type ProjectPaginatedResponseDto = components["schemas"]["ProjectPaginatedResponseDto"];

// DTOs para campos del proyecto (del project-detailed-response.dto.ts)
export type ProjectRequiredFieldsResponseDto = components["schemas"]["ProjectRequiredFieldsResponseDto"];
export type ProjectOptionalFieldsResponseDto = components["schemas"]["ProjectOptionalFieldsResponseDto"];

export interface SelectedProjectData {
  milestoneTemplateId: string;
  selectedPhases: {
    phaseTemplateId: string;
    selectedDeliverables: string[];
  }[];
}
