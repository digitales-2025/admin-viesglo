"use client";

import { useMemo } from "react";

import { useProfile } from "@/app/(public)/auth/sign-in/_hooks/use-auth";
import AlertMessage from "@/shared/components/alerts/Alert";
import { DataTable } from "@/shared/components/data-table/data-table";
import { EmptyData } from "@/shared/components/data-table/empty-data";
import { Loading } from "@/shared/components/loading";
import { useUsers } from "../../_hooks/use-users";
import { UserResponse } from "../../_types/user.types";
import { columnsUsers } from "./UsersColumns";

export default function UsersTable() {
  const { query, setPagination } = useUsers();
  const { data, isLoading, error } = query;
  const user = useProfile();

  const columns = useMemo(() => columnsUsers(user.data?.id ?? ""), [user.data?.id]);

  if (isLoading) return <Loading text="Cargando usuarios..." variant="spinner" />;

  if (error) {
    return <AlertMessage variant="destructive" title="Error al cargar clientes" description={error.error?.message} />;
  }

  if (!data) return <EmptyData />;

  return (
    <DataTable
      columns={columns}
      data={data.data as unknown as UserResponse[]}
      filterPlaceholder="Buscar usuarios ..."
      isLoading={isLoading}
      serverPagination={{
        pageIndex: data.meta.page - 1,
        pageSize: data.meta.pageSize,
        onPaginationChange: (pageIndex, pageSize) => {
          setPagination({ newPage: pageIndex + 1, newSize: pageSize });
        },
        pageCount: data.meta.totalPages,
        total: data.meta.total,
      }}
      initialColumnVisibility={{
        isActive: user.isSuperAdmin,
      }}
    />
  );
}
