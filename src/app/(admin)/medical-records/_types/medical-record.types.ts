import { components } from "@/lib/api/types/api";

export type MedicalRecordResponse = components["schemas"]["MedicalRecordResponseDto"] & {
  customData?: string | Record<string, any>;
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

// Usar el esquema de la API para los campos de secciones personalizadas
export type CustomSectionField = components["schemas"]["CustomSectionFieldDto"];

// Usar el esquema de la API para las secciones personalizadas
export type CustomSection = components["schemas"]["CustomSectionDto"];

export type UpdateCustomSections = {
  customSections?: CustomSection[];
};
