"use client";

import { useMemo } from "react";

import { DataTable } from "@/shared/components/data-table/DataTable";
import { groupFiltersByValue } from "@/shared/utils/filtersGroup";
import { useUsers } from "../_hooks/useUsers";
import { columnsUsers } from "./user.column";

export default function UsersTable() {
  const { data: users, isLoading, error } = useUsers();
  const columns = useMemo(() => columnsUsers(), []);

  const filterActiveOptions = useMemo(() => {
    const options = groupFiltersByValue(users || [], "isActive");
    return options.map((option) => ({
      label: option.label ? "Activo" : "Inactivo",
      value: option.value,
    }));
  }, [users]);

  const filterRoleOptions = useMemo(() => {
    const options = groupFiltersByValue(users?.flatMap((user) => user.roles) || [], "name");
    return options.map((option) => ({
      label: option.label,
      value: option.value,
    }));
  }, [users]);

  if (error) return <div className="text-center py-4 text-destructive">Error al cargar usuarios: {error.message}</div>;

  return (
    <DataTable
      columns={columns}
      data={users || []}
      isLoading={isLoading}
      filterOptions={[
        { label: "Estado", value: "estado", options: filterActiveOptions || [] },
        { label: "Rol", value: "rol", options: filterRoleOptions || [] },
      ]}
    />
  );
}
