import React from "react";
import { CheckCircle, ChevronDown, ChevronUp, Edit, Ellipsis, PlusCircle, Trash } from "lucide-react";

import { EnumAction, EnumResource } from "@/app/dashboard/admin/settings/_types/roles.types";
import { PermissionProtected } from "@/shared/components/protected-component";
import { Button } from "@/shared/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { DatePickerWithRange } from "@/shared/components/ui/date-range-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { cn } from "@/shared/lib/utils";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { useUpdateMilestone } from "../_hooks/use-project-milestones";
import { useOpenMilestoneStore } from "../_stores/useOpenMilestoneStore";
import { MilestoneDetailedResponseDto } from "../../_types";
import { MilestoneAssigneeSelector } from "./MilestoneAssigneeSelector";
import { MODULE_MILESTONES_PROJECT } from "./milestones-project-overlays/MilestonesProjectOverlays";
import { MODULE_PHASES_PROJECT } from "./phases-project-overlays/PhasesProjectOverlays";
import TablePhasesProject from "./TablePhasesProject";

interface Props {
  milestone: MilestoneDetailedResponseDto;
  projectId: string;
  projectStartDate: string;
  projectEndDate: string;
  projectStatus: string;
}

function CardProjectMilestoneBase({ milestone, projectId, projectStartDate, projectEndDate, projectStatus }: Props) {
  const { open } = useDialogStore();
  const { openMilestoneId, toggleMilestone } = useOpenMilestoneStore();
  const { mutate: updateMilestone } = useUpdateMilestone();

  const expanded = openMilestoneId === milestone.id;

  // Función para manejar la actualización del período del hito
  const handleDateUpdate = (startDate?: Date, endDate?: Date) => {
    updateMilestone(
      {
        params: {
          path: {
            projectId,
            milestoneId: milestone.id,
          },
        },
        body: {
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
        },
      },
      {
        onError: (error: any) => {
          console.error("Error al actualizar período del hito:", error);
        },
      }
    );
  };

  return (
    <div className={cn("flex flex-col border rounded-lg", expanded && "bg-muted/20")}>
      <Card
        key={milestone.id}
        className={cn("p-4 border-none transition-colors cursor-pointer bg-background w-full hover:bg-muted/10")}
        onClick={() => toggleMilestone(milestone.id)}
      >
        <CardHeader className="p-0">
          <CardTitle className="grid grid-cols-[auto_1fr_auto] lg:grid-cols-[auto_1fr_auto_auto] w-full items-center gap-2 sm:gap-x-4 gap-y-2">
            {/* Chevron - Primera columna - SIEMPRE EN SU LUGAR */}
            <div className="flex justify-start items-center shrink-0 col-start-1 row-start-1">
              {expanded ? (
                <ChevronUp className="shrink-0 w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="shrink-0 w-4 h-4 text-muted-foreground" />
              )}
            </div>

            {/* Nombre del milestone - Segunda columna - SIEMPRE EN SU LUGAR, NUNCA SE MUEVE */}
            <div className="flex gap-2 items-center min-w-0 col-start-2 row-start-1 overflow-hidden">
              <span className="first-letter:capitalize font-medium wrap-break-word truncate">
                {milestone.name || "Sin nombre"}
              </span>
            </div>

            {/* Selector de asignado - Tercera columna */}
            <div
              className="flex items-center justify-end sm:justify-start gap-2 shrink-0 col-start-3 row-start-1 lg:col-start-3"
              onClick={(e) => e.stopPropagation()}
            >
              <PermissionProtected
                permissions={[
                  { resource: EnumResource.milestones, action: EnumAction.update },
                  { resource: EnumResource.milestones, action: EnumAction.delete },
                ]}
                requireAll={false}
                hideOnUnauthorized={false} // Mostrar siempre, pero en readonly si no tiene permisos
                fallback={
                  <MilestoneAssigneeSelector
                    projectId={projectId}
                    milestoneId={milestone.id}
                    currentAssignee={milestone.internalConsultant}
                    filterBySystemRolePositions={[2, 3]}
                    filterByActive={true}
                    avatarSize="md"
                    align="center"
                    readOnly={true} // Readonly si no tiene permisos
                  />
                }
              >
                <MilestoneAssigneeSelector
                  projectId={projectId}
                  milestoneId={milestone.id}
                  currentAssignee={milestone.internalConsultant}
                  filterBySystemRolePositions={[2, 3]}
                  filterByActive={true}
                  avatarSize="md"
                  align="center"
                  // Readonly si no tiene permisos O si el milestone no está en PLANNING
                  readOnly={milestone.status !== "PLANNING"}
                />
              </PermissionProtected>
            </div>
            {/* Acciones y controles - Cuarta columna - En móvil va a segunda fila, en desktop a la derecha */}
            <div className="flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-2 col-span-full lg:col-start-4 lg:col-end-5 row-start-2 lg:row-start-1 w-full sm:w-auto">
              <div className="flex items-center gap-2 w-full sm:w-auto" onClick={(e) => e.stopPropagation()}>
                <PermissionProtected
                  permissions={[
                    { resource: EnumResource.milestones, action: EnumAction.update },
                    { resource: EnumResource.milestones, action: EnumAction.delete },
                  ]}
                  requireAll={false}
                  hideOnUnauthorized={false} // Mostrar siempre, pero en readonly si no tiene permisos
                  fallback={
                    <DatePickerWithRange
                      initialValue={
                        milestone.startDate || milestone.endDate
                          ? {
                              from: milestone.startDate ? new Date(milestone.startDate) : undefined,
                              to: milestone.endDate ? new Date(milestone.endDate) : undefined,
                            }
                          : undefined
                      }
                      placeholder={
                        milestone.status === "VALIDATED"
                          ? "Período validado"
                          : milestone.startDate && milestone.endDate
                            ? "Editar período"
                            : "Seleccionar período"
                      }
                      className="w-full min-w-[200px] sm:min-w-[250px]"
                      // Limitadores de fechas del proyecto
                      fromDate={new Date(projectStartDate)}
                      toDate={new Date(projectEndDate)}
                      showHolidays={true}
                      readOnly={true} // Readonly si no tiene permisos
                    />
                  }
                >
                  <DatePickerWithRange
                    initialValue={
                      milestone.startDate || milestone.endDate
                        ? {
                            from: milestone.startDate ? new Date(milestone.startDate) : undefined,
                            to: milestone.endDate ? new Date(milestone.endDate) : undefined,
                          }
                        : undefined
                    }
                    onConfirm={(dateRange) => {
                      handleDateUpdate(dateRange?.from, dateRange?.to);
                    }}
                    placeholder={
                      milestone.status === "VALIDATED"
                        ? "Período validado"
                        : milestone.startDate && milestone.endDate
                          ? "Editar período"
                          : "Seleccionar período"
                    }
                    className="w-full min-w-[200px] sm:min-w-[250px]"
                    confirmText="Guardar período"
                    clearText="Limpiar período"
                    cancelText="Cancelar"
                    // Limitadores de fechas del proyecto
                    fromDate={new Date(projectStartDate)}
                    toDate={new Date(projectEndDate)}
                    showHolidays={true}
                    // Readonly si no tiene permisos O si el milestone no está en PLANNING
                    readOnly={milestone.status !== "PLANNING"}
                  />
                </PermissionProtected>

                {milestone.status === "OPERATIONALLY_COMPLETED" && (
                  <PermissionProtected
                    permissions={[{ resource: EnumResource.milestones, action: EnumAction.delete }]}
                    requireAll={false}
                    hideOnUnauthorized={true}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        open(MODULE_MILESTONES_PROJECT, "approve", milestone);
                      }}
                      title="Aprobar oficialmente el hito"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                  </PermissionProtected>
                )}
              </div>

              {milestone.status === "PLANNING" && (
                <PermissionProtected
                  permissions={[
                    { resource: EnumResource.phases, action: EnumAction.update },
                    { resource: EnumResource.phases, action: EnumAction.delete },
                  ]}
                  requireAll={false}
                  hideOnUnauthorized={true}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Expandir el milestone antes de abrir el dialog
                      if (!expanded) {
                        toggleMilestone(milestone.id);
                      }
                      open(MODULE_PHASES_PROJECT, "create");
                    }}
                  >
                    <PlusCircle className="w-4 h-4 sm:mr-1" />
                    <span className="hidden sm:inline">Agregar fase</span>
                  </Button>
                </PermissionProtected>
              )}

              <PermissionProtected
                permissions={[
                  { resource: EnumResource.milestones, action: EnumAction.update },
                  { resource: EnumResource.milestones, action: EnumAction.delete },
                ]}
                requireAll={false}
                hideOnUnauthorized={true}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Ellipsis className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <PermissionProtected
                      permissions={[
                        { resource: EnumResource.milestones, action: EnumAction.update },
                        { resource: EnumResource.milestones, action: EnumAction.delete },
                      ]}
                      requireAll={false}
                      hideOnUnauthorized={true}
                    >
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          open(MODULE_MILESTONES_PROJECT, "edit", milestone);
                        }}
                        disabled={milestone.status !== "PLANNING"}
                      >
                        Editar
                        <DropdownMenuShortcut>
                          <Edit className="w-4 h-4" />
                        </DropdownMenuShortcut>
                      </DropdownMenuItem>
                    </PermissionProtected>

                    <PermissionProtected
                      permissions={[
                        { resource: EnumResource.milestones, action: EnumAction.update },
                        { resource: EnumResource.milestones, action: EnumAction.delete },
                      ]}
                      requireAll={false}
                      hideOnUnauthorized={true}
                    >
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          open(MODULE_MILESTONES_PROJECT, "create-resource", milestone);
                        }}
                        disabled={projectStatus === "OFFICIALLY_COMPLETED"}
                      >
                        Agregar recursos
                        <DropdownMenuShortcut>
                          <PlusCircle className="w-4 h-4" />
                        </DropdownMenuShortcut>
                      </DropdownMenuItem>
                    </PermissionProtected>

                    <PermissionProtected
                      permissions={[{ resource: EnumResource.milestones, action: EnumAction.delete }]}
                      requireAll={false}
                      hideOnUnauthorized={true}
                    >
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          open(MODULE_MILESTONES_PROJECT, "delete", milestone);
                        }}
                        disabled={milestone.status !== "PLANNING"}
                      >
                        Eliminar
                        <DropdownMenuShortcut>
                          <Trash className="w-4 h-4" />
                        </DropdownMenuShortcut>
                      </DropdownMenuItem>
                    </PermissionProtected>
                  </DropdownMenuContent>
                </DropdownMenu>
              </PermissionProtected>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {expanded && (
        <div className="p-4 border-t">
          <TablePhasesProject milestone={milestone} projectId={projectId} />
        </div>
      )}
    </div>
  );
}

export default CardProjectMilestoneBase;
