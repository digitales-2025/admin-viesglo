"use client";

import { useEffect, useState } from "react";
import { formatDate } from "date-fns";
import { Download, GraduationCap, Loader2, Printer, Share2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardFooter } from "@/shared/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { downloadCertificate } from "../_actions/certificates.actions";
import { CertificateResponse } from "../_types/certificates.types";

interface CertificateDialogViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow: CertificateResponse;
}

export default function CertificateDialogView({ open, onOpenChange, currentRow }: CertificateDialogViewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<{
    contentType: string;
    filename: string;
  } | null>(null);

  // Cargar la evidencia cuando el diálogo se abre
  useEffect(() => {
    if (open && currentRow?.id) {
      loadEvidence(currentRow.id);
    }

    // Limpiar recursos cuando el diálogo se cierra
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentRow]);

  const loadEvidence = async (certificateId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await downloadCertificate(certificateId);

      if (!response.success) {
        throw new Error(response.error || "Error al cargar certificado");
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
          filename: response.filename || "certificado",
        });
      }
    } catch (error) {
      console.error("Error al cargar certificado:", error);
      setError(error instanceof Error ? error.message : "Error desconocido");
      toast.error("Error al cargar el certificado");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (previewUrl && fileInfo) {
      const a = document.createElement("a");
      a.href = previewUrl;
      a.download = fileInfo.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handlePrint = () => {
    if (previewUrl) {
      const printWindow = window.open(previewUrl, "_blank");
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    }
  };

  const handleShare = async () => {
    if (previewUrl && fileInfo && typeof navigator.share === "function") {
      try {
        const response = await fetch(previewUrl);
        const blob = await response.blob();
        const file = new File([blob], fileInfo.filename, { type: fileInfo.contentType });

        await navigator.share({
          title: `Certificado - ${currentRow.nameUser} ${currentRow.lastNameUser}`,
          text: `Certificado de ${currentRow.nameCapacitation}`,
          files: [file],
        });
      } catch (error) {
        console.error("Error al compartir:", error);
        toast.error("No se pudo compartir el certificado");
      }
    } else {
      // Fallback para navegadores que no soportan Web Share API
      toast.error("Tu navegador no soporta la función de compartir");
    }
  };

  const isPDF = fileInfo?.contentType?.includes("pdf");
  const isImage = fileInfo?.contentType?.includes("image");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full md:max-w-7xl mx-auto h-auto max-h-[96vh] p-6">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-bold capitalize">
            Certificado: {currentRow?.nameCapacitation}
          </DialogTitle>
          <DialogDescription className="capitalize flex items-center">
            <GraduationCap className="w-4 h-4 mr-2 shrink-0" />
            {currentRow?.nameUser} {currentRow?.lastNameUser}
          </DialogDescription>
        </DialogHeader>

        <div className="h-full max-h-[80vh] overflow-hidden flex flex-col">
          <Card className="border-2 border-primary/20 print:border-primary/10 relative overflow-hidden flex-1">
            <div className="absolute top-0 right-0 w-40 h-40 -mt-8 -mr-8 bg-primary/5 rounded-full" />
            <div className="absolute bottom-0 left-0 w-40 h-40 -mb-8 -ml-8 bg-primary/5 rounded-full" />

            {loading ? (
              <div className="w-full h-64 flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <span className="ml-2">Cargando certificado...</span>
              </div>
            ) : error ? (
              <div className="w-full h-64 flex items-center justify-center text-destructive">
                <p>{error}</p>
              </div>
            ) : previewUrl ? (
              <>
                <CardContent className="p-4  overflow-auto">
                  {isPDF ? (
                    <iframe
                      src={previewUrl}
                      className="w-full h-full border-0"
                      title={fileInfo?.filename || "Documento PDF"}
                    />
                  ) : isImage ? (
                    <div className="flex items-center justify-center h-full bg-muted/20 p-2">
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
                  )}
                </CardContent>

                <CardFooter className="flex flex-wrap sm:flex-row justify-end gap-3 border-t pt-4 pb-4">
                  <Button variant="outline" size="sm" onClick={handlePrint}>
                    <Printer className="h-4 w-4 mr-2" />
                    Imprimir
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Descargar
                  </Button>
                  {typeof navigator.share === "function" && (
                    <Button variant="outline" size="sm" onClick={handleShare}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Compartir
                    </Button>
                  )}
                </CardFooter>
              </>
            ) : (
              <div className="w-full h-64 flex items-center justify-center flex-col gap-4 p-10">
                <p>No hay certificado disponible o no se pudo cargar</p>
                {currentRow?.id && (
                  <Button onClick={() => loadEvidence(currentRow.id)} variant="outline">
                    Reintentar cargar
                  </Button>
                )}
              </div>
            )}
          </Card>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            {currentRow.dateEmision && (
              <p>Este certificado fue emitido el {formatDate(new Date(currentRow.dateEmision), "dd/MM/yyyy")}.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
