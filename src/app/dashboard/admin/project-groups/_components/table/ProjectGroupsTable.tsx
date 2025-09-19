"use client";

import { useMemo } from "react";

import { useProfile } from "@/app/(public)/auth/sign-in/_hooks/use-auth";
import AlertMessage from "@/shared/components/alerts/Alert";
import { DataTable } from "@/shared/components/data-table/data-table";
import { EmptyData } from "@/shared/components/data-table/empty-data";
import { Loading } from "@/shared/components/loading";
import { useProjectGroups } from "../../_hooks/use-project-groups";
import { ProjectGroupResponseDto } from "../../_types/project-groups.types";
import { columnsProjectGroups } from "./ProjectGroupsColumns";

export default function ProjectGroupsTable() {
  const { query, setPagination } = useProjectGroups();
  const { data, isLoading, error } = query;
  const columns = useMemo(() => columnsProjectGroups, []);
  const { isSuperAdmin } = useProfile();

  if (isLoading) return <Loading text="Cargando grupos de proyectos..." variant="spinner" />;

  if (error) {
    return (
      <AlertMessage variant="destructive" title="Error al cargar grupos de proyectos" description={error.message} />
    );
  }

  if (!data) return <EmptyData />;

  return (
    <DataTable
      columns={columns}
      data={data.data as unknown as ProjectGroupResponseDto[]}
      filterPlaceholder="Buscar grupo de proyectos ..."
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
