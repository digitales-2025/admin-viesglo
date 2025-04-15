"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { FileDown } from "lucide-react";

import { DataTable } from "@/shared/components/data-table/DataTable";
import { Button } from "@/shared/components/ui/button";
import {
  useDownloadAptitudeCertificate,
  useDownloadMedicalReport,
  useMedicalRecords,
} from "../_hooks/useMedicalRecords";
import { useClinics } from "../../clinics/_hooks/useClinics";
import { columnsMedicalRecord } from "./medical-record.column";

export default function MedicalRecordTable() {
  const router = useRouter();
  const { data: medicalRecords, isLoading: isLoadingRecords, error: recordsError } = useMedicalRecords();
  const { data: clinics, isLoading: isLoadingClinics, error: clinicsError } = useClinics();

  // Mover los hooks de descarga al componente principal
  const { mutateAsync: downloadCertificate, isPending: isDownloadingCertificate } = useDownloadAptitudeCertificate();
  const { mutateAsync: downloadReport, isPending: isDownloadingReport } = useDownloadMedicalReport();

  const columns = useMemo(
    () =>
      columnsMedicalRecord({
        clinics: clinics || [],
        router,
        downloadCertificate,
        downloadReport,
        isDownloadingCertificate,
        isDownloadingReport,
      }),
    [clinics, router, downloadCertificate, downloadReport, isDownloadingCertificate, isDownloadingReport]
  );

  if (isLoadingRecords || isLoadingClinics)
    return <div className="text-center py-4">Cargando registros médicos...</div>;

  if (recordsError || clinicsError) return <div className="text-center py-4">Error al cargar registros médicos</div>;

  return (
    <DataTable
      columns={columns}
      data={medicalRecords || []}
      actions={
        <Button variant="outline" size="sm" className="ml-auto h-8 lg:flex">
          <FileDown className="mr-2 h-4 w-4" /> Descargar
        </Button>
      }
    />
  );
}
