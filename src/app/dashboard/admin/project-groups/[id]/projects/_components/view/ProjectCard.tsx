"use client";

import { useState } from "react";
import { Calendar, Eye, Info } from "lucide-react";

import HoverCardClient from "@/app/dashboard/admin/project-groups/[id]/projects/_components/view/HoverCardClient";
import HoverCardResponsible from "@/app/dashboard/admin/project-groups/[id]/projects/_components/view/HoverCardCoordinator";
import { Card, CardContent, CardFooter } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";
import { ProjectResponseDto } from "../../_types";
import { projectStatusConfig, projectTypeConfig } from "../../_utils/projects.utils";
import BulletChart from "../../../../../../../../shared/components/dashboard/_components/_projects/BulletChart";

interface ProjectCardProps {
  project: ProjectResponseDto;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const [showHighcharts, setShowHighcharts] = useState(false);

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
    <Card>
      <CardContent>
        {/* Company Header */}
        <div className="flex items-center justify-between mb-3 gap-4">
          <Info className="w-4 h-4 shrink-0" />

          <h3 className="font-bold text-gray-900 flex-1 truncate capitalize text-center">{project.name}</h3>

          <button
            onClick={() => setShowHighcharts(!showHighcharts)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title={showHighcharts ? "Ver gráfico simple" : "Ver gráfico avanzado"}
          >
            <Eye className="w-4 h-4 shrink-0" />
          </button>
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
  );
}
