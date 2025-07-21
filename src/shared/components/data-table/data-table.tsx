import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  Row,
  SortingState,
  Table as TableInstance,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";

import { cn } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";
import { EmptyData } from "./empty-data";
import { FacetedFilter } from "./facetedFilters";
import { ServerPaginationTanstackTableConfig } from "./types/CustomPagination";

// Filtro global genérico TIPADO
function globalFilterFn<TData>(row: Row<TData>, columnId: string, value: string): boolean {
  // Convierte todo el objeto a string (incluye anidados)
  const rowString = JSON.stringify(row.original).toLowerCase();
  return rowString.includes(value.toLowerCase());
}

type ColumnVisility<T> = Partial<Record<keyof T, boolean>>;

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  toolbarActions?: React.ReactNode | ((table: TableInstance<TData>) => React.ReactNode);
  filterPlaceholder?: string;
  facetedFilters?: FacetedFilter<TValue>[];
  // Nuevas props para paginación del servidor
  serverPagination?: ServerPaginationTanstackTableConfig;
  getRowCanExpand?: (row: Row<TData>) => boolean;
  getSubRows?: ((originalRow: TData, index: number) => TData[] | undefined) | undefined;
  renderExpandedRow?: (row: TData) => React.ReactNode;
  onClickRow?: (row: TData) => void;
  initialColumnVisibility?: ColumnVisility<TData>;
  // Props para manejar filtros externos
  externalGlobalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
  updatedColumnVisibilityConfig?: ColumnVisility<TData>;
  // Prop para manejar loading interno
  isLoading?: boolean;
  loadingRowsCount?: number;
  // Prop para mostrar valor en input sin filtrar (server-side filtering)
  externalFilterValue?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  toolbarActions,
  filterPlaceholder,
  facetedFilters,
  serverPagination,
  getRowCanExpand,
  getSubRows,
  renderExpandedRow,
  onClickRow,
  initialColumnVisibility,
  externalGlobalFilter,
  onGlobalFilterChange,
  updatedColumnVisibilityConfig,
  isLoading = false,
  loadingRowsCount = 5,
  externalFilterValue,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(
    (initialColumnVisibility as VisibilityState) ?? {}
  );
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState(externalGlobalFilter || "");
  const [sorting, setSorting] = React.useState<SortingState>([]);

  // Sincronizar filtro global externo con estado interno
  React.useEffect(() => {
    if (externalGlobalFilter !== undefined) {
      setGlobalFilter(externalGlobalFilter);
    }
  }, [externalGlobalFilter]);

  // Manejar cambios en el filtro global
  const handleGlobalFilterChange = React.useCallback(
    (value: string) => {
      setGlobalFilter(value);
      if (onGlobalFilterChange) {
        onGlobalFilterChange(value);
      }
    },
    [onGlobalFilterChange]
  );

  // Estado de paginación local o del servidor
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: serverPagination?.pageIndex ?? 0,
    pageSize: serverPagination?.pageSize ?? 10,
  });

  // Manejar cambios de paginación
  const handlePaginationChange = React.useCallback(
    (updaterOrValue: PaginationState | ((old: PaginationState) => PaginationState)) => {
      const newPagination = typeof updaterOrValue === "function" ? updaterOrValue(pagination) : updaterOrValue;

      setPagination(newPagination);
      if (serverPagination?.onPaginationChange) {
        serverPagination.onPaginationChange(newPagination.pageIndex, newPagination.pageSize);
      }
    },
    [pagination, serverPagination]
  );

  const table = useReactTable({
    data,
    columns,
    getRowCanExpand,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
      pagination,
    },
    enableRowSelection: true,
    getSubRows,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: handleGlobalFilterChange,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: handlePaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: serverPagination ? undefined : getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    globalFilterFn,
    // Aplicar el filtro global a todas las columnas
    filterFns: {
      global: globalFilterFn,
    },
    // Configuración para paginación del servidor
    pageCount: serverPagination?.pageCount ?? -1,
    manualPagination: !!serverPagination,
  });

  React.useEffect(() => {
    if (updatedColumnVisibilityConfig) {
      table.setColumnVisibility((prev) => {
        // Mantenemos la visibilidad de las columnas que ya están visibles
        const updatedVisibility = { ...prev, ...updatedColumnVisibilityConfig };
        return updatedVisibility;
      });
    }
  }, [updatedColumnVisibilityConfig, table]);

  // Función para renderizar skeleton rows mientras carga
  const renderSkeletonRows = () => {
    return Array.from({ length: loadingRowsCount }).map((_, index) => (
      <TableRow key={`skeleton-${index}`}>
        {columns.map((_, cellIndex) => (
          <TableCell key={`skeleton-cell-${index}-${cellIndex}`}>
            <Skeleton className="h-4 w-full" />
          </TableCell>
        ))}
      </TableRow>
    ));
  };

  return (
    <div className="space-y-4">
      <DataTableToolbar
        table={table}
        toolbarActions={toolbarActions}
        filterPlaceholder={filterPlaceholder}
        facetedFilters={facetedFilters}
        externalFilterValue={externalFilterValue}
        onGlobalFilterChange={onGlobalFilterChange}
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              renderSkeletonRows()
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() => onClickRow?.(row.original)}
                    className={cn(row.getIsExpanded() && "bg-muted", "cursor-pointer")}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
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
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <EmptyData />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} serverPagination={serverPagination} />
    </div>
  );
}
