"use client";

import { useState } from "react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { useUploadAptitudeCertificate, useUploadMedicalReport } from "../_hooks/useMedicalRecords";

interface MedicalRecordDialogsProps {
  medicalRecordId: string;
  isOpen: boolean;
  onClose: () => void;
  type: "aptitude-certificate" | "medical-report";
}

export default function MedicalRecordDialogs({ medicalRecordId, isOpen, onClose, type }: MedicalRecordDialogsProps) {
  const [file, setFile] = useState<File | null>(null);
  const uploadAptitudeCertificate = useUploadAptitudeCertificate();
  const uploadMedicalReport = useUploadMedicalReport();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    if (type === "aptitude-certificate") {
      await uploadAptitudeCertificate.mutateAsync({ id: medicalRecordId, file });
    } else {
      await uploadMedicalReport.mutateAsync({ id: medicalRecordId, file });
    }

    setFile(null);
    onClose();
  };

  const title = type === "aptitude-certificate" ? "Subir Certificado de Aptitud Médica" : "Subir Informe Médico";
  const description =
    type === "aptitude-certificate"
      ? "Sube o reemplaza el certificado de aptitud médica"
      : "Sube o reemplaza el informe médico";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">{description}</p>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="file" className="text-sm font-medium">
                Archivo (PDF)
              </label>
              <input
                id="file"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
            >
              Cancelar
            </button>
            <button
              onClick={handleUpload}
              disabled={!file}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Subir
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
