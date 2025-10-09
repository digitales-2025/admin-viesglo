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
import { ProjectStatusEnum, ProjectTypeEnum } from "../../_types/project.enums";
import { projectStatusConfig, projectTypeConfig } from "../../_utils/projects.utils";

interface ProjectsFiltersProps {
  selectedProjectTypes: ProjectTypeEnum[];
  selectedProjectStatuses: ProjectStatusEnum[];
  onProjectTypesChange: (types: ProjectTypeEnum[]) => void;
  onProjectStatusesChange: (statuses: ProjectStatusEnum[]) => void;
}

export default function ProjectsFilters({
  selectedProjectTypes,
  selectedProjectStatuses,
  onProjectTypesChange,
  onProjectStatusesChange,
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

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-4">
      <Button variant="outline" size="sm" className="h-8 border-dashed">
        A-Z ↑
      </Button>
      <Button variant="outline" size="sm" className="h-8 border-dashed">
        Fecha de finalización ↑
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

        {/* Filtro de Nivel de Retraso (placeholder) */}
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
          Nivel de retraso
        </Button>
      </div>
    </div>
  );
}
