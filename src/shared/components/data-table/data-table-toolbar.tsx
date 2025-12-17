import * as React from "react";
import { useCallback, useState } from "react";
import { Table } from "@tanstack/react-table";
import { Search, X } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

import { Button } from "../ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { DataTableViewOptions } from "./data-table-view-options";
import { FacetedFilter } from "./facetedFilters";

interface DataTableToolbarProps<TData, TValue> {
  table: Table<TData>;
  toolbarActions?: React.ReactNode | ((table: Table<TData>) => React.ReactNode);
  filterPlaceholder?: string;
  facetedFilters?: FacetedFilter<TValue>[];
  externalFilterValue?: string;
  onGlobalFilterChange?: (value: string) => void;
}

export function DataTableToolbar<TData, TValue>({
  table,
  toolbarActions,
  filterPlaceholder = "Filter...",
  facetedFilters = [],
  externalFilterValue,
  onGlobalFilterChange,
}: DataTableToolbarProps<TData, TValue>) {
  const currentFilterValue = externalFilterValue ?? table.getState().globalFilter ?? "";
  const isFiltered = table.getState().columnFilters.length > 0 || currentFilterValue !== "";

  // Estado local para el input (para mostrar cambios inmediatos)
  const [inputValue, setInputValue] = useState(currentFilterValue);

  // Sincronizar inputValue con externalFilterValue cuando cambie externamente
  React.useEffect(() => {
    setInputValue(currentFilterValue);
  }, [currentFilterValue]);

  // Función interna para actualizar el filtro (sin debounce)
  const updateFilter = useCallback(
    (value: string) => {
      if (onGlobalFilterChange) {
        onGlobalFilterChange(value);
      } else {
        table.setGlobalFilter(value);
      }
    },
    [onGlobalFilterChange, table]
  );

  // Función con debounce para filtrado externo (server-side)
  const debouncedFilter = useDebouncedCallback((value: string) => {
    updateFilter(value);
  }, 300);

  // Función para manejar cambios en el input
  const handleFilterChange = useCallback(
    (value: string) => {
      setInputValue(value); // Actualizar inmediatamente el input

      if (onGlobalFilterChange) {
        // Si hay filtrado externo, usar debounce
        debouncedFilter(value);
      } else {
        // Si es filtrado local, actualizar inmediatamente
        table.setGlobalFilter(value);
      }
    },
    [onGlobalFilterChange, debouncedFilter, table]
  );

  const handleClearFilters = () => {
    setInputValue(""); // Limpiar input inmediatamente
    table.resetColumnFilters();
    if (onGlobalFilterChange) {
      onGlobalFilterChange("");
    } else {
      table.setGlobalFilter("");
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <div className="flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2">
        <InputGroup className="h-8 w-[150px] lg:w-[250px]">
          <InputGroupAddon align="inline-start">
            <Search className="size-4" />
          </InputGroupAddon>
          <InputGroupInput
            placeholder={filterPlaceholder}
            value={inputValue}
            onChange={(event) => handleFilterChange(event.target.value)}
          />
        </InputGroup>
        <div className="flex flex-wrap items-center gap-2">
          {facetedFilters.map((filter) => {
            const column = table.getColumn(filter.column);
            return (
              column && (
                <DataTableFacetedFilter
                  key={filter.column}
                  column={column}
                  title={filter.title}
                  options={filter.options}
                />
              )
            );
          })}
        </div>
        {isFiltered && (
          <Button variant="ghost" onClick={handleClearFilters} className="h-8 px-2 lg:px-3">
            Limpiar
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center space-x-2">
        {typeof toolbarActions === "function" ? toolbarActions(table) : toolbarActions}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
