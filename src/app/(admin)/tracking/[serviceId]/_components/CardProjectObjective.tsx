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
import { ProjectObjectiveResponse } from "../../_types/tracking.types";
import TableActivities from "./TableActivities";

interface Props {
  objective: ProjectObjectiveResponse;
}

export default function CarObjective({ objective }: Props) {
  const [expanded, setExpanded] = useState(false);

  // Calcular el progreso basado en actividades completadas
  const activities = objective.activities || [];
  const activitiesCount = activities.length;

  // En un caso real, podrías calcular esto basado en el estado de las actividades
  // Por ejemplo: const completedActivities = activities.filter(a => a.isCompleted).length;
  const completedActivities = 0; // Por ahora lo dejamos en 0

  const progress = activitiesCount > 0 ? Math.round((completedActivities / activitiesCount) * 100) : 0;

  return (
    <div className="space-y-2">
      <Card
        key={objective.id}
        className="p-4 shadow-none hover:bg-accent/30 transition-colors cursor-pointer"
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
                  e.stopPropagation(); // Evitar que se propague al card y active el toggle
                  // Aquí iría la lógica para agregar actividad
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
                  <DropdownMenuItem>
                    Editar
                    <DropdownMenuShortcut>
                      <Edit className="w-4 h-4" />
                    </DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
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
          <TableActivities activities={activities} />
        </div>
      )}
    </div>
  );
}
