"use client";

import React, { useState } from "react";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Edit, MoreHorizontal, Trash } from "lucide-react";

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

  // Estado para controlar los dropdowns de precedencias
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});

  // Función para manejar la selección de precedente
  const handlePrecedentSelect = (deliverableId: string, selectedPrecedentId: string) => {
    console.log(`Entregable ${deliverableId} -> Precedente seleccionado:`, selectedPrecedentId);
    setOpenDropdowns((prev) => ({ ...prev, [deliverableId]: false }));
    // TODO: lógica para actualizar en backend
  };

  // Función para encontrar el entregable precedente por ID
  const findPrecedentDeliverable = (id: string) => {
    return deliverables.find((deliverable) => deliverable.id === id);
  };

  // Función para manejar la actualización del período completo
  const handleDateUpdate = (deliverableId: string, startDate?: Date, endDate?: Date) => {
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
  };

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
        id: "precedences",
        header: "Precedencias",
        cell: ({ row }) => {
          const precedentId = (row.original as any).precedentId;
          const rowIndex = row.index;
          const currentDeliverableId = row.original.id;

          // Si es el primer elemento (índice 0)
          if (rowIndex === 0) {
            return (
              <Badge variant="outline" className="text-xs text-green-700 border-green-500 h-8 px-3">
                No requiere precedente
              </Badge>
            );
          }

          // Si no tiene precedente - mostrar opción para asignar
          if (!precedentId) {
            return (
              <DropdownMenu
                open={openDropdowns[currentDeliverableId]}
                onOpenChange={(open) => setOpenDropdowns((prev) => ({ ...prev, [currentDeliverableId]: open }))}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs cursor-pointer hover:bg-muted transition-colors"
                  >
                    Asignar precedente
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="start" className="w-72 max-h-72 overflow-y-auto">
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Seleccionar precedente
                  </div>

                  {deliverables
                    .filter((deliverable) => deliverable.id !== currentDeliverableId)
                    .map((deliverable) => {
                      const globalIndex = deliverables.findIndex((d) => d.id === deliverable.id) + 1; // +1 para usuario
                      return (
                        <DropdownMenuItem
                          key={deliverable.id}
                          onClick={() => handlePrecedentSelect(currentDeliverableId, deliverable.id)}
                          className="cursor-pointer flex items-start gap-2 py-2"
                        >
                          {/* Índice mostrado desde 1 */}
                          <span className="text-[10px] font-semibold text-muted-foreground w-5 text-right pt-0.5">
                            {globalIndex}
                          </span>

                          <div className="flex flex-col">
                            <span className="font-medium text-sm leading-tight truncate">
                              {deliverable.name || "Sin nombre"}
                            </span>
                            <span className="text-xs text-muted-foreground truncate">
                              {deliverable.description || "Sin descripción"}
                            </span>
                          </div>
                        </DropdownMenuItem>
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            );
          }

          // Si tiene precedente
          const precedentDeliverable = findPrecedentDeliverable(precedentId);
          const precedentIndex = deliverables.findIndex((d) => d.id === precedentDeliverable?.id) + 1; // también +1 aquí

          return (
            <div className="relative flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs h-8 px-3">
                #{precedentIndex} {precedentDeliverable?.name || `ID: ${precedentId}`}
              </Badge>

              <DropdownMenu
                open={openDropdowns[currentDeliverableId]}
                onOpenChange={(open) => setOpenDropdowns((prev) => ({ ...prev, [currentDeliverableId]: open }))}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-muted transition-colors"
                    title="Editar precedente"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="start" className="w-72 max-h-72 overflow-y-auto">
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Cambiar precedente
                  </div>

                  {deliverables
                    .filter((d) => d.id !== currentDeliverableId)
                    .map((deliverable) => {
                      const globalIndex = deliverables.findIndex((d) => d.id === deliverable.id) + 1;
                      return (
                        <DropdownMenuItem
                          key={deliverable.id}
                          onClick={() => handlePrecedentSelect(currentDeliverableId, deliverable.id)}
                          className="cursor-pointer flex items-start gap-2 py-2"
                        >
                          <span className="text-[10px] font-semibold text-muted-foreground w-5 text-right pt-0.5">
                            {globalIndex}
                          </span>

                          <div className="flex flex-col">
                            <span className="font-medium text-sm leading-tight truncate">
                              {deliverable.name || "Sin nombre"}
                            </span>
                            <span className="text-xs text-muted-foreground truncate">
                              {deliverable.description || "Sin descripción"}
                            </span>
                          </div>
                        </DropdownMenuItem>
                      );
                    })}

                  <div className="border-t my-1" />

                  <DropdownMenuItem
                    onClick={() => handlePrecedentSelect(currentDeliverableId, "")}
                    className="cursor-pointer flex items-center gap-2 py-2 hover:bg-muted"
                  >
                    <Trash className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Quitar precedente</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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
    [
      projectId,
      phaseId,
      updateDeliverable,
      open,
      deliverables,
      handleDateUpdate,
      openDropdowns,
      handlePrecedentSelect,
      findPrecedentDeliverable,
    ]
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
