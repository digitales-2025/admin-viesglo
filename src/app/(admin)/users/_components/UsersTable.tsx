"use client";

import { useMemo } from "react";

import { DataTable } from "@/shared/components/data-table/DataTable";
import { useUsers } from "../_hooks/useUsers";
import { columnsUsers } from "./user.column";

export default function UsersTable() {
  const { data: roles, isLoading, error } = useUsers();
  const columns = useMemo(() => columnsUsers(), []);

  if (error) return <div className="text-center py-4 text-destructive">Error al cargar usuarios: {error.message}</div>;

  return <DataTable columns={columns} data={roles || []} isLoading={isLoading} />;
}
