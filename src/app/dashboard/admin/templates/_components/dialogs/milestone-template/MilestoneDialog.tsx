"use client";

import { memo, useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

import { Button } from "@/shared/components/ui/button";
import { ResponsiveDialog } from "@/shared/components/ui/resposive-dialog";
import { useMediaQuery } from "@/shared/hooks/use-media-query";
import { useMilestoneTemplateForm } from "../../../_hooks/use-milestone-template-form";
import {
  MilestoneTemplateSearchQueryResult,
  useDeleteMilestoneTemplate,
  useSearchMilestoneTemplates,
} from "../../../_hooks/use-milestone-templates";
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
  // Props opcionales para milestone search
  allMilestones?: MilestoneTemplateResponseDto[];
  milestoneQuery?: MilestoneTemplateSearchQueryResult;
  handleMilestoneSearchChange?: (value: string) => void;
  handleMilestonePreselectedIdsFilter?: (preselectedIds: string[] | undefined) => void;
  handleMilestoneScrollEnd?: () => void;
  isMilestoneLoading?: boolean;
  isMilestoneError?: boolean;
}

export const MilestoneDialog = memo(function MilestoneDialog({
  selectedMilestones,
  onMilestonesChange,
  selectedMilestoneObjects,
  onMilestoneObjectsChange,
  milestones,
  // Props opcionales para milestone search
  allMilestones,
  milestoneQuery,
  handleMilestoneSearchChange,
  handleMilestonePreselectedIdsFilter,
  handleMilestoneScrollEnd,
  isMilestoneLoading,
  isMilestoneError,
}: MilestoneDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingMilestone, setEditingMilestone] = useState<MilestoneTemplateResponseDto | null>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Usar props externas si están disponibles, sino hacer consulta propia
  const externalSearchData =
    allMilestones &&
    milestoneQuery &&
    handleMilestoneSearchChange &&
    handleMilestonePreselectedIdsFilter &&
    handleMilestoneScrollEnd &&
    isMilestoneLoading !== undefined &&
    isMilestoneError !== undefined;

  const {
    allMilestoneTemplates: externalAllMilestoneTemplates,
    query: externalQuery,
    handleSearchChange: externalHandleSearchChange,
    handlePreselectedIdsFilter: externalHandlePreselectedIdsFilter,
    handleScrollEnd: externalHandleScrollEnd,
    isLoading: externalIsLoading,
    isError: externalIsError,
  } = useSearchMilestoneTemplates();

  // Usar datos externos si están disponibles, sino usar datos internos
  const allMilestoneTemplates = externalSearchData ? allMilestones : externalAllMilestoneTemplates;
  const query = externalSearchData ? milestoneQuery : externalQuery;
  const handleSearchChange = externalSearchData ? handleMilestoneSearchChange : externalHandleSearchChange;
  const handlePreselectedIdsFilter = externalSearchData
    ? handleMilestonePreselectedIdsFilter
    : externalHandlePreselectedIdsFilter;
  const handleScrollEnd = externalSearchData ? handleMilestoneScrollEnd : externalHandleScrollEnd;
  const isLoading = externalSearchData ? isMilestoneLoading : externalIsLoading;
  const isError = externalSearchData ? isMilestoneError : externalIsError;

  // Aplicar preselectedIds cuando hay milestones seleccionados
  useEffect(() => {
    if (selectedMilestones.length > 0) {
      handlePreselectedIdsFilter(selectedMilestones);
    }
  }, [selectedMilestones, handlePreselectedIdsFilter]);

  // Debounce para búsqueda (300ms)
  const debouncedSearch = useDebouncedCallback((value: string) => {
    handleSearchChange(value);
  }, 300);

  // Aplicar búsqueda con debounce cuando cambia el término
  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  // Usar hook real para crear/editar milestones - una sola instancia
  const {
    form,
    isPending: isCreating,
    onSubmit,
  } = useMilestoneTemplateForm({
    isUpdate: !!editingMilestone,
    initialData: editingMilestone || undefined,
    onSuccess: (response) => {
      setEditingMilestone(null);

      // Si es una actualización y tenemos respuesta, actualizar el estado local
      if (response && editingMilestone) {
        // Actualizar en selectedMilestoneObjects si está seleccionado
        const isSelected = selectedMilestones.includes(editingMilestone.id);
        if (isSelected) {
          const updatedMilestoneObjects = selectedMilestoneObjects.map((milestone) =>
            milestone.id === editingMilestone.id ? response : milestone
          );
          onMilestoneObjectsChange(updatedMilestoneObjects);
        }
      }
    },
  });

  // Hook para eliminar milestones
  const { mutate: deleteMilestone, isPending: isDeleting } = useDeleteMilestoneTemplate();

  // Filtrar solo milestones activos
  const filteredMilestones = allMilestoneTemplates.filter((milestone) => milestone.isActive);

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
      const milestone = allMilestoneTemplates.find((m) => m.id === milestoneId);
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
    [
      selectedMilestones,
      allMilestoneTemplates,
      selectedMilestoneObjects,
      onMilestonesChange,
      onMilestoneObjectsChange,
      milestones,
    ]
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
        // Props para scroll infinito
        query={query}
        handleScrollEnd={handleScrollEnd}
        isLoading={isLoading}
        isError={isError}
      />
    </ResponsiveDialog>
  );
});
