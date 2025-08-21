"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { MilestoneFormData, milestoneSchema } from "../_schemas/projectTemplates.schemas";
import { MilestoneTemplateResponseDto } from "../_types/templates.types";
import { useCreateMilestoneTemplate, useUpdateMilestoneTemplate } from "./use-milestone-templates";

interface UseMilestoneTemplateFormProps {
  isUpdate?: boolean;
  initialData?: MilestoneTemplateResponseDto;
  onSuccess?: () => void;
}

export function useMilestoneTemplateForm({ isUpdate = false, initialData, onSuccess }: UseMilestoneTemplateFormProps) {
  const { mutate: createMilestoneTemplate, isPending: isCreating } = useCreateMilestoneTemplate();
  const { mutate: updateMilestoneTemplate, isPending: isUpdating } = useUpdateMilestoneTemplate();
  const isPending = isCreating || isUpdating;

  const form = useForm<MilestoneFormData>({
    resolver: zodResolver(milestoneSchema),
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
        isActive: initialData.isActive ?? true,
      };
      form.reset(formData);
    }
  }, [initialData, isUpdate, form]);

  // Función para obtener los datos finales con isActive manejado automáticamente
  const getSubmitData = (data: MilestoneFormData) => {
    return {
      ...data,
      isActive: isUpdate ? (initialData?.isActive ?? true) : true,
    };
  };

  // Nueva función onSubmit
  const onSubmit = (data: MilestoneFormData) => {
    const submitData = getSubmitData(data);

    if (isUpdate && initialData) {
      console.log("submitData", JSON.stringify(submitData, null, 2));
      updateMilestoneTemplate(
        {
          params: { path: { id: initialData.id } },
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
      createMilestoneTemplate(
        { body: submitData },
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
