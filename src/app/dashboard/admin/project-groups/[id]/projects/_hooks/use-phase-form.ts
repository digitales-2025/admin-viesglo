"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { PhasesForm, phasesSchema } from "../_schemas/phases.schemas";
import { PhaseDetailedResponseDto } from "../_types";
import { useAddPhaseToMilestone, useAssignPhase, useRemovePhase, useUpdatePhase } from "./use-phase";

interface UsePhaseFormProps {
  isUpdate?: boolean;
  initialData?: PhaseDetailedResponseDto;
  projectId: string;
  milestoneId: string;
  phaseId?: string;
  onSuccess?: () => void;
}

export function usePhaseForm({
  isUpdate = false,
  initialData,
  projectId,
  milestoneId,
  phaseId,
  onSuccess,
}: UsePhaseFormProps) {
  const { mutate: addPhase, isPending: isAdding } = useAddPhaseToMilestone();
  const { mutate: updatePhase, isPending: isUpdating } = useUpdatePhase();
  const { mutate: removePhase, isPending: isRemoving } = useRemovePhase();
  const { mutate: assignPhase, isPending: isAssigning } = useAssignPhase();

  const isPending = isAdding || isUpdating || isRemoving || isAssigning;

  const form = useForm<PhasesForm>({
    resolver: zodResolver(phasesSchema),
    defaultValues: {
      name: "",
      startDate: undefined,
      endDate: undefined,
      sourceTemplateId: undefined,
      consultantId: undefined,
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (initialData && isUpdate) {
      form.reset({
        name: initialData.name || "",
        startDate: initialData.startDate || undefined,
        endDate: initialData.endDate || undefined,
        sourceTemplateId: undefined,
        consultantId: undefined,
      });
    }
  }, [initialData, isUpdate]);

  // Función para obtener los datos finales
  const getSubmitData = (data: PhasesForm) => {
    return {
      ...data,
      // Si es actualización, mantener algunos valores del initialData
      ...(isUpdate &&
        initialData &&
        {
          // Aquí puedes agregar campos que se mantengan en actualización
        }),
    };
  };

  // Nueva función onSubmit
  const onSubmit = (data: PhasesForm) => {
    const submitData = getSubmitData(data);

    if (isUpdate && initialData && phaseId) {
      updatePhase(
        {
          params: {
            path: {
              projectId,
              milestoneId,
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
    } else {
      // Para crear fase, solo enviar los campos requeridos
      const createData = {
        name: submitData.name || "",
        startDate: submitData.startDate,
        endDate: submitData.endDate,
        sourceTemplateId: submitData.sourceTemplateId,
      };

      addPhase(
        {
          params: {
            path: {
              projectId,
              milestoneId,
            },
          },
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

  // Función para asignar fase
  const onAssign = (data: PhasesForm) => {
    if (!phaseId) return;

    assignPhase(
      {
        params: {
          path: {
            projectId,
            milestoneId,
            phaseId,
          },
        },
        body: { consultantId: data.consultantId || "" },
      },
      {
        onSuccess: () => {
          onSuccess?.();
          form.reset();
        },
      }
    );
  };

  // Función para remover fase
  const onRemove = () => {
    if (!phaseId) return;

    removePhase(
      {
        params: {
          path: {
            projectId,
            milestoneId,
            phaseId,
          },
        },
      },
      {
        onSuccess: () => {
          onSuccess?.();
        },
      }
    );
  };

  return {
    form,
    onSubmit,
    onAssign,
    onRemove,
    isUpdate,
    onSuccess,
    getSubmitData,
    isPending,
  };
}
