"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Banknote, Check, Circle, CreditCard, DownloadCloud } from "lucide-react";

import { CustomFilterGroup, CustomFilterOption } from "@/shared/components/data-table/custom-types";
import { DataTable } from "@/shared/components/data-table/DataTable";
import { Button } from "@/shared/components/ui/button";
import { DatePickerWithRange } from "@/shared/components/ui/date-range-picker";
import { useUbigeo } from "@/shared/hooks/useUbigeo";
import { cn, debounce } from "@/shared/lib/utils";
import { usePayments } from "../_hooks/usePayments";
import { usePaymentsStore } from "../_hooks/usePaymentStore";
import { useQuotationGroups } from "../../quotation-groups/_hooks/useQuotationGroup";
import { TypePayment } from "../../quotation/_types/quotation.types";
import { columnsPayment } from "./payment.column";
import PaymentMonthlyTable from "./PaymentMonthlyTable";

export default function PaymentTable() {
  //const { data: payments, isLoading, error } = usePaymentsWithCleanup();

  const { data: quotationGroups, isLoading: isLoadingQuotationGroups } = useQuotationGroups();
  const { departmentOptions } = useUbigeo();

  const { filters: storeFilters, setFilters, updateFilter } = usePaymentsStore();

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
        value: "isPaid",
        multiSelect: false,
        options: [
          { label: "Pagado", value: "true", icon: Check },
          { label: "No pagado", value: "false", icon: Circle },
        ],
      },
      {
        label: "Tipo de pago",
        value: "typePayment",
        multiSelect: false,
        options: [
          { label: "Mensual", value: TypePayment.MONTHLY, icon: Banknote },
          { label: "Puntual", value: TypePayment.PUNCTUAL, icon: CreditCard },
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
          })
        ),
      });
    }

    return options;
  }, [baseFilterOptions, quotationGroups, departmentOptions]);

  // Creamos una función de debounce para la búsqueda
  const debouncedSearch = useMemo(() => {
    return debounce((searchTerm: string) => {
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

  const { data, isLoading, error } = usePayments(filters);
  const payments = data?.data || [];
  const meta = data?.meta;

  const columns = useMemo(() => columnsPayment(), []);

  // Manejador para cambios en la página (memoizado para evitar recrear la función)
  const handlePageChange = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  // Manejador para cambios en el tamaño de página (memoizado)
  const handlePageSizeChange = useCallback((limit: number) => {
    setPagination((prev) => ({ ...prev, limit }));
  }, []);

  // Manejador para cambios en la búsqueda con debounce
  const handleSearchChange = useCallback(
    (search: string) => {
      debouncedSearch(search);
    },
    [debouncedSearch]
  );

  // Manejador para cambios en los filtros (memoizado)
  const handleFilterChange = useCallback(
    (columnId: string, value: any) => {
      // Si el valor es null o un array vacío, eliminamos el filtro
      if (value === null || (Array.isArray(value) && value.length === 0)) {
        const newFilters = { ...storeFilters } as Record<string, any>;
        delete newFilters[columnId];
        setFilters(newFilters);
        setPagination((prev) => ({ ...prev, page: 1 }));
        return;
      }

      // Para isConcrete (boolean), necesitamos convertir correctamente el string a booleano
      if (columnId === "isPaid") {
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
      return;
    },
    [storeFilters, setFilters, updateFilter]
  );

  // Memoizamos componentes y objetos para evitar renderizados innecesarios
  const actions = useMemo(
    () => (
      <>
        <Button variant="outline" size="sm" className="ml-auto h-8 lg:flex">
          <DownloadCloud className="mr-2 h-4 w-4" /> Descargar
        </Button>
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

  if (error) return <div className="text-center py-4">Error al cargar pagos</div>;

  return (
    <DataTable
      columns={columns}
      data={payments || []}
      getRowCanExpand={(row) => row.original.typePayment === TypePayment.MONTHLY}
      renderExpandedRow={(row) => <PaymentMonthlyTable payment={row} />}
      isLoading={isLoading}
      actions={actions}
      mode="server"
      serverPagination={serverPagination}
      serverFilters={serverFilters}
      serverFilterOptions={quotationGroupOptions as any}
      serverFilterLoading={isLoadingQuotationGroups}
    />
  );
}
