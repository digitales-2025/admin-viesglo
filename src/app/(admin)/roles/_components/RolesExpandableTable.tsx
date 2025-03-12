"use client";

import { useMemo } from "react";
import { Loader2 } from "lucide-react";

import { ExpandableDataTable } from "@/shared/components/data-table/ExpandableDataTable";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { useRoles } from "../_hooks/useRoles";
import { columnsRoles } from "./column";

export function RolesExpandableTable() {
  const { data: roles, isLoading, isError } = useRoles();

  // Memorizamos las columnas para evitar re-renderizados innecesarios
  const columns = useMemo(() => columnsRoles, []);

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

  return <ExpandableDataTable columns={columns} data={roles || []} />;
}
