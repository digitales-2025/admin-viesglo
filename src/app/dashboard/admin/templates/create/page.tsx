"use client";

import { useState } from "react";

import { ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";
import { AutoSaveStatus } from "../_components/ui/AutoSaveStatus";
import { useDraftRecovery } from "../_hooks/use-draft-recovery";
import { useActiveMilestoneTemplates } from "../_hooks/use-milestone-templates";
import { useNavigationWarning } from "../_hooks/use-navigation-warning";
import { useProjectTemplateForm } from "../_hooks/use-project-template-form";
import { useTemplateDraftZustand } from "../_hooks/use-template-draft-zustand";
import { MilestoneTemplateResponseDto } from "../_types/templates.types";
import { useTagsByName } from "../../tags/_hooks/use-tags";
import { TagResponseDto } from "../../tags/_types/tags.types";
import CreateProjectTemplateForm from "./_components/CreateProjectTemplateForm";

export default function CreateTemplatesPage() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedTagObjects, setSelectedTagObjects] = useState<TagResponseDto[]>([]);
  const [selectedMilestones, setSelectedMilestones] = useState<string[]>([]);
  const [selectedMilestoneObjects, setSelectedMilestoneObjects] = useState<MilestoneTemplateResponseDto[]>([]);

  // Obtener datos disponibles para recuperación
  const { data: allMilestones = [] } = useActiveMilestoneTemplates();
  const { data: allTags = [] } = useTagsByName("", 1000, true); // Obtener todos los tags

  // Hook para recuperación de borradores
  const { recoverDraftData } = useDraftRecovery({
    setSelectedTags,
    setSelectedTagObjects,
    setSelectedMilestones,
    setSelectedMilestoneObjects,
    allTags,
    allMilestones,
  });

  // Hook para el formulario del proyecto
  const { form, onSubmit, updateMilestones, updateTags, isPending } = useProjectTemplateForm({
    onSuccess: () => {
      // Limpiar estados después de crear exitosamente
      setSelectedMilestones([]);
      setSelectedMilestoneObjects([]);
      setSelectedTags([]);
      setSelectedTagObjects([]);
    },
  });

  // Hook de auto-save con Zustand
  const { isAutoSaving, lastSaved, showRecoveryDialog, draftData, recoverDraft, dismissDraft, hasUnsavedChanges } =
    useTemplateDraftZustand({
      form,
      isUpdate: false, // Modo crear
      selectedTags,
      onRecoverDraft: recoverDraftData,
    });

  // Hook para interceptar navegación
  const { handleNavigationWithWarning, handleNavigationConfirm } = useNavigationWarning({
    hasUnsavedChanges: hasUnsavedChanges, // Usar la función del hook
    isUpdate: false,
  });

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
        <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full gap-4">
          <ShellTitle title="Nueva plantilla" description="Crea una nueva plantilla de proyecto." />
          <AutoSaveStatus isAutoSaving={isAutoSaving} lastSaved={lastSaved} />
        </div>
      </ShellHeader>

      <CreateProjectTemplateForm
        form={form}
        handleSave={handleSave}
        isPending={isPending}
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
        showRecoveryDialog={showRecoveryDialog}
        recoverDraft={recoverDraft}
        dismissDraft={dismissDraft}
        draftData={draftData}
        handleNavigationWithWarning={handleNavigationWithWarning}
        onNavigationWarningConfirm={handleNavigationConfirm}
        onNavigationWarningCancel={() => {}}
      />
    </>
  );
}
