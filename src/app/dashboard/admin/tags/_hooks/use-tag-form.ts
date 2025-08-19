"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { CreateTagForm, createTagSchema } from "../_schemas/tags-schemas";
import { TagResponseDto } from "../_types/tags.types";
import { useCreateTag, useUpdateTag } from "./use-tags";

interface UseTagFormProps {
  isUpdate?: boolean;
  initialData?: TagResponseDto;
  onSuccess?: () => void;
}

export function useTagForm({ isUpdate = false, initialData, onSuccess }: UseTagFormProps) {
  const { mutate: createTag, isPending: isCreating } = useCreateTag();
  const { mutate: updateTag, isPending: isUpdating } = useUpdateTag();
  const isPending = isCreating || isUpdating;

  const form = useForm<CreateTagForm>({
    resolver: zodResolver(createTagSchema),
    defaultValues: {
      name: "",
      color: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (initialData && isUpdate) {
      const formData = {
        name: initialData.name || "",
        color: initialData.color || "#3b82f6",
      };
      form.reset(formData);
    }
  }, [initialData, isUpdate, form]);

  // Función para obtener los datos finales con isActive manejado automáticamente
  const getSubmitData = (data: CreateTagForm) => {
    return {
      ...data,
      isActive: isUpdate ? (initialData?.isActive ?? true) : true,
    };
  };

  // Nueva función onSubmit
  const onSubmit = (data: CreateTagForm) => {
    const submitData = getSubmitData(data);

    if (isUpdate && initialData) {
      updateTag(
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
      createTag(
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
