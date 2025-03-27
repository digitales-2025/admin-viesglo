import { formatDate } from "date-fns";
import { Calendar, Download, Printer, Share2 } from "lucide-react";

import LogoLarge from "@/shared/components/icons/LogoLarge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/shared/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { CertificateResponse } from "../_types/certificates.types";

interface CertificateDialogViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow: CertificateResponse;
}

export default function CertificateDialogView({ open, onOpenChange, currentRow }: CertificateDialogViewProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:max-w-4xl">
        <DialogHeader>
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="w-full max-w-4xl">
          <Card className="border-4 border-primary/20 print:border-primary/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 -mt-8 -mr-8 bg-primary/5 rounded-full" />
            <div className="absolute bottom-0 left-0 w-40 h-40 -mb-8 -ml-8 bg-primary/5 rounded-full" />

            <CardHeader className="text-center border-b pb-6 relative z-10">
              <div className="flex justify-center mb-4">
                <LogoLarge className="h-12" />
              </div>
              <h1 className="text-3xl font-bold text-primary mb-1">Certificado</h1>
              <p className="text-xl text-muted-foreground">{currentRow.code}</p>
            </CardHeader>

            <CardContent className="pt-8 pb-6 relative z-10">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-medium mb-1">Se certifica que</h2>
                <p className="text-3xl font-bold text-primary uppercase mb-1">
                  {currentRow.nameUser} {currentRow.lastNameUser}
                </p>
                <h3 className="text-xl">ha completado exitosamente</h3>
                <p className="text-2xl font-bold mt-2 mb-4">{currentRow.nameCapacitation}</p>

                <div className="flex justify-center gap-4 text-muted-foreground mb-6">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {currentRow.dateEmision && <span>Emitido: {formatDate(currentRow.dateEmision, "dd/MM/yyyy")}</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {currentRow.dateExpiration && (
                      <span>Válido hasta: {formatDate(currentRow.dateExpiration, "dd/MM/yyyy")}</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 border-t pt-6 relative z-10">
              {/*<div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => setShowQR(!showQR)}
                >
                  <CheckCircle className="h-4 w-4" />
                  Verificar
                </Button>
                {showQR && (
                  <div className="absolute bottom-20 left-0 bg-background p-4 rounded-md shadow-md border">
                    <img src="/placeholder.svg?height=120&width=120" alt="QR Code" className="h-30 w-30" />
                    <p className="text-xs text-center mt-2">Escanea para verificar</p>
                    <p className="text-xs text-center text-muted-foreground break-all">{certificate.verificationUrl}</p>
                  </div>
                )}
              </div>*/}

              <div className="flex gap-2 justify-end w-full">
                <Button variant="outline" size="sm">
                  <Printer className="h-4 w-4 mr-1" />
                  Imprimir
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Descargar
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-1" />
                  Compartir
                </Button>
              </div>
            </CardFooter>
          </Card>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {currentRow.dateEmision && (
              <p>
                Este certificado fue emitido por Ms &M Consulting el {formatDate(currentRow.dateEmision, "dd/MM/yyyy")}.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
