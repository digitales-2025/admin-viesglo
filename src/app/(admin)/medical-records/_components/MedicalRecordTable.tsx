"use client";

import { useMemo, useState } from "react";
import { FileDown } from "lucide-react";

import { DataTable } from "@/shared/components/data-table/DataTable";
import { Button } from "@/shared/components/ui/button";
import {
  useDownloadAptitudeCertificate,
  useDownloadMedicalReport,
  useMedicalRecords,
} from "../_hooks/useMedicalRecords";
import { MedicalRecordsFilter } from "../_types/medical-record.types";
import { useClinics } from "../../clinics/_hooks/useClinics";
import { columnsMedicalRecord } from "./medical-record.column";

export default function MedicalRecordTable() {
  // Estado para almacenar los filtros seleccionados
  const [filters] = useState<MedicalRecordsFilter>({});
  const { data: medicalRecords, isLoading: isLoadingRecords, error: recordsError } = useMedicalRecords(filters);
  const { data: clinics, error: clinicsError } = useClinics();

  // Hooks de descarga
  const { mutateAsync: downloadCertificate, isPending: isDownloadingCertificate } = useDownloadAptitudeCertificate();
  const { mutateAsync: downloadReport, isPending: isDownloadingReport } = useDownloadMedicalReport();

  const columns = useMemo(
    () =>
      columnsMedicalRecord({
        clinics: clinics || [],
        downloadCertificate,
        downloadReport,
        isDownloadingCertificate,
        isDownloadingReport,
      }),
    [clinics, downloadCertificate, downloadReport, isDownloadingCertificate, isDownloadingReport]
  );

  // Verificar solo si hay error en los registros médicos
  if (recordsError) {
    console.error("Error al cargar registros médicos:", recordsError);
    return <div className="text-center py-4">Error al cargar registros médicos</div>;
  }

  if (clinicsError) {
    console.warn("Error al cargar clínicas:", clinicsError);
  }

  return (
    <DataTable
      columns={columns}
      data={medicalRecords || []}
      isLoading={isLoadingRecords}
      actions={
        <div className="flex items-center gap-x-2">
          <Button variant="outline" size="sm" className="ml-auto h-8 lg:flex">
            <FileDown className="mr-2 h-4 w-4" /> Descargar
          </Button>
        </div>
      }
    />
  );
}
