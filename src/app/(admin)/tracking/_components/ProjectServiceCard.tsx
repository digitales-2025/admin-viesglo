import { Trash } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ProjectServiceResponse } from "../_types/tracking.types";
import { calculatePercentageService, calculateTotalActivitiesCompleted } from "../_utils/calculateTracking";
import CircularProgress from "./CircularProgress";

interface ProjectServiceCardProps {
  service: ProjectServiceResponse;
}

export default function ProjectServiceCard({ service }: ProjectServiceCardProps) {
  function countActivities(service: ProjectServiceResponse) {
    return service.objectives.reduce((acc, objective) => acc + (objective.activities ?? []).length, 0);
  }

  const percentageService = calculatePercentageService(service);
  const totalActivitiesCompleted = calculateTotalActivitiesCompleted(service);

  return (
    <Card className="shadow-none bg-accent/50 border-none">
      <CardHeader>
        <CardTitle className="grid grid-cols-[1fr_auto] justify-between items-center gap-4">
          <div className="inline-flex gap-2 items-center justify-between">
            <span className="first-letter:uppercase">{service.name}</span>
            <div className="flex items-center gap-2">
              <CircularProgress size={50} progress={percentageService} strokeWidth={3} />
            </div>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <Button variant="ghost">
              <Trash />
            </Button>
          </div>
        </CardTitle>
        <CardDescription className="flex flex-col gap-2">
          <span className="first-letter:uppercase text-sm text-muted-foreground">
            {totalActivitiesCompleted} / {countActivities(service)} Actividades completadas
          </span>
          {service.description}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
