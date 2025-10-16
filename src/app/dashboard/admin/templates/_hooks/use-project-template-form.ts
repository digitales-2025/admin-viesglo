"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { CreateProjectTemplate, CreateProjectTemplateSchema } from "../_schemas/projectTemplates.schemas";
import { useTemplateDraftStore } from "../_stores/template-draft.store";
import { MilestoneTemplateRefRequestDto, ProjectTemplateResponseDto } from "../_types/templates.types";
import { useCreateProjectTemplate, useUpdateProjectTemplate } from "./use-project-templates";

interface UseProjectTemplateFormProps {
  isUpdate?: boolean;
  initialData?: ProjectTemplateResponseDto;
  onSuccess?: () => void;
}

export const useProjectTemplateForm = ({
  isUpdate = false,
  initialData,
  onSuccess,
}: UseProjectTemplateFormProps = {}) => {
  const router = useRouter();

  // Mutaciones de la API
  const { mutate: createProjectTemplate, isPending: isCreating } = useCreateProjectTemplate();
  const { mutate: updateProjectTemplate, isPending: isUpdating } = useUpdateProjectTemplate();
  const isPending = isCreating || isUpdating;

  // Zustand store para limpiar drafts
  const { clearDraft } = useTemplateDraftStore();

  // Formulario
  const form = useForm<CreateProjectTemplate>({
    resolver: zodResolver(CreateProjectTemplateSchema),
    defaultValues: {
      name: "",
      description: "",
      isActive: true,
      milestones: [],
      tagIds: [],
    },
    mode: "onChange",
  });

  // Cargar datos iniciales si estamos en modo edición
  useEffect(() => {
    if (initialData && isUpdate) {
      const formData = {
        name: initialData.name || "",
        description: initialData.description || "",
        isActive: initialData.isActive ?? true,
        milestones:
          initialData.milestones?.map((milestone) => ({
            milestoneTemplateId: milestone.milestoneTemplateId,
            isRequired: milestone.isRequired ?? false,
            customName: milestone.customName === null ? undefined : milestone.customName, // Convertir null a undefined
            customizations: milestone.customizations === null ? undefined : milestone.customizations, // Convertir null a undefined
          })) || [],
        tagIds: initialData.tags?.map((tag) => tag.id) || [],
      };

      form.reset(formData);
    }
  }, [initialData, isUpdate]);

  // Función para limpiar null values de milestones
  const cleanMilestones = useCallback((milestones: any[]) => {
    if (!milestones) return milestones;

    return milestones.map((milestone) => ({
      ...milestone,
      customName: milestone.customName === null ? undefined : milestone.customName,
      customizations: milestone.customizations === null ? undefined : milestone.customizations,
    }));
  }, []);

  // Efecto para asegurar que los milestones siempre tengan undefined en lugar de null
  useEffect(() => {
    if (isUpdate) {
      const currentValues = form.getValues();
      if (currentValues.milestones) {
        const needsUpdate = currentValues.milestones.some(
          (milestone) => milestone.customName === null || milestone.customizations === null
        );

        if (needsUpdate) {
          const fixedMilestones = cleanMilestones(currentValues.milestones);
          form.setValue("milestones", fixedMilestones);
        }
      }
    }
  }, [form, isUpdate, cleanMilestones]);

  // Función para obtener los datos finales con isActive manejado automáticamente
  const getSubmitData = (data: CreateProjectTemplate) => {
    return {
      ...data,
      isActive: isUpdate ? (initialData?.isActive ?? true) : true,
    };
  };

  // Función para manejar el submit
  const onSubmit = (data: CreateProjectTemplate) => {
    // Limpiar null values en milestones antes de procesar
    const cleanedData = {
      ...data,
      milestones: cleanMilestones(data.milestones || []),
    };

    const submitData = getSubmitData(cleanedData);

    if (isUpdate && initialData) {
      // Actualizar plantilla existente
      updateProjectTemplate(
        {
          params: { path: { id: initialData.id } },
          body: submitData as any,
        },
        {
          onSuccess: () => {
            onSuccess?.();
            form.reset();
            // Limpiar borrador después de guardar exitosamente
            clearDraft(initialData.id, true);
            // Redirigir a la lista de plantillas
            router.push("/dashboard/admin/templates");
          },
          onError: (error) => {
            toast.error(error?.error?.userMessage || "Ocurrió un error inesperado al actualizar la plantilla");
          },
        }
      );
    } else {
      // Crear nueva plantilla
      createProjectTemplate(
        { body: submitData as any },
        {
          onSuccess: () => {
            toast.success("Plantilla creada correctamente");
            onSuccess?.();
            form.reset();
            // Limpiar borrador después de guardar exitosamente
            clearDraft(undefined, false);
            // Redirigir a la lista de plantillas
            router.push("/dashboard/admin/templates");
          },
          onError: (error) => {
            toast.error(error?.error?.userMessage || "Ocurrió un error inesperado al crear la plantilla");
          },
        }
      );
    }
  };

  // Función para actualizar milestones desde el dialog
  const updateMilestones = (milestones: MilestoneTemplateRefRequestDto[]) => {
    form.setValue("milestones", milestones);
  };

  // Función para actualizar tags desde el dialog
  const updateTags = (tagIds: string[]) => {
    form.setValue("tagIds", tagIds);
  };

  // Función para validar si el formulario está listo para enviar
  const isFormValid = form.formState.isValid;
  const hasChanges = form.formState.isDirty;

  // Función para resetear el formulario
  const resetForm = () => {
    form.reset({
      name: "",
      description: "",
      isActive: true,
      milestones: [],
      tagIds: [],
    });
  };

  // Función para cancelar y volver atrás
  const handleCancel = () => {
    if (hasChanges) {
      // Aquí podrías mostrar un diálogo de confirmación
      if (confirm("¿Estás seguro de que quieres cancelar? Los cambios se perderán.")) {
        resetForm();
        router.back();
      }
    } else {
      router.back();
    }
  };

  return {
    form,
    onSubmit,
    updateMilestones,
    updateTags,
    isUpdate,
    isPending,
    isFormValid,
    hasChanges,
    resetForm,
    handleCancel,
    getSubmitData,
  };
};
