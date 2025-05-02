import * as React from "react";
import { Column } from "@tanstack/react-table";
import { Check, PlusCircle } from "lucide-react";

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
import { cn } from "@/shared/lib/utils";

export interface DataTableFacetedFilterOption {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface DataTableFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  title?: string;
  options: DataTableFacetedFilterOption[];
  onFilterChange?: (values: string[]) => void;
  multiSelect?: boolean;
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
  onFilterChange,
  multiSelect = true,
}: DataTableFacetedFilterProps<TData, TValue>) {
  // Estado local para manejar los valores seleccionados cuando no hay columna
  const [localSelectedValues, setLocalSelectedValues] = React.useState<Set<string>>(new Set());

  // Usar el filtro de la columna si existe, de lo contrario usar el estado local
  const facets = column?.getFacetedUniqueValues();
  const selectedValues = column ? new Set(column.getFilterValue() as string[]) : localSelectedValues;

  // Handler for selecting/deselecting a filter value
  const handleSelect = (value: string) => {
    // Crear una copia de los valores seleccionados para modificarla
    const newSelectedValues = new Set(selectedValues);

    // Si es selección única y estamos seleccionando un nuevo valor, limpiamos los previos
    if (!multiSelect) {
      newSelectedValues.clear();
    }

    // Actualizar el conjunto de valores seleccionados
    if (newSelectedValues.has(value)) {
      newSelectedValues.delete(value);
    } else {
      newSelectedValues.add(value);
    }

    // Convertir a array para el filtro
    const filterValues = Array.from(newSelectedValues);

    // Si hay una columna, actualizar su filtro
    if (column) {
      column.setFilterValue(filterValues.length ? filterValues : undefined);
    } else {
      // Si no hay columna, actualizar el estado local
      setLocalSelectedValues(newSelectedValues);
    }

    // Notificar al manejador externo si existe
    if (onFilterChange) {
      onFilterChange(filterValues);
    }
  };

  // Handler for clearing all filters
  const handleClearFilters = () => {
    // Si hay una columna, limpiar su filtro
    if (column) {
      column.setFilterValue(undefined);
    } else {
      // Si no hay columna, limpiar el estado local
      setLocalSelectedValues(new Set());
    }

    // Notificar al manejador externo si existe
    if (onFilterChange) {
      onFilterChange([]);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("h-8 border-dashed", selectedValues?.size > 0 && "border-sky-500")}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          {title}
          {selectedValues?.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                {selectedValues.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                    {selectedValues.size} seleccionados
                  </Badge>
                ) : (
                  options
                    .filter((option) => selectedValues.has(option.value))
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
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>No se encontraron resultados.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value);
                return (
                  <CommandItem key={option.value} onSelect={() => handleSelect(option.value)}>
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <Check className={cn("h-4 w-4")} />
                    </div>
                    {option.icon && <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
                    <span>{option.label}</span>
                    {facets?.get(option.value) && (
                      <span className="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs">
                        {facets.get(option.value)}
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem onSelect={handleClearFilters} className="justify-center text-center">
                    Limpiar filtros
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
