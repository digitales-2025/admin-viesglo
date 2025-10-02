"use client";

import * as React from "react";
import {
  AlertCircle,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileDown,
  Files,
  FileText,
  HardDrive,
  Timer,
  TrendingUp,
  User,
  UserCheck,
  Weight,
} from "lucide-react";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Progress } from "@/shared/components/ui/progress";
import { Separator } from "@/shared/components/ui/separator";
import { cn } from "@/shared/lib/utils";
import { DeliverableDetailedResponseDto } from "../../../../_types";
import { deliverablePriorityConfig, deliverableStatusConfig } from "../../../../_utils/projects.utils";

interface DeliverableDetailsPanelProps {
  deliverable: DeliverableDetailedResponseDto;
}

// Función para formatear fechas
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Función para formatear fechas con hora
const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Función para formatear tamaño de archivo
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

// Función para calcular días de diferencia
const calculateDaysDifference = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export function DeliverableDetailsPanel({ deliverable }: DeliverableDetailsPanelProps) {
  const statusConfig = deliverableStatusConfig[deliverable.status as keyof typeof deliverableStatusConfig];
  const priorityConfig = deliverablePriorityConfig[deliverable.priority as keyof typeof deliverablePriorityConfig];
  const StatusIcon = statusConfig?.icon;
  const PriorityIcon = priorityConfig?.icon;

  // Calcular métricas
  const plannedDuration =
    deliverable.startDate && deliverable.endDate
      ? calculateDaysDifference(deliverable.startDate, deliverable.endDate)
      : null;

  const actualDuration =
    deliverable.actualStartDate && deliverable.actualEndDate
      ? calculateDaysDifference(deliverable.actualStartDate, deliverable.actualEndDate)
      : null;

  const isOverdue = deliverable.endDate && new Date(deliverable.endDate) < new Date() && deliverable.progress < 100;
  const isCompleted = deliverable.progress === 100;

  return (
    <div className="space-y-6">
      {/* Header con información básica */}
      <div className="space-y-3">
        {/* Descripción */}
        <div className="flex flex-row items-center gap-2">
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Descripción:</span>
          </div>
          <p className="text-sm leading-relaxed text-foreground">{deliverable.description || "Sin descripción"}</p>
        </div>

        {/* Estado */}
        <div className="flex flex-row items-center gap-2">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Estado:</span>
          </div>
          <div>
            <Badge
              variant="outline"
              className={cn("gap-1", statusConfig?.className, statusConfig?.textClass, statusConfig?.borderColor)}
            >
              {StatusIcon && <StatusIcon className={cn("h-3 w-3", statusConfig?.iconClass)} />}
              {statusConfig?.label}
            </Badge>
          </div>
        </div>

        {/* Prioridad */}
        <div className="flex flex-row items-center gap-2">
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Prioridad:</span>
          </div>
          <div>
            <Badge
              variant="outline"
              className={cn("gap-1", priorityConfig?.className, priorityConfig?.textClass, priorityConfig?.borderColor)}
            >
              {PriorityIcon && <PriorityIcon className={cn("h-3 w-3", priorityConfig?.iconClass)} />}
              {priorityConfig?.label}
            </Badge>
          </div>
        </div>

        {/* Indicadores especiales */}
        {(isOverdue || isCompleted) && (
          <div className="flex flex-row items-center gap-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Estado especial:</span>
            </div>
            <div className="flex items-center gap-2">
              {isOverdue && (
                <Badge
                  variant="outline"
                  className="gap-1 border-red-300 text-red-700 bg-red-50 dark:bg-red-950 dark:text-red-300 dark:border-red-700"
                >
                  <AlertCircle className="h-3 w-3" />
                  Vencido
                </Badge>
              )}
              {isCompleted && (
                <Badge
                  variant="outline"
                  className="gap-1 border-green-300 text-green-700 bg-green-50 dark:bg-green-950 dark:text-green-300 dark:border-green-700"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  Completado
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Progreso y Métricas */}
      <div>
        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          Progreso y Métricas
        </h4>
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">Progreso</span>
              <span className="text-sm font-semibold">{deliverable.progress}%</span>
            </div>
            <Progress value={deliverable.progress} className="h-2" />
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Weight className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Peso del entregable:</span>
            <span className="font-medium">{deliverable.weight}%</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Período Planificado */}
      <div>
        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          Período Planificado
        </h4>
        <div className="space-y-3">
          {/* Fechas planificadas */}
          {deliverable.startDate && deliverable.endDate && (
            <div className="space-y-2">
              <div className="ml-6 space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Inicio:</span>
                  <span className="font-medium">{formatDate(deliverable.startDate)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Fin:</span>
                  <span className="font-medium">{formatDate(deliverable.endDate)}</span>
                </div>
                {plannedDuration && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duración:</span>
                    <span className="font-medium">{plannedDuration} días</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Fechas reales */}
          {(deliverable.actualStartDate || deliverable.actualEndDate) && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Timer className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Real:</span>
              </div>
              <div className="ml-6 space-y-1">
                {deliverable.actualStartDate && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Inicio:</span>
                    <span className="font-medium">{formatDate(deliverable.actualStartDate)}</span>
                  </div>
                )}
                {deliverable.actualEndDate && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Fin:</span>
                    <span className="font-medium">{formatDate(deliverable.actualEndDate)}</span>
                  </div>
                )}
                {actualDuration && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duración:</span>
                    <span className="font-medium">{actualDuration} días</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mostrar fechas individuales si no hay período completo */}
          {!deliverable.startDate && !deliverable.endDate && (
            <div className="text-center py-4 text-muted-foreground">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No hay fechas definidas</p>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Período Real */}
      <div>
        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          Período Real
        </h4>
        <div className="space-y-3">
          {/* Fechas reales */}
          {(deliverable.actualStartDate || deliverable.actualEndDate) && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Timer className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Real:</span>
              </div>
              <div className="ml-6 space-y-1">
                {deliverable.actualStartDate && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Inicio:</span>
                    <span className="font-medium">{formatDate(deliverable.actualStartDate)}</span>
                  </div>
                )}
                {deliverable.actualEndDate && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Fin:</span>
                    <span className="font-medium">{formatDate(deliverable.actualEndDate)}</span>
                  </div>
                )}
                {actualDuration && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duración:</span>
                    <span className="font-medium">{actualDuration} días</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mostrar fechas individuales si no hay período completo */}
          {!deliverable.actualStartDate && !deliverable.actualEndDate && (
            <div className="text-center py-4 text-muted-foreground">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No hay fechas definidas</p>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Documentos */}
      <div>
        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Files className="h-4 w-4 text-muted-foreground" />
          Documentos ({deliverable.documentsCount})
        </h4>

        {deliverable.documentsCount > 0 ? (
          <div className="space-y-3">
            {/* Resumen de documentos */}
            <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Tamaño total:</span>
                <span className="font-medium">{formatFileSize(deliverable.totalDocumentSize)}</span>
              </div>
            </div>

            {/* Lista de documentos */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {deliverable.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.fileName}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatFileSize(doc.fileSize * 1024 * 1024)}</span>
                        <span>•</span>
                        <span>{formatDateTime(doc.uploadedAt)}</span>
                        <span>•</span>
                        <span>
                          {doc.uploadedBy.name} {doc.uploadedBy.lastName}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Files className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay documentos disponibles</p>
          </div>
        )}
      </div>

      {/* Asignación y Metadatos */}
      <div className="space-y-4">
        {/* Asignado a */}
        {deliverable.assignedTo && (
          <>
            <Separator />
            <div>
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-muted-foreground" />
                Asignado a
              </h4>
              <div className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">
                    {deliverable.assignedTo.name} {deliverable.assignedTo.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{deliverable.assignedTo.email}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
