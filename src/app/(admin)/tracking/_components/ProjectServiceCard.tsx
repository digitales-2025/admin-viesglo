import { Trash } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ProjectServiceResponse } from "../_types/tracking.types";

interface ProjectServiceCardProps {
  service: ProjectServiceResponse;
}

export default function ProjectServiceCard({ service }: ProjectServiceCardProps) {
  function countActivities(service: ProjectServiceResponse) {
    return service.objectives.reduce((acc, objective) => acc + (objective.activities ?? []).length, 0);
  }

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="grid grid-cols-[1fr_auto] justify-between items-center ">
          <div className="inline-flex gap-2 items-center justify-between">
            <span className="first-letter:uppercase">{service.name}</span>
            <div className="flex items-center gap-2">
              <span className="first-letter:uppercase text-xs text-muted-foreground">
                {countActivities(service)} Actividades
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <Button variant="ghost">
              <Trash />
            </Button>
          </div>
        </CardTitle>
        <CardDescription>{service.description}</CardDescription>
      </CardHeader>
    </Card>
  );
}
