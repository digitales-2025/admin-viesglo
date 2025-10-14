import { memo } from "react";
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
          <CardTitle className="grid grid-cols-[auto_auto_auto_auto] w-full grid-rows-4 lg:grid-cols-[auto_1fr_auto_auto_auto] xl:grid-cols-[auto_1fr_auto_auto] items-center gap-x-4 gap-y-1 xl:grid-rows-1 md:grid-rows-2">
            <div className="inline-flex justify-start items-start xl:order-1 ">
              {expanded ? (
                <ChevronUp className="shrink-0 w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="shrink-0 w-4 h-4 text-muted-foreground" />
              )}
            </div>
            <div className="inline-flex gap-2 items-center lg:order-2 col-span-3 order-4 lg:col-span-1">
              <span className="first-letter:capitalize font-medium">{milestone.name}</span>
            </div>
            <div
              className="inline-flex items-center gap-2 xl:order-3 order-5 lg:order-3"
              onClick={(e) => e.stopPropagation()}
            >
              <PermissionProtected
                permissions={[
                  { resource: EnumResource.milestones, action: EnumAction.write },
                  { resource: EnumResource.milestones, action: EnumAction.manage },
                ]}
                requireAll={false}
                hideOnUnauthorized={false} // Mostrar siempre, pero en readonly si no tiene permisos
                fallback={
                  <MilestoneAssigneeSelector
                    projectId={projectId}
                    milestoneId={milestone.id}
                    currentAssignee={milestone.internalConsultant}
                    filterBySystemRolePosition={3}
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
                  filterBySystemRolePosition={3}
                  filterByActive={true}
                  avatarSize="md"
                  align="center"
                  // Readonly si no tiene permisos O si el milestone no está en PLANNING
                  readOnly={milestone.status !== "PLANNING"}
                />
              </PermissionProtected>
            </div>
            <div className="inline-flex justify-end items-center gap-2 xl:order-4 order-3 lg:order-4 ">
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <PermissionProtected
                  permissions={[
                    { resource: EnumResource.milestones, action: EnumAction.write },
                    { resource: EnumResource.milestones, action: EnumAction.manage },
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
                      className="w-full"
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
                    className="w-full"
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
                    permissions={[{ resource: EnumResource.milestones, action: EnumAction.manage }]}
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
                    { resource: EnumResource.phases, action: EnumAction.write },
                    { resource: EnumResource.phases, action: EnumAction.manage },
                  ]}
                  requireAll={false}
                  hideOnUnauthorized={true}
                >
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Expandir el milestone antes de abrir el dialog
                      if (!expanded) {
                        toggleMilestone(milestone.id);
                      }
                      open(MODULE_PHASES_PROJECT, "create");
                    }}
                  >
                    <PlusCircle className="w-4 h-4 mr-1" />
                    <span className="hidden sm:block">Agregar fase</span>
                  </Button>
                </PermissionProtected>
              )}

              <PermissionProtected
                permissions={[
                  { resource: EnumResource.milestones, action: EnumAction.write },
                  { resource: EnumResource.milestones, action: EnumAction.manage },
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
                        { resource: EnumResource.milestones, action: EnumAction.write },
                        { resource: EnumResource.milestones, action: EnumAction.manage },
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
                        { resource: EnumResource.milestones, action: EnumAction.write },
                        { resource: EnumResource.milestones, action: EnumAction.manage },
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
                      permissions={[{ resource: EnumResource.milestones, action: EnumAction.manage }]}
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

const CardProjectMilestone = memo(CardProjectMilestoneBase, (prev, next) => {
  // Evita re-render si no cambian campos relevantes
  return (
    prev.milestone.id === next.milestone.id &&
    prev.milestone.status === next.milestone.status &&
    prev.milestone.name === next.milestone.name &&
    prev.milestone.progress === next.milestone.progress &&
    prev.milestone.startDate === next.milestone.startDate &&
    prev.milestone.endDate === next.milestone.endDate &&
    prev.milestone.completedDeliverablesCount === next.milestone.completedDeliverablesCount &&
    prev.milestone.phasesCount === next.milestone.phasesCount &&
    prev.milestone.phases.length === next.milestone.phases.length &&
    // Comparar internalConsultant para detectar cambios en la asignación
    prev.milestone.internalConsultant?.userId === next.milestone.internalConsultant?.userId &&
    prev.milestone.internalConsultant?.name === next.milestone.internalConsultant?.name &&
    prev.milestone.internalConsultant?.lastName === next.milestone.internalConsultant?.lastName &&
    prev.milestone.internalConsultant?.email === next.milestone.internalConsultant?.email &&
    prev.milestone.internalConsultant?.role === next.milestone.internalConsultant?.role
  );
});

export default CardProjectMilestone;
