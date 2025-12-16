"use client";

import { memo, useCallback, useEffect, useState } from "react";
import { Tags } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

import { Button } from "@/shared/components/ui/button";
import { ResponsiveDialog } from "@/shared/components/ui/resposive-dialog";
import { useMediaQuery } from "@/shared/hooks/use-media-query";
import { useTagForm } from "../../_hooks/use-tag-form";
import { TagSearchQueryResult, useDeleteTag } from "../../_hooks/use-tags";
import { type CreateTagForm } from "../../_schemas/tags-schemas";
import { TagResponseDto } from "../../_types/tags.types";
import { TagEditorForm } from "./TagEditorForm";

interface TagEditorDialogProps {
  selectedTags: string[];
  onTagsChange: (tagIds: string[]) => void;
  selectedTagObjects: TagResponseDto[];
  onTagObjectsChange: (tagObjects: TagResponseDto[]) => void;
  allTags: TagResponseDto[];
  query: TagSearchQueryResult;
  handleSearchChange: (value: string) => void;
  handlePreselectedIdsFilter?: (preselectedIds: string[] | undefined) => void;
  handleScrollEnd: () => void;
  isLoading: boolean;
  isError: boolean;
}

export const TagEditorDialog = memo(function TagEditorDialog({
  selectedTags,
  onTagsChange,
  selectedTagObjects,
  onTagObjectsChange,
  // Props opcionales para evitar consulta duplicada
  allTags,
  query,
  handleSearchChange,
  handlePreselectedIdsFilter,
  handleScrollEnd,
  isLoading,
  isError,
}: TagEditorDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingTag, setEditingTag] = useState<TagResponseDto | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customColor, setCustomColor] = useState("#3b82f6");
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Aplicar preselectedIds cuando hay tags seleccionados
  useEffect(() => {
    if (selectedTags.length > 0) {
      handlePreselectedIdsFilter?.(selectedTags);
    }
  }, [selectedTags, handlePreselectedIdsFilter]);

  // Debounce para búsqueda (300ms)
  const debouncedSearch = useDebouncedCallback((value: string) => {
    handleSearchChange?.(value);
  }, 300);

  // Aplicar búsqueda con debounce cuando cambia el término
  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  // Filtrar solo tags activos
  const filteredTags = allTags?.filter((tag) => tag.isActive) || [];

  // Usar hook real para crear/editar tags - una sola instancia
  const {
    form,
    isPending: isCreating,
    onSubmit,
  } = useTagForm({
    isUpdate: !!editingTag,
    initialData: editingTag || undefined,
    onSuccess: () => {
      setEditingTag(null);
      // Refrescar la búsqueda después de crear/editar
    },
  });

  // Hook para eliminar tags
  const { mutate: deleteTag, isPending: isDeleting } = useDeleteTag();

  // Funciones optimizadas con useCallback para evitar re-creaciones
  const handleSubmit = useCallback(
    (data: CreateTagForm) => {
      onSubmit(data);
      // Limpiar completamente el formulario después de crear/editar
      form.reset({
        name: "",
        color: "#3b82f6",
      });
      // Forzar la limpieza de los campos
      form.setValue("name", "");
      form.setValue("color", "#3b82f6");
      setShowColorPicker(false);
      setCustomColor("#3b82f6");
    },
    [onSubmit, form, setShowColorPicker, setCustomColor]
  );

  const handleDeleteTag = useCallback(
    (tagId: string) => {
      deleteTag(
        { params: { path: { id: tagId } } },
        {
          onSuccess: () => {
            // Remover de tags seleccionados si estaba seleccionado
            onTagsChange(selectedTags.filter((id) => id !== tagId));
            onTagObjectsChange(selectedTagObjects.filter((tag) => tag.id !== tagId));
          },
        }
      );
    },
    [deleteTag, selectedTags, selectedTagObjects, onTagsChange, onTagObjectsChange]
  );

  const toggleTagSelection = useCallback(
    (tagId: string) => {
      const newSelection = selectedTags.includes(tagId)
        ? selectedTags.filter((id) => id !== tagId)
        : [...selectedTags, tagId];
      onTagsChange(newSelection);

      // También actualizar selectedTagObjects
      const tag = allTags?.find((t) => t.id === tagId);
      if (tag) {
        const newTagObjects = selectedTagObjects.some((t) => t.id === tagId)
          ? selectedTagObjects.filter((t) => t.id !== tagId)
          : [...selectedTagObjects, tag];
        onTagObjectsChange(newTagObjects);
      }
    },
    [selectedTags, allTags, selectedTagObjects, onTagsChange, onTagObjectsChange]
  );

  const trigger = (
    <Button variant="outline" size="sm" className="gap-2 bg-transparent w-fit">
      <Tags className="w-4 h-4" />
      Gestionar Etiquetas
    </Button>
  );

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={setOpen}
      isDesktop={isDesktop}
      trigger={trigger}
      title="Gestor de Etiquetas"
      description="Gestiona y selecciona etiquetas para tu proyecto"
      dialogContentClassName="sm:max-w-4xl max-h-[90vh] overflow-hidden px-0"
      drawerContentClassName="max-h-[85vh]"
      drawerScrollAreaClassName="h-full px-0"
    >
      <TagEditorForm
        showColorPicker={showColorPicker}
        setShowColorPicker={setShowColorPicker}
        customColor={customColor}
        setCustomColor={setCustomColor}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filteredTags={filteredTags}
        selectedTags={selectedTags}
        selectedTagObjects={selectedTagObjects}
        toggleTagSelection={toggleTagSelection}
        handleDeleteTag={handleDeleteTag}
        isDeleting={isDeleting}
        isCreating={isCreating}
        handleSubmit={handleSubmit}
        editingTag={editingTag}
        setEditingTag={setEditingTag}
        form={form}
        // Props para scroll infinito
        query={query}
        handleScrollEnd={handleScrollEnd}
        isLoading={isLoading}
        isError={isError}
      />
    </ResponsiveDialog>
  );
});
