"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { AdditionalDeliverableForm, additionalDeliverableSchema } from "../_schemas/additional-deliverables.schemas";
import { AdditionalDeliverableDetailedResponseDto } from "../_types";
import { useAddAdditionalDeliverable, useUpdateAdditionalDeliverable } from "./use-additional-deliverables";

interface UseAdditionalDeliverableFormProps {
  isUpdate?: boolean;
  initialData?: AdditionalDeliverableDetailedResponseDto;
  projectId: string;
  phaseId: string;
  onSuccess?: () => void;
}

export function useAdditionalDeliverableForm({
  isUpdate = false,
  initialData,
  projectId,
  phaseId,
  onSuccess,
}: UseAdditionalDeliverableFormProps) {
  const { mutation: addMutation } = useAddAdditionalDeliverable();
  const { mutation: updateMutation } = useUpdateAdditionalDeliverable();
  const isPending = addMutation.isPending || updateMutation.isPending;

  const form = useForm<AdditionalDeliverableForm>({
    resolver: zodResolver(additionalDeliverableSchema),
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
    }
  }, [initialData, isUpdate, form]);

  // Función para obtener los datos finales
  const getSubmitData = (data: AdditionalDeliverableForm) => {
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
  const onSubmit = (data: AdditionalDeliverableForm) => {
    const submitData = getSubmitData(data);

    if (isUpdate && initialData) {
      updateMutation.mutate(
        {
          params: {
            path: {
              projectId,
              phaseId,
              additionalDeliverableId: initialData.id,
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
      addMutation.mutate(
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
