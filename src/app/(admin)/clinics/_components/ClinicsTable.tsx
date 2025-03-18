"use client";

import { useMemo } from "react";

import { DataTable } from "@/shared/components/data-table/DataTable";
import { useClinics } from "../_hooks/useClinics";
import { columnsClinics } from "./columns";

export default function ClinicsTable() {
  const { data: clinics, isLoading, error } = useClinics();

  const columns = useMemo(() => columnsClinics(), []);

  if (isLoading) return <div className="text-center py-4">Cargando clínicas...</div>;

  if (error) return <div className="text-center py-4">Error al cargar clínicas</div>;

  return <DataTable columns={columns} data={clinics || []} />;
}
