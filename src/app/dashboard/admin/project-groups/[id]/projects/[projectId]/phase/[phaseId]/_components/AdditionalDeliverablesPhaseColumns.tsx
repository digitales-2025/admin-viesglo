"use client";

import React from "react";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Edit, MoreHorizontal, Trash } from "lucide-react";

import { EnumAction, EnumResource } from "@/app/dashboard/admin/settings/_types/roles.types";
import { PermissionProtected } from "@/shared/components/protected-component";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { DatePicker } from "@/shared/components/ui/date-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { cn } from "@/shared/lib/utils";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { AdditionalDeliverableDetailedResponseDto } from "../../../../_types";
import { deliverableStatusConfig } from "../../../../_utils/projects.utils";
import { MODULE_ADDITIONAL_DELIVERABLES_PHASE } from "./additional-deliverables-phase-overlays/AdditionalDeliverablesPhaseOverlays";

// Funciones auxiliares
const formatStatus = (status: string) => {
  const config = deliverableStatusConfig[status as keyof typeof deliverableStatusConfig];
  return config ? config.label : status;
};

// Crear el column helper
const columnHelper = createColumnHelper<AdditionalDeliverableDetailedResponseDto>();

interface AdditionalDeliverablesPhaseColumnsProps {
  projectId: string;
  phaseId: string;
  additionalDeliverables: AdditionalDeliverableDetailedResponseDto[];
  milestoneStatus?: string;
  // Funciones de manejo
  handleActualStartDateUpdate: (additionalDeliverableId: string, date?: Date) => void;
  handleActualEndDateUpdate: (additionalDeliverableId: string, date?: Date) => void;
  handleActualEndDateConfirm: (additionalDeliverableId: string, date?: Date) => void;
  // Funciones de validación
  shouldEnableActualDates: () => boolean;
  shouldShowActualDateColumns: () => boolean;
}

export function AdditionalDeliverablesPhaseColumns({
  projectId,
  phaseId,
  additionalDeliverables,
  milestoneStatus,
  handleActualStartDateUpdate,
  handleActualEndDateUpdate,
  handleActualEndDateConfirm,
  shouldEnableActualDates,
  shouldShowActualDateColumns,
}: AdditionalDeliverablesPhaseColumnsProps) {
  const { open } = useDialogStore();

  return React.useMemo<ColumnDef<AdditionalDeliverableDetailedResponseDto, any>[]>(() => {
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

      columnHelper.accessor("description", {
        id: "descripcion",
        header: "Descripción",
        cell: ({ getValue }) => {
          const description = getValue();
          return (
            <div className="max-w-xs">
              <p className="text-sm text-muted-foreground truncate">{description || "Sin descripción"}</p>
            </div>
          );
        },
      }),

      // Columnas de fechas reales - solo se muestran cuando milestone status es "VALIDATED"
      ...(shouldShowActualDateColumns()
        ? [
            columnHelper.display({
              id: "actualStartDate",
              header: "Fecha de Inicio - Ejecutado",
              cell: ({ row }) => {
                const actualStartDate = row.original.actualStartDate;
                const additionalDeliverableId = row.original.id;
                const additionalDeliverable = row.original;
                const isEnabled = shouldEnableActualDates();

                return (
                  <div className="w-fit" onClick={(e) => e.stopPropagation()}>
                    <DatePicker
                      selected={actualStartDate ? new Date(actualStartDate) : undefined}
                      onSelect={(date) => handleActualStartDateUpdate(additionalDeliverableId, date)}
                      placeholder={"Seleccionar inicio"}
                      disabled={!isEnabled}
                      className="w-full min-w-[140px]"
                      // actualStartDate no puede ser posterior a actualEndDate
                      toDate={
                        additionalDeliverable.actualEndDate ? new Date(additionalDeliverable.actualEndDate) : undefined
                      }
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
                const additionalDeliverableId = row.original.id;
                const additionalDeliverable = row.original;
                const isEnabled = shouldEnableActualDates();

                return (
                  <div className="w-fit" onClick={(e) => e.stopPropagation()}>
                    <DatePicker
                      selected={actualEndDate ? new Date(actualEndDate) : undefined}
                      onSelect={(date) => handleActualEndDateUpdate(additionalDeliverableId, date)}
                      onConfirm={(date) => handleActualEndDateConfirm(additionalDeliverableId, date)}
                      placeholder={"Seleccionar fin"}
                      disabled={!isEnabled}
                      className="w-full min-w-[140px]"
                      // actualEndDate no puede ser anterior a actualStartDate
                      fromDate={
                        additionalDeliverable.actualStartDate
                          ? new Date(additionalDeliverable.actualStartDate)
                          : undefined
                      }
                      readOnly={additionalDeliverable.status === "FINISHED"}
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

      columnHelper.display({
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const additionalDeliverable = row.original;

          return (
            <div onClick={(e) => e.stopPropagation()}>
              <PermissionProtected
                permissions={[
                  { resource: EnumResource.deliverables, action: EnumAction.write },
                  { resource: EnumResource.deliverables, action: EnumAction.manage },
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
                        { resource: EnumResource.deliverables, action: EnumAction.write },
                        { resource: EnumResource.deliverables, action: EnumAction.manage },
                      ]}
                      requireAll={false}
                      hideOnUnauthorized={true}
                    >
                      <DropdownMenuItem
                        onClick={() => open(MODULE_ADDITIONAL_DELIVERABLES_PHASE, "edit", additionalDeliverable)}
                        disabled={milestoneStatus === "OFFICIALLY_APPROVED"}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                    </PermissionProtected>

                    <PermissionProtected
                      permissions={[{ resource: EnumResource.deliverables, action: EnumAction.manage }]}
                      requireAll={false}
                      hideOnUnauthorized={true}
                    >
                      <DropdownMenuItem
                        onClick={() => open(MODULE_ADDITIONAL_DELIVERABLES_PHASE, "delete", additionalDeliverable)}
                        disabled={milestoneStatus === "OFFICIALLY_APPROVED"}
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
    additionalDeliverables,
    milestoneStatus,
    handleActualStartDateUpdate,
    handleActualEndDateUpdate,
    handleActualEndDateConfirm,
    shouldEnableActualDates,
    shouldShowActualDateColumns,
    open,
  ]);
}
