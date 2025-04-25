"use client";

import { useMemo } from "react";
import { DownloadCloud } from "lucide-react";

import { DataTable } from "@/shared/components/data-table/DataTable";
import { Button } from "@/shared/components/ui/button";
import { columnsPayment, usePaymentsWithCleanup } from "./payment.column";

export default function PaymentTable() {
  const { data: payments, isLoading, error } = usePaymentsWithCleanup();

  const columns = useMemo(() => columnsPayment(), []);

  if (error) return <div className="text-center py-4">Error al cargar pagos</div>;

  return (
    <DataTable
      columns={columns}
      data={payments || []}
      isLoading={isLoading}
      actions={
        <Button variant="outline" size="sm" className="ml-auto h-8 lg:flex">
          <DownloadCloud className="mr-2 h-4 w-4" /> Descargar
        </Button>
      }
    />
  );
}
