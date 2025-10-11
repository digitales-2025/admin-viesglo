"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { ProjectsForm, projectsSchema } from "../_schemas/projects.schemas";
import { ProjectResponseDto, ProjectStatusEnum } from "../_types";
import { useCreateProject, useUpdateProject } from "./use-project";

interface UseProjectFormProps {
  isUpdate?: boolean;
  initialData?: ProjectResponseDto;
  projectGroupId: string;
  onSuccess?: () => void;
}

export function useProjectForm({ isUpdate = false, initialData, onSuccess, projectGroupId }: UseProjectFormProps) {
  const router = useRouter();
  const { mutate: createProject, isPending: isCreating } = useCreateProject();
  const { mutate: updateProject, isPending: isUpdating } = useUpdateProject();
  const isPending = isCreating || isUpdating;

  const form = useForm<ProjectsForm>({
    resolver: zodResolver(projectsSchema),
    defaultValues: {
      name: "",
      description: "",
      projectType: undefined,
      status: undefined, // Se maneja automáticamente en getSubmitData
      clientId: "",
      coordinatorId: "",
      projectGroupId: undefined,
      projectTemplateId: undefined,
      selectedMilestones: [],
      projectTagIds: [],
      startDate: undefined,
      endDate: undefined,
      commercialExecutive: "",
      implementingCompany: "",
      externalReviewer: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (initialData && isUpdate) {
      const formData = {
        name: initialData.name || "",
        description: initialData.description || "",
        projectType: initialData.projectType as any,
        status: undefined, // Se maneja automáticamente en getSubmitData
        clientId: initialData.clientId || "",
        coordinatorId: initialData.coordinatorId || "",
        projectGroupId: initialData.projectGroupId || undefined,
        projectTemplateId: initialData.projectTemplateId || undefined,
        projectTagIds: initialData.projectTagIds || [],
        startDate: initialData.startDate || undefined,
        endDate: initialData.endDate || undefined,
        commercialExecutive: initialData.commercialExecutive || "",
        implementingCompany: initialData.implementingCompany || "",
        externalReviewer: initialData.externalReviewer || "",
      };
      form.reset(formData);
    }
  }, [initialData, isUpdate, form]);

  // Función para obtener los datos finales
  const getSubmitData = (data: ProjectsForm) => {
    return {
      ...data,
      projectGroupId: projectGroupId,
      // Lógica de status:
      // - Al crear: asignar CREATED automáticamente
      // - Al actualizar: mantener el status del initialData
      status: isUpdate ? initialData?.status || ProjectStatusEnum.CREATED : ProjectStatusEnum.CREATED,
      // Si es actualización, mantener algunos valores del initialData
      ...(isUpdate &&
        initialData && {
          isActive: initialData.isActive ?? true,
        }),
    };
  };

  // Nueva función onSubmit
  const onSubmit = (data: ProjectsForm) => {
    const submitData = getSubmitData(data);

    if (isUpdate && initialData) {
      updateProject(
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
      createProject(
        { body: submitData },
        {
          onSuccess: (response) => {
            // Intentar diferentes estructuras posibles de la respuesta
            let projectId = null;

            // Estructura 1: response.data.projectId
            if (response?.data?.projectId) {
              projectId = response.data.projectId;
            }
            // Estructura 2: response.projectId (directo)
            else if (response?.projectId) {
              projectId = response.projectId;
            }
            // Estructura 3: response.data.id
            else if (response?.data?.id) {
              projectId = response.data.id;
            }

            if (projectId) {
              router.push(`/dashboard/admin/project-groups/${projectGroupId}/projects/${projectId}`);
            } else {
              // Fallback: ejecutar onSuccess si no hay projectId
              onSuccess?.();
            }
            form.reset();
          },
        }
      );
    }
  };

  const addMilestone = () => {
    const currentMilestones = form.getValues("selectedMilestones") || [];
    form.setValue("selectedMilestones", [
      ...currentMilestones,
      {
        milestoneTemplateId: "",
        selectedPhases: [],
      },
    ]);
  };

  const removeMilestone = (index: number) => {
    const currentMilestones = form.getValues("selectedMilestones") || [];
    form.setValue(
      "selectedMilestones",
      currentMilestones.filter((_, i) => i !== index)
    );
  };

  const addPhase = (milestoneIndex: number) => {
    const currentMilestones = form.getValues("selectedMilestones") || [];
    const currentPhases = currentMilestones[milestoneIndex]?.selectedPhases || [];

    const updatedMilestones = [...currentMilestones];
    updatedMilestones[milestoneIndex] = {
      ...updatedMilestones[milestoneIndex],
      selectedPhases: [
        ...currentPhases,
        {
          phaseTemplateId: "",
          selectedDeliverables: [],
        },
      ],
    };

    form.setValue("selectedMilestones", updatedMilestones);
  };

  const removePhase = (milestoneIndex: number, phaseIndex: number) => {
    const currentMilestones = form.getValues("selectedMilestones") || [];
    const updatedMilestones = [...currentMilestones];

    updatedMilestones[milestoneIndex] = {
      ...updatedMilestones[milestoneIndex],
      selectedPhases: updatedMilestones[milestoneIndex].selectedPhases.filter((_, i) => i !== phaseIndex),
    };

    form.setValue("selectedMilestones", updatedMilestones);
  };

  const addDeliverable = (milestoneIndex: number, phaseIndex: number) => {
    const currentMilestones = form.getValues("selectedMilestones") || [];
    const updatedMilestones = [...currentMilestones];

    const currentDeliverables =
      updatedMilestones[milestoneIndex]?.selectedPhases[phaseIndex]?.selectedDeliverables || [];
    updatedMilestones[milestoneIndex].selectedPhases[phaseIndex] = {
      ...updatedMilestones[milestoneIndex].selectedPhases[phaseIndex],
      selectedDeliverables: [...currentDeliverables, ""],
    };

    form.setValue("selectedMilestones", updatedMilestones);
  };

  const removeDeliverable = (milestoneIndex: number, phaseIndex: number, deliverableIndex: number) => {
    const currentMilestones = form.getValues("selectedMilestones") || [];
    const updatedMilestones = [...currentMilestones];

    updatedMilestones[milestoneIndex].selectedPhases[phaseIndex] = {
      ...updatedMilestones[milestoneIndex].selectedPhases[phaseIndex],
      selectedDeliverables: updatedMilestones[milestoneIndex].selectedPhases[phaseIndex].selectedDeliverables.filter(
        (_, i) => i !== deliverableIndex
      ),
    };

    form.setValue("selectedMilestones", updatedMilestones);
  };

  const addTag = () => {
    const currentTags = form.getValues("projectTagIds") || [];
    form.setValue("projectTagIds", [...currentTags, ""]);
  };

  const removeTag = (index: number) => {
    const currentTags = form.getValues("projectTagIds") || [];
    form.setValue(
      "projectTagIds",
      currentTags.filter((_, i) => i !== index)
    );
  };

  return {
    form,
    addMilestone,
    removeMilestone,
    addPhase,
    removePhase,
    addDeliverable,
    removeDeliverable,
    addTag,
    removeTag,
    isUpdate,
    onSuccess,
    getSubmitData,
    isPending,
    onSubmit,
  };
}
