"use client";

import React from "react";

import { DataTable } from "@/shared/components/data-table/data-table";
import { ServerPaginationTanstackTableConfig } from "@/shared/components/data-table/types/CustomPagination";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { MetaPaginated } from "@/types/query-filters/meta-paginated.types";
import {
  useSetAdditionalDeliverableActualEndDate,
  useSetAdditionalDeliverableActualStartDate,
} from "../../../../_hooks/use-additional-deliverable-actual-dates";
import { AdditionalDeliverableDetailedResponseDto } from "../../../../_types";
import { MODULE_ADDITIONAL_DELIVERABLES_PHASE } from "./additional-deliverables-phase-overlays/AdditionalDeliverablesPhaseOverlays";
import { AdditionalDeliverableDetailsPanel } from "./AdditionalDeliverableDetailsPanel";
import { AdditionalDeliverablesPhaseColumns } from "./AdditionalDeliverablesPhaseColumns";

interface TableAdditionalDeliverablesPhaseProps {
  projectId: string;
  phaseId: string;
  additionalDeliverables: AdditionalDeliverableDetailedResponseDto[];
  meta?: MetaPaginated;
  setPagination: ({ newPage, newSize }: { newPage: number; newSize: number }) => void;
  // Funciones de filtrado
  handleSearchChange: (value: string) => void;
  handleSortChange: (field: "name" | "createdAt" | "updatedAt" | undefined, order: "asc" | "desc" | undefined) => void;
  clearFilters: () => void;
  // Estados de filtros
  search: string | undefined;
  phaseStartDate: string | undefined;
  phaseEndDate: string | undefined;
  milestoneStatus?: string;
}

export function TableAdditionalDeliverablesPhase({
  projectId,
  phaseId,
  additionalDeliverables,
  meta,
  setPagination,
  // Funciones de filtrado
  handleSearchChange,
  // Estados de filtros
  search,
  milestoneStatus,
}: TableAdditionalDeliverablesPhaseProps) {
  const { open } = useDialogStore();

  const { mutate: setActualStartDate } = useSetAdditionalDeliverableActualStartDate();
  const { mutate: setActualEndDate } = useSetAdditionalDeliverableActualEndDate();

  // Función para manejar la actualización de fecha de inicio real
  const handleActualStartDateUpdate = (additionalDeliverableId: string, date?: Date) => {
    if (date) {
      setActualStartDate(additionalDeliverableId, date.toISOString());
    }
  };

  // Función para manejar la actualización de fecha de fin real
  const handleActualEndDateUpdate = (additionalDeliverableId: string, date?: Date) => {
    if (date) {
      setActualEndDate(additionalDeliverableId, date.toISOString());
    }
  };

  // Función para manejar la confirmación de fecha de fin real (con diálogo de confirmación)
  const handleActualEndDateConfirm = (additionalDeliverableId: string, date?: Date) => {
    if (date) {
      // Abrir diálogo de confirmación con los datos del entregable adicional
      const additionalDeliverable = additionalDeliverables.find((d) => d.id === additionalDeliverableId);
      if (additionalDeliverable) {
        open(MODULE_ADDITIONAL_DELIVERABLES_PHASE, "confirm-end-date", {
          ...additionalDeliverable,
          endDate: date.toISOString(),
        });
      }
    }
  };

  // Función para determinar si las fechas reales deben estar habilitadas
  const shouldEnableActualDates = (): boolean => {
    // Los entregables adicionales solo se pueden editar cuando el milestone está VALIDATED
    return milestoneStatus !== "PLANNING";
  };

  // Función para determinar si las columnas de fechas reales deben mostrarse
  const shouldShowActualDateColumns = (): boolean => {
    // Solo mostrar las columnas cuando el milestone status es "VALIDATED"
    return milestoneStatus !== "PLANNING";
  };

  // Obtener las columnas del componente dedicado
  const columns = AdditionalDeliverablesPhaseColumns({
    projectId,
    phaseId,
    additionalDeliverables,
    milestoneStatus,
    handleActualStartDateUpdate,
    handleActualEndDateUpdate,
    handleActualEndDateConfirm,
    shouldEnableActualDates,
    shouldShowActualDateColumns,
  });

  // Configuración de paginación del servidor
  const serverPagination: ServerPaginationTanstackTableConfig | undefined = meta
    ? {
        pageIndex: meta.page - 1, // TanStack usa índice basado en 0
        pageSize: meta.pageSize,
        pageCount: meta.totalPages,
        total: meta.total,
        onPaginationChange: (pageIndex: number, pageSize: number) => {
          setPagination({ newPage: pageIndex + 1, newSize: pageSize }); // Convertir de vuelta a índice basado en 1
        },
      }
    : undefined;

  return (
    <DataTable
      columns={columns}
      data={additionalDeliverables}
      filterPlaceholder="Buscar entregables adicionales..."
      expandable={true}
      renderDetailsPanel={(additionalDeliverable) => (
        <AdditionalDeliverableDetailsPanel
          additionalDeliverable={additionalDeliverable}
          projectId={projectId}
          phaseId={phaseId}
          milestoneStatus={milestoneStatus}
        />
      )}
      getItemId={(additionalDeliverable) => additionalDeliverable.id}
      getItemTitle={(additionalDeliverable) => additionalDeliverable.name}
      defaultPanelSize={40}
      minPanelSize={25}
      maxPanelSize={60}
      defaultTableSize={60}
      minTableSize={40}
      maxTableSize={75}
      // Configuración de paginación del servidor
      serverPagination={serverPagination}
      // Filtros externos
      externalGlobalFilter={search}
      onGlobalFilterChange={handleSearchChange}
      externalFilterValue={search}
    />
  );
}
