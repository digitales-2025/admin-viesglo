"use client";

import { useMemo } from "react";

import AlertMessage from "@/shared/components/alerts/Alert";
import { DataTable } from "@/shared/components/data-table/DataTable";
import { useClients } from "../_hooks/useClients";
import { columnsClients } from "./clients.column";

export default function ClientsTable() {
  const { data: clients, isLoading, error } = useClients();

  const columns = useMemo(() => columnsClients(), []);

  if (error) return <AlertMessage variant="destructive" title="Error al cargar clientes" description={error.message} />;

  return <DataTable columns={columns} data={clients || []} isLoading={isLoading} />;
}
