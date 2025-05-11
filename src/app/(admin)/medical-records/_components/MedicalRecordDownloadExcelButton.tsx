"use client";

import { useState } from "react";

import { FileXls } from "@/shared/components/icons/Files";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { downloadMedicalRecordExcel } from "../_actions/medical-record.action";
import { MedicalRecordsFilter } from "../_types/medical-record.types";

interface DownloadExcelButtonProps {
  filters: MedicalRecordsFilter;
}

export function MedicalRecordDownloadExcelButton({ filters }: DownloadExcelButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    try {
      setIsLoading(true);
      const blob = await downloadMedicalRecordExcel(filters);

      if (!blob) {
        console.error("No se pudo obtener el archivo Excel");
        return;
      }

      // Crear un URL para el blob
      const url = window.URL.createObjectURL(blob);

      // Crear un enlace temporal
      const link = document.createElement("a");
      link.href = url;
      const date = new Date();
      link.setAttribute("download", `medical-records-${date.toLocaleDateString()}.xlsx`);

      // Simular clic en el enlace
      document.body.appendChild(link);
      link.click();

      // Limpiar
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al descargar registros médicos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button variant="outline" size="sm" className="ml-auto h-8 lg:flex" onClick={handleDownload} disabled={isLoading}>
      {isLoading ? <Spinner size="sm" className="mr-2" /> : <FileXls className="mr-2 h-4 w-4 text-emerald-600" />}
      {isLoading ? "Descargando..." : "Descargar Excel"}
    </Button>
  );
}
