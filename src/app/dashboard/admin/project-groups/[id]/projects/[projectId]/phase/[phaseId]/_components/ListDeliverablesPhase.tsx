"use client";

import React from "react";
import { useParams } from "next/navigation";

import AlertMessage from "@/shared/components/alerts/Alert";
import { Loading } from "@/shared/components/loading";
import { MetaPaginated } from "@/types/query-filters/meta-paginated.types";
import { usePhaseDeliverablesPaginated } from "../../../../_hooks/use-project-deliverables";
import { TableDeliverablesPhase } from "./TableDeliverablesPhase";

export function ListDeliverablesPhase() {
  const params = useParams();
  const projectId = params.projectId as string;
  const phaseId = params.phaseId as string;

  const {
    query,
    setPagination,
    deliverables,
    meta,
    // Funciones de filtrado
    handleSearchChange,
    handleSortChange,
    clearFilters,
    // Estados de filtros
    search,
  } = usePhaseDeliverablesPaginated(projectId, phaseId);

  const { isLoading, error } = query;

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
          deliverables={deliverables}
          meta={meta as MetaPaginated | undefined}
          setPagination={setPagination}
          // Funciones de filtrado
          handleSearchChange={handleSearchChange}
          // Estados de filtros
          search={search}
          handleSortChange={handleSortChange}
          clearFilters={clearFilters}
        />
      </div>
    </div>
  );
}
