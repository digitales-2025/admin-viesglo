import { useEffect, useState } from "react";
import { Table } from "@tanstack/react-table";
import { X } from "lucide-react";

import { DataTableViewOptions } from "@/shared/components/data-table/DataTableViewOptions";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { DataTableFacetedFilter, DataTableFacetedFilterOption } from "./DataTableFacetedFilter";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  placeholder?: string;
  searchColumn?: string;
  filterOptions?: { label: string; value: string; options: DataTableFacetedFilterOption[] }[];
  actions?: React.ReactNode;
  onFilterChange?: (filterKey: string, values: string[]) => void;
  viewOptions?: boolean;

  // Propiedades para la paginación del servidor
  hasServerPagination?: boolean;

  // Propiedades para búsqueda y filtros del servidor
  serverSearchValue?: string;
  onServerSearchChange?: (search: string) => void;
  serverFilterOptions?: {
    label: string;
    value: string;
    options: DataTableFacetedFilterOption[];
    multiSelect?: boolean;
  }[];
  onServerFilterChange?: (columnId: string, value: any) => void;
  serverFilterLoading?: boolean;
}

export function DataTableToolbar<TData>({
  table,
  placeholder = "Buscar",
  searchColumn,
  filterOptions,
  actions,
  onFilterChange,
  viewOptions = true,

  // Propiedades del servidor
  hasServerPagination,
  serverSearchValue = "",
  onServerSearchChange,
  serverFilterOptions,
  onServerFilterChange,
  serverFilterLoading,
}: DataTableToolbarProps<TData>) {
  // Estado local para manejar el valor del input
  const [inputValue, setInputValue] = useState("");

  const isFiltered = table.getState().columnFilters.length > 0 || Boolean(table.getState().globalFilter);
  const useServerFilters = hasServerPagination && onServerSearchChange;

  // Actualizar el inputValue cuando cambia globalFilter o searchColumn
  useEffect(() => {
    if (!useServerFilters) {
      if (searchColumn) {
        const columnValue = table.getColumn(searchColumn)?.getFilterValue() as string;
        setInputValue(columnValue || "");
      } else {
        const globalValue = table.getState().globalFilter as string;
        setInputValue(globalValue || "");
      }
    }
  }, [table.getState().globalFilter, table.getState().columnFilters, searchColumn, useServerFilters]);

  // Actualizar inputValue cuando cambia serverSearchValue
  useEffect(() => {
    if (useServerFilters) {
      setInputValue(serverSearchValue || "");
    }
  }, [serverSearchValue, useServerFilters]);

  // Function to handle clearing all filters and notify external handlers
  const handleClearFilters = () => {
    // Limpiar filtros de la tabla si no estamos usando filtros del servidor
    if (!useServerFilters) {
      table.resetColumnFilters();
      table.setGlobalFilter("");
      setInputValue("");
    }

    // Notificar a los manejadores externos que los filtros han sido limpiados
    if (onFilterChange && filterOptions) {
      filterOptions.forEach((option) => {
        onFilterChange(option.value, []);
      });
    }

    // Si tenemos búsqueda del servidor, limpiarla
    if (onServerSearchChange) {
      onServerSearchChange("");
      setInputValue("");
    }

    // Si tenemos filtros del servidor, limpiarlos
    if (onServerFilterChange && serverFilterOptions) {
      serverFilterOptions.forEach((option) => {
        onServerFilterChange(option.value, null);
      });
    }
  };
  const showClearButton = isFiltered || (Boolean(useServerFilters) && serverSearchValue !== "");

  // Manejador para cambios en el input
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    // Siempre actualizamos el estado local del input
    setInputValue(value);

    // Aplicamos el filtro según el modo
    if (useServerFilters && onServerSearchChange) {
      onServerSearchChange(value);
    } else if (searchColumn) {
      const column = table.getColumn(searchColumn);
      if (column) {
        column.setFilterValue(value);
      }
    } else {
      // Para filtrado global, usamos la API de la tabla directamente
      table.setGlobalFilter(value);
    }
  };

  return (
    <div className="flex lg:items-center flex-wrap lg:justify-between lg:flex-row flex-col gap-y-2">
      <div className="flex flex-1 flex-col items-start gap-y-2 lg:flex-row lg:items-center lg:space-x-2">
        {/* Input de búsqueda unificado */}
        <Input
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          className="h-8 w-full lg:w-[250px]"
        />

        {/* Filtros de la tabla */}
        {!useServerFilters && filterOptions && (
          <div className="flex gap-x-2">
            {filterOptions.map((f) => (
              <DataTableFacetedFilter
                key={f.value}
                column={table.getColumn(f.value)}
                title={f.label}
                options={f.options}
                onFilterChange={onFilterChange ? (values) => onFilterChange(f.value, values) : undefined}
              />
            ))}
          </div>
        )}

        {/* Filtros del servidor */}
        {useServerFilters && !serverFilterLoading && serverFilterOptions && (
          <div className="flex gap-x-2">
            {serverFilterOptions.map((f) => (
              <DataTableFacetedFilter
                key={f.value}
                title={f.label}
                options={f.options}
                multiSelect={f.multiSelect !== undefined ? f.multiSelect : true}
                onFilterChange={onServerFilterChange ? (values) => onServerFilterChange(f.value, values) : undefined}
              />
            ))}
          </div>
        )}

        {showClearButton && (
          <Button variant="ghost" onClick={handleClearFilters} className="h-8 px-2 lg:px-3">
            Limpiar
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex gap-x-2  w-fit flex-1 justify-end items-center">
        <div className="flex gap-x-2">
          {actions && actions}
          {viewOptions && <DataTableViewOptions table={table} />}
        </div>
      </div>
    </div>
  );
}
