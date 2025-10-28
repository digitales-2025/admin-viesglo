import * as React from "react";
import { Column } from "@tanstack/react-table";
import { Check, PlusCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Separator } from "../ui/separator";

interface DataTableFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  title?: string;
  options: {
    label: string;
    value: TValue; // Usamos TValue directamente
    icon?: React.ComponentType<{ className?: string }>;
  }[];
  // Soporte controlado (cuando no usamos tabla):
  selectedValues?: TValue[] | undefined;
  onSelectedValuesChange?: (values: TValue[] | undefined) => void;
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
  selectedValues: controlledSelectedValues,
  onSelectedValuesChange,
}: DataTableFacetedFilterProps<TData, TValue>) {
  // Modo no controlado (tabla) usa column.getFilterValue; modo controlado usa prop
  const filterValue = controlledSelectedValues !== undefined ? controlledSelectedValues : column?.getFilterValue();

  const selectedValues = React.useMemo(() => {
    // Si no hay valor de filtro
    if (filterValue === undefined || filterValue === null) {
      return new Set<TValue>();
    }

    // Si es un array, lo convertimos directamente a Set
    if (Array.isArray(filterValue)) {
      return new Set<TValue>(filterValue as TValue[]);
    }

    // Si es un valor único (como un booleano), lo envolvemos en un array
    return new Set<TValue>([filterValue as TValue]);
  }, [filterValue]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
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
                      <Badge variant="secondary" key={String(option.value)} className="rounded-sm px-1 font-normal">
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
                  <CommandItem
                    key={String(option.value)}
                    onSelect={() => {
                      const filterValues = new Set(selectedValues);
                      if (isSelected) {
                        filterValues.delete(option.value);
                      } else {
                        filterValues.add(option.value);
                      }

                      const next = filterValues.size ? Array.from(filterValues) : undefined;

                      if (onSelectedValuesChange) {
                        onSelectedValuesChange(next as TValue[] | undefined);
                        return;
                      }

                      // Modo no controlado (tabla): setFilterValue
                      if (filterValues.size === 1 && typeof Array.from(filterValues)[0] === "boolean") {
                        column?.setFilterValue(Array.from(filterValues)[0]);
                      } else {
                        column?.setFilterValue(next);
                      }
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
                    {option.icon && <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
                    <span>{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      if (onSelectedValuesChange) {
                        // Modo controlado: usar callback
                        onSelectedValuesChange(undefined);
                      } else {
                        // Modo no controlado (tabla): usar setFilterValue
                        column?.setFilterValue(undefined);
                      }
                    }}
                    className="justify-center text-center"
                  >
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
