"use client";

import { ColumnDef } from "@tanstack/react-table";

import { ClinicResponse } from "../_types/clinics.types";

export const columnsClinics = (): ColumnDef<ClinicResponse>[] => [
  {
    id: "name",
    header: "Nombre",
    cell: ({ row }) => row.original.name,
  },
];
