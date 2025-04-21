"use client";

import { useMemo } from "react";
import { DownloadCloud } from "lucide-react";

import { DataTable } from "@/shared/components/data-table/DataTable";
import { Button } from "@/shared/components/ui/button";
import { useClients } from "../_hooks/useClients";
import { columnsClients } from "./clients.column";

export default function ClientsTable() {
  const { data: clients, isLoading, error } = useClients();

  const columns = useMemo(() => columnsClients(), []);

  if (error) {
    console.log("🚀 ~ ClientsTable ~ error:", error);
    return <div className="text-center py-4">Error al cargar clientes</div>;
  }

  return (
    <DataTable
      columns={columns}
      data={clients || []}
      isLoading={isLoading}
      actions={
        <Button variant="outline" size="sm" className="ml-auto h-8 lg:flex">
          <DownloadCloud /> Descargar
        </Button>
      }
    />
  );
}
