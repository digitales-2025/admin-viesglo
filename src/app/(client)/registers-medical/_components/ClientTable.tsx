"use client";

import { useMemo } from "react";
import { DownloadCloud } from "lucide-react";

import { useMedicalRecords } from "@/app/(admin)/medical-records/_hooks/useMedicalRecords";
import AlertMessage from "@/shared/components/alerts/Alert";
import { DataTable } from "@/shared/components/data-table/DataTable";
import { Button } from "@/shared/components/ui/button";
import { DatePickerWithRange } from "@/shared/components/ui/date-range-picker";
import { columnsMedicalRecord } from "./client-medical-record.column";

export default function ClientTable() {
  const { data: medicalRecord, isLoading, error } = useMedicalRecords();
  const columns = useMemo(() => columnsMedicalRecord(), []);

  if (error) {
    return <AlertMessage title="ERROR" description="Error al obtener los registros médicos." variant="destructive" />;
  }

  return (
    <DataTable
      columns={columns}
      data={medicalRecord || []}
      isLoading={isLoading}
      actions={
        <>
          <DatePickerWithRange />
          <Button variant="outline" size="sm" className="ml-auto h-8 lg:flex">
            <DownloadCloud className="mr-2 size-4" />
            Descargar
          </Button>
        </>
      }
    />
  );
}
