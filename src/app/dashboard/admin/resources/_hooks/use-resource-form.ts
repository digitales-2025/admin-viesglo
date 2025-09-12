"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  CreateResourceRequestDto,
  ResourceCategory,
  ResourceResponseDto,
  UpdateResourceRequestDto,
} from "../_types/resources.types";
import { useCreateResource, useUpdateResource } from "./use-resource";

const CATEGORY_ENUM = ["DIRECT_COSTS", "INDIRECT_COSTS", "EXPENSES"] as const;

const resourceSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100, "El nombre no puede exceder 100 caracteres"),
  category: z.enum(CATEGORY_ENUM),
});

type ResourceFormData = z.infer<typeof resourceSchema>;

interface UseResourceFormProps {
  isUpdate?: boolean;
  initialData?: ResourceResponseDto;
  onSuccess?: () => void;
}

export function useResourceForm({ isUpdate = false, initialData, onSuccess }: UseResourceFormProps) {
  const { mutate: createResource, isPending: isCreating } = useCreateResource();
  const { mutate: updateResource, isPending: isUpdating } = useUpdateResource();
  const isPending = isCreating || isUpdating;

  const form = useForm<ResourceFormData>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      name: "",
      category: "DIRECT_COSTS",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (initialData && isUpdate) {
      const formData = {
        name: initialData.name || "",
        category: (initialData.category as ResourceCategory | undefined) || "DIRECT_COSTS",
      };
      form.reset(formData);
    }
  }, [initialData, isUpdate, form]);

  // Función para obtener los datos finales con isActive manejado automáticamente
  const getSubmitData = (data: ResourceFormData) => {
    return {
      ...data,
      isActive: isUpdate ? (initialData?.isActive ?? true) : true,
    };
  };

  // Nueva función onSubmit
  const onSubmit = (data: ResourceFormData) => {
    const submitData = getSubmitData(data);

    if (isUpdate && initialData) {
      const updateData: UpdateResourceRequestDto = {
        name: submitData.name,
        category: submitData.category,
      };
      updateResource(
        {
          params: { path: { resourceId: initialData.id } },
          body: updateData,
        },
        {
          onSuccess: () => {
            onSuccess?.();
            form.reset();
          },
        }
      );
    } else {
      const createData: CreateResourceRequestDto = {
        name: submitData.name,
        category: submitData.category,
      };
      createResource(
        { body: createData },
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
