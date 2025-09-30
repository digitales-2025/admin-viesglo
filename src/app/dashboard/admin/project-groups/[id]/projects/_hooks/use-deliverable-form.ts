"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { DeliverableForm, deliverableSchema } from "../_schemas/deliverables.schemas";
import { DeliverableDetailedResponseDto } from "../_types";
import { useAddDeliverable, useUpdateDeliverable } from "./use-project-deliverables";

interface UseDeliverableFormProps {
  isUpdate?: boolean;
  initialData?: DeliverableDetailedResponseDto;
  projectId: string;
  phaseId: string;
  onSuccess?: () => void;
}

export function useDeliverableForm({
  isUpdate = false,
  initialData,
  projectId,
  phaseId,
  onSuccess,
}: UseDeliverableFormProps) {
  const { mutate: addDeliverable, isPending: isCreating } = useAddDeliverable();
  const { mutate: updateDeliverable, isPending: isUpdating } = useUpdateDeliverable();
  const isPending = isCreating || isUpdating;

  const form = useForm<DeliverableForm>({
    resolver: zodResolver(deliverableSchema),
    defaultValues: {
      name: "",
      description: "",
      startDate: undefined,
      endDate: undefined,
      weight: undefined,
      priority: undefined,
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (initialData && isUpdate) {
      const formData = {
        name: initialData.name || "",
        description: initialData.description || "",
        startDate: initialData.startDate || undefined,
        endDate: initialData.endDate || undefined,
        weight: initialData.weight || undefined,
        priority: initialData.priority as any,
      };
      form.reset(formData);
    }
  }, [initialData, isUpdate, form]);

  // Función para obtener los datos finales
  const getSubmitData = (data: DeliverableForm) => {
    return {
      ...data,
      // Si es actualización, mantener algunos valores del initialData
      ...(isUpdate &&
        initialData &&
        {
          // Aquí puedes agregar campos que se mantengan en la actualización
        }),
    };
  };

  // Función onSubmit
  const onSubmit = (data: DeliverableForm) => {
    const submitData = getSubmitData(data);

    if (isUpdate && initialData) {
      updateDeliverable(
        {
          params: {
            path: {
              projectId,
              phaseId,
              deliverableId: initialData.id,
            },
          },
          body: submitData,
        },
        {
          onSuccess: () => {
            onSuccess?.();
            form.reset();
          },
        }
      );
    } else {
      addDeliverable(
        {
          params: {
            path: {
              projectId,
              phaseId,
            },
          },
          body: submitData,
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
