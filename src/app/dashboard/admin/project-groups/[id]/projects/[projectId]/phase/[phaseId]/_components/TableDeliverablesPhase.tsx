"use client";

import React, { useState } from "react";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { CheckCheck, Edit, MoreHorizontal, Plus, Trash } from "lucide-react";

import { DataTable } from "@/shared/components/data-table/data-table";
import { ServerPaginationTanstackTableConfig } from "@/shared/components/data-table/types/CustomPagination";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { DatePicker } from "@/shared/components/ui/date-picker";
import { DatePickerWithRange } from "@/shared/components/ui/date-range-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { cn } from "@/shared/lib/utils";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { MetaPaginated } from "@/types/query-filters/meta-paginated.types";
import {
  useSetDeliverableActualEndDate,
  useSetDeliverableActualStartDate,
} from "../../../../_hooks/use-deliverable-actual-dates";
import { useUpdateDeliverable } from "../../../../_hooks/use-project-deliverables";
import { DeliverableDetailedResponseDto } from "../../../../_types";
import { deliverablePriorityConfig, deliverableStatusConfig } from "../../../../_utils/projects.utils";
import { useRemovePrecedent, useSetPrecedent } from "../../../../../projects/_hooks/use-project-deliverables";
import { DeliverableDetailsPanel } from "./DeliverableDetailsPanel";
import { MODULE_DELIVERABLES_PHASE } from "./deliverables-phase-overlays/DeliverablesPhaseOverlays";
import { PrecedenceColumn } from "./PrecedenceColumn";

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

// Funciones auxiliares
const formatStatus = (status: string) => {
  const config = deliverableStatusConfig[status as keyof typeof deliverableStatusConfig];
  return config ? config.label : status;
};

const formatPriority = (priority: string) => {
  const config = deliverablePriorityConfig[priority as keyof typeof deliverablePriorityConfig];
  return config ? config.label : priority;
};

// Función para verificar si un entregable tiene fechas planificadas válidas
const hasValidPlannedDates = (deliverable: DeliverableDetailedResponseDto): boolean => {
  return !!(deliverable.startDate && deliverable.endDate);
};

// Crear el column helper
const columnHelper = createColumnHelper<DeliverableDetailedResponseDto>();

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
  milestoneStatus, // ✅ Agregar milestoneStatus
}: TableDeliverablesPhaseProps) {
  const { open } = useDialogStore();

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

  // Función para manejar el toggle de aprobación
  const handleToggleApproval = (deliverable: DeliverableDetailedResponseDto) => {
    // Solo permitir aprobar si no está aprobado
    if (!deliverable.isApproved) {
      open(MODULE_DELIVERABLES_PHASE, "approve", deliverable);
    }
  };
  // Función para manejar la selección de precedente
  const handlePrecedentSelect = (deliverableId: string, selectedPrecedentId: string) => {
    console.log("%c[Precedencia seleccionada]", "color: #4ade80; font-weight: bold;", {
      projectId,
      phaseId,
      deliverable: deliverableId,
      selectedPrecedent: selectedPrecedentId,
    });
    setOpenDropdowns((prev) => ({ ...prev, [deliverableId]: false }));

    // Si selectedPrecedentId está vacío, remover precedente
    if (!selectedPrecedentId) {
      console.log("%c[Eliminando precedencia]", "color: #ef4444; font-weight: bold;", {
        projectId,
        phaseId,
        deliverableId,
        action: "DELETE precedent",
        message: "Precedente será eliminado (actualmente solo log)",
      });
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
    return milestoneStatus !== "CREATED";
  };

  // Verificar si TODOS los entregables tienen fechas planificadas para mostrar la columna de aprobación
  const hasAllDeliverablesWithDates = React.useMemo(() => {
    return deliverables.length > 0 && deliverables.every((deliverable) => hasValidPlannedDates(deliverable));
  }, [deliverables]);

  // Definir las columnas
  const columns = React.useMemo<ColumnDef<DeliverableDetailedResponseDto, any>[]>(() => {
    const baseColumns = [
      columnHelper.accessor("name", {
        id: "nombre",
        header: "Nombre",
        cell: ({ getValue, row }) => {
          const name = getValue();
          const status = row.original.status;
          const config = deliverableStatusConfig[status as keyof typeof deliverableStatusConfig];
          const IconComponent = config?.icon;
          return (
            <div className="flex flex-col space-y-1">
              <span className="font-medium text-foreground">{name || "Sin nombre"}</span>
              <Badge
                variant="outline"
                className={cn("gap-1", config?.className, config?.textClass, config?.borderColor)}
              >
                {IconComponent && <IconComponent className={cn("h-3 w-3", config?.iconClass)} />}
                {formatStatus(status)}
              </Badge>
            </div>
          );
        },
      }),
      columnHelper.accessor("priority", {
        id: "prioridad",
        header: "Prioridad",
        cell: ({ getValue }) => {
          const priority = getValue();
          const config = deliverablePriorityConfig[priority as keyof typeof deliverablePriorityConfig];
          const IconComponent = config?.icon;

          return (
            <Badge variant="outline" className={cn("gap-1", config?.className, config?.textClass, config?.borderColor)}>
              {IconComponent && <IconComponent className={cn("h-3 w-3", config?.iconClass)} />}
              {formatPriority(priority)}
            </Badge>
          );
        },
      }),
      columnHelper.display({
        id: "precedences",
        header: "Precedencias",
        cell: ({ row }) => {
          return (
            <PrecedenceColumn
              deliverable={row.original}
              rowIndex={row.index}
              allDeliverables={deliverables}
              openDropdowns={openDropdowns}
              setOpenDropdowns={setOpenDropdowns}
              onPrecedentSelect={handlePrecedentSelect}
            />
          );
        },
      }),

      columnHelper.display({
        id: "dateRange",
        header: "Fecha de Inicio y Fin - Planificado",
        cell: ({ row }) => {
          const startDate = row.original.startDate;
          const endDate = row.original.endDate;
          const deliverableId = row.original.id;
          const isReadOnly = milestoneStatus === "VALIDATED"; // ✅ Determinar si es readOnly

          return (
            <div className="w-fit" onClick={(e) => e.stopPropagation()}>
              <DatePickerWithRange
                initialValue={
                  startDate || endDate
                    ? {
                        from: startDate ? new Date(startDate) : undefined,
                        to: endDate ? new Date(endDate) : undefined,
                      }
                    : undefined
                }
                onConfirm={(dateRange) => {
                  handleDateUpdate(deliverableId, dateRange?.from, dateRange?.to);
                }}
                placeholder={
                  isReadOnly ? "Período validado" : startDate && endDate ? "Editar período" : "Seleccionar período"
                }
                size="sm"
                className="w-full"
                confirmText="Guardar período"
                clearText="Limpiar período"
                cancelText="Cancelar"
                // Limitadores de fechas de la fase
                fromDate={phaseStartDate ? new Date(phaseStartDate) : undefined}
                toDate={phaseEndDate ? new Date(phaseEndDate) : undefined}
                showHolidays={true}
                readOnly={isReadOnly} // ✅ Aplicar readOnly
              />
            </div>
          );
        },
      }),

      // Columnas de fechas reales - solo se muestran cuando milestone status NO es "CREATED"
      ...(shouldShowActualDateColumns()
        ? [
            columnHelper.display({
              id: "actualStartDate",
              header: "Fecha de Inicio - Ejecutado",
              cell: ({ row }) => {
                const actualStartDate = row.original.actualStartDate;
                const deliverableId = row.original.id;
                const deliverable = row.original;
                const isEnabled = shouldEnableActualDates(deliverable);

                return (
                  <div className="w-fit" onClick={(e) => e.stopPropagation()}>
                    <DatePicker
                      selected={actualStartDate ? new Date(actualStartDate) : undefined}
                      onSelect={(date) => handleActualStartDateUpdate(deliverableId, date)}
                      placeholder={"Seleccionar inicio"}
                      disabled={!isEnabled}
                      className="w-full min-w-[140px]"
                      // actualStartDate no puede ser posterior a actualEndDate
                      toDate={deliverable.actualEndDate ? new Date(deliverable.actualEndDate) : undefined}
                    />
                  </div>
                );
              },
            }),
            columnHelper.display({
              id: "actualEndDate",
              header: "Fecha de Fin - Ejecutado",
              cell: ({ row }) => {
                const actualEndDate = row.original.actualEndDate;
                const deliverableId = row.original.id;
                const deliverable = row.original;
                const isEnabled = shouldEnableActualDates(deliverable);

                return (
                  <div className="w-fit" onClick={(e) => e.stopPropagation()}>
                    <DatePicker
                      selected={actualEndDate ? new Date(actualEndDate) : undefined}
                      onSelect={(date) => handleActualEndDateUpdate(deliverableId, date)}
                      placeholder={"Seleccionar fin"}
                      disabled={!isEnabled}
                      className="w-full min-w-[140px]"
                      // actualEndDate no puede ser anterior a actualStartDate
                      fromDate={deliverable.actualStartDate ? new Date(deliverable.actualStartDate) : undefined}
                    />
                  </div>
                );
              },
            }),
          ]
        : []),
      // Columna de aprobación - solo se incluye si TODOS los entregables tienen fechas planificadas
      ...(hasAllDeliverablesWithDates
        ? [
            columnHelper.display({
              id: "approval",
              header: "Aprobación",
              cell: ({ row }) => {
                const deliverable = row.original;
                const isApproved = deliverable.isApproved || false;

                return (
                  <div onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant={isApproved ? "default" : "outline"}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleApproval(deliverable);
                      }}
                      disabled={isApproved}
                      className={cn("gap-2", isApproved ? " cursor-not-allowed" : "")}
                    >
                      {isApproved ? (
                        <>
                          <CheckCheck className="h-4 w-4" />
                          Válido
                        </>
                      ) : (
                        <>
                          <CheckCheck className="h-4 w-4" />
                          Validar
                        </>
                      )}
                    </Button>
                  </div>
                );
              },
            }),
          ]
        : []),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const deliverable = row.original;

          return (
            <div onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => open(MODULE_DELIVERABLES_PHASE, "edit", deliverable)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => open(MODULE_DELIVERABLES_PHASE, "create-incident", deliverable)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar incidencias
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => open(MODULE_DELIVERABLES_PHASE, "delete", deliverable)}>
                    <Trash className="w-4 h-4 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      }),
    ];

    return baseColumns;
  }, [
    projectId,
    phaseId,
    updateDeliverable,
    open,
    handleActualStartDateUpdate,
    handleActualEndDateUpdate,
    handleToggleApproval,
    phaseStartDate,
    phaseEndDate,
    hasAllDeliverablesWithDates,
    milestoneStatus,
    deliverables, // ✅ Agregar deliverables para las funciones de precedencia
  ]);

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
      renderDetailsPanel={(deliverable) => <DeliverableDetailsPanel deliverable={deliverable} />}
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
