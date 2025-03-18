import { Table } from "@tanstack/react-table";
//import { priorities, statuses } from "../data/data";
//import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { X } from "lucide-react";

import { DataTableViewOptions } from "@/shared/components/data-table/DataTableViewOptions";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { DataTableFacetedFilter } from "./DataTableFacetedFilter";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  placeholder?: string;
  searchColumn?: string;
  filterOptions?: { label: string; value: string }[];
  actions?: React.ReactNode;
}

export function DataTableToolbar<TData>({
  table,
  placeholder = "Buscar",
  searchColumn,
  filterOptions,
  actions,
}: DataTableToolbarProps<TData>) {
  const isFiltered = searchColumn ? Boolean(table.getState().globalFilter) : table.getState().columnFilters.length > 0;

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
              : (event) => table.setGlobalFilter(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {filterOptions && (
          <div className="flex gap-x-2">
            {filterOptions.map((f) => (
              <DataTableFacetedFilter key={f.value} column={table.getColumn(f.value)} title={f.label} options={[]} />
            ))}
          </div>
        )}
        {isFiltered && (
          <Button variant="ghost" onClick={() => table.resetColumnFilters()} className="h-8 px-2 lg:px-3">
            Limpiar
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex gap-x-2">
        {actions && actions}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
