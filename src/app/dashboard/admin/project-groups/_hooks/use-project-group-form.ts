"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  CreateProjectGroupRequestDto,
  ProjectGroupResponseDto,
  ProjectGroupStatus,
  UpdateProjectGroupRequestDto,
} from "../_types/project-groups.types";
import { useCreateProjectGroup, useUpdateProjectGroup } from "./use-project-groups";

const STATUS_ENUM = ["activo", "inactivo"] as const;

const projectGroupSchema = z.object({
  name: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  description: z.string().optional(),
  status: z.enum(STATUS_ENUM, {
    required_error: "El estado es requerido",
  }),
  period: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "El período debe tener el formato YYYY-MM (ej: 2024-01)"),
});

export type ProjectGroupFormData = z.infer<typeof projectGroupSchema>;

interface UseProjectGroupFormProps {
  isUpdate?: boolean;
  initialData?: ProjectGroupResponseDto | null;
  onSuccess?: () => void;
}

export function useProjectGroupForm({ isUpdate = false, initialData, onSuccess }: UseProjectGroupFormProps) {
  const { mutate: createProjectGroup, isPending: isCreating } = useCreateProjectGroup();
  const { mutate: updateProjectGroup, isPending: isUpdating } = useUpdateProjectGroup();
  const isPending = isCreating || isUpdating;

  const form = useForm<ProjectGroupFormData>({
    resolver: zodResolver(projectGroupSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "activo",
      period: "2024-01",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (initialData && isUpdate) {
      const formData = {
        name: initialData.name || "",
        description: initialData.description || "",
        status: (initialData.status as ProjectGroupStatus | undefined) || "activo",
        period: initialData.period || "2024-01",
      };
      form.reset(formData);
    }
  }, [initialData, isUpdate, form]);

  // Función para obtener los datos finales con isActive manejado automáticamente
  const getSubmitData = (data: ProjectGroupFormData) => {
    return {
      ...data,
      isActive: isUpdate ? (initialData?.isActive ?? true) : true,
    };
  };

  // Nueva función onSubmit
  const onSubmit = (data: ProjectGroupFormData) => {
    const submitData = getSubmitData(data);

    if (isUpdate && initialData) {
      const updateData: UpdateProjectGroupRequestDto = {
        name: submitData.name,
        description: submitData.description,
        status: submitData.status,
        period: submitData.period,
      };
      updateProjectGroup(
        {
          params: {
            path: { id: initialData.id },
          },
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
      const createData: CreateProjectGroupRequestDto = {
        name: submitData.name,
        description: submitData.description,
        status: submitData.status,
        period: submitData.period,
      };
      console.log("Creating project group with data:", createData);
      createProjectGroup(
        {
          body: createData,
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
