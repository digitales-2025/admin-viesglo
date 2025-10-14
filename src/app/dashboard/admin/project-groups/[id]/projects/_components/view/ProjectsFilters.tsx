import React from "react";
import { Check, PlusCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/shared/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Separator } from "@/shared/components/ui/separator";
import { ProjectDelayLevelEnum, ProjectStatusEnum, ProjectTypeEnum } from "../../_types/project.enums";
import { projectDelayLevelConfig, projectStatusConfig, projectTypeConfig } from "../../_utils/projects.utils";

interface ProjectsFiltersProps {
  selectedProjectTypes: ProjectTypeEnum[];
  selectedProjectStatuses: ProjectStatusEnum[];
  selectedDelayLevels: ProjectDelayLevelEnum[];
  projectSortField: string;
  sortOrder: "asc" | "desc";
  onProjectTypesChange: (types: ProjectTypeEnum[]) => void;
  onProjectStatusesChange: (statuses: ProjectStatusEnum[]) => void;
  onDelayLevelsChange: (delayLevels: ProjectDelayLevelEnum[]) => void;
  onSortChange: (field: string, order: "asc" | "desc") => void;
}

export default function ProjectsFilters({
  selectedProjectTypes,
  selectedProjectStatuses,
  selectedDelayLevels,
  projectSortField,
  sortOrder,
  onProjectTypesChange,
  onProjectStatusesChange,
  onDelayLevelsChange,
  onSortChange,
}: ProjectsFiltersProps) {
  // Opciones para el filtro de tipo de proyecto
  const projectTypeOptions = Object.values(ProjectTypeEnum).map((type) => ({
    label: projectTypeConfig[type].label,
    value: type,
    icon: projectTypeConfig[type].icon,
    iconClass: projectTypeConfig[type].iconClass,
  }));

  // Opciones para el filtro de estado de proyecto
  const projectStatusOptions = Object.values(ProjectStatusEnum).map((status) => ({
    label: projectStatusConfig[status].label,
    value: status,
    icon: projectStatusConfig[status].icon,
    iconClass: projectStatusConfig[status].iconClass,
  }));

  // Opciones para el filtro de nivel de retraso
  const delayLevelOptions = Object.values(ProjectDelayLevelEnum).map((delayLevel) => ({
    label: projectDelayLevelConfig[delayLevel].label,
    value: delayLevel,
    icon: projectDelayLevelConfig[delayLevel].icon,
    iconClass: projectDelayLevelConfig[delayLevel].iconClass,
  }));

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-4">
      {/* Botón de ordenamiento por nombre */}
      <Button
        variant="outline"
        size="sm"
        className="h-8 border-dashed"
        onClick={() => onSortChange("name", projectSortField === "name" && sortOrder === "asc" ? "desc" : "asc")}
      >
        A-Z {projectSortField === "name" ? (sortOrder === "asc" ? "↑" : "↓") : "↑"}
      </Button>

      {/* Botón de ordenamiento por fecha de finalización */}
      <Button
        variant="outline"
        size="sm"
        className="h-8 border-dashed"
        onClick={() => onSortChange("endDate", projectSortField === "endDate" && sortOrder === "asc" ? "desc" : "asc")}
      >
        Fecha de finalización {projectSortField === "endDate" ? (sortOrder === "asc" ? "↑" : "↓") : "↑"}
      </Button>
      <div className="flex items-center gap-2">
        {/* Filtro de Tipo de Proyecto */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 border-dashed">
              <PlusCircle className="mr-2 h-4 w-4" />
              Tipo de proyecto
              {selectedProjectTypes.length > 0 && (
                <>
                  <Separator orientation="vertical" className="mx-2 h-4" />
                  <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                    {selectedProjectTypes.length}
                  </Badge>
                  <div className="hidden space-x-1 lg:flex">
                    {selectedProjectTypes.length > 2 ? (
                      <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                        {selectedProjectTypes.length} seleccionados
                      </Badge>
                    ) : (
                      projectTypeOptions
                        .filter((option) => selectedProjectTypes.includes(option.value))
                        .map((option) => (
                          <Badge variant="secondary" key={option.value} className="rounded-sm px-1 font-normal">
                            {option.label}
                          </Badge>
                        ))
                    )}
                  </div>
                </>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Tipo de proyecto" />
              <CommandList>
                <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                <CommandGroup>
                  {projectTypeOptions.map((option) => {
                    const isSelected = selectedProjectTypes.includes(option.value);
                    return (
                      <CommandItem
                        key={option.value}
                        onSelect={() => {
                          const newSelection = isSelected
                            ? selectedProjectTypes.filter((type) => type !== option.value)
                            : [...selectedProjectTypes, option.value];
                          onProjectTypesChange(newSelection);
                        }}
                      >
                        <div
                          className={cn(
                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                            isSelected ? "" : "opacity-50 [&_svg]:invisible"
                          )}
                        >
                          <Check className={cn("h-4 w-4")} />
                        </div>
                        {option.icon && <option.icon className={cn("mr-2 h-4 w-4", option.iconClass)} />}
                        <span>{option.label}</span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
                {selectedProjectTypes.length > 0 && (
                  <>
                    <CommandSeparator />
                    <CommandGroup>
                      <CommandItem onSelect={() => onProjectTypesChange([])} className="justify-center text-center">
                        Limpiar filtros
                      </CommandItem>
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Filtro de Estado de Proyecto */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 border-dashed">
              <PlusCircle className="mr-2 h-4 w-4" />
              Estado
              {selectedProjectStatuses.length > 0 && (
                <>
                  <Separator orientation="vertical" className="mx-2 h-4" />
                  <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                    {selectedProjectStatuses.length}
                  </Badge>
                  <div className="hidden space-x-1 lg:flex">
                    {selectedProjectStatuses.length > 2 ? (
                      <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                        {selectedProjectStatuses.length} seleccionados
                      </Badge>
                    ) : (
                      projectStatusOptions
                        .filter((option) => selectedProjectStatuses.includes(option.value))
                        .map((option) => (
                          <Badge variant="secondary" key={option.value} className="rounded-sm px-1 font-normal">
                            {option.label}
                          </Badge>
                        ))
                    )}
                  </div>
                </>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Estado" />
              <CommandList>
                <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                <CommandGroup>
                  {projectStatusOptions.map((option) => {
                    const isSelected = selectedProjectStatuses.includes(option.value);
                    return (
                      <CommandItem
                        key={option.value}
                        onSelect={() => {
                          const newSelection = isSelected
                            ? selectedProjectStatuses.filter((status) => status !== option.value)
                            : [...selectedProjectStatuses, option.value];
                          onProjectStatusesChange(newSelection);
                        }}
                      >
                        <div
                          className={cn(
                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                            isSelected ? "" : "opacity-50 [&_svg]:invisible"
                          )}
                        >
                          <Check className={cn("h-4 w-4")} />
                        </div>
                        {option.icon && <option.icon className={cn("mr-2 h-4 w-4", option.iconClass)} />}
                        <span>{option.label}</span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
                {selectedProjectStatuses.length > 0 && (
                  <>
                    <CommandSeparator />
                    <CommandGroup>
                      <CommandItem onSelect={() => onProjectStatusesChange([])} className="justify-center text-center">
                        Limpiar filtros
                      </CommandItem>
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Filtro de Nivel de Retraso */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 border-dashed">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nivel de retraso
              {selectedDelayLevels.length > 0 && (
                <>
                  <Separator orientation="vertical" className="mx-2 h-4" />
                  <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                    {selectedDelayLevels.length}
                  </Badge>
                  <div className="hidden space-x-1 lg:flex">
                    {selectedDelayLevels.length > 2 ? (
                      <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                        {selectedDelayLevels.length} seleccionados
                      </Badge>
                    ) : (
                      delayLevelOptions
                        .filter((option) => selectedDelayLevels.includes(option.value))
                        .map((option) => (
                          <Badge variant="secondary" key={option.value} className="rounded-sm px-1 font-normal">
                            {option.label}
                          </Badge>
                        ))
                    )}
                  </div>
                </>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Nivel de retraso" />
              <CommandList>
                <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                <CommandGroup>
                  {delayLevelOptions.map((option) => {
                    const isSelected = selectedDelayLevels.includes(option.value);
                    return (
                      <CommandItem
                        key={option.value}
                        onSelect={() => {
                          const newSelection = isSelected
                            ? selectedDelayLevels.filter((delayLevel) => delayLevel !== option.value)
                            : [...selectedDelayLevels, option.value];
                          onDelayLevelsChange(newSelection);
                        }}
                      >
                        <div
                          className={cn(
                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                            isSelected ? "" : "opacity-50 [&_svg]:invisible"
                          )}
                        >
                          <Check className={cn("h-4 w-4")} />
                        </div>
                        {option.icon && <option.icon className={cn("mr-2 h-4 w-4", option.iconClass)} />}
                        <span>{option.label}</span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
                {selectedDelayLevels.length > 0 && (
                  <>
                    <CommandSeparator />
                    <CommandGroup>
                      <CommandItem onSelect={() => onDelayLevelsChange([])} className="justify-center text-center">
                        Limpiar filtros
                      </CommandItem>
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
