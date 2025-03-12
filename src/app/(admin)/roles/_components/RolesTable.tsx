"use client";

import { useMemo } from "react";

import { DataTable } from "@/shared/components/data-table/DataTable";
import { useRoles } from "../_hooks/useRoles";
import { columnsRoles } from "./column";

export default function RolesTable() {
  // Memorizar las columnas
  const columns = useMemo(() => columnsRoles, []);

  const { data: roles, isLoading, error } = useRoles();

  if (isLoading) return <div className="text-center py-4">Cargando roles...</div>;

  if (error) return <div className="text-center py-4 text-destructive">Error al cargar roles: {error.message}</div>;

  return <DataTable columns={columns} data={roles || []} />;
}
