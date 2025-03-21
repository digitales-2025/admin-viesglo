"use client";

import { useMemo } from "react";

import { DataTable } from "@/shared/components/data-table/DataTable";
import { useUsers } from "../_hooks/useUsers";
import { columnsUsers } from "./user.column";

export default function UsersTable() {
  const { data: roles, isLoading, error } = useUsers();

  // Crear columnas con la función de expansión y el ID de la fila expandida
  const columns = useMemo(() => columnsUsers(), []);

  if (isLoading) return <div className="text-center py-4">Cargando usuarios...</div>;

  if (error) return <div className="text-center py-4 text-destructive">Error al cargar usuarios: {error.message}</div>;

  return <DataTable columns={columns} data={roles || []} />;
}
