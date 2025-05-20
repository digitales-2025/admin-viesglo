"use client";

import { useEffect, useState } from "react";
import { formatDate } from "date-fns";
import { Check, Download, GraduationCap, Link, Loader2, Printer, SquareUserRound } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardFooter } from "@/shared/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { downloadCertificate, generateShareUrl } from "../_actions/certificates.actions";
import { CertificateResponse, DocumentTypeLabel } from "../_types/certificates.types";

interface CertificateDialogViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow: CertificateResponse;
}

export default function CertificateDialogView({ open, onOpenChange, currentRow }: CertificateDialogViewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [fileInfo, setFileInfo] = useState<{
    contentType: string;
    filename: string;
  } | null>(null);

  // Cargar la evidencia cuando el diálogo se abre
  useEffect(() => {
    if (open && currentRow?.id) {
      loadEvidence(currentRow.id);
      generateShareLink(currentRow.id);
    }

    // Limpiar recursos cuando el diálogo se cierra
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setShareUrl(null);
      setIsCopied(false);
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

  const generateShareLink = async (certificateId: string) => {
    try {
      // Llama al endpoint para regenerar la URL o obtener el certificado actual
      const result = await generateShareUrl(certificateId);

      if (result.success && result.data) {
        // Si el certificado tiene un archivo con URL, usar esa URL para compartir
        if (result.data.fileCertificate?.url) {
          setShareUrl(result.data.fileCertificate.url);
        } else if (result.data.urlCertificate) {
          // Si hay una URL específica para el certificado, usarla
          setShareUrl(result.data.urlCertificate);
        } else {
          // Si no hay URL específica, crear una URL local
          fallbackToLocalUrl(certificateId);
        }
      } else {
        fallbackToLocalUrl(certificateId);
      }
    } catch (error) {
      console.error("Error al generar enlace compartible:", error);
      fallbackToLocalUrl(certificateId);
    }
  };

  // Función auxiliar para generar URL local como fallback
  const fallbackToLocalUrl = (id: string) => {
    const baseUrl = window.location.origin;
    setShareUrl(`${baseUrl}/certificates/view/${id}`);
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setIsCopied(true);
        toast.success("Enlace copiado al portapapeles");
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(() => {
        toast.error("No se pudo copiar el enlace");
      });
  };

  const isPDF = fileInfo?.contentType?.includes("pdf");
  const isImage = fileInfo?.contentType?.includes("image");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full md:max-w-7xl mx-auto h-[98vh] p-2">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-xl font-bold capitalize">
            Certificado: {currentRow?.nameCapacitation}
          </DialogTitle>
          <DialogDescription className="capitalize flex items-start flex-col gap-2">
            <span className="inline-flex gap-2 items-center">
              <GraduationCap className="w-4 h-4 mr-2 shrink-0" />
              {currentRow?.nameUser} {currentRow?.lastNameUser}
            </span>
            <span className="inline-flex gap-2 items-center">
              <SquareUserRound className="w-4 h-4 mr-2 shrink-0" />
              {DocumentTypeLabel[currentRow?.documentType as keyof typeof DocumentTypeLabel]}
              <span className="font-semibold">{currentRow?.documentNumber}</span>
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="h-[82vh] overflow-hidden flex flex-col">
          <Card className="border-primary/20 print:border-primary/10 relative overflow-hidden flex-1 p-1">
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
              <div className="flex flex-col h-full">
                <CardContent className="p-0 overflow-hidden flex-1">
                  {isPDF ? (
                    <iframe
                      src={previewUrl}
                      className="w-full h-full border-0 rounded-lg"
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
                <CardFooter className="flex flex-wrap sm:flex-row justify-end gap-3 border-t py-2">
                  <Button variant="outline" size="sm" onClick={handlePrint}>
                    <Printer className="h-4 w-4 mr-2" />
                    Imprimir
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Descargar
                  </Button>

                  {shareUrl && (
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(shareUrl)}>
                      {isCopied ? <Check className="h-4 w-4 mr-2 text-green-500" /> : <Link className="h-4 w-4 mr-2" />}
                      Copiar enlace
                    </Button>
                  )}
                </CardFooter>
              </div>
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
          <div className="mt-1 text-center text-xs text-muted-foreground">
            {currentRow.dateEmision && (
              <p>Este certificado fue emitido el {formatDate(new Date(currentRow.dateEmision), "dd/MM/yyyy")}.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
