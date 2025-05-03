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
  diagnosticId: string;
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
}
