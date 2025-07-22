"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { DataTable } from "@/shared/components/data-table/data-table";
import {
  useDownloadAptitudeCertificate,
  useDownloadMedicalReport,
  useMedicalRecords,
} from "../_hooks/useMedicalRecords";
import { MedicalRecordResponse } from "../_types/medical-record.types";
import { useClinics } from "../../clinics/_hooks/useClinics";
import { columnsMedicalRecord } from "./medical-record.column";

export default function MedicalRecordTable() {
  const router = useRouter();

  const handleRowClick = (row: MedicalRecordResponse) => {
    router.push(`/dashboard/admin/medical-records/${row.id}/details`);
  };

  const { data: medicalRecordsData, isLoading: isLoadingRecords, error: recordsError } = useMedicalRecords();

  const medicalRecords = medicalRecordsData || [];

  const { data: clinics, error: clinicsError } = useClinics();

  const { mutateAsync: downloadCertificate, isPending: isDownloadingCertificate } = useDownloadAptitudeCertificate();
  const { mutateAsync: downloadReport, isPending: isDownloadingReport } = useDownloadMedicalReport();

  const columns = useMemo(
    () =>
      columnsMedicalRecord({
        downloadCertificate,
        downloadReport,
        isDownloadingCertificate,
        isDownloadingReport,
      }),
    [clinics, downloadCertificate, downloadReport, isDownloadingCertificate, isDownloadingReport]
  );

  if (recordsError) {
    console.error("Error al cargar registros médicos:", recordsError);
    return <div className="text-center py-4">Error al cargar registros médicos</div>;
  }

  if (clinicsError) {
    console.warn("Error al cargar clínicas (no bloqueante):", clinicsError);
  }

  return <DataTable columns={columns} data={medicalRecords} isLoading={isLoadingRecords} onClickRow={handleRowClick} />;
}
