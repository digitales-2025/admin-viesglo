"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Circle, Locate } from "lucide-react";

import { cn } from "@/lib/utils";
import { DataTable } from "@/shared/components/data-table/DataTable";
import { Loading } from "@/shared/components/loading";
import { DatePickerWithRange } from "@/shared/components/ui/date-range-picker";
import { useUbigeo } from "@/shared/hooks/useUbigeo";
import { debounce } from "@/shared/lib/utils";
import { useQuotations } from "../_hooks/useQuotations";
import { useQuotationsStore } from "../_hooks/useQuotationsStore";
import { CustomFilterGroup, CustomFilterOption } from "../../../../shared/components/data-table/custom-types";
import { useQuotationGroups } from "../../quotation-groups/_hooks/useQuotationGroup";
import { DownloadExcelButton } from "./DownloadExcelButton";
import { columnsQuotation } from "./quotation.column";

export default function QuotationTable() {
  const { data: quotationGroups, isLoading: isLoadingQuotationGroups } = useQuotationGroups();
  const { departmentOptions } = useUbigeo();

  // Obtenemos los filtros del store
  const { filters: storeFilters, setFilters, updateFilter } = useQuotationsStore();
  console.log("🚀 ~ QuotationTable ~ storeFilters:", storeFilters);

  // Mantenemos los filtros de paginación localmente
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });

  // Combinamos los filtros del store con la paginación local
  const filters = useMemo(
    () => ({
      ...storeFilters,
      ...pagination,
    }),
    [storeFilters, pagination]
  );

  // Estado inicial para el filtro de 'Estado' que siempre estará disponible
  const baseFilterOptions = useMemo(
    () => [
      {
        label: "Estado",
        value: "isConcrete",
        multiSelect: false,
        options: [
          { label: "Concretada", value: "true", icon: Check },
          { label: "No concretada", value: "false", icon: Circle },
        ],
      },
    ],
    []
  );

  // Usamos useMemo para construir las opciones de filtro de manera declarativa
  const quotationGroupOptions: CustomFilterGroup[] = useMemo(() => {
    // Empezamos con las opciones base
    const options = [...baseFilterOptions] as CustomFilterGroup[];

    // Añadir grupos de cotización si están disponibles
    if (quotationGroups && quotationGroups.length > 0) {
      options.push({
        label: "Grupo de cotizaciones",
        value: "code",
        multiSelect: true,
        options: quotationGroups.map(
          (quotationGroup): CustomFilterOption => ({
            label: (
              <div
                className={cn(
                  "inline-flex justify-center items-center space-x-1",
                  quotationGroup.isActive ? "" : "text-rose-600 dark:text-rose-800 line-through opacity-50"
                )}
              >
                <span className="text-muted-foreground text-xs font-semibold">( {quotationGroup.code} )</span>
                <span> {quotationGroup.name}</span>
              </div>
            ),
            value: quotationGroup.id,
          })
        ),
      });
    }

    // Añadir departamentos si están disponibles
    if (departmentOptions && departmentOptions.length > 0) {
      options.push({
        label: "Departamento",
        value: "department",
        multiSelect: true,
        options: departmentOptions.map(
          (departament): CustomFilterOption => ({
            label: departament.label,
            value: departament.value,
            icon: Locate,
          })
        ),
      });
    }

    return options;
  }, [baseFilterOptions, quotationGroups, departmentOptions]);

  // Creamos una función de debounce para la búsqueda
  const debouncedSearch = useMemo(() => {
    return debounce((searchTerm: string) => {
      // Al cambiar la búsqueda, guardamos en el store y reseteamos a página 1
      updateFilter("search", searchTerm);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 400);
  }, [updateFilter]);

  // Limpiar el debounce al desmontar el componente
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Obtenemos los datos de la API usando los filtros
  const { data, isLoading, error } = useQuotations(filters);

  const quotations = data?.data || [];
  const meta = data?.meta;

  const columns = useMemo(() => columnsQuotation(), []);

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

      // Para service y department, permitimos múltiples valores (array)
      if (columnId === "code" || columnId === "department") {
        updateFilter(columnId, Array.isArray(value) ? value : [value]);
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
        <DownloadExcelButton filters={filters} />
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
    [storeFilters, updateFilter, setFilters, filters]
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
    <>
      {isLoadingQuotationGroups ? (
        <Loading text="Cargando grupos de cotizacion" />
      ) : (
        <DataTable
          columns={columns}
          data={quotations}
          isLoading={isLoading}
          actions={actions}
          mode="server"
          serverPagination={serverPagination}
          serverFilters={serverFilters}
          serverFilterOptions={quotationGroupOptions as any}
          serverFilterLoading={isLoadingQuotationGroups}
        />
      )}
    </>
  );
}
