"use client";

import { useMemo } from "react";

import AlertMessage from "@/shared/components/alerts/Alert";
import { DataTable } from "@/shared/components/data-table/DataTable";
import { useRoles } from "../_hooks/useRoles";
import { Role } from "../_types/roles";
import { columnsRoles } from "./column";
import { RolePermissionsView } from "./RolePermissionsView";

export function RolesExpandableTable() {
  const { data: roles, isLoading, isError } = useRoles();

  // Memorizamos las columnas para evitar re-renderizados innecesarios
  const columns = useMemo(() => columnsRoles(), []);

  if (isError) {
    return <AlertMessage title="Error" description="Error al cargar los roles" variant="destructive" />;
  }

  // Verificar que roles sea un array válido y no esté vacío
  if (!roles || !Array.isArray(roles) || roles.length === 0) {
    return <AlertMessage title="Información" description="No hay roles para mostrar." variant="info" />;
  }

  return (
    <DataTable
      columns={columns}
      data={roles}
      isLoading={isLoading}
      getSubRows={(row) => row.permissionIds as unknown as Role[]}
      renderExpandedRow={(row) => <RolePermissionsView role={row} />}
    />
  );
}
