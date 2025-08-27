"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { DeliverableFormData, deliverableSchema } from "../_schemas/projectTemplates.schemas";
import {
  DeliverablePriority,
  DeliverableTemplateResponseDto,
  MilestoneTemplateResponseDto,
} from "../_types/templates.types";
import { useAddDeliverableToPhase, useUpdateDeliverableOfPhase } from "./use-milestone-templates";

interface UseDeliverableTemplateFormProps {
  isUpdate?: boolean;
  initialData?: DeliverableTemplateResponseDto;
  milestoneTemplateId?: string;
  phaseId?: string;
  onSuccess?: (response?: MilestoneTemplateResponseDto) => void;
}

export function useDeliverableTemplateForm({
  isUpdate = false,
  initialData,
  milestoneTemplateId = "",
  phaseId = "",
  onSuccess,
}: UseDeliverableTemplateFormProps) {
  const { mutate: addDeliverable, isPending: isAdding } = useAddDeliverableToPhase();
  const { mutate: updateDeliverable, isPending: isUpdating } = useUpdateDeliverableOfPhase();
  const isPending = isAdding || isUpdating;

  const form = useForm<DeliverableFormData>({
    resolver: zodResolver(deliverableSchema),
    defaultValues: {
      name: "",
      description: "",
      priority: undefined,
      precedence: [],
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (initialData && isUpdate) {
      const formData = {
        name: initialData.name || "",
        description: initialData.description || "",
        priority: (initialData.priority as DeliverablePriority) || DeliverablePriority.MEDIUM,
        precedence: initialData.precedence || [],
      };
      form.reset(formData);
    } else {
      // Reset form when not in update mode
      form.reset({
        name: "",
        description: "",
        priority: undefined,
        precedence: [],
      });
    }
  }, [initialData, isUpdate, form]);

  // Función para obtener los datos finales
  const getSubmitData = (data: DeliverableFormData) => {
    return data;
  };

  // Nueva función onSubmit que recibe los valores seleccionados
  const onSubmit = (data: DeliverableFormData, selectedMilestoneId?: string, selectedPhaseId?: string) => {
    // Usar los valores seleccionados si se proporcionan, sino usar los valores por defecto
    const finalMilestoneId = selectedMilestoneId || milestoneTemplateId;
    const finalPhaseId = selectedPhaseId || phaseId;

    // Validar que los parámetros requeridos estén presentes
    if (!finalMilestoneId || !finalPhaseId) {
      toast.error("Debe seleccionar un milestone y una fase antes de crear un entregable");
      return;
    }

    if (isUpdate && initialData) {
      updateDeliverable(
        {
          params: {
            path: {
              id: finalMilestoneId,
              phaseId: finalPhaseId,
              deliverableId: initialData.id,
            },
          },
          body: data,
        },
        {
          onSuccess: (response) => {
            onSuccess?.(response);
            form.reset();
          },
        }
      );
    } else {
      addDeliverable(
        {
          params: {
            path: {
              id: finalMilestoneId,
              phaseId: finalPhaseId,
            },
          },
          body: data,
        },
        {
          onSuccess: (response) => {
            onSuccess?.(response);
            form.reset();
          },
        }
      );
    }
  };

  const addPrecedence = (deliverableId: string) => {
    const currentPrecedence = form.getValues("precedence") || [];
    if (!currentPrecedence.some((p) => p.deliverableId === deliverableId)) {
      form.setValue("precedence", [...currentPrecedence, { deliverableId }]);
    }
  };

  const removePrecedence = (deliverableId: string) => {
    const currentPrecedence = form.getValues("precedence") || [];
    form.setValue(
      "precedence",
      currentPrecedence.filter((p) => p.deliverableId !== deliverableId)
    );
  };

  return {
    form,
    isUpdate,
    onSuccess,
    getSubmitData,
    isPending,
    onSubmit,
    addPrecedence,
    removePrecedence,
  };
}
