"use client";

import * as React from "react";
import {
  AlertCircle,
  BarChart3,
  Calendar,
  Clock,
  Edit,
  ExternalLink,
  FileDown,
  FilePlus,
  Files,
  FileText,
  MoreHorizontal,
  Trash2,
  UserCheck,
} from "lucide-react";

import { EnumAction, EnumResource } from "@/app/dashboard/admin/settings/_types/roles.types";
import { PermissionProtected } from "@/shared/components/protected-component";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Progress } from "@/shared/components/ui/progress";
import { Separator } from "@/shared/components/ui/separator";
import { cn } from "@/shared/lib/utils";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { AdditionalDeliverableDetailedResponseDto } from "../../../../_types";
import { deliverableStatusConfig } from "../../../../_utils/projects.utils";

interface AdditionalDeliverableDetailsPanelProps {
  additionalDeliverable: AdditionalDeliverableDetailedResponseDto;
  projectId: string;
  phaseId: string;
  milestoneStatus?: string; // Estado del milestone para determinar restricciones
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

// Función para calcular días de diferencia
const calculateDaysDifference = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export function AdditionalDeliverableDetailsPanel({
  additionalDeliverable,
  projectId,
  phaseId,
  milestoneStatus,
}: AdditionalDeliverableDetailsPanelProps) {
  const { open } = useDialogStore();
  const [popupWindow, setPopupWindow] = React.useState<Window | null>(null);
  const statusConfig = deliverableStatusConfig[additionalDeliverable.status as keyof typeof deliverableStatusConfig];
  const StatusIcon = statusConfig?.icon;

  // Calcular métricas
  const actualDuration =
    additionalDeliverable.actualStartDate && additionalDeliverable.actualEndDate
      ? calculateDaysDifference(additionalDeliverable.actualStartDate, additionalDeliverable.actualEndDate)
      : null;

  // Función para determinar si los documentos están restringidos
  const areDocumentsRestricted = (): boolean => {
    // Restringir si el entregable está completado o el milestone está oficialmente aprobado
    return milestoneStatus === "OFFICIALLY_APPROVED";
  };

  // Función para determinar si se puede agregar documentos
  const canAddDocuments = (): boolean => {
    return !areDocumentsRestricted();
  };

  // Función para determinar si se puede editar/eliminar documentos
  const canEditDeleteDocuments = (): boolean => {
    return !areDocumentsRestricted();
  };

  // Funciones para manejar acciones de documentos
  const handleCreateDocument = () => {
    open("additional-deliverable-documents", "create", {
      projectId,
      phaseId,
      additionalDeliverableId: additionalDeliverable.id,
    });
  };

  const handleEditDocument = (document: any) => {
    open("additional-deliverable-documents", "edit", {
      ...document,
      projectId,
      phaseId,
      additionalDeliverableId: additionalDeliverable.id,
    });
  };

  const handleDeleteDocument = (document: any) => {
    open("additional-deliverable-documents", "delete", {
      ...document,
      projectId,
      phaseId,
      additionalDeliverableId: additionalDeliverable.id,
    });
  };

  // Función para abrir la ventana popup pequeña
  const openPopupWindow = (fileUrl: string, fileName: string) => {
    if (!fileUrl) return;

    // Limpiar ventana anterior si existe
    if (popupWindow && !popupWindow.closed) {
      popupWindow.close();
    }

    // Configuración de la ventana popup pequeña
    const width = 900;
    const height = 600;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    const features = `
      width=${width},
      height=${height},
      left=${left},
      top=${top},
      scrollbars=yes,
      resizable=yes,
      status=no,
      toolbar=no,
      location=no,
      menubar=no,
      directories=no
    `.replace(/\s/g, "");

    try {
      const newWindow = window.open(fileUrl, fileName || "Nextcloud Document", features);
      setPopupWindow(newWindow);
    } catch (error) {
      console.error("Error abriendo popup:", error);
    }
  };

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
          <p className="text-sm leading-relaxed text-foreground">
            {additionalDeliverable.description || "Sin descripción"}
          </p>
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

        {/* Tipo de entregable */}
        <div className="flex flex-row items-center gap-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Tipo:</span>
          </div>
          <div>
            <Badge
              variant="outline"
              className="gap-1 bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-700"
            >
              <FileText className="h-3 w-3" />
              Entregable Adicional
            </Badge>
          </div>
        </div>
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
              <span className="text-sm font-semibold">{additionalDeliverable.progress || 0}%</span>
            </div>
            <Progress value={additionalDeliverable.progress || 0} className="h-2" />
          </div>
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
          {(additionalDeliverable.actualStartDate || additionalDeliverable.actualEndDate) && (
            <div className="space-y-2">
              <div className="ml-6 space-y-1">
                {additionalDeliverable.actualStartDate && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Inicio:</span>
                    <span className="font-medium">{formatDate(additionalDeliverable.actualStartDate)}</span>
                  </div>
                )}
                {additionalDeliverable.actualEndDate && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Fin:</span>
                    <span className="font-medium">{formatDate(additionalDeliverable.actualEndDate)}</span>
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

          {/* Mostrar mensaje si no hay fechas definidas */}
          {!additionalDeliverable.actualStartDate && !additionalDeliverable.actualEndDate && (
            <div className="text-center py-4 text-muted-foreground">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No hay fechas de ejecución definidas</p>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Documentos */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-col gap-1">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Files className="h-4 w-4 text-muted-foreground" />
              Documentos ({additionalDeliverable.additionalDocumentsCount || 0})
            </h4>
            {areDocumentsRestricted() && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> Documentos bloqueados: Hito oficialmente aprobado
              </p>
            )}
          </div>
          <PermissionProtected
            permissions={[
              { resource: EnumResource.deliverables, action: EnumAction.write },
              { resource: EnumResource.deliverables, action: EnumAction.manage },
            ]}
            requireAll={false}
            hideOnUnauthorized={true}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleCreateDocument();
              }}
              className="h-8 gap-2"
              disabled={!canAddDocuments()}
            >
              <FilePlus className="h-4 w-4" />
              Agregar
            </Button>
          </PermissionProtected>
        </div>

        {additionalDeliverable.additionalDocumentsCount > 0 ? (
          <div className="space-y-3">
            {/* Lista de documentos con previsualización */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {additionalDeliverable.additionalDocuments.map((doc) => (
                <div key={doc.id} className="space-y-2">
                  {/* Información del documento con acciones */}
                  <div
                    className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => openPopupWindow(doc.fileUrl, doc.fileName)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{doc.fileName}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatDateTime(doc.uploadedAt)}</span>
                          <span>•</span>
                          <span>
                            {doc.uploadedBy.name} {doc.uploadedBy.lastName}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          openPopupWindow(doc.fileUrl, doc.fileName);
                        }}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <PermissionProtected
                        permissions={[
                          { resource: EnumResource.deliverables, action: EnumAction.write },
                          { resource: EnumResource.deliverables, action: EnumAction.manage },
                        ]}
                        requireAll={false}
                        hideOnUnauthorized={true}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={(e) => e.stopPropagation()}
                              disabled={!canEditDeleteDocuments()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditDocument(doc);
                              }}
                              disabled={!canEditDeleteDocuments()}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteDocument(doc);
                              }}
                              className="text-red-600 focus:text-red-600"
                              disabled={!canEditDeleteDocuments()}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </PermissionProtected>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Files className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm mb-3">No hay documentos disponibles</p>
            <PermissionProtected
              permissions={[
                { resource: EnumResource.deliverables, action: EnumAction.write },
                { resource: EnumResource.deliverables, action: EnumAction.manage },
              ]}
              requireAll={false}
              hideOnUnauthorized={true}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCreateDocument();
                }}
                className="gap-2"
                disabled={!canAddDocuments()}
              >
                <FilePlus className="h-4 w-4" />
                Agregar primer documento
              </Button>
            </PermissionProtected>
          </div>
        )}
      </div>

      {/* Metadatos */}
      <div className="space-y-4">
        <Separator />
        <div>
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-muted-foreground" />
            Información del Entregable
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Creado:</span>
              <span className="font-medium">{formatDateTime(additionalDeliverable.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Última actualización:</span>
              <span className="font-medium">{formatDateTime(additionalDeliverable.updatedAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
