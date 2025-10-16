"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { useProfile } from "@/app/(public)/auth/sign-in/_hooks/use-auth";
import AlertMessage from "@/shared/components/alerts/Alert";
import { DataTable } from "@/shared/components/data-table/data-table";
import { EmptyData } from "@/shared/components/data-table/empty-data";
import { Loading } from "@/shared/components/loading";
import { useProjectTemplates } from "../../_hooks/use-project-templates";
import { ProjectTemplateResponseDto } from "../../_types/templates.types";
import { columnsProjectTemplates } from "./ProjectTemplatesColumns";

export default function ProjectTemplatesTable() {
  const router = useRouter();
  const { query, setPagination } = useProjectTemplates();
  const { data, isLoading, error } = query;
  const columns = useMemo(() => columnsProjectTemplates(), []);
  const { isSuperAdmin } = useProfile();

  // Función para manejar el click en una fila
  const handleRowClick = (template: ProjectTemplateResponseDto) => {
    router.push(`/dashboard/admin/templates/${template.id}/view`);
  };

  if (isLoading) return <Loading text="Cargando plantillas de proyectos..." variant="spinner" />;

  if (error) {
    return (
      <AlertMessage
        variant="destructive"
        title="Error al cargar plantillas de proyectos"
        description={error.error?.message}
      />
    );
  }

  if (!data) return <EmptyData />;

  return (
    <DataTable
      columns={columns}
      data={data.data as unknown as ProjectTemplateResponseDto[]}
      filterPlaceholder="Buscar plantilla..."
      onClickRow={handleRowClick}
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
