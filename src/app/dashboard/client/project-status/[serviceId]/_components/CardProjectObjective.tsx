import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { ProjectObjectiveResponse } from "@/app/dashboard/admin/tracking/_types/tracking.types";
import { StatusProjectActivity } from "@/app/dashboard/admin/tracking/[serviceId]/_types/activities.types";
import { Card, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";
import { cn } from "@/shared/lib/utils";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import ProjectActivitiesDialogs from "./ProjectActivitiesDialogs";
import TableActivities from "./TableProjectActivities";

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
  useDialogStore();

  return (
    <div className="flex flex-col">
      <Card
        key={objective.id}
        className={cn(
          "p-4 shadow-none transition-colors cursor-pointer z-[1] bg-background w-full  hover:border-sky-300 sticky top-16",
          expanded && "bg-accent border-b-transparent rounded-b-none"
        )}
        onClick={() => setExpanded(!expanded)}
      >
        <CardHeader className="p-0">
          <CardTitle className="grid grid-cols-[auto_auto_auto] w-full grid-rows-3 lg:grid-cols-[auto_1fr_auto_auto] xl:grid-cols-[auto_1fr_auto_auto_auto] items-center gap-x-4 gap-y-1 xl:grid-rows-1 md:grid-rows-2">
            <div className="inline-flex justify-start items-start xl:order-1 ">
              {expanded ? (
                <ChevronUp className="shrink-0 w-4 h-4 text-primary" />
              ) : (
                <ChevronDown className="shrink-0 w-4 h-4" />
              )}
            </div>
            <div className="inline-flex gap-2 items-center lg:order-2 col-span-3  order-4 lg:col-span-1">
              <span className="first-letter:capitalize">{objective.name}</span>
            </div>
            <span className="text-xs text-muted-foreground ml-2 text-nowrap xl:order-3 text-end order-2 lg:order-3">
              ({activitiesCount} {activitiesCount === 1 ? "actividad" : "actividades"})
            </span>
            <div className="inline-flex justify-end items-center w-full gap-2 xl:order-4 order-5 lg:col-span-4 col-span-3 xl:col-span-1">
              <Progress value={progress} className="min-w-52" />
              <span className="text-sm text-nowrap">{progress} %</span>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {expanded && (
        <div className="flex flex-col gap-2">
          <TableActivities objectiveId={objective.id} />
        </div>
      )}
      {objective && <ProjectActivitiesDialogs objectiveId={objective.id} />}
    </div>
  );
}
