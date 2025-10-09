"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { MilestoneForm, milestoneSchema } from "../_schemas/milestones.schemas";
import { useCreateMilestone, useUpdateMilestone } from "./use-project-milestones";

interface UseMilestoneFormProps {
  isUpdate?: boolean;
  initialData?: {
    id?: string;
    name?: string;
    startDate?: string;
    endDate?: string;
  };
  projectId: string;
  onSuccess?: () => void;
}

export function useMilestoneForm({ isUpdate = false, initialData, projectId, onSuccess }: UseMilestoneFormProps) {
  const { mutate: createMilestone, isPending: isCreating } = useCreateMilestone();
  const { mutate: updateMilestone, isPending: isUpdating } = useUpdateMilestone();
  const isPending = isCreating || isUpdating;

  const form = useForm<MilestoneForm>({
    resolver: zodResolver(milestoneSchema),
    defaultValues: {
      name: "",
      startDate: undefined,
      endDate: undefined,
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (initialData && isUpdate) {
      const formData = {
        name: initialData.name || "",
        startDate: initialData.startDate || undefined,
        endDate: initialData.endDate || undefined,
      };
      form.reset(formData);
    }
  }, [initialData, isUpdate, form]);

  // Función para obtener los datos finales
  const getSubmitData = (data: MilestoneForm) => {
    return {
      ...data,
    };
  };

  // Función onSubmit
  const onSubmit = (data: MilestoneForm) => {
    const submitData = getSubmitData(data);

    if (isUpdate && initialData?.id) {
      updateMilestone(
        {
          params: {
            path: {
              projectId,
              milestoneId: initialData.id,
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
      createMilestone(
        {
          params: { path: { projectId } },
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
