"use client";

import { useMemo } from "react";

import { DataTable } from "@/shared/components/data-table/DataTable";
import { useCertificates } from "../_hooks/useCertificates";
import { columnsCertificates } from "./certificates.column";

export default function CertificatesDataTable() {
  const { data: certificates, isLoading, error } = useCertificates();
  const columns = useMemo(() => columnsCertificates(), []);

  if (isLoading) return <div className="text-center py-4">Cargando certificados...</div>;

  if (error) return <div className="text-center py-4">Error al cargar certificados {error.message}</div>;

  return <DataTable columns={columns} data={certificates ?? []} />;
}
