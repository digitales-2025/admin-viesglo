"use client";

import { useEffect, useMemo } from "react";
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

  // Debug logging
  useEffect(() => {
    if (medicalRecords) {
      console.log("Medical Records Data:", medicalRecords);
      // Check if clinicId exists in the records
      const hasClinicId = medicalRecords.some((record) => record.clinicId);
      console.log("Records have clinicId:", hasClinicId);
      if (hasClinicId) {
        // Log a sample clinicId
        const sampleRecord = medicalRecords.find((record) => record.clinicId);
        console.log("Sample clinicId:", sampleRecord?.clinicId);
      }
    }

    if (clinics) {
      console.log("Available Clinics:", clinics);
    }
  }, [medicalRecords, clinics]);

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

  if (recordsError || clinicsError) return <div className="text-center py-4">Error al cargar registros médicos</div>;

  return (
    <DataTable
      columns={columns}
      data={medicalRecords || []}
      isLoading={isLoadingRecords || isLoadingClinics}
      actions={
        <Button variant="outline" size="sm" className="ml-auto h-8 lg:flex">
          <FileDown className="mr-2 h-4 w-4" /> Descargar
        </Button>
      }
    />
  );
}
