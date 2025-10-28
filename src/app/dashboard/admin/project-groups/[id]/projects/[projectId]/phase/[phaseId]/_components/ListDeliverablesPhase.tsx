"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";

import AlertMessage from "@/shared/components/alerts/Alert";
import { Loading } from "@/shared/components/loading";
import { MetaPaginated } from "@/types/query-filters/meta-paginated.types";
import { usePhaseDeliverablesPaginated } from "../../../../_hooks/use-project-deliverables";
import { TableDeliverablesPhase } from "./TableDeliverablesPhase";

interface ListDeliverablesPhaseProps {
  milestoneStatus?: string;
  setMilestoneStatus: (status: string | undefined) => void;
}

export function ListDeliverablesPhase({ milestoneStatus, setMilestoneStatus }: ListDeliverablesPhaseProps) {
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
  } = usePhaseDeliverablesPaginated(projectId, phaseId);

  const { isLoading, error, data } = query;

  // Actualizar el milestoneStatus cuando se obtengan los datos
  useEffect(() => {
    if (data?.milestoneStatus) {
      setMilestoneStatus(data.milestoneStatus);
    }
  }, [data?.milestoneStatus, setMilestoneStatus]);

  if (isLoading) return <Loading text="Cargando entregables..." variant="spinner" />;

  if (error) {
    return (
      <AlertMessage
        variant="destructive"
        title="Error al cargar entregables"
        description={error.error?.userMessage ?? ""}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabla de entregables */}
      <div className="px-6 pb-6">
        <TableDeliverablesPhase
          projectId={projectId}
          phaseId={phaseId}
          deliverables={data?.deliverables || []}
          meta={meta as MetaPaginated | undefined}
          setPagination={setPagination}
          // Funciones de filtrado
          handleSearchChange={handleSearchChange}
          // Estados de filtros
          search={search}
          handleSortChange={handleSortChange}
          clearFilters={clearFilters}
          phaseStartDate={data?.phase?.startDate}
          phaseEndDate={data?.phase?.endDate}
          milestoneStatus={milestoneStatus} // ✅ Usar el estado pasado desde la página
        />
      </div>
    </div>
  );
}
