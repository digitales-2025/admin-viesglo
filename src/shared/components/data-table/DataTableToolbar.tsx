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
  serverFilterOptions?: { label: string; value: string; options: DataTableFacetedFilterOption[] }[];
  onServerFilterChange?: (columnId: string, value: any) => void;
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
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0 || Boolean(table.getState().globalFilter);
  const useServerFilters = hasServerPagination && onServerSearchChange;

  // Function to handle clearing all filters and notify external handlers
  const handleClearFilters = () => {
    // Limpiar filtros de la tabla si no estamos usando filtros del servidor
    if (!useServerFilters) {
      table.resetColumnFilters();
      table.setGlobalFilter("");
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
    }

    // Si tenemos filtros del servidor, limpiarlos
    if (onServerFilterChange && serverFilterOptions) {
      serverFilterOptions.forEach((option) => {
        onServerFilterChange(option.value, null);
      });
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2">
        {/* Búsqueda: muestra el input de búsqueda del servidor o de la tabla según corresponda */}
        {useServerFilters ? (
          <Input
            placeholder={placeholder}
            value={serverSearchValue}
            onChange={(event) => onServerSearchChange(event.target.value)}
            className="h-8 w-[150px] lg:w-[250px]"
          />
        ) : (
          <Input
            placeholder={placeholder}
            value={
              searchColumn
                ? ((table.getColumn(searchColumn)?.getFilterValue() as string) ?? "")
                : ((table.getState().globalFilter as string) ?? "")
            }
            onChange={(event) => {
              if (searchColumn) {
                table.getColumn(searchColumn)?.setFilterValue(event.target.value);
              } else {
                if (table.getState().columnFilters.length > 0) {
                  table.resetColumnFilters();
                }
                table.setGlobalFilter(event.target.value);
              }
            }}
            className="h-8 w-[150px] lg:w-[250px]"
          />
        )}

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
        {useServerFilters && serverFilterOptions && (
          <div className="flex gap-x-2">
            {serverFilterOptions.map((f) => (
              <DataTableFacetedFilter
                key={f.value}
                title={f.label}
                options={f.options}
                onFilterChange={onServerFilterChange ? (values) => onServerFilterChange(f.value, values) : undefined}
              />
            ))}
          </div>
        )}

        {(isFiltered || (useServerFilters && serverSearchValue)) && (
          <Button variant="ghost" onClick={handleClearFilters} className="h-8 px-2 lg:px-3">
            Limpiar
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex gap-x-2">
        {actions && actions}
        {viewOptions && <DataTableViewOptions table={table} />}
      </div>
    </div>
  );
}
