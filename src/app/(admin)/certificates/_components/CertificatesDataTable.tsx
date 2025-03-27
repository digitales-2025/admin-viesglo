"use client";

import { useEffect, useMemo, useState } from "react";

import { DataTable } from "@/shared/components/data-table/DataTable";
import { useCertificateFilterStore } from "../_hooks/useCertificateFilterStore";
import { useCertificates, useGetCertificatesByDateRange } from "../_hooks/useCertificates";
import { CertificateResponse } from "../_types/certificates.types";
import { columnsCertificates } from "./certificates.column";
import CertificatesTableOptions from "./CertificatesTableOptions";

export default function CertificatesDataTable() {
  const { dateRange } = useCertificateFilterStore();
  const { data: allCertificates, isLoading: isLoadingAll, error: errorAll } = useCertificates();
  const {
    data: filteredCertificates,
    isLoading: isLoadingFiltered,
    error: errorFiltered,
    isSuccess: isFilterSuccess,
  } = useGetCertificatesByDateRange(dateRange?.from, dateRange?.to);

  const columns = useMemo(() => columnsCertificates(), []);

  const [certificates, setCertificates] = useState<CertificateResponse[]>([]);
  const isLoading = isLoadingAll || isLoadingFiltered;
  const error = errorFiltered || errorAll;

  // Actualizar los certificados mostrados según el filtro
  useEffect(() => {
    if (dateRange?.from && dateRange?.to && isFilterSuccess) {
      setCertificates(filteredCertificates ?? []);
    } else if (allCertificates) {
      setCertificates(allCertificates);
    }
  }, [allCertificates, filteredCertificates, dateRange, isFilterSuccess]);

  if (isLoading) return <div className="text-center py-4">Cargando certificados...</div>;

  if (error) return <div className="text-center py-4">Error al cargar certificados {error.message}</div>;

  return (
    <div className="space-y-4">
      <DataTable columns={columns} data={certificates} actions={<CertificatesTableOptions />} />
    </div>
  );
}
