"use client";

import { useEffect, useMemo } from "react";

import { DataTable } from "@/shared/components/data-table/DataTable";
import { useClinics } from "../../../(admin)/clinics/_hooks/useClinics";
import {
  useDownloadAptitudeCertificate,
  useDownloadMedicalReport,
  useMedicalRecords,
} from "../../../(admin)/medical-records/_hooks/useMedicalRecords";
import { registersRecordColumns } from "./register.column";

export default function RegistersTable() {
  const { data: medicalRecords, isLoading: isLoadingRecords, error: recordsError } = useMedicalRecords();
  const { data: clinics, isLoading: isLoadingClinics, error: clinicsError } = useClinics();

  // Debug logging
  useEffect(() => {
    if (medicalRecords) {
      console.log("Medical Records Data (Clinic view):", medicalRecords);
    }
  }, [medicalRecords]);

  // Mover los hooks de descarga al componente principal
  const { mutateAsync: downloadCertificate, isPending: isDownloadingCertificate } = useDownloadAptitudeCertificate();
  const { mutateAsync: downloadReport, isPending: isDownloadingReport } = useDownloadMedicalReport();

  // Modificamos las columnas para usar nuestro componente RegisterTableActions
  const columns = useMemo(
    () =>
      registersRecordColumns({
        clinics: clinics || [],
        downloadCertificate,
        downloadReport,
        isDownloadingCertificate,
        isDownloadingReport,
      }),
    [clinics, downloadCertificate, downloadReport, isDownloadingCertificate, isDownloadingReport]
  );

  if (recordsError || clinicsError) return <div className="text-center py-4">Error al cargar registros médicos</div>;

  return <DataTable columns={columns} data={medicalRecords || []} isLoading={isLoadingRecords || isLoadingClinics} />;
}
