"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useProfile } from "@/app/(public)/auth/sign-in/_hooks/use-auth";
import AlertMessage from "@/shared/components/alerts/Alert";
import { DataTable } from "@/shared/components/data-table/data-table";
import { debounce } from "@/shared/lib/utils";
import { useCertificatesStore } from "../_hooks/useCertificateFilterStore";
import { useCertificatesPaginated } from "../_hooks/useCertificates";
import { columnsCertificates } from "./certificates.column";

export default function CertificatesDataTable() {
  const user = useProfile();
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });

  const { filters: storeFilters, updateFilter } = useCertificatesStore();
  const filters = useMemo(
    () => ({
      ...storeFilters,
      ...pagination,
    }),
    [storeFilters, pagination]
  );

  const debouncedSearch = useMemo(() => {
    return debounce((searchTem: string) => {
      updateFilter("search", searchTem);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 400);
  }, [updateFilter]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  });

  const { data, isLoading, error } = useCertificatesPaginated(filters);

  const certificates = data?.data || [];
  const meta = data?.meta;

  const columns = useMemo(() => columnsCertificates(), []);

  // Manejador para cambios en la página
  const handlePageChange = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  // Manejador para cambios en el tamaño de página
  const handlePageSizeChange = useCallback((limit: number) => {
    setPagination({ page: 1, limit });
  }, []);

  const serverPagination = useMemo(
    () =>
      meta
        ? {
            currentPage: meta.currentPage,
            totalPages: meta.totalPages,
            pageSize: meta.itemsPerPage,
            totalItems: meta.totalItems,
            onPageChange: handlePageChange,
            onPageSizeChange: handlePageSizeChange,
          }
        : undefined,
    [meta, handlePageChange, handlePageSizeChange]
  );

  if (error)
    return <AlertMessage variant="destructive" title="Certificados" description="Error al cargar los certificados" />;

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={certificates}
        isLoading={isLoading}
        serverPagination={serverPagination as any}
        initialColumnVisibility={{
          estado: user.isSuperAdmin,
          "fecha de caducidad": false,
        }}
      />
    </div>
  );
}
