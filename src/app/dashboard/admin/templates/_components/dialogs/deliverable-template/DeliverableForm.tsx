import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import { Button } from "@/shared/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { DeliverableFormData } from "../../../_schemas/projectTemplates.schemas";
import {
  DeliverablePriority,
  DeliverableTemplateResponseDto,
  MilestoneTemplateResponseDto,
  PhaseTemplateResponseDto,
} from "../../../_types/templates.types";
import { deliverablePriorityConfig } from "../../../_utils/templates.utils";
import { AdvancedPrecedenceManager } from "./AdvancedPrecedenceManager";

interface DeliverableFormProps {
  form: UseFormReturn<DeliverableFormData>;
  onSubmit: (data: DeliverableFormData, selectedMilestoneId?: string, selectedPhaseId?: string) => void;
  onClose?: () => void;
  phases: (PhaseTemplateResponseDto & { milestoneId: string })[];
  deliverables: (DeliverableTemplateResponseDto & { phaseId: string })[];
  milestoneTemplates: MilestoneTemplateResponseDto[];
  isPending?: boolean;
  isUpdate?: boolean;
  initialData?: DeliverableTemplateResponseDto & { phaseId?: string };
}

export default function DeliverableForm({
  form,
  onSubmit,
  onClose,
  phases,
  deliverables,
  milestoneTemplates,
  isPending = false,
  isUpdate = false,
  initialData,
}: DeliverableFormProps) {
  const [selectedPhaseId, setSelectedPhaseId] = useState<string>("");
  const [selectedMilestoneTemplateId, setSelectedMilestoneTemplateId] = useState<string>("");

  // Función para encontrar el milestone al que pertenece una fase
  const findMilestoneForPhase = (phaseId: string): string => {
    // Primero buscar en las fases locales
    const localPhase = phases.find((p) => p.id === phaseId);
    if (localPhase) {
      return localPhase.milestoneId;
    }

    // Si no se encuentra en las fases locales, buscar en los milestone templates
    for (const milestone of milestoneTemplates) {
      if (milestone.phases?.some((phase) => phase.id === phaseId)) {
        return milestone.id;
      }
    }

    return "";
  };

  // Pre-seleccionar milestone y fase cuando se está editando
  useEffect(() => {
    if (isUpdate && initialData?.phaseId && milestoneTemplates.length > 0) {
      // Encontrar el milestone que contiene esta fase
      const milestoneId = findMilestoneForPhase(initialData.phaseId);
      if (milestoneId) {
        setSelectedMilestoneTemplateId(milestoneId);
        setSelectedPhaseId(initialData.phaseId);
      }
    }
  }, [isUpdate, initialData, milestoneTemplates]);

  // Restaurar valores solo si se pierden completamente en modo edición
  useEffect(() => {
    if (isUpdate && initialData?.phaseId && !selectedMilestoneTemplateId && !selectedPhaseId) {
      const milestoneId = findMilestoneForPhase(initialData.phaseId);
      if (milestoneId) {
        setSelectedMilestoneTemplateId(milestoneId);
        setSelectedPhaseId(initialData.phaseId);
      }
    }
  }, [isUpdate, initialData, selectedMilestoneTemplateId, selectedPhaseId, milestoneTemplates]);

  // Obtener las fases del milestone seleccionado (combinando milestoneTemplates y phases locales)
  const getPhasesForSelectedMilestone = () => {
    if (!selectedMilestoneTemplateId) return [];

    // Obtener fases del milestone template
    const selectedMilestone = milestoneTemplates.find((m) => m.id === selectedMilestoneTemplateId);
    const templatePhases = selectedMilestone?.phases || [];

    // Obtener fases locales que pertenecen a este milestone
    const localPhases = phases.filter((p) => p.milestoneId === selectedMilestoneTemplateId);

    // Combinar ambas listas, evitando duplicados por ID y por nombre
    const allPhases = [...templatePhases];

    localPhases.forEach((localPhase) => {
      // Verificar si ya existe una fase con el mismo ID o el mismo nombre
      const existsById = allPhases.some((templatePhase) => templatePhase.id === localPhase.id);
      const existsByName = allPhases.some((templatePhase) => templatePhase.name === localPhase.name);

      if (!existsById && !existsByName) {
        allPhases.push(localPhase);
      }
    });

    return allPhases;
  };

  const availablePhases = getPhasesForSelectedMilestone();

  const enrichedDeliverables = deliverables
    .filter((d) => {
      // Si estamos en modo edición, excluir el entregable que se está editando
      if (isUpdate && initialData && d.id === initialData.id) {
        return false;
      }
      return true;
    })
    .map((d) => {
      const phase = phases.find((p) => p.id === d.phaseId);
      return {
        ...d,
        phaseName: phase?.name || "Fase desconocida",
        priority: d.priority || DeliverablePriority.MEDIUM,
      };
    });

  const currentDeliverable = {
    id: "current",
    name: form.watch("name") || "Nuevo entregable",
    phaseId: selectedPhaseId,
    phaseName: phases.find((p) => p.id === selectedPhaseId)?.name || "Fase seleccionada",
    priority: form.watch("priority") as DeliverablePriority,
  };
  // Función para manejar el submit con validación
  const handleSubmit = (data: DeliverableFormData) => {
    // Validar que se hayan seleccionado milestone y fase
    if (!selectedMilestoneTemplateId || !selectedPhaseId) {
      return;
    }

    // Llamar al onSubmit original con los valores seleccionados
    onSubmit(data, selectedMilestoneTemplateId, selectedPhaseId);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <FormItem>
            <FormLabel className="font-sans font-semibold">Milestone Template</FormLabel>
            {milestoneTemplates.length === 0 ? (
              <div className="flex items-center justify-center p-4 border border-dashed border-gray-300 rounded-md">
                <div className="text-center">
                  <Info className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 mb-2">No hay plantillas de hitos disponibles</p>
                  <p className="text-xs text-gray-400">Primero debes crear un plantilla de hito</p>
                </div>
              </div>
            ) : (
              <>
                <Select
                  value={selectedMilestoneTemplateId}
                  onValueChange={(value) => {
                    // Solo bloquear valores completamente vacíos, permitir cambios válidos
                    if (!value) {
                      return;
                    }
                    setSelectedMilestoneTemplateId(value);
                    setSelectedPhaseId(""); // Reset phase when milestone changes
                  }}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un milestone template" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {milestoneTemplates.map((milestone) => (
                      <SelectItem key={milestone.id} value={milestone.id}>
                        {milestone.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!selectedMilestoneTemplateId && !isUpdate && (
                  <p className="text-sm text-red-500 mt-1">Debes seleccionar un milestone template</p>
                )}
              </>
            )}
          </FormItem>

          <FormItem>
            <FormLabel className="font-sans font-semibold">Fase</FormLabel>
            <>
              <Select
                value={selectedPhaseId}
                onValueChange={(value) => {
                  // Solo bloquear valores completamente vacíos, permitir cambios válidos
                  if (!value) {
                    return;
                  }
                  setSelectedPhaseId(value);
                }}
                disabled={!selectedMilestoneTemplateId}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        selectedMilestoneTemplateId ? "Selecciona una fase" : "Primero selecciona una plantilla de hito"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availablePhases.map((phase) => (
                    <SelectItem key={phase.id} value={phase.id}>
                      {phase.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!selectedPhaseId && selectedMilestoneTemplateId && !isUpdate && (
                <p className="text-sm text-red-500 mt-1">Debes seleccionar una fase</p>
              )}
            </>
          </FormItem>

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-sans font-semibold">Prioridad</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona una prioridad" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(DeliverablePriority).map((p) => {
                      const cfg = deliverablePriorityConfig[p];
                      return (
                        <SelectItem key={p} value={p}>
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-3.5 h-3.5 rounded-full inline-block ${cfg?.dotClass ?? "bg-gray-400"}`}
                              aria-hidden
                            />
                            <span>{cfg?.label ?? p}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-sans font-semibold">Nombre del Entregable</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Acta de responsabilidades" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-sans font-semibold">Descripción (Opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe el contenido o requisitos del entregable..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          {selectedPhaseId && (
            <AdvancedPrecedenceManager
              currentDeliverable={currentDeliverable}
              allDeliverables={enrichedDeliverables}
              selectedPrecedences={form.watch("precedence") || []}
              onPrecedencesChange={(precedences) => form.setValue("precedence", precedences)}
              deliverables={deliverables}
              phases={phases}
              milestoneTemplates={milestoneTemplates}
            />
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isPending || !selectedMilestoneTemplateId || !selectedPhaseId}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isPending ? "Guardando..." : "Guardar Entregable"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
