"use client";

import { useMemo, useState } from "react";
import { DownloadCloud } from "lucide-react";

import { DataTable } from "@/shared/components/data-table/DataTable";
import { Button } from "@/shared/components/ui/button";
import { useQuotations } from "../_hooks/useQuotations";
import { QuotationFilters } from "../_types/quotation.types";
import { columnsQuotation } from "./quotation.column";

export default function QuotationTable() {
  const [filters, setFilters] = useState<QuotationFilters>({
    page: 1,
    limit: 10,
  });

  const { data, isLoading, error } = useQuotations(filters);
  const quotations = data?.data || [];
  const meta = data?.meta;

  const columns = useMemo(() => columnsQuotation(), []);

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handlePageSizeChange = (limit: number) => {
    setFilters((prev) => ({ ...prev, page: 1, limit }));
  };

  if (error) return <div className="text-center py-4">Error al cargar cotizaciones</div>;

  return (
    <DataTable
      columns={columns}
      data={quotations}
      isLoading={isLoading}
      actions={
        <Button variant="outline" size="sm" className="ml-auto h-8 lg:flex">
          <DownloadCloud className="mr-2 h-4 w-4" /> Descargar
        </Button>
      }
      serverPagination={
        meta
          ? {
              currentPage: meta.currentPage,
              totalPages: meta.totalPages,
              pageSize: meta.itemsPerPage,
              totalItems: meta.totalItems,
              onPageChange: handlePageChange,
              onPageSizeChange: handlePageSizeChange,
            }
          : undefined
      }
    />
  );
}
