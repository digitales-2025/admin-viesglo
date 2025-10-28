import { FolderX } from "lucide-react";

interface EmptyProps {
  message?: string;
}
/**
 * Componente para mostrar un mensaje de "No hay datos" en el centro de la pantalla
 * @param message - Mensaje a mostrar
 * @returns Componente Empty
 */
export default function Empty({ message = "No hay datos" }: EmptyProps) {
  return (
    <div className="flex items-center justify-center h-full flex-col gap-2">
      <FolderX className="w-10 h-10 text-muted-foreground/30" strokeWidth={1} />
      <p className="text-sm text-muted-foreground/50">{message}</p>
    </div>
  );
}
