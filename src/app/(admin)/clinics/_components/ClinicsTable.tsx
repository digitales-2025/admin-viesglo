"use client";

import { useMemo } from "react";

import { useIsAdmin } from "@/auth/presentation/hooks/useIsAdmin";
import AlertMessage from "@/shared/components/alerts/Alert";
import { DataTable } from "@/shared/components/data-table/DataTable";
import { useClinics } from "../_hooks/useClinics";
import { columnsClinics } from "./clinics.columns";

export default function ClinicsTable() {
  const isAdmin = useIsAdmin();
  const { data: clinics, isLoading, error } = useClinics();

  const columns = useMemo(() => columnsClinics(), []);

  if (error) return <AlertMessage variant="destructive" title="Error al cargar clínicas" description={error.message} />;

  return (
    <DataTable
      columns={columns}
      data={clinics || []}
      isLoading={isLoading}
      initialColumnVisibility={{ estado: isAdmin }}
    />
  );
}
