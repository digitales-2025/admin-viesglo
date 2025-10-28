"use client";

import { useMemo } from "react";

import { useProfile } from "@/app/(public)/auth/sign-in/_hooks/use-auth";
import AlertMessage from "@/shared/components/alerts/Alert";
import { DataTable } from "@/shared/components/data-table/data-table";
import { EmptyData } from "@/shared/components/data-table/empty-data";
import { Loading } from "@/shared/components/loading";
import { useRoles } from "../../_hooks/use-roles";
import { RoleListItem } from "../../../settings/_types/roles.types";
import { RoleDescription } from "./RoleDescription";
import { columnsRoles } from "./RolesColumns";

export function RolesTable() {
  const user = useProfile();
  const { query, setPagination } = useRoles();
  const { data, isLoading, error } = query;

  // Memorizamos las columnas para evitar re-renderizados innecesarios
  const columns = useMemo(() => columnsRoles(), []);

  if (isLoading) return <Loading text="Cargando roles..." variant="spinner" />;

  if (error) {
    return (
      <AlertMessage variant="destructive" title="Error al cargar roles" description={error.error?.userMessage ?? ""} />
    );
  }

  if (!data) return <EmptyData />;

  return (
    <DataTable
      columns={columns}
      data={data.data as unknown as RoleListItem[]}
      filterPlaceholder="Buscar roles ..."
      serverPagination={{
        pageIndex: data.meta.page - 1,
        pageSize: data.meta.pageSize,
        onPaginationChange: (pageIndex, pageSize) => {
          setPagination({ newPage: pageIndex + 1, newSize: pageSize });
        },
        pageCount: data.meta.totalPages,
        total: data.meta.total,
      }}
      renderExpandedRow={(row) => <RoleDescription row={row} />}
      getRowCanExpand={() => true}
      initialColumnVisibility={{
        isActive: user.isSuperAdmin,
      }}
    />
  );
}
