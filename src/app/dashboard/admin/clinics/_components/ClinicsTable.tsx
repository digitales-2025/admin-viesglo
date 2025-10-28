"use client";

import { useMemo } from "react";

import { useProfile } from "@/app/(public)/auth/sign-in/_hooks/use-auth";
import AlertMessage from "@/shared/components/alerts/Alert";
import { DataTable } from "@/shared/components/data-table/data-table";
import { useClinics } from "../_hooks/useClinics";
import { columnsClinics } from "./clinics.columns";

export default function ClinicsTable() {
  const user = useProfile();
  const { data: clinics, isLoading, error } = useClinics();

  const columns = useMemo(() => columnsClinics(), []);

  if (error) return <AlertMessage variant="destructive" title="Error al cargar clínicas" description={error.message} />;

  return (
    <DataTable
      columns={columns}
      data={clinics || []}
      isLoading={isLoading}
      initialColumnVisibility={{ estado: user.isSuperAdmin }}
    />
  );
}
