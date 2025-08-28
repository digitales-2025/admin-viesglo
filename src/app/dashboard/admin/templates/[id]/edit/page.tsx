"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import AlertMessage from "@/shared/components/alerts/Alert";
import { ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";
import { Loading } from "@/shared/components/loading";
import { AutoSaveStatus } from "../../_components/ui/AutoSaveStatus";
import { useDraftRecovery } from "../../_hooks/use-draft-recovery";
import { useActiveMilestoneTemplates } from "../../_hooks/use-milestone-templates";
import { useNavigationWarning } from "../../_hooks/use-navigation-warning";
import { useProjectTemplateForm } from "../../_hooks/use-project-template-form";
import { useTemplateDetailedById } from "../../_hooks/use-project-templates";
import { useTemplateDraftZustand } from "../../_hooks/use-template-draft-zustand";
import { MilestoneTemplateResponseDto } from "../../_types/templates.types";
import { useTagsByName } from "../../../tags/_hooks/use-tags";
import { TagResponseDto } from "../../../tags/_types/tags.types";
import CreateProjectTemplateForm from "../../create/_components/CreateProjectTemplateForm";

export default function EditTemplatesPage() {
  const params = useParams();
  const id = params.id as string;

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

  // Obtener datos de la plantilla por ID con milestone templates completos
  const { data: templateData, isLoading, error, refetch } = useTemplateDetailedById(id, true);

  // Hook para el formulario del proyecto en modo edición
  const { form, onSubmit, updateMilestones, updateTags, isPending, handleCancel } = useProjectTemplateForm({
    isUpdate: true,
    initialData: templateData || undefined,
    onSuccess: () => {
      // Hacer refetch para obtener los datos actualizados
      refetch();
      // Limpiar estados después de actualizar exitosamente
      setSelectedMilestones([]);
      setSelectedMilestoneObjects([]);
      setSelectedTags([]);
      setSelectedTagObjects([]);
    },
  });

  // Hook de auto-save con Zustand
  const {
    isAutoSaving,
    lastSaved,
    hasValidDraft,
    showRecoveryDialog,
    draftData,
    recoverDraft,
    dismissDraft,
    hasUnsavedChanges,
  } = useTemplateDraftZustand({
    form,
    templateId: id,
    isUpdate: true,
    selectedTags,
    onRecoverDraft: recoverDraftData,
  });

  // Hook para interceptar navegación
  const { handleNavigationWithWarning, handleNavigationConfirm } = useNavigationWarning({
    hasUnsavedChanges: hasUnsavedChanges, // Usar la función del hook
    templateId: id,
    isUpdate: true,
  });

  // Cargar datos iniciales cuando se obtenga la plantilla (solo si no hay draft)
  useEffect(() => {
    if (templateData) {
      const hasDraft = hasValidDraft(id, true);

      if (!hasDraft) {
        // Cargar tags seleccionados
        const tagIds = templateData.tags?.map((tag: any) => tag.id) || [];
        setSelectedTags(tagIds);
        setSelectedTagObjects(templateData.tags || []);

        // Cargar milestones en el orden correcto basado en templateData.milestones
        if (templateData.milestones && templateData.milestoneTemplates) {
          const milestoneIds = templateData.milestones.map((milestone: any) => milestone.milestoneTemplateId);
          setSelectedMilestones(milestoneIds);

          // Ordenar milestoneTemplates según el orden de milestones
          const orderedMilestoneTemplates = templateData.milestones
            .map((milestoneRef: any) => {
              const milestoneTemplate = templateData.milestoneTemplates!.find(
                (mt: any) => mt.id === milestoneRef.milestoneTemplateId
              );
              return milestoneTemplate;
            })
            .filter((mt): mt is any => mt !== undefined); // Filtrar en caso de que no se encuentre algún template

          setSelectedMilestoneObjects(orderedMilestoneTemplates);
        }
      }
    }
  }, [templateData, id]); // Removido hasValidDraft de las dependencias

  const handleSave = () => {
    // El useEffect en CreateProjectTemplateForm ya maneja la sincronización correctamente
    // Solo necesitamos asegurarnos de que los tags estén sincronizados
    updateTags(selectedTags);

    // Enviar el formulario
    form.handleSubmit(onSubmit)();
  };

  // Callbacks para el diálogo de navegación
  const handleNavigationWarningConfirm = (targetUrl: string) => {
    handleNavigationConfirm(targetUrl);
  };

  const handleNavigationWarningCancel = () => {
    // No hacer nada, solo cerrar el diálogo
  };

  // Mostrar loading mientras se cargan los datos
  if (isLoading) {
    return (
      <>
        <ShellHeader>
          <ShellTitle title="Editando plantilla..." description="Cargando datos de la plantilla." />
        </ShellHeader>
        <Loading text="Cargando datos de la plantilla..." variant="spinner" />
      </>
    );
  }

  // Mostrar error si no se pudo cargar la plantilla
  if (error || !templateData) {
    return (
      <>
        <ShellHeader>
          <ShellTitle title="Error" description="No se pudo cargar la plantilla." />
        </ShellHeader>
        <AlertMessage
          variant="destructive"
          title="Error al cargar plantillas"
          description={error?.error?.message ?? "Ocurrió un error desconocido al cargar la plantilla."}
        />
      </>
    );
  }

  return (
    <>
      <ShellHeader>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full gap-4">
          <ShellTitle title="Editar plantilla" description={`Editando: ${templateData.name}`} />
          <AutoSaveStatus isAutoSaving={isAutoSaving} lastSaved={lastSaved} />
        </div>
      </ShellHeader>

      <CreateProjectTemplateForm
        form={form}
        handleSave={handleSave}
        handleCancel={handleCancel}
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
        draftData={draftData}
        showRecoveryDialog={showRecoveryDialog}
        recoverDraft={recoverDraft}
        dismissDraft={dismissDraft}
        handleNavigationWithWarning={handleNavigationWithWarning}
        onNavigationWarningConfirm={handleNavigationWarningConfirm}
        onNavigationWarningCancel={handleNavigationWarningCancel}
      />
    </>
  );
}
