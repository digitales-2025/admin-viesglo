"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { PhaseFormData, phaseSchema } from "../_schemas/projectTemplates.schemas";
import { PhaseTemplateResponseDto } from "../_types/templates.types";
import { useAddPhaseToMilestoneTemplate, useUpdatePhaseOfMilestoneTemplate } from "./use-milestone-templates";

interface UsePhaseTemplateFormProps {
  isUpdate?: boolean;
  initialData?: PhaseTemplateResponseDto;
  milestoneTemplateId?: string;
  onSuccess?: () => void;
}

export function usePhaseTemplateForm({
  isUpdate = false,
  initialData,
  milestoneTemplateId = "",
  onSuccess,
}: UsePhaseTemplateFormProps) {
  const { mutate: addPhase, isPending: isAdding } = useAddPhaseToMilestoneTemplate();
  const { mutate: updatePhase, isPending: isUpdating } = useUpdatePhaseOfMilestoneTemplate();
  const isPending = isAdding || isUpdating;

  const form = useForm<PhaseFormData>({
    resolver: zodResolver(phaseSchema),
    defaultValues: {
      name: "",
      description: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (initialData && isUpdate) {
      const formData = {
        name: initialData.name || "",
        description: initialData.description || "",
      };
      form.reset(formData);
    } else {
      // Reset form when not in update mode
      form.reset({
        name: "",
        description: "",
      });
    }
  }, [initialData, isUpdate, form]);

  // Función para obtener los datos finales
  const getSubmitData = (data: PhaseFormData) => {
    return data;
  };

  // Nueva función onSubmit que recibe el milestone seleccionado
  const onSubmit = (data: PhaseFormData, selectedMilestoneId?: string) => {
    // Usar el milestone seleccionado si se proporciona, sino usar el valor por defecto
    const finalMilestoneId = selectedMilestoneId || milestoneTemplateId;

    // Validar que el milestone esté presente
    if (!finalMilestoneId) {
      return;
    }

    if (isUpdate && initialData) {
      updatePhase(
        {
          params: {
            path: {
              id: finalMilestoneId,
              phaseId: initialData.id,
            },
          },
          body: data,
        },
        {
          onSuccess: () => {
            onSuccess?.();
            form.reset();
          },
        }
      );
    } else {
      addPhase(
        {
          params: { path: { id: finalMilestoneId } },
          body: data,
        },
        {
          onSuccess: () => {
            onSuccess?.();
            form.reset();
          },
        }
      );
    }
  };

  return {
    form,
    isUpdate,
    onSuccess,
    getSubmitData,
    isPending,
    onSubmit,
  };
}
