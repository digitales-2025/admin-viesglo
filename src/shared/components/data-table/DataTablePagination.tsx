import { Table } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  // Propiedades para paginación del servidor (opcional)
  serverPagination?: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };
}

export function DataTablePagination<TData>({ table, serverPagination }: DataTablePaginationProps<TData>) {
  // Si se proporciona serverPagination, usamos la paginación del servidor
  // De lo contrario, usamos la paginación interna de la tabla
  const isServerPagination = !!serverPagination;

  // Valores para la paginación interna
  const currentPageInternal = table.getState().pagination.pageIndex + 1;
  const totalPagesInternal = table.getPageCount();
  const pageSizeInternal = table.getState().pagination.pageSize;
  const selectedRowsCount = table.getFilteredSelectedRowModel().rows.length;
  const totalRowsInternal = table.getFilteredRowModel().rows.length;

  // Valores para la paginación del servidor (si está disponible)
  const currentPage = isServerPagination ? serverPagination.currentPage : currentPageInternal;
  const totalPages = isServerPagination ? serverPagination.totalPages : totalPagesInternal;
  const pageSize = isServerPagination ? serverPagination.pageSize : pageSizeInternal;
  const totalItems = isServerPagination ? serverPagination.totalItems : totalRowsInternal;

  // Funciones de control para paginación
  const canPreviousPage = isServerPagination ? currentPage > 1 : table.getCanPreviousPage();

  const canNextPage = isServerPagination ? currentPage < totalPages : table.getCanNextPage();

  const handlePageSizeChange = (size: number) => {
    if (isServerPagination) {
      serverPagination.onPageSizeChange(size);
    } else {
      table.setPageSize(size);
    }
  };

  const goToFirstPage = () => {
    if (isServerPagination) {
      serverPagination.onPageChange(1);
    } else {
      table.setPageIndex(0);
    }
  };

  const goToPreviousPage = () => {
    if (isServerPagination) {
      serverPagination.onPageChange(currentPage - 1);
    } else {
      table.previousPage();
    }
  };

  const goToNextPage = () => {
    if (isServerPagination) {
      serverPagination.onPageChange(currentPage + 1);
    } else {
      table.nextPage();
    }
  };

  const goToLastPage = () => {
    if (isServerPagination) {
      serverPagination.onPageChange(totalPages);
    } else {
      table.setPageIndex(totalPages - 1);
    }
  };

  return (
    <div className="flex items-center justify-between overflow-clip px-2" style={{ overflowClipMargin: 1 }}>
      <div className="hidden flex-1 text-sm text-muted-foreground sm:block">
        {selectedRowsCount} de {totalItems} fila(s) seleccionada(s).
      </div>
      <div className="flex items-center sm:space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="hidden text-sm font-medium sm:block">Filas por página</p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              handlePageSizeChange(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Página {currentPage} de {totalPages || 1}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={goToFirstPage}
            disabled={!canPreviousPage}
          >
            <span className="sr-only">Ir a la primera página</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="h-8 w-8 p-0" onClick={goToPreviousPage} disabled={!canPreviousPage}>
            <span className="sr-only">Ir a la página anterior</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="h-8 w-8 p-0" onClick={goToNextPage} disabled={!canNextPage}>
            <span className="sr-only">Ir a la página siguiente</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={goToLastPage}
            disabled={!canNextPage}
          >
            <span className="sr-only">Ir a la última página</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
