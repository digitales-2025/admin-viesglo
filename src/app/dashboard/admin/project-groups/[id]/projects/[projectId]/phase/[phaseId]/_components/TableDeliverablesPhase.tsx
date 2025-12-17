"use client";

import React, { useState } from "react";

import { EnumAction, EnumResource } from "@/app/dashboard/admin/settings/_types/roles.types";
import { DataTable } from "@/shared/components/data-table/data-table";
import { ServerPaginationTanstackTableConfig } from "@/shared/components/data-table/types/CustomPagination";
import { usePermissionCheckHook } from "@/shared/components/protected-component";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { MetaPaginated } from "@/types/query-filters/meta-paginated.types";
import {
  useSetDeliverableActualEndDate,
  useSetDeliverableActualStartDate,
} from "../../../../_hooks/use-deliverable-actual-dates";
import { useUpdateDeliverable } from "../../../../_hooks/use-project-deliverables";
import { DeliverableDetailedResponseDto } from "../../../../_types";
import { useRemovePrecedent, useSetPrecedent } from "../../../../../projects/_hooks/use-project-deliverables";
import { DeliverableDetailsPanel } from "./DeliverableDetailsPanel";
import { MODULE_DELIVERABLES_PHASE } from "./deliverables-phase-overlays/DeliverablesPhaseOverlays";
import { DeliverablesPhaseColumns } from "./DeliverablesPhaseColumns";

interface TableDeliverablesPhaseProps {
  projectId: string;
  phaseId: string;
  deliverables: DeliverableDetailedResponseDto[];
  meta?: MetaPaginated;
  setPagination: ({ newPage, newSize }: { newPage: number; newSize: number }) => void;
  // Funciones de filtrado
  handleSearchChange: (value: string) => void;
  handleSortChange: (
    field: "name" | "lastName" | "email" | "createdAt" | "updatedAt" | undefined,
    order: "asc" | "desc" | undefined
  ) => void;
  clearFilters: () => void;
  // Estados de filtros
  search: string | undefined;
  phaseStartDate: string | undefined;
  phaseEndDate: string | undefined;
  milestoneStatus?: string;
}

// Función para verificar si un entregable tiene fechas planificadas válidas
const hasValidPlannedDates = (deliverable: DeliverableDetailedResponseDto): boolean => {
  return !!(deliverable.startDate && deliverable.endDate);
};

export function TableDeliverablesPhase({
  projectId,
  phaseId,
  deliverables,
  meta,
  setPagination,
  // Funciones de filtrado
  handleSearchChange,
  // Estados de filtros
  search,
  phaseStartDate,
  phaseEndDate,
  milestoneStatus,
}: TableDeliverablesPhaseProps) {
  const { open } = useDialogStore();
  const { hasAnyPermission } = usePermissionCheckHook();

  const { mutate: setPrecedent } = useSetPrecedent();
  const { mutate: removePrecedent } = useRemovePrecedent();

  const { mutate: updateDeliverable } = useUpdateDeliverable();
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});
  const { mutate: setActualStartDate } = useSetDeliverableActualStartDate();
  const { mutate: setActualEndDate } = useSetDeliverableActualEndDate();
  // Función para manejar la actualización del período completo
  const handleDateUpdate = React.useCallback(
    (deliverableId: string, startDate?: Date, endDate?: Date) => {
      updateDeliverable(
        {
          params: {
            path: {
              projectId,
              phaseId,
              deliverableId,
            },
          },
          body: {
            startDate: startDate?.toISOString(),
            endDate: endDate?.toISOString(),
          },
        },
        {
          onError: (error) => {
            console.error("Error al actualizar período:", error);
          },
        }
      );
    },
    [updateDeliverable, projectId, phaseId]
  );

  // Función para manejar la actualización de fecha de inicio real
  const handleActualStartDateUpdate = (deliverableId: string, date?: Date) => {
    if (date) {
      setActualStartDate(deliverableId, date.toISOString());
    }
  };

  // Función para manejar la actualización de fecha de fin real
  const handleActualEndDateUpdate = (deliverableId: string, date?: Date) => {
    if (date) {
      setActualEndDate(deliverableId, date.toISOString());
    }
  };

  // Función para manejar la confirmación de fecha de fin real (con diálogo de confirmación)
  const handleActualEndDateConfirm = (deliverableId: string, date?: Date) => {
    if (date) {
      // Abrir diálogo de confirmación con los datos del entregable
      const deliverable = deliverables.find((d) => d.id === deliverableId);
      if (deliverable) {
        open(MODULE_DELIVERABLES_PHASE, "confirm-end-date", {
          ...deliverable,
          endDate: date.toISOString(),
        });
      }
    }
  };

  // Función para manejar el toggle de aprobación
  const handleToggleApproval = (deliverable: DeliverableDetailedResponseDto) => {
    // Solo permitir aprobar si no está aprobado
    if (!deliverable.isApproved) {
      open(MODULE_DELIVERABLES_PHASE, "approve", deliverable);
    }
  };
  // Función para manejar la selección de precedente
  const handlePrecedentSelect = (deliverableId: string, selectedPrecedentId: string) => {
    setOpenDropdowns((prev) => ({ ...prev, [deliverableId]: false }));

    // Si selectedPrecedentId está vacío, remover precedente
    if (!selectedPrecedentId) {
      removePrecedent({
        params: {
          path: {
            projectId,
            phaseId,
            deliverableId,
          },
        },
        body: {} as Record<string, never>,
      });
      return;
    }

    // Establecer nuevo precedente
    setPrecedent({
      params: {
        path: {
          projectId,
          phaseId,
          deliverableId,
        },
      },
      body: {
        precedentDeliverableId: selectedPrecedentId,
      },
    });
  };

  // Función para encontrar el entregable precedente por ID
  const findPrecedentDeliverable = (id: string) => {
    return deliverables.find((deliverable) => deliverable.id === id);
  };

  // Función para verificar si un entregable tiene precedente y si está bloqueado
  const isDeliverableBlockedByPrecedent = (deliverable: DeliverableDetailedResponseDto): boolean => {
    const precedentId = (deliverable as any).precedentId;
    if (!precedentId) return false;

    const precedentDeliverable = findPrecedentDeliverable(precedentId);
    if (!precedentDeliverable) return false;

    // El entregable está bloqueado si su precedente no tiene fecha de fin real
    return !precedentDeliverable.actualEndDate;
  };

  // Función para determinar si las fechas reales deben estar habilitadas
  const shouldEnableActualDates = (deliverable: DeliverableDetailedResponseDto): boolean => {
    // PRIMERO: Verificar si está bloqueado por precedencia (esto tiene prioridad)
    const isBlocked = isDeliverableBlockedByPrecedent(deliverable);
    if (isBlocked) {
      return false;
    }

    // SEGUNDO: Verificar el estado del milestone
    if (milestoneStatus === "VALIDATED") {
      return true;
    }

    return true;
  };

  // Función para determinar si las columnas de fechas reales deben mostrarse
  const shouldShowActualDateColumns = (): boolean => {
    // Solo mostrar las columnas cuando el milestone status NO es "CREATED"
    return milestoneStatus !== "PLANNING";
  };

  // Función para verificar si el usuario tiene permisos de aprobación
  const hasApprovalPermissions = React.useMemo(() => {
    return hasAnyPermission([
      { resource: EnumResource.projects, action: EnumAction.update },
      { resource: EnumResource.projects, action: EnumAction.delete },
    ]);
  }, [hasAnyPermission]);

  // Verificar si TODOS los entregables tienen fechas planificadas para mostrar la columna de aprobación
  const hasAllDeliverablesWithDates = React.useMemo(() => {
    return deliverables.length > 0 && deliverables.every((deliverable) => hasValidPlannedDates(deliverable));
  }, [deliverables]);

  // Verificar si TODOS los entregables ya están aprobados
  const areAllDeliverablesApproved = React.useMemo(() => {
    return deliverables.length > 0 && deliverables.every((deliverable) => deliverable.isApproved === true);
  }, [deliverables]);

  // Verificar si se debe mostrar la columna de aprobación (fechas + permisos + no todos aprobados)
  const shouldShowApprovalColumn = React.useMemo(() => {
    return hasAllDeliverablesWithDates && hasApprovalPermissions && !areAllDeliverablesApproved;
  }, [hasAllDeliverablesWithDates, hasApprovalPermissions, areAllDeliverablesApproved]);

  // Obtener las columnas del componente dedicado
  const columns = DeliverablesPhaseColumns({
    projectId,
    phaseId,
    deliverables,
    milestoneStatus,
    phaseStartDate,
    phaseEndDate,
    handleDateUpdate,
    handleActualStartDateUpdate,
    handleActualEndDateUpdate,
    handleActualEndDateConfirm,
    handleToggleApproval,
    handlePrecedentSelect,
    openDropdowns,
    setOpenDropdowns,
    shouldEnableActualDates,
    shouldShowActualDateColumns,
    shouldShowApprovalColumn,
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
      data={deliverables}
      filterPlaceholder="Buscar entregables..."
      expandable={true}
      renderDetailsPanel={(deliverable) => (
        <DeliverableDetailsPanel
          deliverable={deliverable}
          projectId={projectId}
          phaseId={phaseId}
          milestoneStatus={milestoneStatus}
        />
      )}
      getItemId={(deliverable) => deliverable.id}
      getItemTitle={(deliverable) => deliverable.name}
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
