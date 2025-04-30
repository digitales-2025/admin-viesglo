"use client";

import { useMemo } from "react";

import { DataTable } from "@/shared/components/data-table/DataTable";
import { useRoles } from "../_hooks/useRoles";
import { columnsRoles } from "./column";

export default function RolesTable() {
  const { data: roles, isLoading, error } = useRoles();

  // Crear columnas con la función de expansión y el ID de la fila expandida
  const columns = useMemo(() => columnsRoles(), []);

  if (error) return <div className="text-center py-4 text-destructive">Error al cargar roles: {error.message}</div>;

  return <DataTable columns={columns} data={roles || []} isLoading={isLoading} />;
}
