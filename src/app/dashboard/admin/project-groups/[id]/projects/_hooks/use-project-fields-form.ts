"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { ProjectFieldsForm, projectFieldsSchema } from "../_schemas/project-fields.schemas";
import { ProjectDetailedResponseDto } from "../_types";
import { useUpdateProjectFields } from "./use-project";

interface UseProjectFieldsFormProps {
  project: ProjectDetailedResponseDto | null;
  onSuccess?: () => void;
}

export function useProjectFieldsForm({ project, onSuccess }: UseProjectFieldsFormProps) {
  const { mutate: updateProjectFields, isPending } = useUpdateProjectFields();

  const form = useForm<ProjectFieldsForm>({
    resolver: zodResolver(projectFieldsSchema),
    defaultValues: {
      requiredFields: {
        bondDate: project?.requiredFields?.bondDate || undefined,
        hasCurrentAccount: project?.requiredFields?.hasCurrentAccount || undefined,
        proinnovateContract: project?.requiredFields?.proinnovateContract || undefined,
        bondType: project?.requiredFields?.bondType || undefined,
        approvedConsultant: project?.requiredFields?.approvedConsultant || undefined,
      },
      optionalFields: {
        milestone1Payment: project?.optionalFields?.milestone1Payment || undefined,
        milestone2Payment: project?.optionalFields?.milestone2Payment || undefined,
        certificationDate: project?.optionalFields?.certificationDate || undefined,
      },
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (project) {
      const formData = {
        requiredFields: {
          bondDate: project.requiredFields?.bondDate || undefined,
          hasCurrentAccount: project.requiredFields?.hasCurrentAccount || undefined,
          proinnovateContract: project.requiredFields?.proinnovateContract || undefined,
          bondType: project.requiredFields?.bondType || undefined,
          approvedConsultant: project.requiredFields?.approvedConsultant || undefined,
        },
        optionalFields: {
          milestone1Payment: project.optionalFields?.milestone1Payment || undefined,
          milestone2Payment: project.optionalFields?.milestone2Payment || undefined,
          certificationDate: project.optionalFields?.certificationDate || undefined,
        },
      };
      form.reset(formData);
    }
  }, [project, form]);

  const onSubmit = (data: ProjectFieldsForm) => {
    if (!project) {
      console.error("No hay proyecto disponible para actualizar");
      return;
    }

    // Filtrar campos vacíos/undefined
    const filteredData = {
      requiredFields: data.requiredFields
        ? Object.fromEntries(
            Object.entries(data.requiredFields).filter(([_, value]) => value !== undefined && value !== "")
          )
        : undefined,
      optionalFields: data.optionalFields
        ? Object.fromEntries(
            Object.entries(data.optionalFields).filter(([_, value]) => value !== undefined && value !== "")
          )
        : undefined,
    };

    // Solo enviar si hay al menos un campo para actualizar
    if (
      (filteredData.requiredFields && Object.keys(filteredData.requiredFields).length > 0) ||
      (filteredData.optionalFields && Object.keys(filteredData.optionalFields).length > 0)
    ) {
      updateProjectFields(
        {
          params: { path: { projectId: project.id } },
          body: filteredData,
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
    onSubmit,
    isPending,
  };
}
