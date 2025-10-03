"use client";

import React from "react";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Edit, MoreHorizontal, Plus, Trash } from "lucide-react";

import { DataTable } from "@/shared/components/data-table/data-table";
import { ServerPaginationTanstackTableConfig } from "@/shared/components/data-table/types/CustomPagination";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
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
import { useUpdateDeliverable } from "../../../../_hooks/use-project-deliverables";
import { DeliverableDetailedResponseDto } from "../../../../_types";
import { deliverablePriorityConfig, deliverableStatusConfig } from "../../../../_utils/projects.utils";
import { DeliverableDetailsPanel } from "./DeliverableDetailsPanel";
import { MODULE_DELIVERABLES_PHASE } from "./deliverables-phase-overlays/DeliverablesPhaseOverlays";

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
}: TableDeliverablesPhaseProps) {
  const { open } = useDialogStore();
  const { mutate: updateDeliverable } = useUpdateDeliverable();

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

  // Definir las columnas
  const columns = React.useMemo<ColumnDef<DeliverableDetailedResponseDto, any>[]>(
    () => [
      columnHelper.accessor("name", {
        id: "nombre",
        header: "Nombre",
        cell: ({ getValue, row }) => {
          const name = getValue();
          const description = row.original.description;
          return (
            <div className="flex flex-col space-y-1">
              <span className="font-medium text-foreground">{name || "Sin nombre"}</span>
              <span className="text-sm text-muted-foreground line-clamp-2">{description || "Sin descripción"}</span>
            </div>
          );
        },
      }),
      columnHelper.accessor("status", {
        id: "estado",
        header: "Estado",
        cell: ({ getValue }) => {
          const status = getValue();
          const config = deliverableStatusConfig[status as keyof typeof deliverableStatusConfig];
          const IconComponent = config?.icon;

          return (
            <Badge variant="outline" className={cn("gap-1", config?.className, config?.textClass, config?.borderColor)}>
              {IconComponent && <IconComponent className={cn("h-3 w-3", config?.iconClass)} />}
              {formatStatus(status)}
            </Badge>
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
        id: "dateRange",
        header: "Período",
        cell: ({ row }) => {
          const startDate = row.original.startDate;
          const endDate = row.original.endDate;
          const deliverableId = row.original.id;

          return (
            <div className="w-fit">
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
                placeholder={startDate && endDate ? "Editar período" : "Seleccionar período"}
                size="sm"
                className="w-full"
                confirmText="Guardar período"
                clearText="Limpiar período"
                cancelText="Cancelar"
              />
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const deliverable = row.original;

          return (
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
          );
        },
      }),
    ],
    [handleDateUpdate, open]
  );

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
