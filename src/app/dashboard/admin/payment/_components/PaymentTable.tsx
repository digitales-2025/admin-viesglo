"use client";

import { useEffect, useMemo, useState } from "react";

import { DataTable } from "@/shared/components/data-table/data-table";
import { debounce } from "@/shared/lib/utils";
import { usePayments } from "../_hooks/usePayments";
import { usePaymentsStore } from "../_hooks/usePaymentStore";
import { PaymentPlan } from "../../quotation/_types/quotation.types";
import InstallmentsPaymentDetail from "./InstallmentsPaymentDetail";
import { columnsPayment } from "./payment.column";

export default function PaymentTable() {
  const { filters: storeFilters, updateFilter } = usePaymentsStore();
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

  const columns = useMemo(() => columnsPayment(), []);

  if (error) return <div className="text-center py-4">Error al cargar pagos</div>;

  return (
    <DataTable
      columns={columns}
      data={payments || []}
      getRowCanExpand={(row) => row.original.paymentPlan === PaymentPlan.INSTALLMENTS}
      renderExpandedRow={(row) => <InstallmentsPaymentDetail payment={row} />}
      isLoading={isLoading}
    />
  );
}
