"use client";

import { memo } from "react";
import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";
import { ClockArrowUp, User, UserCog } from "lucide-react";

import { useProjectStore } from "@/app/(admin)/tracking/_hooks/useProjectStore";
import {
  ProjectResponse,
  ProjectStatus,
  ProjectStatusColors,
  ProjectStatusLabels,
} from "@/app/(admin)/tracking/_types/tracking.types";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { cn } from "@/shared/lib/utils";

interface ProjectCardProps {
  className?: string;
  project: ProjectResponse;
}

const ProjectCard = memo(function ProjectCard({ className, project }: ProjectCardProps) {
  const { setSelectedProject, selectedProject } = useProjectStore();
  const isMobile = useIsMobile();

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
        <Badge
          variant="outline"
          className={cn("text-xs sm:text-sm border-none", ProjectStatusColors[project.status as ProjectStatus])}
        >
          {ProjectStatusLabels[project.status as ProjectStatus]}
        </Badge>
        <CardTitle className="text-sm sm:text-base first-letter:uppercase line-clamp-2">
          {project.typeContract}
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm line-clamp-2">{project.description}</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-[1fr_auto] gap-2 sm:gap-4 items-center px-3 pb-0 sm:px-6">
        <Progress
          value={Number(project.progress?.toFixed(2))}
          color={cn(
            project.progress && project.progress >= 90 && "bg-teal-500",
            project.progress && project.progress >= 100 && "bg-emerald-500",
            project.progress && project.progress >= 50 && "bg-yellow-500",
            project.progress && project.progress < 50 && "bg-orange-500"
          )}
          className="bg-slate-500/10 h-1.5 sm:h-2"
        />
        <div className="flex flex-row gap-1 sm:gap-2 items-center">
          <span className="text-xs sm:text-sm font-medium">{project.progress?.toFixed(2)}%</span>
          <span className={cn("text-muted-foreground", isMobile ? "sr-only" : "text-xs")}>Completado</span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap items-center gap-2 sm:gap-4 px-3 sm:px-6 py-0">
        <Badge
          variant="outline"
          className="flex items-center gap-1 sm:gap-2 text-muted-foreground text-xs sm:text-sm h-6 sm:h-7"
        >
          <User className="size-3 sm:size-4" />
          Cliente:
          <strong className="first-letter:uppercase line-clamp-1 text-wrap" title={project.client.name}>
            {project.client.name}
          </strong>
        </Badge>

        {project.responsibleUserId && (
          <Badge
            variant="outline"
            className="flex items-center gap-1 sm:gap-2 text-muted-foreground text-xs sm:text-sm h-6 sm:h-7"
          >
            <UserCog className="size-3 sm:size-4 shrink-0" />
            Responsable:
            <strong className="first-letter:uppercase line-clamp-1">{project.responsibleUser?.fullName}</strong>
          </Badge>
        )}

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
