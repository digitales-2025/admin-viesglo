"use client";

import { memo } from "react";
import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";
import { ClockArrowUp, Edit, MoreVertical, Trash, User } from "lucide-react";

import { useProjectStore } from "@/app/(admin)/tracking/_hooks/useProjectStore";
import { ProjectResponse } from "@/app/(admin)/tracking/_types/tracking.types";
import { calculatePercentageProject } from "@/app/(admin)/tracking/_utils/calculateTracking";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Progress } from "@/shared/components/ui/progress";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { cn } from "@/shared/lib/utils";
import { useDialogStore } from "@/shared/stores/useDialogStore";

interface ProjectCardProps {
  className?: string;
  project: ProjectResponse;
}

// Envolver en memo para prevenir re-renders innecesarios
const ProjectCard = memo(function ProjectCard({ className, project }: ProjectCardProps) {
  const { setSelectedProject, selectedProject } = useProjectStore();
  const { open } = useDialogStore();
  const isMobile = useIsMobile();

  // Memo para evitar recalcular este valor
  const percentageProject = calculatePercentageProject(project);

  // Pre-formatear la fecha para evitar formatos repetidos
  const formattedDate = project.startDate ? format(new TZDate(project.startDate, "America/Lima"), "dd-MM-yyyy") : null;

  const handleClick = () => {
    if (selectedProject?.id === project.id) {
      setSelectedProject(null);
    } else {
      setSelectedProject(project);
    }
  };

  if (!project) return null;

  return (
    <Card
      className={cn(
        "h-fit shadow-none cursor-pointer select-none border transition-all duration-200",
        selectedProject?.id === project.id && "border-sky-500 bg-sky-50/30 dark:bg-sky-950/20",
        className
      )}
      onClick={handleClick}
    >
      <CardHeader className="px-3 pt-3 pb-2 sm:px-6 sm:py-4">
        <CardTitle className="grid grid-cols-[1fr_auto] gap-1 sm:gap-2 min-h-9 sm:min-h-10 justify-center items-start">
          <span className="first-letter:uppercase text-wrap text-sm sm:text-base line-clamp-2">
            {project.typeContract}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground h-7 w-7 sm:h-8 sm:w-8">
                <MoreVertical className="size-4 sm:size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  open("projects", "edit", project);
                }}
                className="text-xs sm:text-sm"
              >
                Editar
                <DropdownMenuShortcut>
                  <Edit className="size-3 sm:size-4" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  open("projects", "delete", project);
                }}
                className="text-xs sm:text-sm"
              >
                Eliminar
                <DropdownMenuShortcut>
                  <Trash className="size-3 sm:size-4" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm line-clamp-2">{project.description}</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-[1fr_auto] gap-2 sm:gap-4 items-center px-3 pb-0 sm:px-6">
        <Progress
          value={percentageProject}
          color={cn(
            percentageProject >= 90 && "bg-teal-500",
            percentageProject >= 100 && "bg-emerald-500",
            percentageProject >= 50 && "bg-yellow-500",
            percentageProject < 50 && "bg-orange-500"
          )}
          className="bg-slate-500/10 h-1.5 sm:h-2"
        />
        <div className="flex flex-row gap-1 sm:gap-2 items-center">
          <span className="text-xs sm:text-sm font-medium">{percentageProject}%</span>
          <span className={cn("text-muted-foreground", isMobile ? "sr-only" : "text-xs")}>Completado</span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap items-center gap-2 sm:gap-4 px-3 py-2 sm:px-6 sm:py-4">
        <Badge
          variant="outline"
          className="flex items-center gap-1 sm:gap-2 text-muted-foreground text-xs sm:text-sm h-6 sm:h-7"
        >
          <User className="size-3 sm:size-4" />
          <strong className="first-letter:uppercase line-clamp-1">{project.client.name}</strong>
        </Badge>
        {formattedDate && (
          <Badge
            variant="outline"
            className="flex items-center gap-1 sm:gap-2 text-muted-foreground text-xs sm:text-sm h-6 sm:h-7"
          >
            <ClockArrowUp className="size-3 sm:size-4" />
            <strong className="line-clamp-1">{isMobile ? formattedDate : `Fecha de inicio: ${formattedDate}`}</strong>
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
});

export default ProjectCard;
