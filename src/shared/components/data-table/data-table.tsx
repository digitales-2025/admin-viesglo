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
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../ui/resizable";
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
  // Props para funcionalidad expandible
  expandable?: boolean;
  renderDetailsPanel?: (item: TData) => React.ReactNode;
  getItemId?: (item: TData) => string;
  getItemTitle?: (item: TData) => string;
  // Configuración del panel resizable
  defaultPanelSize?: number;
  minPanelSize?: number;
  maxPanelSize?: number;
  // Configuración de la tabla cuando está expandida
  defaultTableSize?: number;
  minTableSize?: number;
  maxTableSize?: number;
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
  // Props para funcionalidad expandible
  expandable = false,
  renderDetailsPanel,
  getItemId,
  getItemTitle,
  defaultPanelSize = 40,
  minPanelSize = 20,
  maxPanelSize = 60,
  defaultTableSize = 60,
  minTableSize = 40,
  maxTableSize = 80,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(
    (initialColumnVisibility as VisibilityState) ?? {}
  );
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState(externalGlobalFilter || "");
  const [sorting, setSorting] = React.useState<SortingState>([]);

  // Estado para funcionalidad expandible
  const [selectedItem, setSelectedItem] = React.useState<TData | null>(null);

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

  // Handlers para funcionalidad expandible
  const handleRowClick = React.useCallback(
    (item: TData) => {
      if (expandable && renderDetailsPanel) {
        setSelectedItem(item);
      }
      if (onClickRow) {
        onClickRow(item);
      }
    },
    [expandable, renderDetailsPanel, onClickRow]
  );

  const handleClosePanel = React.useCallback(() => {
    setSelectedItem(null);
  }, []);

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

  // Componente de tabla base
  const TableComponent = () => (
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
                    onClick={() => handleRowClick(row.original)}
                    className={cn(
                      row.getIsExpanded() && "bg-muted",
                      expandable && "cursor-pointer hover:bg-muted/50",
                      selectedItem &&
                        getItemId &&
                        getItemId(selectedItem) === getItemId(row.original) &&
                        "bg-muted/30 border-l-2 border-l-primary"
                    )}
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

  // Si no es expandible o no hay item seleccionado, mostrar solo la tabla
  if (!expandable || !selectedItem || !renderDetailsPanel || !getItemTitle) {
    return <TableComponent />;
  }

  // Si es expandible y hay item seleccionado, mostrar layout resizable
  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      {/* Panel de tabla */}
      <ResizablePanel defaultSize={defaultTableSize} minSize={minTableSize} maxSize={maxTableSize} className="pr-2">
        <TableComponent />
      </ResizablePanel>

      {/* Panel de detalles */}
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={defaultPanelSize} minSize={minPanelSize} maxSize={maxPanelSize}>
        <div className="h-full flex flex-col bg-background border border-l-0">
          {/* Header con botón cerrar */}
          <div className="flex items-center justify-between p-4 border-b bg-muted/30">
            <h3 className="text-lg font-semibold truncate">{getItemTitle(selectedItem)}</h3>
            <Button variant="ghost" size="sm" onClick={handleClosePanel} className="h-8 w-8 p-0 flex-shrink-0">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Contenido con scroll */}
          <div className="flex-1 overflow-y-auto p-4">{renderDetailsPanel(selectedItem)}</div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
