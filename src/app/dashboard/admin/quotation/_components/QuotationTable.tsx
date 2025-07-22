"use client";

import { useEffect, useMemo, useState } from "react";

import { DataTable } from "@/shared/components/data-table/data-table";
import { Loading } from "@/shared/components/loading";
import { debounce } from "@/shared/lib/utils";
import { useQuotations } from "../_hooks/useQuotations";
import { useQuotationsStore } from "../_hooks/useQuotationsStore";
import { useQuotationGroups } from "../../quotation-groups/_hooks/useQuotationGroup";
import { columnsQuotation } from "./quotation.column";

export default function QuotationTable() {
  const { isLoading: isLoadingQuotationGroups } = useQuotationGroups();

  // Obtenemos los filtros del store
  const { filters: storeFilters, updateFilter } = useQuotationsStore();
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
  const columns = useMemo(() => columnsQuotation(), []);

  if (error) return <div className="text-center py-4">Error al cargar cotizaciones</div>;

  return (
    <>
      {isLoadingQuotationGroups ? (
        <Loading text="Cargando grupos de cotizacion" />
      ) : (
        <DataTable
          initialColumnVisibility={{
            cargo: false,
            "correo electrónico": false,
            departamento: false,
          }}
          columns={columns}
          data={quotations}
          isLoading={isLoading}
        />
      )}
    </>
  );
}
