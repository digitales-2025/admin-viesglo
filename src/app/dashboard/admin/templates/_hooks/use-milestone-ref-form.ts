"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { MilestoneRefFormData, milestoneRefFormSchema } from "../_schemas/projectTemplates.schemas";
import { MilestoneTemplateRefRequestDto } from "../_types/templates.types";

interface UseMilestoneRefFormProps {
  isUpdate?: boolean;
  initialData?: MilestoneTemplateRefRequestDto;
  onSuccess?: () => void;
}

export function useMilestoneRefForm({ isUpdate = false, initialData }: UseMilestoneRefFormProps) {
  const form = useForm<MilestoneRefFormData>({
    resolver: zodResolver(milestoneRefFormSchema),
    defaultValues: {
      milestoneTemplateId: "",
      isRequired: false,
      customName: "",
      customizations: undefined,
    },
  });

  useEffect(() => {
    if (initialData && isUpdate) {
      form.reset({
        milestoneTemplateId: initialData.milestoneTemplateId || "",
        isRequired: initialData.isRequired ?? false,
        customName: initialData.customName, // Preservar null si es null
        customizations: initialData.customizations || {},
      });
    }
  }, [initialData, isUpdate, form]);

  return {
    form,
    isPending: false,
  };
}
