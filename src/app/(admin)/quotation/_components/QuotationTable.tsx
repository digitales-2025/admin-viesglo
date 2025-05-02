"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DownloadCloud } from "lucide-react";

import { DataTable } from "@/shared/components/data-table/DataTable";
import { Button } from "@/shared/components/ui/button";
import { debounce } from "@/shared/lib/utils";
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
  // Estado para los filtros
  const [filters, setFilters] = useState<QuotationFilters>({
    page: 1,
    limit: 10,
  });
  console.log("🚀 ~ QuotationTable ~ filters:", filters);

  // Creamos una función de debounce para la búsqueda
  const debouncedSearch = useMemo(() => {
    return debounce((searchTerm: string) => {
      setFilters((prev) => ({ ...prev, page: 1, search: searchTerm }));
    }, 400);
  }, []);

  // Limpiar el debounce al desmontar el componente
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const { data, isLoading, error } = useQuotations(filters);
  const quotations = data?.data || [];
  const meta = data?.meta;

  const columns = useMemo(() => columnsQuotation(), []);

  // Manejador para cambios en la página (memoizado para evitar recrear la función)
  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  // Manejador para cambios en el tamaño de página (memoizado)
  const handlePageSizeChange = useCallback((limit: number) => {
    setFilters((prev) => ({ ...prev, page: 1, limit }));
  }, []);

  // Manejador para cambios en la búsqueda con debounce
  const handleSearchChange = useCallback(
    (search: string) => {
      debouncedSearch(search);
    },
    [debouncedSearch]
  );

  // Manejador para cambios en los filtros (memoizado)
  const handleFilterChange = useCallback((columnId: string, value: any) => {
    setFilters((prev) => {
      // Si el valor es null o un array vacío, eliminamos el filtro
      if (value === null || (Array.isArray(value) && value.length === 0)) {
        const newFilters = { ...prev };
        delete newFilters[columnId as keyof QuotationFilters];
        return { ...newFilters, page: 1 };
      }

      // Si es un array con valores, tomamos el primer valor para filtros simples
      const filterValue = Array.isArray(value) ? (columnId === "isConcrete" ? value[0] === "true" : value[0]) : value;

      console.log("🚀 ~ setFilters ~ filterValue:", filterValue);
      // Actualizamos el filtro
      return {
        ...prev,
        [columnId]: filterValue,
        page: 1, // Resetear a la primera página al cambiar filtros
      };
    });
  }, []);

  // Memoizamos componentes y objetos para evitar renderizados innecesarios
  const actions = useMemo(
    () => (
      <Button variant="outline" size="sm" className="ml-auto h-8 lg:flex">
        <DownloadCloud className="mr-2 h-4 w-4" /> Descargar
      </Button>
    ),
    []
  );

  const serverPagination = useMemo(
    () =>
      meta
        ? {
            currentPage: meta.currentPage,
            totalPages: meta.totalPages,
            pageSize: meta.itemsPerPage,
            totalItems: meta.totalItems,
            onPageChange: handlePageChange,
            onPageSizeChange: handlePageSizeChange,
          }
        : undefined,
    [meta, handlePageChange, handlePageSizeChange]
  );

  const serverFilters = useMemo(
    () => ({
      filters,
      onSearchChange: handleSearchChange,
      onFilterChange: handleFilterChange,
    }),
    [filters, handleSearchChange, handleFilterChange]
  );
  if (error) return <div className="text-center py-4">Error al cargar cotizaciones</div>;

  return (
    <DataTable
      columns={columns}
      data={quotations}
      isLoading={isLoading}
      actions={actions}
      mode="server"
      serverPagination={serverPagination}
      serverFilters={serverFilters}
      serverFilterOptions={SERVER_FILTER_OPTIONS}
    />
  );
}
