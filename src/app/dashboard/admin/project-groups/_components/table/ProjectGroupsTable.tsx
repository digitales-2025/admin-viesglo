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
import { ProjectGroupsTableActions } from "./ProjectGroupsTableActions";

interface ProjectGroupsTableProps {
  onEdit?: (projectGroup: ProjectGroupResponseDto) => void;
}

export default function ProjectGroupsTable({ onEdit }: ProjectGroupsTableProps) {
  const { query, setPagination } = useProjectGroups();
  const { data, isLoading, error } = query;
  const columns = useMemo(() => {
    // Crear columnas dinámicamente para pasar la función onEdit
    return columnsProjectGroups.map((column) => {
      if (column.id === "actions") {
        return {
          ...column,
          cell: ({ row }: any) => <ProjectGroupsTableActions projectGroup={row.original} onEdit={onEdit} />,
        };
      }
      return column;
    });
  }, [onEdit]);
  const { isSuperAdmin: _isSuperAdmin } = useProfile();

  if (isLoading) return <Loading text="Cargando grupos de proyectos..." variant="spinner" />;

  if (error) {
    const description = error instanceof Error ? error.message : "Error desconocido";
    return <AlertMessage variant="destructive" title="Error al cargar grupos de proyectos" description={description} />;
  }

  if (!data) return <EmptyData />;

  // Manejar tanto estructura de useQuery como useInfiniteQuery
  const isInfiniteStructure = data && "pages" in data;
  const firstPage = isInfiniteStructure ? (data as any).pages?.[0] : data;
  const activeProjectGroups = (firstPage?.data as any[])?.filter((group) => group.isActive === true) || [];

  return (
    <DataTable
      columns={columns}
      data={activeProjectGroups as unknown as ProjectGroupResponseDto[]}
      filterPlaceholder="Buscar grupo de proyectos ..."
      serverPagination={{
        pageIndex: (firstPage?.meta?.page || 1) - 1,
        pageSize: firstPage?.meta?.pageSize || 10,
        onPaginationChange: (pageIndex, pageSize) => {
          setPagination({ newPage: pageIndex + 1, newSize: pageSize });
        },
        pageCount: firstPage?.meta?.totalPages || 1,
        total: firstPage?.meta?.total || 0,
      }}
    />
  );
}
