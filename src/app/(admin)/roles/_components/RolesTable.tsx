"use client";

import { useMemo, useState } from "react";

import { ExpandableDataTable } from "@/shared/components/data-table/ExpandableDataTable";
import { useRoles } from "../_hooks/useRoles";
import { createColumnsRoles } from "./column";

export default function RolesTable() {
  const { data: roles, isLoading, error } = useRoles();
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Función para manejar la expansión de una fila
  const handleRowExpand = (rowId: string) => {
    setExpandedRowId((prevId) => (prevId === rowId ? null : rowId));
  };

  // Crear columnas con la función de expansión y el ID de la fila expandida
  const columns = useMemo(() => createColumnsRoles(handleRowExpand, expandedRowId), [expandedRowId]);

  if (isLoading) return <div className="text-center py-4">Cargando roles...</div>;

  if (error) return <div className="text-center py-4 text-destructive">Error al cargar roles: {error.message}</div>;

  return <ExpandableDataTable columns={columns} data={roles || []} />;
}
