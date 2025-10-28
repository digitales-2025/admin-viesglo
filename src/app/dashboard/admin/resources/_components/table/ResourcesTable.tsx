"use client";

import { useMemo } from "react";

import { useProfile } from "@/app/(public)/auth/sign-in/_hooks/use-auth";
import AlertMessage from "@/shared/components/alerts/Alert";
import { DataTable } from "@/shared/components/data-table/data-table";
import { EmptyData } from "@/shared/components/data-table/empty-data";
import { Loading } from "@/shared/components/loading";
import { useResources } from "../../_hooks/use-resource";
import { ResourceResponseDto } from "../../_types/resources.types";
import { columnsResources } from "./ResourcesColumns";

export default function ResourcesTable() {
  const { query, setPagination } = useResources();
  const { data, isLoading, error } = query;
  const columns = useMemo(() => columnsResources(), []);
  const { isSuperAdmin } = useProfile();

  if (isLoading) return <Loading text="Cargando recursos..." variant="spinner" />;

  if (error) {
    return <AlertMessage variant="destructive" title="Error al cargar recursos" description={error.error?.message} />;
  }

  if (!data) return <EmptyData />;

  return (
    <DataTable
      columns={columns}
      data={data.data as unknown as ResourceResponseDto[]}
      filterPlaceholder="Buscar recurso ..."
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
        isActive: isSuperAdmin,
      }}
    />
  );
}
