"use client";

import React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, Plus, Trash2 } from "lucide-react";

import { useProfile } from "@/app/(public)/auth/sign-in/_hooks/use-auth";
import {
  useCreateIncident,
  useDeleteIncident,
  useIncidentsByDeliverable,
} from "@/app/dashboard/admin/incidents/_hooks/use-incidents";
import { CreateIncidentRequestDto, IncidentResponseDto } from "@/app/dashboard/admin/incidents/_types/incidents.types";
import { Button } from "@/shared/components/ui/button";
import { Calendar as CalendarComponent } from "@/shared/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { cn } from "@/shared/lib/utils";

interface IncidentRowContext {
  projectId: string;
  milestoneId: string;
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

// Ejemplo de implementación
{
  /* <IncidentDialog
  currentRow={{ projectId, milestoneId, phaseId, deliverableId }}
  open={isOpenForModule("deliverables", "incidents")}
  onOpenChange={(o) => (o ? open() : close())}
/> */
}

/**
 * Componente de diálogo para gestionar incidencias de un entregable
 * Permite crear, listar y eliminar incidencias
 */
export function IncidentDialog({ currentRow, trigger, open, onOpenChange }: IncidentDialogProps) {
  // Estados para el formulario de nueva incidencia
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [description, setDescription] = React.useState<string>("");
  const [calendarOpen, setCalendarOpen] = React.useState(false);

  // Hooks para gestión de incidencias
  const { data: incidentsData, isLoading, error } = useIncidentsByDeliverable(currentRow.deliverableId);
  const createMutation = useCreateIncident();
  const deleteMutation = useDeleteIncident();
  const profile = useProfile();

  // Estado interno del diálogo si no se proporciona externamente
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

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
      date: date.toISOString().split("T")[0],
      description: description.trim(),
    };

    try {
      const createdById = typeof profile.data?.id === "string" ? profile.data.id : "";
      await createMutation.mutateAsync({
        body: {
          description: incidentData.description,
          date: incidentData.date,
          projectId: currentRow.projectId,
          milestoneId: currentRow.milestoneId,
          phaseId: currentRow.phaseId,
          deliverableId: currentRow.deliverableId,
          createdById,
        },
      });
      // Limpiar formulario después de crear
      setDate(undefined);
      setDescription("");
    } catch (error) {
      console.error("Error al crear incidencia:", error);
    }
  };

  /**
   * Maneja la eliminación de una incidencia
   */
  const handleDeleteIncident = async (incidentId: string) => {
    try {
      await deleteMutation.mutateAsync({ params: { path: { id: incidentId } } });
    } catch (error) {
      console.error("Error al eliminar incidencia:", error);
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
    const data = (payload as { data?: unknown }).data;
    return Array.isArray(data) ? (data as IncidentResponseDto[]) : [];
  }, [incidentsData]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Incidencias
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Incidencia</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Formulario para agregar nueva incidencia */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="incident-date">Fecha</Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd/MM/yyyy", { locale: es }) : "Seleccione fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={(selectedDate) => {
                      setDate(selectedDate);
                      setCalendarOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="incident-description">Detalle</Label>
              <Input
                id="incident-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Escriba el detalle"
                className="w-full"
              />
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleCreateIncident}
                disabled={!date || !description.trim() || createMutation.isPending}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                {createMutation.isPending ? "Agregando..." : "Agregar"}
              </Button>
            </div>
          </div>

          {/* Lista de incidencias */}
          <div className="flex-1 overflow-hidden">
            <div className="border rounded-lg overflow-hidden">
              {/* Encabezados de la tabla */}
              <div className="grid grid-cols-12 gap-4 p-3 bg-gray-100 border-b font-medium text-sm">
                <div className="col-span-3">Fecha</div>
                <div className="col-span-8">Detalle</div>
                <div className="col-span-1">Acciones</div>
              </div>

              {/* Contenido de la tabla */}
              <div className="max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="p-8 text-center text-muted-foreground">Cargando incidencias...</div>
                ) : error ? (
                  <div className="p-8 text-center text-destructive">Error al cargar las incidencias</div>
                ) : incidents.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">No hay incidencias registradas</div>
                ) : (
                  incidents.map((incident) => (
                    <div
                      key={incident.id}
                      className="grid grid-cols-12 gap-4 p-3 border-b last:border-b-0 hover:bg-gray-50 transition-colors"
                    >
                      <div className="col-span-3 text-sm">{formatDate(incident.date)}</div>
                      <div className="col-span-8 text-sm">{incident.description}</div>
                      <div className="col-span-1 flex justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteIncident(incident.id)}
                          disabled={deleteMutation.isPending}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
