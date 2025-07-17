"use client";

import { useEffect, useMemo, useState } from "react";

import { useProfile } from "@/app/(public)/auth/sign-in/_hooks/use-auth";
import { DataTable } from "@/shared/components/data-table/DataTable";
import { DataTableFacetedFilterOption } from "@/shared/components/data-table/DataTableFacetedFilter";
import { groupFiltersByValue } from "@/shared/utils/filtersGroup";
import { useUsers } from "../_hooks/useUsers";
import { columnsUsers } from "./user.column";

export default function UsersTable() {
  const { data: users, isLoading, error } = useUsers();
  const user = useProfile();

  // Estado local para los filtros con tipos explícitos de DataTableFacetedFilterOption
  const [filterActiveOptions, setFilterActiveOptions] = useState<DataTableFacetedFilterOption[]>([]);
  const [filterRoleOptions, setFilterRoleOptions] = useState<DataTableFacetedFilterOption[]>([]);

  // Actualizar filtros solo cuando los datos estén disponibles
  useEffect(() => {
    if (users && users.length > 0) {
      // Filtro de activos
      const activeOptions = groupFiltersByValue(users, "isActive");
      setFilterActiveOptions(
        activeOptions.map((option) => ({
          label: option.label ? "Activo" : "Inactivo",
          value: String(option.value), // Convertir a string para cumplir con el tipo
        }))
      );

      // Filtro de roles
      const roleOptions = groupFiltersByValue(users.flatMap((user) => user.roles) || [], "name");
      setFilterRoleOptions(
        roleOptions.map((option) => ({
          label: option.label,
          value: String(option.value), // Asegurar que value es siempre string
        }))
      );
    }
  }, [users]);
  const columns = useMemo(() => columnsUsers(), []);

  // Manejo de errores
  if (error) return <div className="text-center py-4 text-destructive">Error al cargar usuarios: {error.message}</div>;

  return (
    <DataTable
      columns={columns}
      data={users || []}
      isLoading={isLoading}
      filterOptions={[
        { label: "Estado", value: "estado", options: filterActiveOptions },
        { label: "Rol", value: "rol", options: filterRoleOptions },
      ]}
      initialColumnVisibility={{
        estado: user.isSuperAdmin,
      }}
    />
  );
}
