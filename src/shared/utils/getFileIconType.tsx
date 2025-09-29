import { FileImage } from "lucide-react";

import { Doc, File, FileXls, Pdf } from "../components/icons/Files";

/**
 * Obtiene el icono de un archivo basado en su tipo
 * @param mimeType - El tipo de archivo (image, pdf, doc, xls, etc)
 * @returns El icono del archivo
 */
export function getFileIconType(mimeType: string) {
  switch (mimeType) {
    case "application/pdf":
      return <Pdf className="size-6" />;
    case "image/jpeg":
    case "image/png":
    case "image/jpg":
    case "image/gif":
    case "image/webp":
    case "image/svg+xml":
    case "image/tiff":
    case "image/bmp":
      return <FileImage className="size-6" />;
    case "application/msword":
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return <Doc className="size-6" />;
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
    case "application/vnd.ms-excel":
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
    case "text/csv":
      return <FileXls className="size-6" />;
    default:
      return <File className="size-6" />;
  }
}
