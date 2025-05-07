import { components } from "@/lib/api/types/api";

export type MedicalRecordResponse = components["schemas"]["MedicalRecordResponseDto"] & {
  details?: any;
};

// Usar el esquema de la API para los tipos
export type MedicalRecordCreate = components["schemas"]["CreateMedicalRecordDto"];

// Usar el esquema de la API para los tipos
export type MedicalRecordUpdate = components["schemas"]["UpdateMedicalRecordDto"];

export type MedicalRecordFileInfo = {
  status?: string;
  message?: string;
  fileInfo?: components["schemas"]["FileMetadataResponseDto"];
};

// Usar el esquema de la API para los detalles
export type UpdateMedicalRecordDetails = components["schemas"]["UpdateMedicalRecordDetailsDto"];

// Tipos para diagnósticos médicos
export type CreateDiagnostic = {
  diagnosticId?: string;
  diagnosticValueId?: string;
  values: string[];
  isReportIncluded?: boolean;
};

// Tipo para el request de múltiples diagnósticos
export type BulkDiagnosticsRequest = {
  diagnostics: CreateDiagnostic[];
};

// Tipo para filtrar registros médicos
export interface MedicalRecordsFilter {
  clientId?: string;
  clinicId?: string;
  search?: string;
  diagnosticName?: string[] | string;
  from?: Date;
  to?: Date;
  page?: number;
  limit?: number;
}

// Añadir tipo para metadatos de paginación
export interface PaginationMeta {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

// Tipo para la entidad Diagnóstico (basado en lo que probablemente devuelva el backend)
export interface DiagnosticEntity {
  id: string;
  code: string; // CIE-10 u otro código
  name: string; // Nombre del diagnóstico
  description?: string;
  dataType?: string; // Podría ser relevante para cómo se muestran los valores
  isActive?: boolean;
  isReportIncluded?: boolean;
  // Añade aquí otros campos que tu endpoint GET /diagnostics devuelva y necesites
}
