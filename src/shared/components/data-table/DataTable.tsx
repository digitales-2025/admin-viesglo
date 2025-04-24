"use client";

import * as React from "react";
import {
  Column,
  ColumnDef,
  ColumnFiltersState,
  ColumnPinningState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";

import { DataTableFacetedFilterOption } from "@/shared/components/data-table/DataTableFacetedFilter";
import { DataTablePagination } from "@/shared/components/data-table/DataTablePagination";
import { DataTableToolbar } from "@/shared/components/data-table/DataTableToolbar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { cn } from "@/shared/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  actions?: React.ReactNode;
  isLoading?: boolean;
  toolBar?: boolean;
  filterOptions?: { label: string; value: string; options: DataTableFacetedFilterOption[] }[];
  pagination?: boolean;
  className?: string;
  onClickRow?: (row: TData) => void;
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: (value: VisibilityState) => void;
  onFilterChange?: (filterKey: string, values: string[]) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  actions,
  isLoading = false,
  toolBar = true,
  pagination = true,
  filterOptions,
  onClickRow,
  className,
  columnVisibility: externalColumnVisibility,
  onColumnVisibilityChange,
  onFilterChange,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [internalColumnVisibility, setInternalColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>({
    left: ["select"],
    // right: ["actions"],
  });

  // Use external column visibility state if provided
  const effectiveColumnVisibility = externalColumnVisibility || internalColumnVisibility;

  // Handle column visibility changes and propagate to external handler if provided
  const handleColumnVisibilityChange = React.useCallback(
    (updaterOrValue: VisibilityState | ((prev: VisibilityState) => VisibilityState)) => {
      if (onColumnVisibilityChange) {
        // If it's a function updater, execute it with the current visibility state
        const newValue =
          typeof updaterOrValue === "function"
            ? updaterOrValue(externalColumnVisibility || internalColumnVisibility)
            : updaterOrValue;

        onColumnVisibilityChange(newValue);
      } else {
        setInternalColumnVisibility(updaterOrValue);
      }
    },
    [onColumnVisibilityChange, externalColumnVisibility, internalColumnVisibility]
  );

  // Handle column filter changes and propagate to external handler if provided
  const handleColumnFiltersChange = React.useCallback(
    (updaterOrValue: ColumnFiltersState | ((prev: ColumnFiltersState) => ColumnFiltersState)) => {
      // If it's a function updater, execute it with current filters
      const newFilters = typeof updaterOrValue === "function" ? updaterOrValue(columnFilters) : updaterOrValue;

      setColumnFilters(newFilters);

      // If external handler is provided, notify about filter changes
      if (onFilterChange) {
        // Process each filter and call the external handler
        newFilters.forEach((filter) => {
          const { id, value } = filter;
          if (Array.isArray(value)) {
            onFilterChange(id, value);
          }
        });
      }
    },
    [onFilterChange, columnFilters]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility: effectiveColumnVisibility,
      rowSelection,
      columnFilters,
      columnPinning,
    },
    manualPagination: !pagination,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: handleColumnFiltersChange,
    onColumnVisibilityChange: handleColumnVisibilityChange,
    onColumnPinningChange: setColumnPinning,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  const getCommonPinningStyles = (column: Column<TData>): React.CSSProperties => {
    const isPinned = column.getIsPinned();
    return {
      left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
      right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
      position: isPinned ? "sticky" : "relative",
      width: column.getSize(),
      zIndex: isPinned ? 1 : 0,
    };
  };

  return (
    <div className="space-y-4">
      {toolBar && (
        <DataTableToolbar
          table={table}
          actions={actions}
          filterOptions={filterOptions}
          onFilterChange={onFilterChange}
        />
      )}
      <div className={cn("rounded-md border", className)}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const { column } = header;
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan} style={{ ...getCommonPinningStyles(column) }}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin h-6 w-6 border-2 border-gray-500 rounded-full border-t-transparent"></div>
                    <span className="ml-2 text-slate-500">Cargando datos...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={onClickRow ? () => onClickRow(row.original) : undefined}
                >
                  {row.getVisibleCells().map((cell) => {
                    const { column } = cell;
                    return (
                      <TableCell key={cell.id} style={{ ...getCommonPinningStyles(column) }}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-slate-300">
                  No hay datos disponibles.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {pagination && <DataTablePagination table={table} />}
    </div>
  );
}
