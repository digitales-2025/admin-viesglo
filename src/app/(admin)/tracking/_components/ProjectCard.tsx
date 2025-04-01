"use client";

import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";
import { ClockArrowUp, User } from "lucide-react";

import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";
import { cn } from "@/shared/lib/utils";
import { useProjectStore } from "../_hooks/useProjectStore";
import { ProjectResponse } from "../_types/tracking.types";
import { calculatePercentageProject } from "../_utils/calculateTracking";

interface ProjectCardProps {
  className?: string;
  project: ProjectResponse;
}

export default function ProjectCard({ className, project }: ProjectCardProps) {
  const { setSelectedProject, selectedProject } = useProjectStore();

  const percentageProject = calculatePercentageProject(project);
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
        "h-fit shadow-none cursor-pointer select-none",
        selectedProject?.id === project.id && "border-sky-500",
        className
      )}
      onClick={handleClick}
    >
      <CardHeader>
        <CardTitle className="first-letter:uppercase">{project.typeContract}</CardTitle>
        <CardDescription>{project.description}</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-[1fr_auto] gap-4 items-center">
        <Progress
          value={percentageProject}
          color={cn(
            percentageProject >= 90 && "bg-teal-500",
            percentageProject >= 100 && "bg-emerald-500",
            percentageProject >= 50 && "bg-yellow-500",
            percentageProject < 50 && "bg-orange-500"
          )}
          className="bg-slate-500/10"
        />
        <div className="flex flex-row gap-2 items-center">
          <span className="text-sm font-medium">{percentageProject}%</span>
          <span className="text-xs text-muted-foreground">Completado</span>
        </div>
      </CardContent>
      <CardFooter className="flex items-center gap-4">
        <Badge variant="outline" className="flex items-center gap-2 text-muted-foreground ">
          <User className="w-4 h-4" />
          <strong className="first-letter:uppercase">{project.client.name}</strong>
        </Badge>
        {project.startDate && (
          <Badge variant="outline" className="flex items-center gap-2 text-muted-foreground">
            <ClockArrowUp className="w-4 h-4" />
            <strong>Fecha de inicio: {format(new TZDate(project.startDate, "America/Lima"), "dd-MM-yyyy")}</strong>
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
}
