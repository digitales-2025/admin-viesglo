"use client";

import { useMemo } from "react";

import { useProfile } from "@/app/(public)/auth/sign-in/_hooks/use-auth";
import AlertMessage from "@/shared/components/alerts/Alert";
import { DataTable } from "@/shared/components/data-table/data-table";
import { EmptyData } from "@/shared/components/data-table/empty-data";
import { Loading } from "@/shared/components/loading";
import { useClients } from "../_hooks/use-clients";
import { ClientProfileResponseDto } from "../_types/clients.types";
import { facetedFilters } from "../_utils/clients.filter.utils";
import { columnsClients } from "./clients.column";

export default function ClientsTable() {
  const { query, setPagination } = useClients();
  const { data, isLoading, error } = query;
  const columns = useMemo(() => columnsClients(), []);
  const { isSuperAdmin } = useProfile();

  if (isLoading) return <Loading text="Cargando clientes..." variant="spinner" />;

  if (error) {
    return <AlertMessage variant="destructive" title="Error al cargar clientes" description={error.error?.message} />;
  }

  if (!data) return <EmptyData />;

  return (
    <DataTable
      columns={columns}
      data={data.data as unknown as ClientProfileResponseDto[]}
      filterPlaceholder="Buscar cliente ..."
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
      facetedFilters={facetedFilters}
    />
  );
}
