"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import AlertMessage from "@/shared/components/alerts/Alert";
import { DataTable } from "@/shared/components/data-table/DataTable";
import { DatePickerWithRange } from "@/shared/components/ui/date-range-picker";
import { debounce } from "@/shared/lib/utils";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { useCertificatesStore } from "../_hooks/useCertificateFilterStore";
import { useCertificatesPaginated } from "../_hooks/useCertificates";
import { columnsCertificates } from "./certificates.column";

export default function CertificatesDataTable() {
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });

  const { filters: storeFilters, setFilters, updateFilter } = useCertificatesStore();
  const filters = useMemo(
    () => ({
      ...storeFilters,
      ...pagination,
    }),
    [storeFilters, pagination]
  );

  const { open } = useDialogStore();

  const debouncedSearch = useMemo(() => {
    return debounce((searchTem: string) => {
      updateFilter("search", searchTem);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 400);
  }, [updateFilter]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  });

  const { data, isLoading, error } = useCertificatesPaginated(filters);

  const certificates = data?.data || [];
  const meta = data?.meta;

  const columns = useMemo(() => columnsCertificates(), []);

  // Manejador para cambios en la página
  const handlePageChange = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  // Manejador para cambios en el tamaño de página
  const handlePageSizeChange = useCallback((limit: number) => {
    setPagination({ page: 1, limit });
  }, []);

  // Manejador para cambios en la búsqueda con debounce
  const handleSearchChange = useCallback(
    (search: string) => {
      debouncedSearch(search);
    },
    [debouncedSearch]
  );

  // Manejador para cambios en los filtros
  const handleFilterChange = useCallback(
    (columnId: string, value: any) => {
      // Si el valor es null o un array vacío, eliminamos el filtro
      if (value === null || (Array.isArray(value) && value.length === 0)) {
        // Creamos una copia de los filtros actuales
        const newFilters = { ...storeFilters };
        // Eliminamos la propiedad correspondiente
        delete newFilters[columnId as keyof typeof newFilters];
        // Actualizamos el store con los nuevos filtros
        setFilters(newFilters);
        // Reseteamos a página 1
        setPagination((prev) => ({ ...prev, page: 1 }));
        return;
      }

      // Para isConcrete (boolean), necesitamos convertir correctamente el string a booleano
      if (columnId === "isConcrete") {
        // Si es un array, tomamos el primer valor, sino usamos el valor directamente
        const stringValue = Array.isArray(value) ? value[0] : value;
        // Convertir explícitamente el string "true"/"false" a booleano
        const boolValue = stringValue === "true";
        updateFilter(columnId, boolValue);
        setPagination((prev) => ({ ...prev, page: 1 }));
        return;
      }

      // Para otros filtros, usamos el primer valor si es un array
      const filterValue = Array.isArray(value) ? value[0] : value;
      updateFilter(columnId, filterValue);
      setPagination((prev) => ({ ...prev, page: 1 }));
    },
    [storeFilters, setFilters, updateFilter]
  );

  // Memoizamos componentes y objetos para evitar renderizados innecesarios
  const actions = useMemo(
    () => (
      <>
        <DatePickerWithRange
          size="sm"
          initialValue={{
            from: storeFilters.from ? new Date(storeFilters.from) : undefined,
            to: storeFilters.to ? new Date(storeFilters.to) : undefined,
          }}
          onConfirm={(value) => {
            if (value?.from) updateFilter("from", value.from);
            if (value?.to) updateFilter("to", value.to);
            if (!value?.from && !value?.to) {
              const newFilters = { ...storeFilters };
              delete newFilters.from;
              delete newFilters.to;
              setFilters(newFilters);
            }
            setPagination((prev) => ({ ...prev, page: 1 }));
          }}
          onClear={() => {
            const newFilters = { ...storeFilters };
            delete newFilters.from;
            delete newFilters.to;
            setFilters(newFilters);
            setPagination((prev) => ({ ...prev, page: 1 }));
          }}
        />
      </>
    ),
    [storeFilters, updateFilter, setFilters]
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

  if (error)
    return <AlertMessage variant="destructive" title="Certificados" description="Error al cargar los certificados" />;

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={certificates}
        isLoading={isLoading}
        actions={actions}
        mode="server"
        serverPagination={serverPagination as any}
        serverFilters={serverFilters}
        onClickRow={(row) => {
          open("certificates", "view", row);
        }}
      />
    </div>
  );
}
