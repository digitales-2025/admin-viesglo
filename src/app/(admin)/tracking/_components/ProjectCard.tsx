"use client";

import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";
import { CalendarCheck, User } from "lucide-react";

import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";
import { cn } from "@/shared/lib/utils";
import { useProjectStore } from "../_hooks/useProjectStore";
import { ProjectResponse } from "../_types/tracking.types";

interface ProjectCardProps {
  className?: string;
  project: ProjectResponse;
}

export default function ProjectCard({ className, project }: ProjectCardProps) {
  const { setSelectedProject, selectedProject } = useProjectStore();

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
      <CardContent>
        <Progress value={project.status === "active" ? 50 : 20} color="bg-sky-500" />
      </CardContent>
      <CardFooter className="flex items-center gap-4">
        <Badge variant="infoOutline" className="flex items-center gap-2">
          <User className="w-4 h-4" />
          <strong>{project.client.name}</strong>
        </Badge>
        {project.startDate && (
          <Badge variant="successOutline" className="flex items-center gap-2">
            <CalendarCheck className="w-4 h-4" />
            <strong>Inicio: {format(new TZDate(project.startDate, "America/Lima"), "dd-MM-yyyy")}</strong>
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
}
