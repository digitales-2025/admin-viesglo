import { components } from "@/lib/api/types/api";

// Tipos de documentos de entregables
export type DeliverableDocumentDto = components["schemas"]["DeliverableDocumentsResponseDto"]["documents"][0];
export type DocumentOperationResponseDto = components["schemas"]["DocumentOperationResponseDto"];
export type DeliverableDocumentsResponseDto = components["schemas"]["DeliverableDocumentsResponseDto"];

// Tipo para el formulario de documentos (solo campos que el usuario puede editar)
export interface DeliverableDocumentFormData {
  fileName: string;
  fileUrl: string;
  fileSize?: number; // Opcional - se usará valor por defecto si no se proporciona
  // uploadedBy y uploadedAt se obtienen automáticamente del usuario autenticado
}
