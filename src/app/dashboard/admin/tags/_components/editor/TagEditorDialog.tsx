"use client";

import { useEffect, useState } from "react";
import { Tags } from "lucide-react";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { ResponsiveDialog } from "@/shared/components/ui/resposive-dialog";
import { useMediaQuery } from "@/shared/hooks/use-media-query";
import { useTagForm } from "../../_hooks/use-tag-form";
import { useDeleteTag, useTagsByName } from "../../_hooks/use-tags";
import { type CreateTagForm } from "../../_schemas/tags-schemas";
import { TagResponseDto } from "../../_types/tags.types";
import { TagEditorForm } from "./TagEditorForm";

interface TagEditorDialogProps {
  selectedTags: string[];
  onTagsChange: (tagIds: string[]) => void;
}

export function TagEditorDialog({ selectedTags, onTagsChange }: TagEditorDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [editingTag, setEditingTag] = useState<TagResponseDto | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customColor, setCustomColor] = useState("#3b82f6");
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Usar hook real para buscar tags - con debounce para optimizar
  const { data: searchResults = [] } = useTagsByName(
    debouncedSearchTerm,
    10,
    true // Siempre habilitado para mostrar tags existentes
  );

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

  // Debounce para optimizar búsquedas
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms de delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Usar searchResults - el backend ya filtra por nombre, solo filtrar por isActive
  const filteredTags = searchResults.filter((tag) => tag.isActive);

  const handleSubmit = (data: CreateTagForm) => {
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
  };

  const handleDeleteTag = (tagId: string) => {
    deleteTag(
      { params: { path: { id: tagId } } },
      {
        onSuccess: () => {
          // Remover de tags seleccionados si estaba seleccionado
          onTagsChange(selectedTags.filter((id) => id !== tagId));
        },
      }
    );
  };

  const toggleTagSelection = (tagId: string) => {
    const newSelection = selectedTags.includes(tagId)
      ? selectedTags.filter((id) => id !== tagId)
      : [...selectedTags, tagId];
    onTagsChange(newSelection);
  };

  const trigger = (
    <Button variant="outline" className="gap-2 bg-transparent">
      <Tags className="w-4 h-4" />
      Gestionar Tags
      {selectedTags.length > 0 && (
        <Badge variant="secondary" className="ml-1">
          {selectedTags.length}
        </Badge>
      )}
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
        toggleTagSelection={toggleTagSelection}
        handleDeleteTag={handleDeleteTag}
        isDeleting={isDeleting}
        isCreating={isCreating}
        handleSubmit={handleSubmit}
        editingTag={editingTag}
        setEditingTag={setEditingTag}
        form={form}
        searchResults={searchResults}
      />
    </ResponsiveDialog>
  );
}
