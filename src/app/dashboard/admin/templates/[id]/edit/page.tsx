"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import AlertMessage from "@/shared/components/alerts/Alert";
import { ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";
import { Loading } from "@/shared/components/loading";
import { useProjectTemplateForm } from "../../_hooks/use-project-template-form";
import { useTemplateDetailedById } from "../../_hooks/use-project-templates";
import { MilestoneTemplateResponseDto } from "../../_types/templates.types";
import { TagResponseDto } from "../../../tags/_types/tags.types";
import CreateProjectTemplateForm from "../../create/_components/CreateProjectTemplateForm";

export default function EditTemplatesPage() {
  const params = useParams();
  const id = params.id as string;

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedTagObjects, setSelectedTagObjects] = useState<TagResponseDto[]>([]);
  const [selectedMilestones, setSelectedMilestones] = useState<string[]>([]);
  const [selectedMilestoneObjects, setSelectedMilestoneObjects] = useState<MilestoneTemplateResponseDto[]>([]);

  // Obtener datos de la plantilla por ID con milestone templates completos
  const { data: templateData, isLoading, error } = useTemplateDetailedById(id, true);

  // Hook para el formulario del proyecto en modo edición
  const { form, onSubmit, updateMilestones, updateTags, isPending, isFormValid, handleCancel } = useProjectTemplateForm(
    {
      isUpdate: true,
      initialData: templateData || undefined,
      onSuccess: () => {
        // Limpiar estados después de actualizar exitosamente
        setSelectedMilestones([]);
        setSelectedMilestoneObjects([]);
        setSelectedTags([]);
        setSelectedTagObjects([]);
      },
    }
  );

  // Cargar datos iniciales cuando se obtenga la plantilla
  useEffect(() => {
    if (templateData) {
      // Cargar tags seleccionados
      const tagIds = templateData.tags?.map((tag: any) => tag.id) || [];
      setSelectedTags(tagIds);
      setSelectedTagObjects(templateData.tags || []);

      // Cargar milestones seleccionados con datos completos
      const milestoneIds = templateData.milestones?.map((milestone: any) => milestone.milestoneTemplateId) || [];
      setSelectedMilestones(milestoneIds);

      // Cargar los objetos completos de milestone templates
      if (templateData.milestoneTemplates) {
        setSelectedMilestoneObjects(templateData.milestoneTemplates);
      }
    }
  }, [templateData]);

  const handleSave = () => {
    // Actualizar milestones y tags en el formulario antes de enviar
    const milestoneRefs = selectedMilestoneObjects.map((milestone) => ({
      milestoneTemplateId: milestone.id,
      isRequired: false, // Por defecto, se puede configurar después
      customName: undefined,
      customizations: undefined,
    }));

    updateMilestones(milestoneRefs);
    updateTags(selectedTags);

    // Enviar el formulario
    form.handleSubmit(onSubmit)();
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
          title="Error al cargar clientes"
          description={error?.error?.message ?? "Ocurrió un error desconocido al cargar la plantilla."}
        />
      </>
    );
  }

  return (
    <>
      <ShellHeader>
        <ShellTitle title="Editar plantilla" description={`Editando: ${templateData.name}`} />
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
