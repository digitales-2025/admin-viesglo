import { useState } from "react";
import { ChevronDown, ChevronUp, Edit, Ellipsis, PlusCircle, Trash } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Progress } from "@/shared/components/ui/progress";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { StatusProjectActivity } from "../_types/activities.types";
import { ProjectObjectiveResponse } from "../../_types/tracking.types";
import ProjectActivitiesDialogs, { MODULE_PROJECT_ACTIVITIES } from "./ProjectActivitiesDialogs";
import { MODULE_PROJECT_OBJECTIVES } from "./ProjectObjectivesDialogs";
import TableActivities from "./TableActivities";

interface Props {
  objective: ProjectObjectiveResponse;
}

export default function CardProjectObjective({ objective }: Props) {
  const [expanded, setExpanded] = useState(false);

  // Calcular el progreso basado en actividades completadas
  const activitiesCount = objective.activities?.length || 0;

  const completedActivities =
    objective.activities?.filter((activity) => activity.status === StatusProjectActivity.COMPLETED).length || 0;

  const progress = activitiesCount > 0 ? Math.round((completedActivities / activitiesCount) * 100) : 0;
  const { open } = useDialogStore();

  return (
    <div className="space-y-2">
      <Card
        key={objective.id}
        className="p-4 shadow-none transition-colors cursor-pointer z-[1] bg-background  hover:border-sky-300 sticky top-16"
        onClick={() => setExpanded(!expanded)}
      >
        <CardHeader className="p-0">
          <CardTitle className="grid grid-cols-[1fr_auto] justify-center items-center gap-4">
            <div className="inline-flex gap-2 items-center">
              {expanded ? <ChevronUp className="w-4 h-4 text-primary" /> : <ChevronDown className="w-4 h-4" />}
              <span className="first-letter:capitalize">{objective.name}</span>
              <span className="text-xs text-muted-foreground ml-2">
                ({activitiesCount} {activitiesCount === 1 ? "actividad" : "actividades"})
              </span>
            </div>
            <div className="inline-flex justify-end items-center w-full gap-2">
              <Progress value={progress} className="min-w-52" />
              <span className="text-sm text-nowrap">{progress} %</span>
              <Button
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  const dataWithObjectiveId = {
                    ...objective,
                    objectiveId: objective.id,
                  };

                  open(MODULE_PROJECT_ACTIVITIES, "create", dataWithObjectiveId);
                }}
              >
                <PlusCircle className="w-4 h-4 mr-1" />
                Agregar actividad
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
                      open(MODULE_PROJECT_OBJECTIVES, "edit", objective);
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
                      open(MODULE_PROJECT_OBJECTIVES, "delete", objective);
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
        <div className="grid grid-cols-[auto_1fr] ml-2">
          <div className="h-full w-1 bg-border/50 mr-2"></div>
          <TableActivities objectiveId={objective.id} />
        </div>
      )}
      {objective && <ProjectActivitiesDialogs objectiveId={objective.id} />}
    </div>
  );
}
