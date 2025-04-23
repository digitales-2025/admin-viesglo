"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

import { DataTable } from "@/shared/components/data-table/DataTable";
import { useClinics } from "../../../(admin)/clinics/_hooks/useClinics";
import { columnsMedicalRecord } from "../../../(admin)/medical-records/_components/medical-record.column";
import {
  useDownloadAptitudeCertificate,
  useDownloadMedicalReport,
  useMedicalRecords,
} from "../../../(admin)/medical-records/_hooks/useMedicalRecords";
import RegisterTableActions from "./RegisterTableActions";

export default function RegistersTable() {
  const router = useRouter();
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
  const columns = useMemo(() => {
    const baseColumns = columnsMedicalRecord({
      clinics: clinics || [],
      router,
      downloadCertificate,
      downloadReport,
      isDownloadingCertificate,
      isDownloadingReport,
    });

    // Reemplazamos la última columna (opciones) con nuestro componente personalizado
    const columnsWithoutOptions = baseColumns.filter((col) => col.id !== "options");

    return [
      ...columnsWithoutOptions,
      {
        id: "options",
        header: "",
        cell: ({ row }) => {
          const record = row.original;
          return <RegisterTableActions record={record} router={router} />;
        },
      },
    ];
  }, [clinics, router, downloadCertificate, downloadReport, isDownloadingCertificate, isDownloadingReport]);

  if (recordsError || clinicsError) return <div className="text-center py-4">Error al cargar registros médicos</div>;

  return (
    <DataTable
      columns={columns}
      data={medicalRecords || []}
      isLoading={isLoadingRecords || isLoadingClinics}
      // actions={
      // <Button variant="outline" size="sm" className="ml-auto h-8 lg:flex">
      //   <FileDown className="mr-2 h-4 w-4" /> Descargar
      // </Button>
      // }
    />
  );
}
