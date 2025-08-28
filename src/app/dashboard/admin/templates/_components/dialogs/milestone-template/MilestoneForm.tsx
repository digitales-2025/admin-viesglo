"use client";

import { memo, useCallback } from "react";
import { Check, Edit2, Plus, Search, Target, Trash2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Textarea } from "@/shared/components/ui/textarea";
import { MilestoneFormData } from "../../../_schemas/projectTemplates.schemas";
import { MilestoneTemplateResponseDto } from "../../../_types/templates.types";
import { handleAddMilestoneRef } from "../../../_utils/handlers/milestone-ref-template.handlers.utils";

interface MilestoneFormProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredMilestones: MilestoneTemplateResponseDto[];
  selectedMilestones: string[];
  selectedMilestoneObjects: MilestoneTemplateResponseDto[];
  toggleMilestoneSelection: (milestoneId: string) => void;
  handleDeleteMilestone: (milestoneId: string) => void;
  isDeleting: boolean;
  isCreating: boolean;
  handleSubmit: (data: MilestoneFormData) => void;
  editingMilestone: MilestoneTemplateResponseDto | null;
  setEditingMilestone: (milestone: MilestoneTemplateResponseDto | null) => void;
  form: UseFormReturn<MilestoneFormData>;
  milestones: MilestoneTemplateResponseDto[];
  onMilestonesChange: (milestoneIds: string[]) => void;
  onMilestoneObjectsChange: (milestoneObjects: MilestoneTemplateResponseDto[]) => void;
}

export const MilestoneForm = memo(function MilestoneForm({
  searchTerm,
  setSearchTerm,
  filteredMilestones,
  selectedMilestones,
  selectedMilestoneObjects,
  toggleMilestoneSelection,
  handleDeleteMilestone,
  isDeleting,
  isCreating,
  handleSubmit,
  editingMilestone,
  setEditingMilestone,
  form,
  milestones,
  onMilestonesChange,
  onMilestoneObjectsChange,
}: MilestoneFormProps) {
  // Funciones optimizadas con useCallback
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    },
    [setSearchTerm]
  );

  const handleMilestoneClick = useCallback(
    (milestoneId: string) => {
      toggleMilestoneSelection(milestoneId);

      handleAddMilestoneRef(
        milestoneId,
        selectedMilestoneObjects,
        onMilestoneObjectsChange,
        milestones,
        onMilestonesChange
      );
    },
    [toggleMilestoneSelection]
  );

  const handleEditClick = useCallback(
    (e: React.MouseEvent, milestone: MilestoneTemplateResponseDto) => {
      e.stopPropagation();
      setEditingMilestone(milestone);
    },
    [setEditingMilestone]
  );

  const handleDeleteClick = useCallback(
    (e: React.MouseEvent, milestoneId: string) => {
      e.stopPropagation();
      handleDeleteMilestone(milestoneId);
    },
    [handleDeleteMilestone]
  );

  const handleCancelEdit = useCallback(() => {
    setEditingMilestone(null);
    form.reset({
      name: "",
      description: "",
    });
    form.setValue("name", "");
    form.setValue("description", "");
  }, [setEditingMilestone, form]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
      {/* Left Panel - Milestone List & Search */}
      <div className="space-y-4">
        {/* Search Header */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar hitos..." value={searchTerm} onChange={handleSearchChange} className="pl-10" />
        </div>

        {/* Milestones List */}
        <ScrollArea className="h-[500px] border-2 border-dashed border-muted-foreground/20 rounded-xl p-4 bg-gradient-to-br from-background to-muted/20">
          <div className="space-y-2">
            {filteredMilestones.length > 0 ? (
              filteredMilestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className={`group flex items-center justify-between px-3 sm:px-4 py-2 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    selectedMilestones.includes(milestone.id)
                      ? "border-primary bg-primary/10 shadow-primary/20"
                      : "border-border hover:border-primary/30 hover:bg-muted/30"
                  }`}
                  onClick={() => handleMilestoneClick(milestone.id)}
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div
                      className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 mt-0.5 ${
                        selectedMilestones.includes(milestone.id)
                          ? "border-primary bg-primary scale-110"
                          : "border-muted-foreground group-hover:border-primary/50"
                      }`}
                    >
                      {selectedMilestones.includes(milestone.id) && (
                        <Check className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                      )}
                    </div>
                    <Target className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-medium text-sm leading-tight">{milestone.name}</span>
                      {milestone.description && (
                        <span className="text-xs text-muted-foreground leading-relaxed mt-0.5 line-clamp-2">
                          {milestone.description}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-primary/10"
                      onClick={(e) => handleEditClick(e, milestone)}
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-destructive/10"
                      onClick={(e) => handleDeleteClick(e, milestone.id)}
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
                <Target className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No se encontraron hitos</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Right Panel - Create/Edit Form */}
      <div className="space-y-4">
        <div className="border-2 border-dashed rounded-xl p-6">
          <h3 className="text-base font-medium mb-6 flex items-center gap-2">
            {editingMilestone ? (
              <>
                <Edit2 className="w-4 h-4 text-primary" />
                Editar Hito
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 text-primary" />
                Crear Nuevo Hito
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
                    <FormLabel className="text-sm font-medium">Nombre del Hito</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Planificación del proyecto" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description Field */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Descripción (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe el propósito de este hito..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 flex-col">
                <Button type="submit" className="flex-1 bg-primary text-white" disabled={isCreating}>
                  {isCreating ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Guardando...
                    </div>
                  ) : editingMilestone ? (
                    "Actualizar Hito"
                  ) : (
                    "Crear Hito"
                  )}
                </Button>
                {editingMilestone && (
                  <Button type="button" variant="outline" onClick={handleCancelEdit}>
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>

        {/* Selected Milestones */}
        {selectedMilestoneObjects.length > 0 && (
          <div className="border-2 border-dashed border-primary/20 rounded-xl p-4 bg-gradient-to-br from-primary/5 to-background">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              Hitos Seleccionados ({selectedMilestoneObjects.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedMilestoneObjects.map((milestone) => (
                <Badge
                  key={milestone.id}
                  variant="secondary"
                  className="flex items-center gap-2 px-3 py-1 rounded-full border-2 transition-all hover:scale-105"
                >
                  <Target className="w-3 h-3" />
                  {milestone.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
