"use client";

import { useMemo } from "react";

import { useProfile } from "@/app/(public)/auth/sign-in/_hooks/use-auth";
import AlertMessage from "@/shared/components/alerts/Alert";
import { DataTable } from "@/shared/components/data-table/data-table";
import { useQuotationGroups } from "../_hooks/useQuotationGroup";
import { columnsQuotationGroups } from "./quotation-group.column";

export default function QuotationGroupTable() {
  const user = useProfile();
  const { data: quotationGroups, isLoading, error } = useQuotationGroups();

  const columns = useMemo(() => columnsQuotationGroups(), []);

  if (error)
    return (
      <AlertMessage variant="destructive" title="Error al cargar grupos de cotizaciones" description={error.message} />
    );

  return (
    <DataTable
      columns={columns}
      data={quotationGroups || []}
      isLoading={isLoading}
      initialColumnVisibility={{ estado: user?.isSuperAdmin }}
    />
  );
}
