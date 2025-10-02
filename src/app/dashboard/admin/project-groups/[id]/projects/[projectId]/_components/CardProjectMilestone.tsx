import { memo } from "react";
import { ChevronDown, ChevronUp, Edit, Ellipsis, PlusCircle, Trash } from "lucide-react";

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
import { MODULE_MILESTONES_PROJECT } from "./milestones-project-overlays/MilestonesProjectOverlays";
import { MODULE_PHASES_PROJECT } from "./phases-project-overlays/PhasesProjectOverlays";
import TablePhasesProject from "./TablePhasesProject";

interface Props {
  milestone: MilestoneDetailedResponseDto;
  projectId: string;
}

function CardProjectMilestoneBase({ milestone, projectId }: Props) {
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
          <CardTitle className="grid grid-cols-[auto_auto_auto] w-full grid-rows-3 lg:grid-cols-[auto_1fr_auto_auto] xl:grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-1 xl:grid-rows-1 md:grid-rows-2">
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
            <div className="inline-flex justify-end items-center gap-2 xl:order-5 order-3 lg:order-4 ">
              <div onClick={(e) => e.stopPropagation()}>
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
                  placeholder={milestone.startDate && milestone.endDate ? "Editar período" : "Seleccionar período"}
                  className="w-full"
                  confirmText="Guardar período"
                  clearText="Limpiar período"
                  cancelText="Cancelar"
                />
              </div>

              <Button
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  open(MODULE_PHASES_PROJECT, "create");
                }}
              >
                <PlusCircle className="w-4 h-4 mr-1" />
                <span className="hidden sm:block">Agregar fase</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Ellipsis className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      open(MODULE_MILESTONES_PROJECT, "edit", milestone);
                    }}
                  >
                    Editar
                    <DropdownMenuShortcut>
                      <Edit className="w-4 h-4" />
                    </DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      open(MODULE_MILESTONES_PROJECT, "delete", milestone);
                    }}
                  >
                    Eliminar
                    <DropdownMenuShortcut>
                      <Trash className="w-4 h-4" />
                    </DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
    prev.milestone.name === next.milestone.name &&
    prev.milestone.progress === next.milestone.progress &&
    prev.milestone.completedDeliverablesCount === next.milestone.completedDeliverablesCount &&
    prev.milestone.phasesCount === next.milestone.phasesCount &&
    prev.milestone.phases.length === next.milestone.phases.length
  );
});

export default CardProjectMilestone;
