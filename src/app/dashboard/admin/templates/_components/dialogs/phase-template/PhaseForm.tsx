"use client";

import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import { Button } from "@/shared/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { PhaseFormData } from "../../../_schemas/projectTemplates.schemas";
import { MilestoneTemplateResponseDto, PhaseTemplateResponseDto } from "../../../_types/templates.types";

interface PhaseFormProps {
  form: UseFormReturn<PhaseFormData>;
  onSubmit: (data: PhaseFormData, selectedMilestoneId?: string) => void;
  onClose?: () => void;
  milestones: MilestoneTemplateResponseDto[];
  isPending?: boolean;
  isUpdate?: boolean;
  initialData?: PhaseTemplateResponseDto & { milestoneId?: string }; // Para saber qué fase se está editando
}

export default function PhaseForm({
  form,
  onSubmit,
  onClose,
  milestones,
  isPending = false,
  isUpdate = false,
  initialData,
}: PhaseFormProps) {
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>("");

  // Función para encontrar el milestone al que pertenece una fase
  const findMilestoneForPhase = (phaseId: string): string => {
    // Primero intentar buscar por milestoneId si está disponible
    if (initialData?.milestoneId) {
      return initialData.milestoneId;
    }

    // Si no, buscar en los milestones por el phaseId
    for (const milestone of milestones) {
      if (milestone.phases?.some((phase) => phase.id === phaseId)) {
        return milestone.id;
      }
    }

    return "";
  };

  // Pre-seleccionar el milestone cuando se está editando
  useEffect(() => {
    if (isUpdate && initialData?.milestoneId) {
      setSelectedMilestoneId(initialData.milestoneId);
    }
  }, [isUpdate, initialData]);

  // Mantener el milestone seleccionado en modo edición
  useEffect(() => {
    if (isUpdate && initialData?.milestoneId && !selectedMilestoneId) {
      setSelectedMilestoneId(initialData.milestoneId);
    }
  }, [isUpdate, initialData, selectedMilestoneId]);

  // Función para manejar el submit con validación
  const handleSubmit = (data: PhaseFormData) => {
    // Validar que se haya seleccionado un milestone (solo para crear, no para editar)
    if (!isUpdate && !selectedMilestoneId) {
      return;
    }

    // Para editar, usar el milestone pre-seleccionado o el seleccionado
    const milestoneId = isUpdate
      ? selectedMilestoneId || (initialData?.id ? findMilestoneForPhase(initialData.id) : "")
      : selectedMilestoneId;

    if (!milestoneId) {
      return;
    }

    // Llamar al onSubmit original con el milestone seleccionado
    onSubmit(data, milestoneId);
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormItem>
          <FormLabel className="font-sans font-semibold">Plantilla de hito</FormLabel>
          {milestones.length === 0 ? (
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
                value={selectedMilestoneId}
                onValueChange={(value) => {
                  // En modo edición, no permitir valores vacíos
                  if (isUpdate && !value) {
                    return;
                  }
                  setSelectedMilestoneId(value);
                }}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona una plantilla de hito" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {milestones.map((milestone) => (
                    <SelectItem key={milestone.id} value={milestone.id}>
                      {milestone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!selectedMilestoneId && (
                <p className="text-sm text-red-500 mt-1">Debes seleccionar una plantilla de hito</p>
              )}
            </>
          )}
        </FormItem>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-sans font-semibold">Nombre de la Fase</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Inicio de proyecto" {...field} />
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
                  placeholder="Describe el propósito de esta fase..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Guardando..." : "Guardar Fase"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
