export type MedicalRecordResponse = any & {
  details?: any;
};

// Usar el esquema de la API para los tipos
export type MedicalRecordCreate = any;

// Usar el esquema de la API para los tipos
export type MedicalRecordUpdate = any;

export type MedicalRecordFileInfo = {
  status?: string;
  message?: string;
  fileInfo?: any;
};

// Usar el esquema de la API para los detalles
export type UpdateMedicalRecordDetails = any;

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

// Tipo para el request de eliminar diagnóstico
export type DeleteDiagnosticRequest = {
  diagnosticId: string;
};

// Tipo para la creación de un diagnóstico a nivel de sistema
export type SystemCreateDiagnosticRequest = {
  name: string; // Nombre del diagnóstico
  description?: string; // Descripción opcional
  dataType: string; // Tipo de dato (ej. JSON, TEXT) -> Siempre JSON desde el front en creación
  isDefaultIncluded?: boolean; // Si se incluye por defecto en la creación de medical record
};

// Tipo para la actualización de un diagnóstico a nivel de sistema
export type SystemUpdateDiagnosticRequest = {
  name?: string; // Solo nombre actualizable
  description?: string; // Solo descripción actualizable
  isDefaultIncluded?: boolean; // Para permitir actualizar si se incluye por defecto
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
  aptitude?: string;
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
  isDefaultIncluded?: boolean;
  // Añade aquí otros campos que tu endpoint GET /diagnostics devuelva y necesites
}
