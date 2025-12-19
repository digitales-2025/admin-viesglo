import React from "react";
import { Edit, MoreHorizontal, Trash } from "lucide-react";

import { useProfile } from "@/app/(public)/auth/sign-in/_hooks/use-auth";
import { EnumAction, EnumResource } from "@/app/dashboard/admin/settings/_types/roles.types";
import { components } from "@/lib/api/types/api";
import { PermissionProtected } from "@/shared/components/protected-component";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { DatePickerWithRange } from "@/shared/components/ui/date-range-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Progress } from "@/shared/components/ui/progress";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { PhaseDetailedResponseDto } from "../../_types";
import { MODULE_PHASES_PROJECT } from "./phases-project-overlays/PhasesProjectOverlays";

type UserSummaryResponseDto = components["schemas"]["UserSummaryResponseDto"];

export type SimpleColumnDef<TRow> = {
  key: keyof TRow | "actions";
  header: React.ReactNode;
  render?: (row: TRow) => React.ReactNode;
  className?: string;
};

// Componente para la celda de período que puede usar hooks
interface PeriodCellProps {
  phase: PhaseDetailedResponseDto;
  onDateUpdate?: (phaseId: string, startDate?: Date, endDate?: Date) => void;
  milestoneStartDate?: string;
  milestoneEndDate?: string;
  milestoneStatus?: string;
  milestoneAssignedUser?: UserSummaryResponseDto | null;
}

function PeriodCell({
  phase,
  onDateUpdate,
  milestoneStartDate,
  milestoneEndDate,
  milestoneStatus,
  milestoneAssignedUser,
}: PeriodCellProps) {
  const { data: currentUser } = useProfile();

  const startDate = phase.startDate;
  const endDate = phase.endDate;
  const phaseId = phase.id;

  // Verificar si el usuario actual es el asignado al milestone
  const isCurrentUserAssigned = Boolean(
    currentUser?.id && milestoneAssignedUser?.userId && currentUser.id === milestoneAssignedUser.userId
  );

  // Permitir editar si:
  // 1. El milestone está en PLANNING, O
  // 2. El usuario actual es el asignado al milestone
  const canEdit = milestoneStatus === "PLANNING" || isCurrentUserAssigned;

  return (
    <div className="w-64" onClick={(e) => e.stopPropagation()}>
      <PermissionProtected
        permissions={[
          { resource: EnumResource.phases, action: EnumAction.update },
          { resource: EnumResource.phases, action: EnumAction.delete },
        ]}
        requireAll={false}
        hideOnUnauthorized={false} // Mostrar siempre, pero en readonly si no tiene permisos
        forceAuthorized={isCurrentUserAssigned} // Forzar autorización si el usuario es el asignado
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
              milestoneStatus === "VALIDATED"
                ? "Período validado"
                : startDate && endDate
                  ? "Editar período"
                  : "Seleccionar período"
            }
            size="sm"
            className="w-full"
            // Limitadores de fechas del milestone
            fromDate={milestoneStartDate ? new Date(milestoneStartDate) : undefined}
            toDate={milestoneEndDate ? new Date(milestoneEndDate) : undefined}
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
            onDateUpdate?.(phaseId, dateRange?.from, dateRange?.to);
          }}
          placeholder={
            milestoneStatus === "VALIDATED"
              ? "Período validado"
              : startDate && endDate
                ? "Editar período"
                : "Seleccionar período"
          }
          size="sm"
          className="w-full"
          confirmText="Guardar período"
          clearText="Limpiar período"
          cancelText="Cancelar"
          // Limitadores de fechas del milestone
          fromDate={milestoneStartDate ? new Date(milestoneStartDate) : undefined}
          toDate={milestoneEndDate ? new Date(milestoneEndDate) : undefined}
          showHolidays={true}
          // Readonly si no tiene permisos O si no puede editar (no está en PLANNING y no es el asignado)
          readOnly={!canEdit}
        />
      </PermissionProtected>
    </div>
  );
}

interface PhasesProjectColumnsProps {
  onDateUpdate?: (phaseId: string, startDate?: Date, endDate?: Date) => void;
  milestoneStartDate?: string;
  milestoneEndDate?: string;
  milestoneStatus?: string;
  milestoneAssignedUser?: UserSummaryResponseDto | null;
}

export function getPhasesProjectColumns({
  onDateUpdate,
  milestoneStartDate,
  milestoneEndDate,
  milestoneStatus,
  milestoneAssignedUser,
}: PhasesProjectColumnsProps = {}): Array<SimpleColumnDef<PhaseDetailedResponseDto>> {
  return [
    {
      key: "name",
      header: "Nombre de la Fase",
      render: (phase: PhaseDetailedResponseDto) => (
        <div className="space-y-1">
          <div className="font-medium text-sm">{phase.name}</div>
        </div>
      ),
      className: "min-w-[200px]",
    },
    {
      key: "progress",
      header: "Progreso",
      render: (phase: PhaseDetailedResponseDto) => (
        <div className="space-y-2 w-32">
          <div className="flex items-center justify-between text-xs">
            <span>{phase.progress}%</span>
            <span className="text-muted-foreground">
              {phase.completedDeliverablesCount}/{phase.deliverablesCount}
            </span>
          </div>
          <Progress value={phase.progress} className="h-2" />
        </div>
      ),
      className: "w-32",
    },
    {
      key: "deliverables",
      header: "Entregables",
      render: (phase: PhaseDetailedResponseDto) => {
        const total = phase.deliverables?.length ?? phase.deliverablesCount ?? 0;
        const completed = phase.completedDeliverablesCount ?? 0;
        const openDeliverablesDrawer = () => {
          useDialogStore.getState().open("DELIVERABLES_LIST", "view", { phase });
        };

        return (
          <div className="flex items-center gap-2 text-xs" onClick={(e) => e.stopPropagation()}>
            <Badge variant="outline" className="text-xs cursor-pointer" onClick={openDeliverablesDrawer}>
              {completed}/{total}
            </Badge>
            <span className="text-muted-foreground">entregables</span>
          </div>
        );
      },
      className: "min-w-[120px]",
    },
    {
      key: "startDate",
      header: "Período",
      render: (phase: PhaseDetailedResponseDto) => (
        <PeriodCell
          phase={phase}
          onDateUpdate={onDateUpdate}
          milestoneStartDate={milestoneStartDate}
          milestoneEndDate={milestoneEndDate}
          milestoneStatus={milestoneStatus}
          milestoneAssignedUser={milestoneAssignedUser}
        />
      ),
      className: "min-w-[280px]",
    },
    {
      key: "actualEndDate",
      header: "Estado",
      render: (phase: PhaseDetailedResponseDto) => {
        const getStatusBadge = (progress: number) => {
          if (progress === 0) {
            return (
              <Badge variant="outline" className="text-xs">
                No iniciado
              </Badge>
            );
          } else if (progress === 100) {
            return (
              <Badge variant="default" className="text-xs">
                Completado
              </Badge>
            );
          } else if (progress > 0) {
            return (
              <Badge variant="secondary" className="text-xs">
                En progreso
              </Badge>
            );
          }
          return (
            <Badge variant="outline" className="text-xs">
              Pendiente
            </Badge>
          );
        };

        return getStatusBadge(phase.progress);
      },
      className: "w-24",
    },
    {
      key: "actions",
      header: "",
      render: (phase: PhaseDetailedResponseDto) => {
        const open = useDialogStore.getState().open;

        return (
          <div onClick={(e) => e.stopPropagation()}>
            <PermissionProtected
              permissions={[
                { resource: EnumResource.phases, action: EnumAction.update },
                { resource: EnumResource.phases, action: EnumAction.delete },
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
                      { resource: EnumResource.phases, action: EnumAction.update },
                      { resource: EnumResource.phases, action: EnumAction.delete },
                    ]}
                    requireAll={false}
                    hideOnUnauthorized={true}
                  >
                    <DropdownMenuItem onClick={() => open(MODULE_PHASES_PROJECT, "edit", phase)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                  </PermissionProtected>

                  <PermissionProtected
                    permissions={[{ resource: EnumResource.phases, action: EnumAction.delete }]}
                    requireAll={false}
                    hideOnUnauthorized={true}
                  >
                    <DropdownMenuItem onClick={() => open(MODULE_PHASES_PROJECT, "delete", phase)}>
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
      className: "w-12",
    },
  ];
}
