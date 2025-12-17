"use client";

import { useState } from "react";

import { ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";
import { AutoSaveStatus } from "../_components/ui/AutoSaveStatus";
import { useDraftRecovery } from "../_hooks/use-draft-recovery";
import { useSearchMilestoneTemplates } from "../_hooks/use-milestone-templates";
import { useNavigationWarning } from "../_hooks/use-navigation-warning";
import { useProjectTemplateForm } from "../_hooks/use-project-template-form";
import { useTemplateDraftZustand } from "../_hooks/use-template-draft-zustand";
import { MilestoneTemplateResponseDto } from "../_types/templates.types";
import { useSearchTags } from "../../tags/_hooks/use-tags";
import { TagResponseDto } from "../../tags/_types/tags.types";
import CreateProjectTemplateForm from "./_components/CreateProjectTemplateForm";

export default function CreateTemplatesPage() {
  const [selectedTagObjects, setSelectedTagObjects] = useState<TagResponseDto[]>([]);
  const [selectedMilestoneObjects, setSelectedMilestoneObjects] = useState<MilestoneTemplateResponseDto[]>([]);

  // Obtener datos disponibles para recuperación
  const {
    allMilestoneTemplates = [],
    query: milestoneQuery,
    handleSearchChange: handleMilestoneSearchChange,
    handlePreselectedIdsFilter: handleMilestonePreselectedIdsFilter,
    handleScrollEnd: handleMilestoneScrollEnd,
    isLoading: isMilestoneLoading,
    isError: isMilestoneError,
    preselectedIds: selectedMilestones,
    setPreselectedIds: setSelectedMilestones,
  } = useSearchMilestoneTemplates();

  const {
    allTags = [],
    query: tagQuery,
    handleSearchChange: handleTagSearchChange,
    handlePreselectedIdsFilter: handleTagPreselectedIdsFilter,
    handleScrollEnd: handleTagScrollEnd,
    isLoading: isTagLoading,
    isError: isTagError,
    preselectedIds: selectedTags,
    setPreselectedIds: setSelectedTags,
  } = useSearchTags(); // Una sola consulta paginada para todo

  // Hook para recuperación de borradores
  const { recoverDraftData } = useDraftRecovery({
    setSelectedTags,
    setSelectedTagObjects,
    setSelectedMilestones,
    setSelectedMilestoneObjects,
    allTags,
    allMilestones: allMilestoneTemplates,
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
    updateTags(selectedTags || []);

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
        selectedMilestones={selectedMilestones || []}
        setSelectedMilestones={setSelectedMilestones as React.Dispatch<React.SetStateAction<string[]>>}
        selectedMilestoneObjects={selectedMilestoneObjects}
        setSelectedMilestoneObjects={setSelectedMilestoneObjects}
        updateMilestones={updateMilestones}
        updateTags={updateTags}
        selectedTags={selectedTags || []}
        setSelectedTags={setSelectedTags as React.Dispatch<React.SetStateAction<string[]>>}
        selectedTagObjects={selectedTagObjects}
        setSelectedTagObjects={setSelectedTagObjects}
        showRecoveryDialog={showRecoveryDialog}
        recoverDraft={recoverDraft}
        dismissDraft={dismissDraft}
        draftData={draftData}
        handleNavigationWithWarning={handleNavigationWithWarning}
        onNavigationWarningConfirm={handleNavigationConfirm}
        onNavigationWarningCancel={() => {}}
        // Props para TagEditorDialog
        allTags={allTags}
        tagQuery={tagQuery}
        handleTagSearchChange={handleTagSearchChange}
        handleTagPreselectedIdsFilter={handleTagPreselectedIdsFilter}
        handleTagScrollEnd={handleTagScrollEnd}
        isTagLoading={isTagLoading}
        isTagError={isTagError}
        // Props para MilestoneDialog
        allMilestones={allMilestoneTemplates}
        milestoneQuery={milestoneQuery}
        handleMilestoneSearchChange={handleMilestoneSearchChange}
        handleMilestonePreselectedIdsFilter={handleMilestonePreselectedIdsFilter}
        handleMilestoneScrollEnd={handleMilestoneScrollEnd}
        isMilestoneLoading={isMilestoneLoading}
        isMilestoneError={isMilestoneError}
      />
    </>
  );
}
