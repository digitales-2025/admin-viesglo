"use client";

import React from "react";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { CheckCheck, Edit, MoreHorizontal, Plus, Trash } from "lucide-react";

import { EnumAction, EnumResource } from "@/app/dashboard/admin/settings/_types/roles.types";
import { PermissionProtected } from "@/shared/components/protected-component";
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
import { DeliverableDetailedResponseDto } from "../../../../_types";
import { deliverablePriorityConfig, deliverableStatusConfig } from "../../../../_utils/projects.utils";
import { MODULE_DELIVERABLES_PHASE } from "./deliverables-phase-overlays/DeliverablesPhaseOverlays";
import { PrecedenceColumn } from "./PrecedenceColumn";

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

interface DeliverablesPhaseColumnsProps {
  projectId: string;
  phaseId: string;
  deliverables: DeliverableDetailedResponseDto[];
  milestoneStatus?: string;
  phaseStartDate?: string;
  phaseEndDate?: string;
  // Funciones de manejo
  handleDateUpdate: (deliverableId: string, startDate?: Date, endDate?: Date) => void;
  handleActualStartDateUpdate: (deliverableId: string, date?: Date) => void;
  handleActualEndDateUpdate: (deliverableId: string, date?: Date) => void;
  handleActualEndDateConfirm: (deliverableId: string, date?: Date) => void;
  handleToggleApproval: (deliverable: DeliverableDetailedResponseDto) => void;
  handlePrecedentSelect: (deliverableId: string, selectedPrecedentId: string) => void;
  // Estados
  openDropdowns: Record<string, boolean>;
  setOpenDropdowns: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  // Funciones de validación
  shouldEnableActualDates: (deliverable: DeliverableDetailedResponseDto) => boolean;
  shouldShowActualDateColumns: () => boolean;
  shouldShowApprovalColumn: boolean;
}

export function DeliverablesPhaseColumns({
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
}: DeliverablesPhaseColumnsProps) {
  const { open } = useDialogStore();

  return React.useMemo<ColumnDef<DeliverableDetailedResponseDto, any>[]>(() => {
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
              milestoneStatus={milestoneStatus}
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
          const isReadOnly = milestoneStatus !== "PLANNING";

          return (
            <div className="w-fit" onClick={(e) => e.stopPropagation()}>
              <PermissionProtected
                permissions={[
                  { resource: EnumResource.deliverables, action: EnumAction.update },
                  { resource: EnumResource.deliverables, action: EnumAction.delete },
                ]}
                requireAll={false}
                hideOnUnauthorized={false} // Mostrar siempre, pero en readonly si no tiene permisos
                fallback={
                  <DatePickerWithRange
                    initialValue={
                      startDate || endDate
                        ? {
                            from: startDate ? new Date(startDate) : undefined,
                            to: endDate ? new Date(endDate) : undefined,
                          }
                        : undefined
                    }
                    placeholder={
                      isReadOnly ? "Período validado" : startDate && endDate ? "Editar período" : "Seleccionar período"
                    }
                    size="sm"
                    className="w-full"
                    // Limitadores de fechas de la fase
                    fromDate={phaseStartDate ? new Date(phaseStartDate) : undefined}
                    toDate={phaseEndDate ? new Date(phaseEndDate) : undefined}
                    showHolidays={true}
                    readOnly={true} // Readonly si no tiene permisos
                  />
                }
              >
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
                  // Readonly si no tiene permisos O si el milestone no está en PLANNING
                  readOnly={isReadOnly}
                />
              </PermissionProtected>
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
                      readOnly={milestoneStatus === "OFFICIALLY_APPROVED"}
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
                      onConfirm={(date) => handleActualEndDateConfirm(deliverableId, date)}
                      placeholder={"Seleccionar fin"}
                      disabled={!isEnabled}
                      className="w-full min-w-[140px]"
                      // actualEndDate no puede ser anterior a actualStartDate
                      fromDate={deliverable.actualStartDate ? new Date(deliverable.actualStartDate) : undefined}
                      readOnly={deliverable.status === "FINISHED"}
                      // Activar botón de confirmación solo para actualEndDate
                      showConfirmButton={true}
                      confirmText="Guardar fecha"
                      cancelText="Cancelar"
                    />
                  </div>
                );
              },
            }),
          ]
        : []),
      // Columna de aprobación - solo se incluye si TODOS los entregables tienen fechas planificadas Y el usuario tiene permisos Y no todos están aprobados
      ...(shouldShowApprovalColumn
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
              <PermissionProtected
                permissions={[
                  { resource: EnumResource.deliverables, action: EnumAction.update },
                  { resource: EnumResource.deliverables, action: EnumAction.delete },
                ]}
                requireAll={false}
                hideOnUnauthorized={true} // Ocultar completamente si no tiene permisos
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <PermissionProtected
                      permissions={[
                        { resource: EnumResource.deliverables, action: EnumAction.update },
                        { resource: EnumResource.deliverables, action: EnumAction.delete },
                      ]}
                      requireAll={false}
                      hideOnUnauthorized={true}
                    >
                      <DropdownMenuItem
                        onClick={() => open(MODULE_DELIVERABLES_PHASE, "edit", deliverable)}
                        disabled={milestoneStatus !== "PLANNING"}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                    </PermissionProtected>

                    <PermissionProtected
                      permissions={[
                        { resource: EnumResource.deliverables, action: EnumAction.update },
                        { resource: EnumResource.deliverables, action: EnumAction.delete },
                      ]}
                      requireAll={false}
                      hideOnUnauthorized={true}
                    >
                      <DropdownMenuItem onClick={() => open(MODULE_DELIVERABLES_PHASE, "create-incident", deliverable)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar incidencias
                      </DropdownMenuItem>
                    </PermissionProtected>

                    <PermissionProtected
                      permissions={[{ resource: EnumResource.deliverables, action: EnumAction.delete }]}
                      requireAll={false}
                      hideOnUnauthorized={true}
                    >
                      <DropdownMenuItem
                        onClick={() => open(MODULE_DELIVERABLES_PHASE, "delete", deliverable)}
                        disabled={milestoneStatus !== "PLANNING"}
                      >
                        <Trash className="w-4 h-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </PermissionProtected>
                  </DropdownMenuContent>
                </DropdownMenu>
              </PermissionProtected>
            </div>
          );
        },
      }),
    ];

    return baseColumns;
  }, [
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
    open,
  ]);
}
