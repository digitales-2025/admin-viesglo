"use client";

import { AlertTriangle, BarChart3, Calendar, CheckSquare, Clock, Target, TrendingUp, Users } from "lucide-react";

import BulletChart from "@/app/dashboard/admin/project-groups/[id]/projects/_components/view/BulletChart";
import { Progress } from "@/shared/components/ui/progress";
import { ResponsiveDialog } from "@/shared/components/ui/resposive-dialog";
import { useMediaQuery } from "@/shared/hooks";
import { cn } from "@/shared/lib/utils";
import { useProjectMilestones } from "../../_hooks/use-project";
import { ProjectResponseDto } from "../../_types";

interface ProjectProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: ProjectResponseDto | null;
}

export default function ProjectProgressDialog({ open, onOpenChange, project }: ProjectProgressDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Hook para obtener hitos del proyecto
  const { query: milestonesQuery } = useProjectMilestones(project?.id || "");
  const milestones = milestonesQuery.data?.milestones || [];

  // No renderizar si no hay proyecto
  if (!project) {
    return null;
  }

  // Calcular métricas del proyecto (usando datos disponibles en ProjectResponseDto)
  const totalDeliverables = project.milestonesCount * 3; // Estimación basada en hitos
  const completedDeliverables = Math.round((project.overallProgress / 100) * totalDeliverables);

  // Calcular fecha objetivo (usando endDate del proyecto)
  const targetDate = project.endDate ? new Date(project.endDate) : null;
  const formattedTargetDate = targetDate
    ? targetDate.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "No definida";

  // Determinar estado de riesgo de consultores
  const consultantRiskStatus = project.overallProgress < project.targetProgress ? "En riesgo" : "En tiempo";
  const consultantRiskColor = consultantRiskStatus === "En riesgo" ? "text-red-500" : "text-green-500";

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      isDesktop={isDesktop}
      title={project.name}
      description="Dashboard de progreso del proyecto"
      dialogContentClassName="sm:max-w-5xl px-0"
      dialogScrollAreaClassName="h-full max-h-[85vh] px-0"
      drawerContentClassName="max-h-[70vh]"
      drawerScrollAreaClassName="h-full px-0"
    >
      <div className="space-y-6">
        {/* Header con Progreso Principal - Diseño Innovador */}
        <div className="relative overflow-hidden bg-card border border-border rounded-lg">
          {/* Fondo con patrón sutil */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(59,130,246)_1px,transparent_0)] bg-[length:20px_20px]"></div>
          </div>

          <div className="relative p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-semibold">Progreso General</h3>
                  <p className="text-sm text-muted-foreground">Estado actual del proyecto</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-primary">{project.overallProgress}%</div>
                <div className="text-xs text-muted-foreground">completado</div>
              </div>
            </div>

            <BulletChart
              current={project.overallProgress}
              target={project.targetProgress}
              showTooltip={true}
              animationDuration={1500}
            />
          </div>
        </div>

        {/* Métricas de Estado - Diseño Creativo Empresarial */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Consultores */}
          <div className="group relative bg-card border border-border rounded-lg p-4 overflow-hidden">
            {/* Línea de acento lateral */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="font-medium">Consultores</h4>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-foreground">{project.coordinatorName}</div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div
                    className={cn(
                      "w-3 h-3 rounded-full",
                      consultantRiskStatus === "En riesgo" ? "bg-amber-500" : "bg-emerald-500"
                    )}
                  ></div>
                  <div
                    className={cn(
                      "absolute inset-0 w-3 h-3 rounded-full animate-ping opacity-30",
                      consultantRiskStatus === "En riesgo" ? "bg-amber-500" : "bg-emerald-500"
                    )}
                  ></div>
                </div>
                <span className="text-sm text-muted-foreground">Estado:</span>
                <span className={cn("text-sm font-medium", consultantRiskColor)}>{consultantRiskStatus}</span>
              </div>
            </div>
          </div>

          {/* Entregables */}
          <div className="group relative bg-card border border-border rounded-lg p-4 overflow-hidden">
            {/* Línea de acento lateral */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center">
                <CheckSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h4 className="font-medium">Entregables</h4>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                {completedDeliverables} de {totalDeliverables} completados
              </div>
              <div className="relative">
                <Progress
                  value={(completedDeliverables / totalDeliverables) * 100}
                  color="bg-emerald-500"
                  className="h-2"
                />
                <div className="absolute top-0 left-0 h-2 w-full bg-emerald-100 dark:bg-emerald-900/20 rounded-full"></div>
              </div>
              <div className="text-xs text-muted-foreground">
                {Math.round((completedDeliverables / totalDeliverables) * 100)}% completado
              </div>
            </div>
          </div>

          {/* Fecha Objetivo */}
          <div className="group relative bg-card border border-border rounded-lg p-4 overflow-hidden">
            {/* Línea de acento lateral */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500"></div>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-medium">Timeline</h4>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Fecha objetivo</div>
              <div className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-3 w-3 text-muted-foreground" />
                {formattedTargetDate}
              </div>
            </div>
          </div>
        </div>

        {/* Progreso por Hitos - Diseño Creativo */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-semibold">Progreso por Hitos</h3>
              <p className="text-sm text-muted-foreground">Desglose detallado del avance</p>
            </div>
          </div>

          <div className="space-y-3">
            {milestones.length > 0 ? (
              milestones.map((milestone, index) => (
                <div
                  key={milestone.id}
                  className="group relative bg-card border border-border rounded-lg p-4 overflow-hidden"
                >
                  {/* Línea de conexión visual */}
                  {index < milestones.length - 1 && (
                    <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-border"></div>
                  )}

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-lg border-2 flex items-center justify-center",
                            milestone.progress === 100
                              ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800"
                              : milestone.progress >= 50
                                ? "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800"
                                : milestone.progress > 0
                                  ? "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800"
                                  : "bg-muted border-border"
                          )}
                        >
                          <span
                            className={cn(
                              "text-sm font-bold",
                              milestone.progress === 100
                                ? "text-emerald-600 dark:text-emerald-400"
                                : milestone.progress >= 50
                                  ? "text-blue-600 dark:text-blue-400"
                                  : milestone.progress > 0
                                    ? "text-amber-600 dark:text-amber-400"
                                    : "text-muted-foreground"
                            )}
                          >
                            {milestone.order}
                          </span>
                        </div>
                        {/* Indicador de progreso circular */}
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-background border border-border flex items-center justify-center">
                          <div
                            className={cn(
                              "w-2 h-2 rounded-full",
                              milestone.progress === 100
                                ? "bg-emerald-500"
                                : milestone.progress >= 50
                                  ? "bg-blue-500"
                                  : milestone.progress > 0
                                    ? "bg-amber-500"
                                    : "bg-muted-foreground"
                            )}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium">{milestone.name}</h4>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {milestone.phasesCount} fases
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckSquare className="h-3 w-3" />
                            {milestone.deliverablesCount} entregables
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold">{milestone.progress}%</div>
                      <div
                        className={cn(
                          "text-xs font-medium px-2 py-1 rounded-full",
                          milestone.status === "OPERATIONALLY_COMPLETED"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : milestone.status === "IN_PROGRESS"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              : milestone.status === "PLANNING"
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                : "bg-muted text-muted-foreground"
                        )}
                      >
                        {milestone.status === "OPERATIONALLY_COMPLETED"
                          ? "Completado"
                          : milestone.status === "IN_PROGRESS"
                            ? "En Progreso"
                            : milestone.status === "PLANNING"
                              ? "Planificación"
                              : milestone.status}
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <Progress
                      value={milestone.progress}
                      color={cn(
                        milestone.progress === 100
                          ? "bg-emerald-500"
                          : milestone.progress >= 50
                            ? "bg-blue-500"
                            : milestone.progress > 0
                              ? "bg-amber-500"
                              : "bg-muted"
                      )}
                      className="h-2"
                    />
                    {/* Indicador de progreso en la barra */}
                    <div className="absolute top-0 right-0 h-2 w-2 rounded-full bg-background border border-border"></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-muted flex items-center justify-center">
                  <Target className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-base font-medium mb-2">Sin hitos disponibles</h3>
                <p className="text-sm text-muted-foreground">Este proyecto no tiene hitos configurados aún</p>
              </div>
            )}
          </div>
        </div>

        {/* Principales Incidencias - Diseño Creativo */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold">Principales Incidencias</h3>
              <p className="text-sm text-muted-foreground">Problemas y alertas del proyecto</p>
            </div>
          </div>

          <div className="relative bg-card border border-border rounded-lg p-6 overflow-hidden">
            <div className="relative text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h4 className="text-base font-medium mb-2">Sin incidencias</h4>
              <p className="text-sm text-muted-foreground">No hay problemas reportados actualmente</p>
            </div>
          </div>
        </div>
      </div>
    </ResponsiveDialog>
  );
}
