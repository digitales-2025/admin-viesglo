"use client";

import { useState } from "react";

import { ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";
import { useProjectTemplateForm } from "../_hooks/use-project-template-form";
import { MilestoneTemplateResponseDto } from "../_types/templates.types";
import { TagResponseDto } from "../../tags/_types/tags.types";
import CreateProjectTemplateForm from "./_components/CreateProjectTemplateForm";

export default function CreateTemplatesPage() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedTagObjects, setSelectedTagObjects] = useState<TagResponseDto[]>([]);
  const [selectedMilestones, setSelectedMilestones] = useState<string[]>([]);
  const [selectedMilestoneObjects, setSelectedMilestoneObjects] = useState<MilestoneTemplateResponseDto[]>([]);

  // Hook para el formulario del proyecto
  const { form, onSubmit, updateMilestones, updateTags, isPending, isFormValid, handleCancel } = useProjectTemplateForm(
    {
      onSuccess: () => {
        // Limpiar estados después de crear exitosamente
        setSelectedMilestones([]);
        setSelectedMilestoneObjects([]);
        setSelectedTags([]);
        setSelectedTagObjects([]);
      },
    }
  );

  const handleSave = () => {
    // El useEffect en CreateProjectTemplateForm ya maneja la sincronización correctamente
    // Solo necesitamos asegurarnos de que los tags estén sincronizados
    updateTags(selectedTags);

    // Enviar el formulario
    form.handleSubmit(onSubmit)();
  };

  return (
    <>
      <ShellHeader>
        <ShellTitle title="Nueva plantilla" description="Crea una nueva plantilla de proyecto." />
      </ShellHeader>

      <CreateProjectTemplateForm
        form={form}
        handleSave={handleSave}
        handleCancel={handleCancel}
        isPending={isPending}
        isFormValid={isFormValid}
        selectedMilestones={selectedMilestones}
        setSelectedMilestones={setSelectedMilestones}
        selectedMilestoneObjects={selectedMilestoneObjects}
        setSelectedMilestoneObjects={setSelectedMilestoneObjects}
        updateMilestones={updateMilestones}
        updateTags={updateTags}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        selectedTagObjects={selectedTagObjects}
        setSelectedTagObjects={setSelectedTagObjects}
      />
    </>
  );
}
