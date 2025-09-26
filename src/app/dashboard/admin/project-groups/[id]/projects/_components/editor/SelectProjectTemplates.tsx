import React, { useCallback, useState } from "react";
import { X } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import { useTemplateDetailedById } from "@/app/dashboard/admin/templates/_hooks";
import {
  ProjectTemplateDetailedResponseDto,
  ProjectTemplateResponseDto,
} from "@/app/dashboard/admin/templates/_types/templates.types";
import { ProjectTemplateSearch } from "@/app/dashboard/admin/templates/search";
import { BaseErrorResponse } from "@/lib/api/types/common";
import { Button } from "@/shared/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { cn } from "@/shared/lib/utils";
import { ProjectsForm } from "../../_schemas/projects.schemas";
import TreeProjectTemplates from "./TreeProjectTemplates";

interface SelectProjectTemplatesProps {
  form: UseFormReturn<ProjectsForm>;
  className?: string;
}

export default function SelectProjectTemplates({ form, className }: SelectProjectTemplatesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplateResponseDto | null>(null);

  const isPending = form.formState.isSubmitting;

  // Hook para obtener los datos detallados de la plantilla seleccionada
  const {
    data: templateData,
    isLoading,
    error,
  } = useTemplateDetailedById(selectedTemplate?.id, !!selectedTemplate?.id);

  // Función para manejar la selección de plantilla
  const handleTemplateSelect = useCallback(
    (template: ProjectTemplateResponseDto) => {
      setSelectedTemplate(template);
      // Limpiar selecciones anteriores cuando se cambia de plantilla
      form.setValue("selectedMilestones", []);
      // También actualizar el projectTemplateId
      form.setValue("projectTemplateId", template.id);
    },
    [form]
  );

  // Función para limpiar la plantilla seleccionada
  const clearSelectedTemplate = useCallback(() => {
    setSelectedTemplate(null);
    form.setValue("selectedMilestones", []);
    form.setValue("projectTemplateId", undefined);
  }, [form]);

  return (
    <FormField
      control={form.control}
      name="selectedMilestones"
      render={() => (
        <FormItem className={cn("w-full", className)}>
          <FormLabel>Plantillas de proyecto</FormLabel>
          <FormControl>
            <div className="space-y-4">
              {/* Selector de plantilla */}
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="flex-1 relative">
                    <ProjectTemplateSearch
                      value={selectedTemplate?.id || ""}
                      onAddItem={(templateId: string, template: ProjectTemplateResponseDto) =>
                        handleTemplateSelect(template)
                      }
                      onDuplicate={() => false} // No permitir duplicados
                      disabled={isPending}
                      filterByActive={true}
                    />
                  </div>
                  <div>
                    {selectedTemplate && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={clearSelectedTemplate}
                        disabled={isPending}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                {selectedTemplate && (
                  <div className="text-xs text-muted-foreground">
                    Plantilla seleccionada: <span className="font-medium">{selectedTemplate.name}</span>
                  </div>
                )}
              </div>

              <TreeProjectTemplates
                form={form}
                selectedTemplate={selectedTemplate}
                isLoading={isLoading}
                error={error as BaseErrorResponse}
                templateData={templateData as ProjectTemplateDetailedResponseDto}
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
