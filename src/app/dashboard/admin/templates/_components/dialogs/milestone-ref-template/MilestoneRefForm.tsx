"use client";

import { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";

import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { MilestoneRefFormData } from "../../../_schemas/projectTemplates.schemas";
import { MilestoneTemplateRefRequestDto } from "../../../_types/templates.types";

interface MilestoneRefFormProps {
  form: UseFormReturn<MilestoneRefFormData>;
  onSubmit: (data: MilestoneRefFormData) => void;
  onClose?: () => void;
  isPending?: boolean;
  isUpdate?: boolean;
  initialData?: MilestoneTemplateRefRequestDto;
}

export default function MilestoneRefForm({
  form,
  onSubmit,
  onClose,
  isPending = false,
  isUpdate = false,
  initialData,
}: MilestoneRefFormProps) {
  const [selectedMilestoneTemplateId, setSelectedMilestoneTemplateId] = useState<string>("");

  // Pre-seleccionar el milestone template cuando se está editando
  useEffect(() => {
    if (isUpdate && initialData?.milestoneTemplateId) {
      setSelectedMilestoneTemplateId(initialData.milestoneTemplateId);
    }
  }, [isUpdate, initialData]);

  // Función para manejar el submit con validación
  const handleSubmit = (data: MilestoneRefFormData) => {
    // Validar que se haya seleccionado un milestone template (solo para crear, no para editar)
    if (!isUpdate && !selectedMilestoneTemplateId) {
      return;
    }

    // Para editar, usar el milestone template pre-seleccionado o el seleccionado
    const milestoneTemplateId = isUpdate
      ? selectedMilestoneTemplateId || initialData?.milestoneTemplateId || ""
      : selectedMilestoneTemplateId;

    if (!milestoneTemplateId) {
      return;
    }

    // Crear los datos finales con el milestone template seleccionado
    const finalData: MilestoneRefFormData = {
      ...data,
      milestoneTemplateId,
    };

    // Llamar al onSubmit original
    onSubmit(finalData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="customName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-sans font-semibold">Nombre Personalizado (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Inicio del Proyecto" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isRequired"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-sm font-medium">Hito Requerido</FormLabel>
                <p className="text-xs text-muted-foreground">
                  Marca esta opción si el hito es obligatorio para el proyecto
                </p>
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Guardando..." : isUpdate ? "Actualizar Configuración" : "Agregar a Plantilla"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
