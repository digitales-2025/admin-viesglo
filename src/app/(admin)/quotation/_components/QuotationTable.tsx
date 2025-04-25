"use client";

import { useMemo } from "react";
import { DownloadCloud } from "lucide-react";

import { DataTable } from "@/shared/components/data-table/DataTable";
import { Button } from "@/shared/components/ui/button";
import { useQuotations } from "../_hooks/useQuotations";
import { columnsQuotation } from "./quotation.column";

export default function QuotationTable() {
  const { data: quotations, isLoading, error } = useQuotations();

  const columns = useMemo(() => columnsQuotation(), []);

  if (error) return <div className="text-center py-4">Error al cargar cotizaciones</div>;

  return (
    <DataTable
      columns={columns}
      data={quotations || []}
      isLoading={isLoading}
      actions={
        <Button variant="outline" size="sm" className="ml-auto h-8 lg:flex">
          <DownloadCloud className="mr-2 h-4 w-4" /> Descargar
        </Button>
      }
    />
  );
}
