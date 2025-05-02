"use client";

import * as React from "react";
import { Fragment, useEffect } from "react";
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
  OnChangeFn,
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
  viewOptions?: boolean;
  getSubRows?: (row: TData) => TData[] | undefined;
  renderExpandedRow?: (row: TData) => React.ReactNode;
  onClickRow?: (row: TData) => void;

  /**
   * Modo de paginación y filtrado:
   * - "client": Paginación y filtrado en el cliente (por defecto)
   * - "server": Paginación y filtrado en el servidor
   */
  mode?: "client" | "server";

  /**
   * Configuración para paginación en el servidor (solo si mode="server")
   */
  serverPagination?: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };

  /**
   * Configuración para filtrado en el servidor (solo si mode="server")
   */
  serverFilters?: {
    filters: Record<string, any>;
    onSearchChange: (search: string) => void;
    onFilterChange: (columnId: string, value: any) => void;
  };

  /**
   * Opciones de filtro para el servidor (solo si mode="server")
   */
  serverFilterOptions?: {
    label: string;
    value: string;
    options: DataTableFacetedFilterOption[];
  }[];
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
  viewOptions = true,
  getSubRows,
  renderExpandedRow,
  mode = "client",
  serverPagination,
  serverFilters,
  serverFilterOptions,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>({
    left: ["select"],
  });

  // Estado para manejar el valor de búsqueda global del servidor
  const [serverSearchValue, setServerSearchValue] = React.useState("");

  // Validar configuración consistente
  const isServerMode = mode === "server";
  const hasServerConfig = !!serverPagination && !!serverFilters;

  // Verificar configuración inconsistente y mostrar advertencia en desarrollo
  React.useEffect(() => {
    if (isServerMode && !hasServerConfig) {
      console.warn(
        "DataTable: modo servidor especificado pero falta configuración. " +
          "Proporcione serverPagination y serverFilters cuando use mode='server'."
      );
    }

    if (!isServerMode && hasServerConfig) {
      console.warn(
        "DataTable: configuración de servidor proporcionada pero modo='client'. " +
          "Cambie a mode='server' o elimine serverPagination y serverFilters."
      );
    }
  }, [isServerMode, hasServerConfig]);

  // Manejador personalizado para los filtros de columna
  const handleColumnFiltersChange: OnChangeFn<ColumnFiltersState> = (updaterOrValue) => {
    // En modo servidor, deberíamos manejar los filtros de manera diferente
    setColumnFilters(updaterOrValue);
  };

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      columnPinning,
      globalFilter: isServerMode ? serverSearchValue : undefined,
    },
    manualPagination: isServerMode, // Activar paginación manual en modo servidor
    manualFiltering: isServerMode, // Activar filtrado manual en modo servidor
    enableRowSelection: true,
    getSubRows,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: handleColumnFiltersChange,
    onColumnVisibilityChange: setColumnVisibility,
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

  // Resetear selección cuando cambian los datos
  useEffect(() => {
    if (data) {
      table.setRowSelection({});
      table.resetExpanded();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // Manejador para cambios en la búsqueda del servidor
  const handleServerSearchChange = (value: string) => {
    setServerSearchValue(value);

    if (isServerMode && serverFilters) {
      serverFilters.onSearchChange(value);
    }
  };

  // Manejador para cambios en los filtros del servidor
  const handleServerFilterChange = (columnId: string, value: any) => {
    if (isServerMode && serverFilters) {
      serverFilters.onFilterChange(columnId, value);
    }
  };

  return (
    <div className="space-y-4">
      {toolBar && (
        <DataTableToolbar<TData>
          table={table}
          actions={actions}
          filterOptions={isServerMode ? undefined : filterOptions}
          viewOptions={viewOptions}
          hasServerPagination={isServerMode}
          serverSearchValue={serverSearchValue}
          onServerSearchChange={isServerMode ? handleServerSearchChange : undefined}
          serverFilterOptions={isServerMode ? serverFilterOptions : undefined}
          onServerFilterChange={isServerMode ? handleServerFilterChange : undefined}
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
                <Fragment key={row.id}>
                  <TableRow
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
                  {row.getIsExpanded() && (
                    <TableRow key={row.id}>
                      <TableCell colSpan={columns.length}>
                        {renderExpandedRow
                          ? renderExpandedRow(row.original) // Renderizado dinámico
                          : "No hay datos disponibles"}
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
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
      {pagination && (
        <DataTablePagination table={table} serverPagination={isServerMode ? serverPagination : undefined} />
      )}
    </div>
  );
}
