"use client";

import { useMemo, useState } from "react";

import { DataTable } from "@/shared/components/data-table/DataTable";
import {
  useDownloadAptitudeCertificate,
  useDownloadMedicalReport,
  useMedicalRecords,
} from "../../../admin/medical-records/_hooks/useMedicalRecords";
import { MedicalRecordsFilter } from "../../../admin/medical-records/_types/medical-record.types";
import { registersRecordColumns } from "./register.column";

export default function RegistersTable() {
  // Estado para almacenar los filtros seleccionados
  const [filters] = useState<MedicalRecordsFilter>({});
  const { data: medicalRecords, isLoading: isLoadingRecords, error: recordsError } = useMedicalRecords(filters);

  // Mover los hooks de descarga al componente principal
  const { mutateAsync: downloadCertificate, isPending: isDownloadingCertificate } = useDownloadAptitudeCertificate();
  const { mutateAsync: downloadReport, isPending: isDownloadingReport } = useDownloadMedicalReport();

  // Modificamos las columnas para usar nuestro componente RegisterTableActions
  const columns = useMemo(
    () =>
      registersRecordColumns({
        downloadCertificate,
        downloadReport,
        isDownloadingCertificate,
        isDownloadingReport,
      }),
    [downloadCertificate, downloadReport, isDownloadingCertificate, isDownloadingReport]
  );

  if (recordsError) return <div className="text-center py-4">Error al cargar registros médicos</div>;

  return <DataTable columns={columns} data={medicalRecords || []} isLoading={isLoadingRecords} />;
}
