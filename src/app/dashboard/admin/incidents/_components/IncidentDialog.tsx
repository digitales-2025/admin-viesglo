"use client";

import React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AlertCircle, Calendar, Plus } from "lucide-react";

import { useCreateIncident, useIncidentsByDeliverable } from "@/app/dashboard/admin/incidents/_hooks/use-incidents";
import { CreateIncidentRequestDto, IncidentResponseDto } from "@/app/dashboard/admin/incidents/_types/incidents.types";
import { Button } from "@/shared/components/ui/button";
import { DatePicker } from "@/shared/components/ui/date-picker";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/shared/components/ui/empty";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { ResponsiveDialog } from "@/shared/components/ui/resposive-dialog";
import { useMediaQuery } from "@/shared/hooks/use-media-query";

interface IncidentRowContext {
  projectId: string;
  milestoneId?: string;
  phaseId: string;
  deliverableId: string;
}

interface IncidentDialogProps {
  /** Fila/Contexto con los IDs requeridos */
  currentRow: IncidentRowContext;
  /** Trigger personalizado para abrir el diálogo */
  trigger?: React.ReactNode;
  /** Estado de apertura del diálogo */
  open?: boolean;
  /** Callback para cambiar el estado de apertura */
  onOpenChange?: (open: boolean) => void;
}

/**
 * Componente de diálogo para gestionar incidencias de un entregable
 * Permite crear, listar y eliminar incidencias
 */
export function IncidentDialog({ currentRow, open, onOpenChange }: IncidentDialogProps) {
  // Estados para el formulario de nueva incidencia
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [description, setDescription] = React.useState<string>("");

  // Detectar si es desktop para ResponsiveDialog
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Estado interno del diálogo si no se proporciona externamente
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  // Hooks para gestión de incidencias
  const { data: incidentsData } = useIncidentsByDeliverable(
    currentRow.deliverableId,
    currentRow.projectId,
    currentRow.milestoneId,
    currentRow.phaseId,
    isOpen
  );
  const createMutation = useCreateIncident();

  /**
   * Maneja la creación de una nueva incidencia
   */
  const handleCreateIncident = async () => {
    if (!date || !description.trim()) {
      return;
    }

    const incidentData: CreateIncidentRequestDto = {
      projectId: currentRow.projectId,
      milestoneId: currentRow.milestoneId,
      phaseId: currentRow.phaseId,
      deliverableId: currentRow.deliverableId,
      // Alinear con MilestoneResourcesDialog: usar YYYY-MM-DD derivado de toISOString
      date: date.toISOString().split("T")[0],
      description: description.trim(),
    };

    try {
      const payload = {
        description: incidentData.description,
        date: incidentData.date,
        projectId: currentRow.projectId,
        milestoneId: currentRow.milestoneId,
        phaseId: currentRow.phaseId,
        deliverableId: currentRow.deliverableId,
      };
      await createMutation.mutateAsync({ body: payload as any });
      // Limpiar formulario después de crear
      setDate(undefined);
      setDescription("");
    } catch (error) {
      console.error("Error al crear incidencia:", error);
    }
  };

  /**
   * Formatea la fecha para mostrar en la lista
   */
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yy", { locale: es });
    } catch {
      return dateString;
    }
  };

  // Normalizar data cuando openapi devuelve por content-type {"application/json": ...}
  const incidents: IncidentResponseDto[] = React.useMemo(() => {
    if (!incidentsData) return [];
    const maybeWrapper = incidentsData as unknown;
    const payload =
      typeof maybeWrapper === "object" &&
      maybeWrapper !== null &&
      Object.prototype.hasOwnProperty.call(maybeWrapper, "application/json")
        ? (maybeWrapper as Record<string, unknown>)["application/json"]
        : incidentsData;
    const candidate = (payload as { data?: unknown }).data;
    // Si el backend devuelve un array directo (no paginado), úsalo
    const data = Array.isArray(candidate) ? candidate : Array.isArray(payload) ? (payload as unknown[]) : [];
    return Array.isArray(data) ? (data as IncidentResponseDto[]) : [];
  }, [incidentsData]);

  return (
    <ResponsiveDialog
      open={isOpen}
      onOpenChange={setIsOpen}
      isDesktop={isDesktop}
      title="Gestión de Incidencias"
      description="Registra y consulta las incidencias asociadas a este entregable."
      showTrigger={false}
      dialogContentClassName="sm:max-w-3xl px-0"
      dialogScrollAreaClassName="max-h-[70vh]"
      drawerScrollAreaClassName="h-[60vh]"
    >
      <div className="flex flex-col gap-4">
        {/* Formulario para agregar nueva incidencia */}
        <div className="border rounded-md p-4 bg-muted/10">
          <h4 className="text-sm font-medium mb-3 text-foreground">Nueva incidencia</h4>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-3 items-end">
            <div className="space-y-1.5">
              <Label htmlFor="incident-date" className="text-xs text-muted-foreground">
                Fecha
              </Label>
              <DatePicker selected={date} onSelect={setDate} placeholder="Seleccionar fecha" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="incident-description" className="text-xs text-muted-foreground">
                Descripción
              </Label>
              <Input
                id="incident-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describa la incidencia..."
                className="w-full"
              />
            </div>

            <Button
              onClick={handleCreateIncident}
              disabled={!date || !description.trim() || createMutation.isPending}
              size="default"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              {createMutation.isPending ? "Agregando..." : "Agregar"}
            </Button>
          </div>
        </div>

        {/* Lista de incidencias */}
        <div className="flex flex-col">
          <h4 className="text-sm font-medium mb-2 text-foreground">
            Historial de incidencias
            {incidents.length > 0 && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">({incidents.length})</span>
            )}
          </h4>
          <div className="border rounded-md overflow-hidden">
            {/* Encabezados de la tabla */}
            <div className="grid grid-cols-12 gap-3 px-3 py-2 bg-muted/40 border-b text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <div className="col-span-3 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Fecha
              </div>
              <div className="col-span-9">Descripción</div>
            </div>

            {/* Contenido de la tabla */}
            <div className="max-h-64 overflow-y-auto">
              {incidents.length > 0 ? (
                incidents.map((incident, index) => (
                  <div
                    key={incident.id}
                    className={`grid grid-cols-12 gap-3 px-3 py-2.5 transition-colors hover:bg-muted/30 ${
                      index !== incidents.length - 1 ? "border-b border-border/50" : ""
                    }`}
                  >
                    <div className="col-span-3 text-sm text-muted-foreground font-mono">
                      {formatDate(incident.date)}
                    </div>
                    <div className="col-span-9 text-sm text-foreground">{incident.description}</div>
                  </div>
                ))
              ) : (
                <Empty className="py-6">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <AlertCircle className="size-5" />
                    </EmptyMedia>
                    <EmptyTitle className="text-sm">Sin incidencias</EmptyTitle>
                    <EmptyDescription className="text-xs">
                      No hay incidencias registradas para este entregable.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </div>
          </div>
        </div>
      </div>
    </ResponsiveDialog>
  );
}
