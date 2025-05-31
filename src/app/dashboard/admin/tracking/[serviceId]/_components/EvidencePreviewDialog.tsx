"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/shared/components/ui/dialog";
import { downloadEvidence } from "../../_actions/activities-project.actions";
import { ProjectActivityResponse } from "../../_types/tracking.types";

interface EvidencePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity: ProjectActivityResponse | null;
}

export default function EvidencePreviewDialog({ activity, open, onOpenChange }: EvidencePreviewDialogProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<{
    contentType: string;
    filename: string;
  } | null>(null);

  // Cargar la evidencia cuando el diálogo se abre
  useEffect(() => {
    if (open && activity?.id) {
      loadEvidence(activity.id);
    }

    // Limpiar recursos cuando el diálogo se cierra
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    };
  }, [open, activity]);

  const loadEvidence = async (activityId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await downloadEvidence(activityId);

      if (!response.success) {
        throw new Error(response.error || "Error al cargar evidencia");
      }

      if (response.downloadUrl) {
        // Obtener el archivo
        const downloadResponse = await fetch(response.downloadUrl, {
          method: "GET",
          credentials: "include",
        });

        if (!downloadResponse.ok) {
          throw new Error("No se pudo obtener el archivo");
        }

        // Convertir a blob y crear URL
        const blob = await downloadResponse.blob();
        const url = URL.createObjectURL(blob);

        // Guardar información del archivo
        setPreviewUrl(url);
        setFileInfo({
          contentType: response.contentType || blob.type,
          filename: response.filename || "evidencia",
        });
      }
    } catch (error) {
      console.error("Error al cargar evidencia:", error);
      setError(error instanceof Error ? error.message : "Error desconocido");
      toast.error("Error al cargar la evidencia");
    } finally {
      setLoading(false);
    }
  };

  const isPDF = fileInfo?.contentType?.includes("pdf");
  const isImage = fileInfo?.contentType?.includes("image");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[95vw] sm:max-h-[95vh] flex flex-col p-0 overflow-hidden gap-0">
        <DialogTitle className="p-5 pb-0">
          <div className="flex justify-between items-center border-b pb-2 mb-2">
            <h2 className="text-lg font-semibold">
              {activity?.evidence?.originalName || "Previsualización de evidencia"}
              <span className="text-xs text-muted-foreground ml-2">Actividad: {activity?.name || "Desconocida"}</span>
            </h2>
          </div>
        </DialogTitle>

        <div className="flex-1 min-h-[85vh] h-full overflow-auto justify-center items-center">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <span className="ml-2">Cargando evidencia...</span>
            </div>
          ) : error ? (
            <div className="w-full h-full flex items-center justify-center text-destructive">
              <p>{error}</p>
            </div>
          ) : previewUrl ? (
            isPDF ? (
              <iframe
                src={previewUrl}
                className="w-full h-[85vh] border-0"
                title={fileInfo?.filename || "Documento PDF"}
              />
            ) : isImage ? (
              <div className="flex items-center justify-center h-[75vh] bg-muted/20 p-4">
                <img
                  src={previewUrl}
                  alt={fileInfo?.filename || "Imagen"}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center p-10">
                <p>Este tipo de archivo no se puede previsualizar. Utilice el botón de descarga.</p>
              </div>
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center flex-col gap-4 p-10">
              <p>No hay evidencia disponible o no se pudo cargar</p>
              {activity?.id && (
                <Button onClick={() => loadEvidence(activity.id)} variant="outline">
                  Reintentar cargar
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
