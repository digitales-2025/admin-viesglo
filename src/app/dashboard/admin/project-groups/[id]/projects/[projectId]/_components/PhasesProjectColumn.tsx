import { Edit, MoreHorizontal, Trash } from "lucide-react";

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

export type SimpleColumnDef<TRow> = {
  key: keyof TRow | "actions";
  header: React.ReactNode;
  render?: (row: TRow) => React.ReactNode;
  className?: string;
};

interface PhasesProjectColumnsProps {
  onDateUpdate?: (phaseId: string, startDate?: Date, endDate?: Date) => void;
}

export function getPhasesProjectColumns({ onDateUpdate }: PhasesProjectColumnsProps = {}): Array<
  SimpleColumnDef<PhaseDetailedResponseDto>
> {
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
      render: (phase: PhaseDetailedResponseDto) => {
        const startDate = phase.startDate;
        const endDate = phase.endDate;
        const phaseId = phase.id;

        return (
          <div className="w-64" onClick={(e) => e.stopPropagation()}>
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => open(MODULE_PHASES_PROJECT, "edit", phase)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => open(MODULE_PHASES_PROJECT, "delete", phase)}>
                  <Trash className="w-4 h-4 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
      className: "w-12",
    },
  ];
}
