"use client";

import React from "react";
import { useParams } from "next/navigation";
import { FileText } from "lucide-react";

import { EnumAction, EnumResource } from "@/app/dashboard/admin/settings/_types/roles.types";
import AlertMessage from "@/shared/components/alerts/Alert";
import { ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";
import { PermissionProtected } from "@/shared/components/protected-component";
import { MetaPaginated } from "@/types/query-filters/meta-paginated.types";
import { usePhaseAdditionalDeliverablesPaginated } from "../../../../_hooks/use-additional-deliverables";
import AdditionalDeliverablesPhasePrimaryButtons from "./AdditionalDeliverablesPhasePrimaryButtons";
import { DeliverablesTableSkeleton } from "./DeliverablesTableSkeleton";
import { TableAdditionalDeliverablesPhase } from "./TableAdditionalDeliverablesPhase";

export function ListAdditionalDeliverablesPhase() {
  const params = useParams();
  const projectId = params.projectId as string;
  const phaseId = params.phaseId as string;

  const {
    query,
    setPagination,
    meta,
    // Funciones de filtrado
    handleSearchChange,
    handleSortChange,
    clearFilters,
    // Estados de filtros
    search,
  } = usePhaseAdditionalDeliverablesPaginated(projectId, phaseId);

  const { isLoading, error, data } = query;

  if (isLoading) return <DeliverablesTableSkeleton />;

  if (error) {
    return (
      <AlertMessage
        variant="destructive"
        title="Error al cargar entregables adicionales"
        description={error.error?.userMessage ?? ""}
      />
    );
  }

  // Verificar si no hay entregables adicionales
  const hasAdditionalDeliverables = data?.additionalDeliverables && data.additionalDeliverables.length > 0;

  return (
    <PermissionProtected
      permissions={[
        { resource: EnumResource.projects, action: EnumAction.update },
        { resource: EnumResource.projects, action: EnumAction.delete },
      ]}
      requireAll={false}
      hideOnUnauthorized={true}
    >
      {!hasAdditionalDeliverables ? (
        // Vista cuando no hay entregables adicionales
        <div className="px-6 pt-2">
          <div className="flex flex-col items-center justify-center text-center space-y-6">
            {/* Icono principal */}
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
              <FileText className="w-8 h-8 text-slate-400 dark:text-slate-500" />
            </div>

            {/* Contenido textual */}
            <div className="space-y-2 max-w-sm">
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">No hay entregables adicionales</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Esta fase no tiene entregables fuera de lo planificado. Puedes agregar entregables adicionales cuando
                sea necesario.
              </p>
            </div>

            {/* Botón de acción */}
            <div>
              <AdditionalDeliverablesPhasePrimaryButtons
                milestoneStatus={data?.milestoneStatus || ""}
                projectId={projectId}
                phaseId={phaseId}
              />
            </div>
          </div>
        </div>
      ) : (
        // Vista normal cuando hay entregables adicionales
        <div className="space-y-6">
          {/* Header para entregables adicionales */}
          <div className="px-6">
            <ShellHeader>
              <ShellTitle
                title="Entregables Adicionales"
                description="Gestiona los entregables adicionales de esta fase."
              />
              <AdditionalDeliverablesPhasePrimaryButtons
                milestoneStatus={data?.milestoneStatus || ""}
                projectId={projectId}
                phaseId={phaseId}
              />
            </ShellHeader>
          </div>

          {/* Tabla de entregables adicionales */}
          <div className="px-6 pb-6">
            <TableAdditionalDeliverablesPhase
              projectId={projectId}
              phaseId={phaseId}
              additionalDeliverables={data?.additionalDeliverables || []}
              meta={meta as MetaPaginated | undefined}
              setPagination={setPagination}
              // Funciones de filtrado
              handleSearchChange={handleSearchChange}
              // Estados de filtros
              search={search}
              handleSortChange={handleSortChange}
              clearFilters={clearFilters}
              phaseStartDate={data?.phase?.startDate || undefined}
              phaseEndDate={data?.phase?.endDate || undefined}
              milestoneStatus={data?.milestoneStatus || undefined}
            />
          </div>
        </div>
      )}
    </PermissionProtected>
  );
}
