"use client";

import { useMemo } from "react";

import AlertMessage from "@/shared/components/alerts/Alert";
import { DataTable } from "@/shared/components/data-table/DataTable";
import { useAvailableDiagnostics } from "../../medical-records/_hooks/useMedicalRecords";
import { columnsDiagnostics } from "./diagnostics.columns";

export default function DiagnosticsTable() {
  const { data: diagnostics, isLoading, error } = useAvailableDiagnostics();

  const columns = useMemo(() => columnsDiagnostics(), []);

  if (error)
    return <AlertMessage variant="destructive" title="Error al cargar diagnósticos" description={error.message} />;

  return <DataTable columns={columns} data={diagnostics || []} isLoading={isLoading} />;
}
