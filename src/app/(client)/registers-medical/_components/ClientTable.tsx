"use client";

import { useEffect, useMemo, useState } from "react";
import { DownloadCloud } from "lucide-react";

import { DataTable } from "@/shared/components/data-table/DataTable";
import { Button } from "@/shared/components/ui/button";
import { DatePickerWithRange } from "@/shared/components/ui/date-range-picker";
import { ClientWithResponse } from "../_types/client.types";
import { columnsClients } from "./client.column";

export default function ClientTable() {
  const [clients, setClients] = useState<ClientWithResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const columns = useMemo(() => columnsClients(), []);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch("/api/clients"); // endpoint para obtener los datos
        if (!res.ok) throw new Error("Error al obtener los datos");
        const data = await res.json();
        setClients(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  if (error) {
    return <div className="text-center py-4">Error al cargar los registros médicos</div>;
  }

  return (
    <DataTable
      columns={columns}
      data={clients}
      isLoading={loading}
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
