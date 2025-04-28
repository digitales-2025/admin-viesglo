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
}

export function DataTableToolbar<TData>({
  table,
  placeholder = "Buscar",
  searchColumn,
  filterOptions,
  actions,
  onFilterChange,
  viewOptions = true,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0 || Boolean(table.getState().globalFilter);

  // Function to handle clearing all filters and notify external handlers
  const handleClearFilters = () => {
    table.resetColumnFilters();
    table.setGlobalFilter("");

    // Also notify external handlers that filters have been cleared
    if (onFilterChange && filterOptions) {
      filterOptions.forEach((option) => {
        onFilterChange(option.value, []);
      });
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2">
        <Input
          placeholder={placeholder}
          value={
            searchColumn
              ? ((table.getColumn(searchColumn)?.getFilterValue() as string) ?? "")
              : ((table.getState().globalFilter as string) ?? "")
          }
          onChange={
            searchColumn
              ? (event) => table.getColumn(searchColumn)?.setFilterValue(event.target.value)
              : (event) => {
                  if (table.getState().columnFilters.length > 0) {
                    table.resetColumnFilters();
                  }
                  table.setGlobalFilter(event.target.value);
                }
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {filterOptions && (
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
        {isFiltered && (
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
