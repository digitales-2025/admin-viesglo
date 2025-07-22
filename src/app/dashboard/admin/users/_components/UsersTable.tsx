"use client";

import { useMemo } from "react";

import { useProfile } from "@/app/(public)/auth/sign-in/_hooks/use-auth";
import { DataTable } from "@/shared/components/data-table/data-table";
import { useUsers } from "../_hooks/useUsers";
import { columnsUsers } from "./user.column";

export default function UsersTable() {
  const { data: users, isLoading, error } = useUsers();
  const user = useProfile();

  const columns = useMemo(() => columnsUsers(), []);

  // Manejo de errores
  if (error) return <div className="text-center py-4 text-destructive">Error al cargar usuarios: {error.message}</div>;

  return (
    <DataTable
      columns={columns}
      data={users || []}
      isLoading={isLoading}
      initialColumnVisibility={{
        isActive: user.isSuperAdmin,
      }}
    />
  );
}
