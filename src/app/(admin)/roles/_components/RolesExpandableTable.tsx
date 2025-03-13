"use client";

import { useMemo } from "react";
import { Loader2 } from "lucide-react";

import { ExpandableDataTable } from "@/shared/components/data-table/ExpandableDataTable";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { useRoles } from "../_hooks/useRoles";
import { Role } from "../_types/roles";
import { columnsRoles } from "./column";
import { RolePermissionsView } from "./RolePermissionsView";

export function RolesExpandableTable() {
  const { data: roles, isLoading, isError } = useRoles();

  // Memorizamos las columnas para evitar re-renderizados innecesarios
  const columns = useMemo(() => columnsRoles(), []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        <span>Cargando roles...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>No se pudieron cargar los roles. Intente nuevamente más tarde.</AlertDescription>
      </Alert>
    );
  }

  // Verificar que roles sea un array válido y no esté vacío
  if (!roles || !Array.isArray(roles) || roles.length === 0) {
    return (
      <Alert>
        <AlertTitle>Información</AlertTitle>
        <AlertDescription>No hay roles para mostrar.</AlertDescription>
      </Alert>
    );
  }

  return (
    <ExpandableDataTable
      columns={columns}
      data={roles}
      getSubRows={(row) => row.permissionIds as unknown as Role[]}
      renderExpandedRow={(row) => <RolePermissionsView role={row} />}
    />
  );
}
