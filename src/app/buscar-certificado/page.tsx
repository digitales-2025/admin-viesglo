"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Download, FileTextIcon, GraduationCap, Link, Printer } from "lucide-react";

import {
  downloadCertificatePublic,
  generateShareUrl,
  getCertificateByCode,
} from "@/app/(admin)/certificates/_actions/certificates.actions";
import { CertificateResponse } from "@/app/(admin)/certificates/_types/certificates.types";
import LogoLarge from "@/shared/components/icons/LogoLarge";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";

export default function BuscarCertificadoPage() {
  const [codigo, setCodigo] = useState("");
  const [certificado, setCertificado] = useState<CertificateResponse | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Estados para la visualización del documento
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [fileInfo, setFileInfo] = useState<{
    contentType: string;
    filename: string;
  } | null>(null);

  const buscarCertificado = async () => {
    if (!codigo.trim()) {
      setError("Por favor ingrese un código de certificado");
      return;
    }

    setIsLoading(true);
    setError("");
    setCertificado(null);

    try {
      const result = await getCertificateByCode(codigo);

      if (!result.success || !result.data) {
        throw new Error(result.error || "Certificado no encontrado");
      }

      setCertificado(result.data);
      setIsLoading(false);

      // Una vez que tenemos el certificado, cargamos la evidencia
      if (result.data.id) {
        loadEvidence(result.data.id);
        generateShareLink(result.data.id);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error al buscar el certificado";
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  // Limpia los recursos cuando cambia el certificado
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setShareUrl(null);
      setIsCopied(false);
    };
  }, [certificado, previewUrl]);

  const loadEvidence = async (certificateId: string) => {
    setLoading(true);
    setError("");

    try {
      const response = await downloadCertificatePublic(certificateId);
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
      setError(error instanceof Error ? error.message : "Error desconocido");
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
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Error al copiar al portapapeles:", err);
      });
  };

  const isPDF = fileInfo?.contentType?.includes("pdf");
  const isImage = fileInfo?.contentType?.includes("image");

  return (
    <div className="min-h-screen py-10 px-4 relative">
      <img
        src="/assets/msm-certificados.webp"
        alt="MsM Certificados"
        className="absolute top-0 left-0 object-cover w-full h-full z-0"
      />
      <div className="absolute top-0 left-0 w-full h-full bg-black/50 z-10 backdrop-blur-xs"></div>
      <div className="w-full relative max-w-3xl mx-auto z-10">
        <Card className="border-none">
          <CardHeader className="text-center space-y-2  border-b">
            <div>
              <CardTitle className="text-2xl font-semibold">
                <div className="flex justify-center mb-4">
                  <LogoLarge className="h-10" />
                </div>
                Verificador de Certificados
              </CardTitle>
              <CardDescription className="">
                Ingrese el código de su certificado para verificar su autenticidad
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="flex gap-2">
              <Input
                className="border rounded-md"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && buscarCertificado()}
                placeholder="Ingrese el código del certificado (Ej: CERT123)"
              />
              <Button onClick={buscarCertificado} disabled={isLoading} className="bg-primary hover:bg-primary/80">
                {isLoading ? "Buscando..." : "Verificar"}
              </Button>
            </div>

            {/* Indicaciones para el usuario */}
            {!certificado && !error && (
              <div className="text-sm  p-4 rounded border">
                <p>Para verificar un certificado, ingrese el código que aparece en la parte superior del documento.</p>
              </div>
            )}

            {/* Mensaje de error */}
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No encontrado</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Información del certificado */}
            {certificado && (
              <div className="space-y-6">
                <Card>
                  <CardHeader className=" pb-4 border-b">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center text-xl">
                          <FileTextIcon className="mr-2 h-5 w-5 text-primary" />
                          Certificado {certificado.code || certificado.id}
                        </CardTitle>
                        <CardDescription className="mt-1 flex items-center">
                          <GraduationCap className="w-4 h-4 mr-2 shrink-0" />
                          {certificado.nameUser} {certificado.lastNameUser}
                        </CardDescription>
                        <div className="text-sm mt-1">
                          <p>Capacitación: {certificado.nameCapacitation}</p>
                          {certificado.dateEmision && (
                            <p>Fecha de emisión: {new Date(certificado.dateEmision).toLocaleDateString()}</p>
                          )}
                        </div>
                      </div>
                      <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                    </div>
                  </CardHeader>
                </Card>

                {/* Vista previa del documento */}
                <Card className="border border-primary/20 print:border-primary/10 relative p-0 overflow-hidden">
                  {loading ? (
                    <div className="w-full h-64 flex items-center justify-center">
                      <div className="h-10 w-10 animate-spin text-primary border-2 border-current border-t-transparent rounded-full"></div>
                      <span className="ml-2">Cargando certificado...</span>
                    </div>
                  ) : error ? (
                    <div className="w-full h-64 flex items-center justify-center text-destructive">
                      <p>{error}</p>
                    </div>
                  ) : previewUrl ? (
                    <>
                      <CardContent className="p-0 overflow-auto">
                        {isPDF ? (
                          <iframe
                            src={previewUrl}
                            className="w-full min-h-[600px] border-0"
                            title={fileInfo?.filename || "Documento PDF"}
                          />
                        ) : isImage ? (
                          <div className="flex items-center justify-center h-full bg-muted/20 p-2">
                            <img
                              src={previewUrl}
                              alt={fileInfo?.filename || "Imagen"}
                              className="max-w-full max-h-[400px] object-contain"
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

                        {shareUrl && (
                          <Button variant="outline" size="sm" onClick={() => copyToClipboard(shareUrl)}>
                            {isCopied ? (
                              <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                            ) : (
                              <Link className="h-4 w-4 mr-2" />
                            )}
                            Copiar enlace
                          </Button>
                        )}
                      </CardFooter>
                    </>
                  ) : (
                    <div className="w-full h-64 flex items-center justify-center flex-col gap-4 p-10">
                      <p>No hay certificado disponible o no se pudo cargar</p>
                      {certificado.id && (
                        <Button onClick={() => loadEvidence(certificado.id)} variant="outline">
                          Reintentar cargar
                        </Button>
                      )}
                    </div>
                  )}
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
