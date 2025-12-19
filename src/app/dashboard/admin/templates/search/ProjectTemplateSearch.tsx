"use client";

import { useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { AutoComplete, Option } from "@/shared/components/ui/autocomplete";
import { Badge } from "@/shared/components/ui/badge";
import { useSearchProjectTemplates } from "../_hooks/use-project-templates";
import { ProjectTemplateResponseDto } from "../_types/templates.types";

interface ProjectTemplateSearchProps {
  disabled?: boolean;
  value: string;
  onDuplicate: (projectTemplate: ProjectTemplateResponseDto) => boolean;
  onAddItem: (projectTemplateId: string, projectTemplate: ProjectTemplateResponseDto) => void;
  filterByActive?: boolean | undefined; // true = solo activas, false = solo inactivas, undefined = todas
}

export function ProjectTemplateSearch({
  disabled,
  value,
  onAddItem,
  onDuplicate,
  filterByActive,
}: ProjectTemplateSearchProps) {
  const isDuplicate = useRef(false);
  const { allTemplates, query, handleScrollEnd, handleSearchChange, search, handleIsActiveFilter, isActive } =
    useSearchProjectTemplates();

  // Aplicar filtro por estado activo cuando se pase el prop
  // Solo aplicar una vez al inicio si el valor es diferente
  useEffect(() => {
    if (filterByActive !== undefined && filterByActive !== isActive) {
      handleIsActiveFilter(filterByActive);
    }
  }, [filterByActive, handleIsActiveFilter, isActive]);

  const projectTemplates: Option<ProjectTemplateResponseDto>[] = useMemo(() => {
    // Asegurar que allTemplates sea un array
    if (!allTemplates || !Array.isArray(allTemplates)) {
      return [];
    }

    return allTemplates.map((template) => ({
      value: template.id,
      label: template.name,
      entity: template,
      component: (
        <div className="grid grid-cols-2 gap-2 w-full" title={template.name}>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold truncate">{template.name}</span>
            <span className="text-xs text-muted-foreground">
              {template.description && <span className="truncate block">{template.description}</span>}
              {template.tagIds && template.tagIds.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {template.tagIds.length} etiqueta{template.tagIds.length > 1 ? "s" : ""}
                </span>
              )}
            </span>
          </div>
          <div className="flex flex-col gap-1 items-end">
            <Badge
              className={cn(
                "text-xs font-semibold",
                template.isActive
                  ? "bg-green-100 text-green-800 border-green-200"
                  : "bg-red-100 text-red-800 border-red-200"
              )}
            >
              {template.isActive ? "Activa" : "Inactiva"}
            </Badge>
            {template.milestones && template.milestones.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {template.milestones.length} hito{template.milestones.length > 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </div>
      ),
    }));
  }, [allTemplates]);

  const selectedTemplate = projectTemplates.find((template) => template.value === value);

  // Crear una versión simple para el trigger (solo nombre)
  const selectedTemplateSimple =
    selectedTemplate && selectedTemplate.entity
      ? {
          ...selectedTemplate,
          component: (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{selectedTemplate.entity.name}</span>
            </div>
          ),
        }
      : undefined;

  const handleSelect = ({ value, entity }: Option<ProjectTemplateResponseDto>) => {
    if (!entity) {
      toast.error("No se pudo seleccionar la plantilla. Por favor, inténtalo de nuevo.");
      return;
    }
    const isDuplicateItem = onDuplicate(entity);
    if (!isDuplicateItem) {
      // Si no se debe limpiar el valor seleccionado, no hacemos nada más
      onAddItem(value, entity);
      return;
    }
    isDuplicate.current = isDuplicateItem;
  };

  return (
    <AutoComplete<ProjectTemplateResponseDto>
      queryState={query}
      options={projectTemplates}
      value={selectedTemplateSimple}
      onValueChange={handleSelect}
      onSearchChange={handleSearchChange}
      onScrollEnd={handleScrollEnd}
      onPreventSelection={() => {
        let shouldPreventSelection = true;
        // Si la plantilla ya está en la lista, no permitir la selección
        if (isDuplicate.current) {
          return shouldPreventSelection; // Bloquear la selección
        }

        shouldPreventSelection = false; // Permitir la selección si no es duplicado
        return shouldPreventSelection;
      }}
      placeholder="Selecciona una plantilla..."
      searchPlaceholder="Buscar por nombre o descripción..."
      emptyMessage={search !== "" ? `No se encontraron resultados para "${search}"` : "No se encontraron plantillas"}
      debounceMs={400}
      regexInput={/^[a-zA-Z0-9\s\-.]*$/}
      className="w-full"
      commandContentClassName="min-w-[400px]"
      disabled={disabled}
    />
  );
}
