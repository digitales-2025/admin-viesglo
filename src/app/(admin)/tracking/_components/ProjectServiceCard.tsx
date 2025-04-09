import { useRouter } from "next/navigation";
import { CheckCircle, Circle, Clock, Edit, MoreVertical, Trash } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Progress } from "@/shared/components/ui/progress";
import { cn } from "@/shared/lib/utils";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { ProjectServiceResponse } from "../_types/tracking.types";
import { calculatePercentageService, calculateTotalActivitiesCompleted } from "../_utils/calculateTracking";
import { PROJECT_SERVICE_MODULE } from "./ProjectsDialogs";

interface ProjectServiceCardProps {
  service: ProjectServiceResponse;
}

export default function ProjectServiceCard({ service }: ProjectServiceCardProps) {
  function countActivities(service: ProjectServiceResponse) {
    return service.objectives.reduce((acc, objective) => acc + (objective.activities ?? []).length, 0);
  }

  const percentageService = calculatePercentageService(service);
  const totalActivitiesCompleted = calculateTotalActivitiesCompleted(service);

  const { open } = useDialogStore();

  const handleEditService = () => {
    open(PROJECT_SERVICE_MODULE, "edit", service);
  };

  const handleDeleteService = () => {
    open(PROJECT_SERVICE_MODULE, "delete", service);
  };

  const router = useRouter();

  return (
    <Card
      className="shadow-none bg-accent/50 p-2 px-1 cursor-pointer hover:bg-accent/70 transition-all duration-300 hover:border-dashed hover:border-sky-500/50 border-transparent"
      onClick={() => router.push(`/tracking/${service.id}`)}
    >
      <CardHeader>
        <CardTitle className="grid grid-cols-[1fr_auto] justify-between items-center gap-4">
          <div className="inline-flex gap-2 items-center justify-between">
            <div className="flex items-center gap-2">
              {percentageService === 100 && <CheckCircle className="w-4 h-4 text-emerald-500" />}
              {percentageService < 100 && percentageService > 0 && <Clock className="w-4 h-4 text-yellow-500" />}
              {percentageService === 0 && <Circle className="w-4 h-4 text-red-500" />}
              <span className="first-letter:uppercase">{service.name}</span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleEditService}>
                Editar
                <DropdownMenuShortcut>
                  <Edit />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDeleteService}>
                Eliminar
                <DropdownMenuShortcut>
                  <Trash />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardTitle>
        <CardDescription className="flex flex-col gap-2 ">{service.description}</CardDescription>
      </CardHeader>
      <CardFooter className="flex flex-col gap-2 w-full">
        <div className="flex items-center gap-2 justify-between w-full text-sm text-muted-foreground">
          <span className="first-letter:uppercase">
            {totalActivitiesCompleted} / {countActivities(service)} Actividades completadas
          </span>
          <span className="flex items-center gap-2">{percentageService}%</span>
        </div>
        <Progress
          value={percentageService}
          color={cn(
            percentageService >= 90 && "bg-teal-500",
            percentageService >= 100 && "bg-emerald-500",
            percentageService >= 50 && "bg-yellow-500",
            percentageService < 50 && "bg-orange-500"
          )}
          className="bg-slate-500/10"
        />
      </CardFooter>
    </Card>
  );
}
