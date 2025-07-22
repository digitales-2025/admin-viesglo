"use client";

import { useMemo } from "react";

import AlertMessage from "@/shared/components/alerts/Alert";
import { DataTable } from "@/shared/components/data-table/data-table";
import { useAllDiagnostics } from "../../medical-records/_hooks/useMedicalRecords";
import { columnsDiagnostics } from "./diagnostics.columns";

export default function DiagnosticsTable() {
  const { data: diagnostics, isLoading, error } = useAllDiagnostics();

  const columns = useMemo(() => columnsDiagnostics(), []);

  if (error)
    return <AlertMessage variant="destructive" title="Error al cargar diagnósticos" description={error.message} />;

  return <DataTable columns={columns} data={diagnostics || []} isLoading={isLoading} />;
}
