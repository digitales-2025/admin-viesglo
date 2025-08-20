import { memo, useCallback } from "react";
import { Check, Edit2, Palette, Plus, Search, Tags, Trash2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { type CreateTagForm } from "../../_schemas/tags-schemas";
import { TagResponseDto } from "../../_types/tags.types";
import { predefinedColors } from "../../_utils/tag.utils";

interface TagEditorFormProps {
  showColorPicker: boolean;
  setShowColorPicker: (show: boolean) => void;
  customColor: string;
  setCustomColor: (color: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredTags: TagResponseDto[];
  selectedTags: string[];
  selectedTagObjects: TagResponseDto[];
  toggleTagSelection: (tagId: string) => void;
  handleDeleteTag: (tagId: string) => void;
  isDeleting: boolean;
  isCreating: boolean;
  handleSubmit: (data: CreateTagForm) => void;
  editingTag: TagResponseDto | null;
  setEditingTag: (tag: TagResponseDto | null) => void;
  form: UseFormReturn<CreateTagForm>;
}

export const TagEditorForm = memo(function TagEditorForm({
  showColorPicker,
  setShowColorPicker,
  customColor,
  setCustomColor,
  searchTerm,
  setSearchTerm,
  filteredTags,
  selectedTags,
  selectedTagObjects,
  toggleTagSelection,
  handleDeleteTag,
  isDeleting,
  isCreating,
  handleSubmit,
  editingTag,
  setEditingTag,
  form,
}: TagEditorFormProps) {
  // Funciones optimizadas con useCallback
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    },
    [setSearchTerm]
  );

  const handleTagClick = useCallback(
    (tagId: string) => {
      toggleTagSelection(tagId);
    },
    [toggleTagSelection]
  );

  const handleEditClick = useCallback(
    (e: React.MouseEvent, tag: TagResponseDto) => {
      e.stopPropagation();
      setEditingTag(tag);
      setCustomColor(tag.color || "#3b82f6");
    },
    [setEditingTag, setCustomColor]
  );

  const handleDeleteClick = useCallback(
    (e: React.MouseEvent, tagId: string) => {
      e.stopPropagation();
      handleDeleteTag(tagId);
    },
    [handleDeleteTag]
  );

  const handleColorSelect = useCallback(
    (color: string) => {
      form.setValue("color", color);
      setCustomColor(color);
    },
    [form, setCustomColor]
  );

  const handleCustomColorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const color = e.target.value;
      setCustomColor(color);
      form.setValue("color", color);
    },
    [setCustomColor, form]
  );

  const handleCancelEdit = useCallback(() => {
    setEditingTag(null);
    form.reset({
      name: "",
      color: "#3b82f6",
    });
    form.setValue("name", "");
    form.setValue("color", "#3b82f6");
    setCustomColor("#3b82f6");
    setShowColorPicker(false);
  }, [setEditingTag, form, setCustomColor, setShowColorPicker]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
      {/* Left Panel - Tag List & Search */}
      <div className="space-y-4">
        {/* Search Header */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar etiquetas..." value={searchTerm} onChange={handleSearchChange} className="pl-10" />
        </div>

        {/* Tags List */}
        <ScrollArea className="h-[500px] border-2 border-dashed border-muted-foreground/20 rounded-xl p-4 bg-gradient-to-br from-background to-muted/20">
          <div className="space-y-2">
            {filteredTags.length > 0 ? (
              filteredTags.map((tag) => (
                <div
                  key={tag.id}
                  className={`group flex items-center justify-between px-4 py-2 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    selectedTags.includes(tag.id)
                      ? "border-primary bg-primary/10 shadow-primary/20"
                      : "border-border hover:border-primary/30 hover:bg-muted/30"
                  }`}
                  onClick={() => handleTagClick(tag.id)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedTags.includes(tag.id)
                          ? "border-primary bg-primary scale-110"
                          : "border-muted-foreground group-hover:border-primary/50"
                      }`}
                    >
                      {selectedTags.includes(tag.id) && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div className="w-6 h-6 rounded-full border-2 shadow-sm" style={{ backgroundColor: tag.color }} />
                    <span className="font-medium text-sm">{tag.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 hover:bg-primary/10"
                      onClick={(e) => handleEditClick(e, tag)}
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 hover:bg-destructive/10"
                      onClick={(e) => handleDeleteClick(e, tag.id)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <div className="w-3 h-3 border-2 border-destructive/30 border-t-destructive rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3 text-destructive" />
                      )}
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Tags className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No se encontraron etiquetas</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Right Panel - Create/Edit Form */}
      <div className="space-y-4">
        <div className="border-2 border-dashed rounded-xl p-6">
          <h3 className="text-base font-medium mb-6 flex items-center gap-2">
            {editingTag ? (
              <>
                <Edit2 className="w-4 h-4 text-primary" />
                Editar Etiqueta
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 text-primary" />
                Crear Nueva Etiqueta
              </>
            )}
          </h3>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Name Field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Nombre de la Etiqueta</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Urgente, Importante, Crítico..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Color Selection */}
              <div className="space-y-4">
                <FormLabel className="text-sm font-medium">Color de la Etiqueta</FormLabel>

                {/* Current Color Preview */}
                <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-muted/30 border-2 border-dashed border-muted-foreground/20">
                  <div
                    className="w-6 h-6 rounded-full border-2 shadow-lg"
                    style={{ backgroundColor: form.watch("color") || "#3b82f6" }}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Color seleccionado</p>
                    <p className="text-xs text-muted-foreground">{form.watch("color") || "#3b82f6"}</p>
                  </div>
                </div>

                {/* Predefined Colors */}
                <div>
                  <p className="text-xs text-muted-foreground mb-3">Colores predefinidos</p>
                  <div className="grid grid-cols-8 gap-2">
                    {predefinedColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                          form.watch("color") === color
                            ? "border-primary scale-110 shadow-lg"
                            : "border-gray-300 hover:border-primary/50"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => handleColorSelect(color)}
                      />
                    ))}
                  </div>
                </div>

                {/* Custom Color */}
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="flex-1"
                  >
                    <Palette className="w-4 h-4 mr-2" />
                    Color personalizado
                  </Button>
                  {showColorPicker && (
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        value={customColor}
                        onChange={handleCustomColorChange}
                        className="p-1 border-2 rounded-lg cursor-pointer w-10"
                      />
                      <Input
                        value={customColor}
                        onChange={handleCustomColorChange}
                        placeholder="#000000"
                        className="w-24 text-xs font-mono"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 flex-col">
                <Button type="submit" className="flex-1 bg-primary text-white" disabled={isCreating}>
                  {isCreating ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Guardando...
                    </div>
                  ) : editingTag ? (
                    "Actualizar Etiqueta"
                  ) : (
                    "Crear Etiqueta"
                  )}
                </Button>
                {editingTag && (
                  <Button type="button" variant="outline" onClick={handleCancelEdit}>
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>

        {/* Selected Tags */}
        {selectedTagObjects.length > 0 && (
          <div className="border-2 border-dashed border-primary/20 rounded-xl p-4 bg-gradient-to-br from-primary/5 to-background">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              Etiquetas Seleccionadas ({selectedTagObjects.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedTagObjects.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="flex items-center gap-2 px-3 py-1 rounded-full border-2 transition-all hover:scale-105"
                  style={{
                    backgroundColor: `${tag.color}15`,
                    borderColor: tag.color,
                    color: tag.color,
                  }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }} />
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
