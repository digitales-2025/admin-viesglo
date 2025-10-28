"use client";

import { useParams, useRouter } from "next/navigation";
import { Calendar, Edit, Eye, Info } from "lucide-react";

import HoverCardClient from "@/app/dashboard/admin/project-groups/[id]/projects/_components/view/HoverCardClient";
import HoverCardResponsible from "@/app/dashboard/admin/project-groups/[id]/projects/_components/view/HoverCardCoordinator";
import { EnumAction, EnumResource } from "@/app/dashboard/admin/settings/_types/roles.types";
import { PermissionProtected } from "@/shared/components/protected-component";
import { Card, CardContent, CardFooter } from "@/shared/components/ui/card";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/shared/components/ui/context-menu";
import { cn } from "@/shared/lib/utils";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { ProjectResponseDto } from "../../_types";
import { projectDelayLevelConfig, projectStatusConfig, projectTypeConfig } from "../../_utils/projects.utils";
import BulletChart from "./BulletChart";

interface ProjectCardProps {
  project: ProjectResponseDto;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const { open } = useDialogStore();
  const router = useRouter();
  const params = useParams();
  const projectGroupId = params.id as string;

  // Constante para módulo
  const MODULE = "projects";

  // Función para navegar al proyecto
  const handleCardClick = () => {
    router.push(`/dashboard/admin/project-groups/${projectGroupId}/projects/${project.id}`);
  };

  // Función para manejar la edición del proyecto
  const handleEditProject = (e: React.MouseEvent) => {
    e.stopPropagation();
    open(MODULE, "edit", project);
  };

  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateString; // Fallback al string original si hay error
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <Card className="cursor-pointer hover:shadow-md transition-shadow duration-200" onClick={handleCardClick}>
          <CardContent>
            {/* Company Header */}
            <div className="flex items-center justify-between mb-3 gap-4">
              <PermissionProtected
                permissions={[
                  { resource: EnumResource.projects, action: EnumAction.write },
                  { resource: EnumResource.projects, action: EnumAction.manage },
                ]}
                requireAll={false}
                hideOnUnauthorized={true}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    open("projects", "edit-fields", project);
                  }}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  title="Editar información de empresa"
                >
                  <Info className="w-4 h-4 shrink-0" />
                </button>
              </PermissionProtected>

              <h3 className="font-bold text-gray-900 flex-1 truncate capitalize text-center">{project.name}</h3>

              <PermissionProtected
                permissions={[
                  { resource: EnumResource.projects, action: EnumAction.read },
                  { resource: EnumResource.projects, action: EnumAction.write },
                  { resource: EnumResource.projects, action: EnumAction.manage },
                ]}
                requireAll={false}
                hideOnUnauthorized={true}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    open("projects", "progress", project);
                  }}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  title="Ver dashboard de progreso"
                >
                  <Eye className="w-4 h-4 shrink-0" />
                </button>
              </PermissionProtected>
            </div>

            {/* Bullet Chart Toggle */}
            <div className="mb-4">
              <BulletChart current={project.overallProgress} target={project.targetProgress} />
            </div>

            <div className="space-y-2">
              {/* Client Info */}
              {project.clientId && (
                <div className="flex flex-row items-center gap-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Cliente:</span>
                  </div>
                  <HoverCardClient
                    clientId={project.clientId}
                    clientName={project.clientName || "Cliente"}
                    className="text-sm"
                  />
                </div>
              )}

              {/* Project Info - Simple and Clean */}
              <div className="space-y-2">
                {/* Coordinator */}
                {project.coordinatorId && (
                  <div className="flex flex-row items-center gap-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Coordinador:</span>
                    </div>
                    <HoverCardResponsible
                      userId={project.coordinatorId}
                      userName={project.coordinatorName || "Coordinador"}
                      className="text-sm"
                    />
                  </div>
                )}
              </div>

              {/* Status and Milestones - Inline */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Estado:</span>
                    {(() => {
                      const statusConfig = projectStatusConfig[project.status as keyof typeof projectStatusConfig];
                      if (statusConfig) {
                        const StatusIcon = statusConfig.icon;
                        return (
                          <div
                            className={cn(
                              "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border",
                              statusConfig.badge,
                              statusConfig.textClass
                            )}
                          >
                            <StatusIcon className={cn("h-3 w-3", statusConfig.iconClass)} />
                            <span>{statusConfig.label}</span>
                          </div>
                        );
                      }
                      return <span className="text-red-600 font-medium">{project.status}</span>;
                    })()}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Hitos:</span>
                  <span className="text-gray-600">{project.milestonesCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Nivel de retraso:</span>
                    {(() => {
                      const projectDelayConfig =
                        projectDelayLevelConfig[project.delayLevel as keyof typeof projectDelayLevelConfig];
                      if (projectDelayConfig) {
                        const ProjectDelayConfigIcon = projectDelayConfig.icon;
                        return (
                          <div
                            className={cn(
                              "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border",
                              projectDelayConfig.badge,
                              projectDelayConfig.textClass
                            )}
                          >
                            <ProjectDelayConfigIcon className={cn("h-3 w-3", projectDelayConfig.iconClass)} />
                            <span>{projectDelayConfig.label}</span>
                          </div>
                        );
                      }
                      return <span className="text-red-600 font-medium">{project.delayLevel}</span>;
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4 shrink-0" />
              <span className="text-xs">{project.startDate ? formatDate(project.startDate) : "Sin fecha"}</span>
            </div>
            {project.projectType &&
              (() => {
                const typeConfig = projectTypeConfig[project.projectType as keyof typeof projectTypeConfig];
                if (typeConfig) {
                  const TypeIcon = typeConfig.icon;
                  return (
                    <div className={cn("flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium")}>
                      <TypeIcon className={cn("h-3 w-3", typeConfig.iconClass)} />
                      <span>{typeConfig.label}</span>
                    </div>
                  );
                }
                return null;
              })()}
          </CardFooter>
        </Card>
      </ContextMenuTrigger>

      <PermissionProtected
        permissions={[
          { resource: EnumResource.projects, action: EnumAction.write },
          { resource: EnumResource.projects, action: EnumAction.manage },
        ]}
        requireAll={false}
        hideOnUnauthorized={true}
      >
        <ContextMenuContent className="w-48">
          <ContextMenuItem onClick={handleEditProject}>
            <Edit className="h-4 w-4 mr-2" />
            Editar Proyecto
          </ContextMenuItem>
        </ContextMenuContent>
      </PermissionProtected>
    </ContextMenu>
  );
}
