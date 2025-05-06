"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Circle, DownloadCloud, Locate } from "lucide-react";

import { cn } from "@/lib/utils";
import { DataTable } from "@/shared/components/data-table/DataTable";
import { Loading } from "@/shared/components/loading";
import { Button } from "@/shared/components/ui/button";
import { DatePickerWithRange } from "@/shared/components/ui/date-range-picker";
import { useUbigeo } from "@/shared/hooks/useUbigeo";
import { debounce } from "@/shared/lib/utils";
import { useQuotations } from "../_hooks/useQuotations";
import { QuotationFilters } from "../_types/quotation.types";
import { CustomFilterGroup, CustomFilterOption } from "../../../../shared/components/data-table/custom-types";
import { useQuotationGroups } from "../../quotation-groups/_hooks/useQuotationGroup";
import { columnsQuotation } from "./quotation.column";

export default function QuotationTable() {
  const { data: quotationGroups, isLoading: isLoadingQuotationGroups } = useQuotationGroups();
  const { departmentOptions } = useUbigeo();

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

  const [filters, setFilters] = useState<QuotationFilters>({
    page: 1,
    limit: 10,
  });
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

      // Para isConcrete (boolean), necesitamos convertir correctamente el string a booleano
      if (columnId === "isConcrete") {
        // Si es un array, tomamos el primer valor, sino usamos el valor directamente
        const stringValue = Array.isArray(value) ? value[0] : value;
        // Convertir explícitamente el string "true"/"false" a booleano
        const boolValue = stringValue === "true";
        return {
          ...prev,
          [columnId]: boolValue,
          page: 1,
        };
      }

      // Para service y department, permitimos múltiples valores (array)
      if (columnId === "code" || columnId === "department") {
        return {
          ...prev,
          [columnId]: Array.isArray(value) ? value : [value],
          page: 1,
        };
      }

      // Para otros filtros, usamos el primer valor si es un array
      const filterValue = Array.isArray(value) ? value[0] : value;
      return {
        ...prev,
        [columnId]: filterValue,
        page: 1,
      };
    });
  }, []);

  // Memoizamos componentes y objetos para evitar renderizados innecesarios
  const actions = useMemo(
    () => (
      <>
        <Button variant="outline" size="sm" className="ml-auto h-8 lg:flex">
          <DownloadCloud className="mr-2 h-4 w-4" /> Descargar
        </Button>
        <DatePickerWithRange
          size="sm"
          initialValue={{ from: undefined, to: undefined }}
          onConfirm={(value) => {
            setFilters((prev) => ({
              ...prev,
              from: value?.from,
              to: value?.to,
            }));
          }}
          onClear={() => {
            setFilters((prev) => ({
              ...prev,
              from: undefined,
              to: undefined,
            }));
          }}
        />
      </>
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
