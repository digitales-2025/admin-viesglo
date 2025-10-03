"use client";

import React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Plus } from "lucide-react";

import { useCreateIncident, useIncidentsByDeliverable } from "@/app/dashboard/admin/incidents/_hooks/use-incidents";
import { CreateIncidentRequestDto, IncidentResponseDto } from "@/app/dashboard/admin/incidents/_types/incidents.types";
import { Button } from "@/shared/components/ui/button";
import { DatePicker } from "@/shared/components/ui/date-picker";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

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

/**
 * Componente de diálogo para gestionar incidencias de un entregable
 * Permite crear, listar y eliminar incidencias
 */
export function IncidentDialog({ currentRow, open, onOpenChange }: IncidentDialogProps) {
  // Estados para el formulario de nueva incidencia
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [description, setDescription] = React.useState<string>("");
  // Ya no usamos Popover/Calendar, mantenemos solo el estado de fecha

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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="!max-w-none w-[55vw] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Incidencia</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Formulario para agregar nueva incidencia */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="incident-date">Fecha</Label>
              <DatePicker selected={date} onSelect={setDate} placeholder="Seleccionar fecha" />
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
              </div>

              {/* Contenido de la tabla */}
              <div className="max-h-96 overflow-y-auto">
                {incidents.length > 0
                  ? incidents.map((incident) => (
                      <div
                        key={incident.id}
                        className="grid grid-cols-12 gap-4 p-3 border-b last:border-b-0 hover:bg-gray-50 transition-colors"
                      >
                        <div className="col-span-3 text-sm">{formatDate(incident.date)}</div>
                        <div className="col-span-8 text-sm">{incident.description}</div>
                      </div>
                    ))
                  : null}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
