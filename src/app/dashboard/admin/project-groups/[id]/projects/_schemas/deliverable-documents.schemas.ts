import { z } from "zod";

export const deliverableDocumentSchema = z.object({
  // Campos básicos del documento
  fileName: z
    .string()
    .min(1, "El nombre del archivo es requerido")
    .max(255, "El nombre del archivo no puede exceder 255 caracteres"),

  fileUrl: z.string().url("Debe ser una URL válida").min(1, "La URL del archivo es requerida"),

  // fileSize es opcional - se puede omitir y se usará valor por defecto (0)
  fileSize: z
    .number()
    .min(0, "El tamaño del archivo no puede ser menor a 0")
    .max(1000, "El tamaño del archivo no puede exceder 1000 MB")
    .optional(),

  // uploadedBy y uploadedAt se obtienen automáticamente del usuario autenticado
  // No se incluyen en el schema del formulario
});

export type DeliverableDocumentForm = z.infer<typeof deliverableDocumentSchema>;
