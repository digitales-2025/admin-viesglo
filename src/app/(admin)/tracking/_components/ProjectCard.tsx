"use client";

import { memo, useState } from "react";
import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";
import { ClockArrowUp, Edit, MoreVertical, RotateCcw, Trash, User, UserCog } from "lucide-react";

import { ProtectedComponent } from "@/auth/presentation/components/ProtectedComponent";
import { FileXls } from "@/shared/components/icons/Files";
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
import { downloadProjectDetailXls } from "../_actions/project.actions";
import { useToggleProjectActive } from "../_hooks/useProject";
import { useProjectStore } from "../_hooks/useProjectStore";
import { ProjectResponse, ProjectStatus, ProjectStatusColors, ProjectStatusLabels } from "../_types/tracking.types";
import { EnumAction, EnumResource } from "../../roles/_utils/groupedPermission";

interface ProjectCardProps {
  className?: string;
  project: ProjectResponse;
}

const ProjectCard = memo(function ProjectCard({ className, project }: ProjectCardProps) {
  const { mutate: toggleProjectActive, isPending: isToggling } = useToggleProjectActive();
  const { setSelectedProject, selectedProject } = useProjectStore();
  const { open } = useDialogStore();
  const isMobile = useIsMobile();

  const formattedDate = project.startDate ? format(new TZDate(project.startDate, "America/Lima"), "dd-MM-yyyy") : null;

  const handleClick = () => {
    if (selectedProject?.id === project.id) {
      setSelectedProject(null);
    } else {
      setSelectedProject(project);
    }
  };

  const [isLoading, setIsLoading] = useState(false);
  const handleDownload = async () => {
    try {
      setIsLoading(true);
      const blob = await downloadProjectDetailXls(project.id);

      if (!blob) {
        console.error("No se pudo obtener el archivo Excel");
        return;
      }

      // Crear un URL para el blob
      const url = window.URL.createObjectURL(blob);

      // Crear un enlace temporal
      const link = document.createElement("a");
      link.href = url;
      const date = new Date();
      link.setAttribute("download", `proyecto-${project.typeContract}-${date.toLocaleDateString()}.xlsx`);

      // Simular clic en el enlace
      document.body.appendChild(link);
      link.click();

      // Limpiar
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al descargar proyecto:", error);
    } finally {
      setIsLoading(false);
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
      <CardHeader className="px-3 pt-1 pb-2 sm:px-6 sm:py-1">
        <CardTitle className="grid grid-cols-[1fr_auto] gap-1 sm:gap-2 min-h-9 sm:min-h-10 justify-center items-start">
          <Badge
            variant="outline"
            className={cn("text-xs sm:text-sm border-none", ProjectStatusColors[project.status as ProjectStatus])}
          >
            {ProjectStatusLabels[project.status as ProjectStatus]}
          </Badge>
          <ProtectedComponent
            requiredPermissions={[
              { resource: EnumResource.projects, action: EnumAction.update },
              { resource: EnumResource.projects, action: EnumAction.delete },
            ]}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground h-7 w-7 sm:h-8 sm:w-8">
                  <MoreVertical className="size-4 sm:size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <ProtectedComponent
                  requiredPermissions={[{ resource: EnumResource.projects, action: EnumAction.update }]}
                >
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
                </ProtectedComponent>
                <ProtectedComponent
                  requiredPermissions={[{ resource: EnumResource.projects, action: EnumAction.delete }]}
                >
                  {project.isActive ? (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        open("projects", "delete", project);
                      }}
                      className="text-xs sm:text-sm"
                      disabled={!project.isActive}
                    >
                      Eliminar
                      <DropdownMenuShortcut>
                        <Trash className="size-3 sm:size-4" />
                      </DropdownMenuShortcut>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleProjectActive(project.id);
                      }}
                      className="text-xs sm:text-sm"
                      disabled={isToggling}
                    >
                      Reactivar
                      <DropdownMenuShortcut>
                        <RotateCcw className="size-3 sm:size-4 text-yellow-500" />
                      </DropdownMenuShortcut>
                    </DropdownMenuItem>
                  )}
                </ProtectedComponent>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload();
                  }}
                  className="text-xs sm:text-sm"
                  disabled={isLoading}
                >
                  Descargar
                  <DropdownMenuShortcut>
                    <FileXls className="size-3 sm:size-4" />
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </ProtectedComponent>
          <span className="first-letter:uppercase text-wrap text-sm sm:text-base line-clamp-2">
            {project.typeContract}
          </span>
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
          <span className="text-xs sm:text-sm font-medium">{project.progress?.toFixed(0)}%</span>
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

        {project.responsibleUserId && (
          <Badge
            variant="outline"
            className="flex items-center gap-1 sm:gap-2 text-muted-foreground text-xs sm:text-sm h-6 sm:h-7"
          >
            <UserCog className="size-3 sm:size-4 shrink-0" />
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
