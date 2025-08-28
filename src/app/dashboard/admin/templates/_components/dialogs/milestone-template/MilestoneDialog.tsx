"use client";

import { memo, useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { ResponsiveDialog } from "@/shared/components/ui/resposive-dialog";
import { useMediaQuery } from "@/shared/hooks/use-media-query";
import { useMilestoneTemplateForm } from "../../../_hooks/use-milestone-template-form";
import { useDeleteMilestoneTemplate, useMilestoneTemplatesByName } from "../../../_hooks/use-milestone-templates";
import { MilestoneFormData } from "../../../_schemas/projectTemplates.schemas";
import { MilestoneTemplateResponseDto } from "../../../_types/templates.types";
import { handleAddMilestoneRef } from "../../../_utils/handlers/milestone-ref-template.handlers.utils";
import { MilestoneForm } from "./MilestoneForm";

interface MilestoneDialogProps {
  selectedMilestones: string[];
  onMilestonesChange: (milestoneIds: string[]) => void;
  selectedMilestoneObjects: MilestoneTemplateResponseDto[];
  onMilestoneObjectsChange: (milestoneObjects: MilestoneTemplateResponseDto[]) => void;
  milestones: MilestoneTemplateResponseDto[];
}

export const MilestoneDialog = memo(function MilestoneDialog({
  selectedMilestones,
  onMilestonesChange,
  selectedMilestoneObjects,
  onMilestoneObjectsChange,
  milestones,
}: MilestoneDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingMilestone, setEditingMilestone] = useState<MilestoneTemplateResponseDto | null>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Estado para el término de búsqueda debounced
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);

  // useEffect simple para debounce sin dependencias circulares
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Usar hook real para buscar milestones - con debounce para optimizar
  const { data: searchResults = [] } = useMilestoneTemplatesByName(
    debouncedTerm,
    10,
    true // Siempre habilitado para mostrar milestones existentes
  );

  // Usar hook real para crear/editar milestones - una sola instancia
  const {
    form,
    isPending: isCreating,
    onSubmit,
  } = useMilestoneTemplateForm({
    isUpdate: !!editingMilestone,
    initialData: editingMilestone || undefined,
    onSuccess: () => {
      setEditingMilestone(null);
      // Refrescar la búsqueda después de crear/editar
    },
  });

  // Hook para eliminar milestones
  const { mutate: deleteMilestone, isPending: isDeleting } = useDeleteMilestoneTemplate();

  // Usar searchResults - el backend ya filtra por nombre, solo filtrar por isActive
  const filteredMilestones = (searchResults || []).filter((milestone) => milestone.isActive);

  // Funciones optimizadas con useCallback para evitar re-creaciones
  const handleSubmit = useCallback(
    (data: MilestoneFormData) => {
      onSubmit(data);
      // Limpiar completamente el formulario después de crear/editar
      form.reset({
        name: "",
        description: "",
      });
      // Forzar la limpieza de los campos
      form.setValue("name", "");
      form.setValue("description", "");
    },
    [onSubmit, form]
  );

  const handleDeleteMilestone = useCallback(
    (milestoneId: string) => {
      deleteMilestone(
        { params: { path: { id: milestoneId } } },
        {
          onSuccess: () => {
            // Remover de milestones seleccionados si estaba seleccionado
            onMilestonesChange(selectedMilestones.filter((id) => id !== milestoneId));
            onMilestoneObjectsChange(selectedMilestoneObjects.filter((milestone) => milestone.id !== milestoneId));
          },
        }
      );
    },
    [deleteMilestone, selectedMilestones, selectedMilestoneObjects, onMilestonesChange, onMilestoneObjectsChange]
  );

  const toggleMilestoneSelection = useCallback(
    (milestoneId: string) => {
      const isCurrentlySelected = selectedMilestones.includes(milestoneId);
      const newSelection = isCurrentlySelected
        ? selectedMilestones.filter((id) => id !== milestoneId)
        : [...selectedMilestones, milestoneId];
      onMilestonesChange(newSelection);

      // También actualizar selectedMilestoneObjects
      const milestone = (searchResults || []).find((m) => m.id === milestoneId);
      if (milestone) {
        const newMilestoneObjects = selectedMilestoneObjects.some((m) => m.id === milestoneId)
          ? selectedMilestoneObjects.filter((m) => m.id !== milestoneId)
          : [...selectedMilestoneObjects, milestone];
        onMilestoneObjectsChange(newMilestoneObjects);

        // Si se está seleccionando (no deseleccionando) y tenemos la función onAddMilestoneRef, agregar automáticamente
        if (!isCurrentlySelected) {
          handleAddMilestoneRef(
            milestoneId,
            selectedMilestoneObjects,
            onMilestoneObjectsChange,
            milestones,
            onMilestonesChange
          );
        }
      }
    },
    [selectedMilestones, searchResults, selectedMilestoneObjects, onMilestonesChange, onMilestoneObjectsChange]
  );

  const trigger = (
    <Button className="gap-2 w-fit bg-primary hover:bg-primary/90 text-primary-foreground">
      <Plus className="w-4 h-4" />
      Agregar hito
    </Button>
  );

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={setOpen}
      isDesktop={isDesktop}
      trigger={trigger}
      title="Gestor de Hitos"
      description="Gestiona y selecciona hitos para tu plantilla"
      dialogContentClassName="sm:max-w-4xl max-h-[90vh] overflow-hidden px-0"
      drawerContentClassName="max-h-[85vh]"
      drawerScrollAreaClassName="h-full px-0"
    >
      <MilestoneForm
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filteredMilestones={filteredMilestones}
        selectedMilestones={selectedMilestones}
        selectedMilestoneObjects={selectedMilestoneObjects}
        toggleMilestoneSelection={toggleMilestoneSelection}
        handleDeleteMilestone={handleDeleteMilestone}
        isDeleting={isDeleting}
        isCreating={isCreating}
        handleSubmit={handleSubmit}
        editingMilestone={editingMilestone}
        setEditingMilestone={setEditingMilestone}
        form={form}
        milestones={milestones}
        onMilestonesChange={onMilestonesChange}
        onMilestoneObjectsChange={onMilestoneObjectsChange}
      />
    </ResponsiveDialog>
  );
});
