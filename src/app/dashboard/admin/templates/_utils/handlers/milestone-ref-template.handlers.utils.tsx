import { UseFormReturn } from "react-hook-form";

import { DialogType } from "@/shared/stores/useDialogStore";
import { CreateProjectTemplate, MilestoneRefFormData } from "../../_schemas/projectTemplates.schemas";
import { MilestoneTemplateRefRequestDto, MilestoneTemplateResponseDto } from "../../_types/templates.types";

export const handleAddMilestoneRefConfig = (
  data: MilestoneRefFormData,
  form: UseFormReturn<CreateProjectTemplate>,
  updateMilestones: (milestones: MilestoneTemplateRefRequestDto[]) => void
) => {
  // Convertir MilestoneRefFormData a MilestoneTemplateRefRequestDto
  const milestoneRef = {
    milestoneTemplateId: data.milestoneTemplateId,
    isRequired: data.isRequired,
    customName: data.customName || undefined,
    customizations: data.customizations || undefined,
  };

  // Obtener las configuraciones actuales
  const currentMilestones = form.getValues().milestones || [];

  // Verificar si ya existe una configuración para este milestone
  const existingIndex = currentMilestones.findIndex((ref) => ref.milestoneTemplateId === data.milestoneTemplateId);

  if (existingIndex >= 0) {
    // Actualizar la configuración existente
    const updatedMilestones = [...currentMilestones];
    updatedMilestones[existingIndex] = milestoneRef as any;
    // Actualizar directamente el formulario usando setValue
    form.setValue("milestones", updatedMilestones as any, { shouldValidate: true });
    updateMilestones(updatedMilestones as any);
  } else {
    // Agregar nueva configuración
    const newMilestones = [...currentMilestones, milestoneRef] as any;
    // Actualizar directamente el formulario usando setValue
    form.setValue("milestones", newMilestones, { shouldValidate: true });
    updateMilestones(newMilestones);
  }
};

export const handleEditMilestoneRefConfig = (
  milestone: MilestoneTemplateResponseDto,
  form: UseFormReturn<CreateProjectTemplate>,
  open: (module: string, type: DialogType, data?: any) => void
) => {
  // Buscar si ya existe una configuración para este milestone
  const existingConfig = form.getValues().milestones?.find((ref) => ref.milestoneTemplateId === milestone.id);

  if (existingConfig) {
    // Si existe, abrir en modo edición
    open("milestone-ref-config", "edit", existingConfig);
  } else {
    // Si no existe, crear una nueva configuración por defecto
    const defaultConfig = {
      milestoneTemplateId: milestone.id,
      isRequired: false,
      customName: undefined,
      customizations: undefined,
    };
    open("milestone-ref-config", "edit", defaultConfig);
  }
};

// Función para agregar milestone ref automáticamente cuando se crea un deliverable
export const handleAddMilestoneRef = (
  milestoneId: string,
  selectedMilestoneObjects: MilestoneTemplateResponseDto[],
  setSelectedMilestoneObjects: (milestoneObjects: MilestoneTemplateResponseDto[]) => void,
  milestones: MilestoneTemplateResponseDto[],
  setSelectedMilestones: (milestoneIds: string[]) => void
) => {
  // Verificar si el milestone ya está en selectedMilestoneObjects
  const milestoneExists = selectedMilestoneObjects.some((milestone) => milestone.id === milestoneId);

  if (!milestoneExists) {
    // Buscar el milestone completo en milestones
    const milestone = milestones.find((m) => m.id === milestoneId);

    if (milestone) {
      // Agregar a selectedMilestoneObjects
      setSelectedMilestoneObjects([...selectedMilestoneObjects, milestone]);
      // Agregar a selectedMilestones - necesitamos obtener el estado actual
      const currentSelectedMilestones = selectedMilestoneObjects.map((m) => m.id);
      setSelectedMilestones([...currentSelectedMilestones, milestoneId]);
    }
  }
};

export const handleUpdateMilestoneRefConfig = (
  data: MilestoneRefFormData,
  form: UseFormReturn<CreateProjectTemplate>,
  updateMilestones: (milestones: MilestoneTemplateRefRequestDto[]) => void
) => {
  // Convertir MilestoneRefFormData a MilestoneTemplateRefRequestDto
  const milestoneRef = {
    milestoneTemplateId: data.milestoneTemplateId,
    isRequired: data.isRequired,
    customName: data.customName || undefined,
    customizations: data.customizations || undefined,
  };

  // Obtener las configuraciones actuales
  const currentMilestones = form.getValues().milestones || [];

  // Actualizar la configuración existente
  const updatedMilestones = currentMilestones.map((ref) =>
    ref.milestoneTemplateId === data.milestoneTemplateId ? (milestoneRef as any) : ref
  );

  // Actualizar directamente el formulario usando setValue
  form.setValue("milestones", updatedMilestones as any, { shouldValidate: true });

  // También llamar a updateMilestones para mantener la sincronización
  updateMilestones(updatedMilestones as any);
};
