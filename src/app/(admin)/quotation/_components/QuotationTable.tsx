"use client";

import { useMemo, useState } from "react";
import { DownloadCloud } from "lucide-react";

import { DataTable } from "@/shared/components/data-table/DataTable";
import { Button } from "@/shared/components/ui/button";
import { useQuotations } from "../_hooks/useQuotations";
import { QuotationFilters } from "../_types/quotation.types";
import { columnsQuotation } from "./quotation.column";

// Opciones de filtro para las cotizaciones
const SERVER_FILTER_OPTIONS = [
  {
    label: "Servicio",
    value: "service",
    options: [
      { label: "Consultoría", value: "Consultoría" },
      { label: "Capacitación", value: "Capacitación" },
      { label: "Auditoría", value: "Auditoría" },
    ],
  },
  {
    label: "Departamento",
    value: "department",
    options: [
      { label: "Moquegua", value: "Moquegua" },
      { label: "Ica", value: "Ica" },
      { label: "Arequipa", value: "Arequipa" },
      { label: "Cusco", value: "Cusco" },
      { label: "Trujillo", value: "Trujillo" },
    ],
  },
  {
    label: "Estado",
    value: "isConcrete",
    options: [
      { label: "Concretada", value: "true" },
      { label: "No concretada", value: "false" },
    ],
  },
];

export default function QuotationTable() {
  const [filters, setFilters] = useState<QuotationFilters>({
    page: 1,
    limit: 10,
  });

  const { data, isLoading, error } = useQuotations(filters);
  const quotations = data?.data || [];
  const meta = data?.meta;

  const columns = useMemo(() => columnsQuotation(), []);

  // Manejador para cambios en la página
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  // Manejador para cambios en el tamaño de página
  const handlePageSizeChange = (limit: number) => {
    setFilters((prev) => ({ ...prev, page: 1, limit }));
  };

  // Manejador para cambios en la búsqueda
  const handleSearchChange = (search: string) => {
    setFilters((prev) => ({ ...prev, page: 1, search }));
  };

  // Manejador para cambios en los filtros
  const handleFilterChange = (columnId: string, value: any) => {
    setFilters((prev) => {
      // Si el valor es null o un array vacío, eliminamos el filtro
      if (value === null || (Array.isArray(value) && value.length === 0)) {
        const newFilters = { ...prev };
        delete newFilters[columnId as keyof QuotationFilters];
        return { ...newFilters, page: 1 };
      }

      // Si es un array con valores, tomamos el primer valor para filtros simples
      const filterValue = Array.isArray(value) ? (columnId === "isConcrete" ? value[0] === "true" : value[0]) : value;

      // Actualizamos el filtro
      return {
        ...prev,
        [columnId]: filterValue,
        page: 1, // Resetear a la primera página al cambiar filtros
      };
    });
  };

  if (error) return <div className="text-center py-4">Error al cargar cotizaciones</div>;

  return (
    <DataTable
      columns={columns}
      data={quotations}
      isLoading={isLoading}
      actions={
        <Button variant="outline" size="sm" className="ml-auto h-8 lg:flex">
          <DownloadCloud className="mr-2 h-4 w-4" /> Descargar
        </Button>
      }
      // Configuración de paginación del servidor
      serverPagination={
        meta
          ? {
              currentPage: meta.currentPage,
              totalPages: meta.totalPages,
              pageSize: meta.itemsPerPage,
              totalItems: meta.totalItems,
              onPageChange: handlePageChange,
              onPageSizeChange: handlePageSizeChange,
            }
          : undefined
      }
      // Configuración de filtros del servidor
      serverFilters={{
        filters,
        onSearchChange: handleSearchChange,
        onFilterChange: handleFilterChange,
      }}
      // Opciones de filtro específicas para el servidor
      serverFilterOptions={SERVER_FILTER_OPTIONS}
    />
  );
}
