"use client";

import { ColumnDef } from "@tanstack/react-table";

import { ClinicResponse } from "../_types/clinics.types";

export const columnsClinics = (): ColumnDef<ClinicResponse>[] => [
  {
    id: "name",
    header: "Nombre",
    cell: ({ row }) => row.original.name,
  },
  {
    id: "department",
    header: "Departamento",
    cell: ({ row }) => row.original.department,
  },
  {
    id: "province",
    header: "Provincia",
    cell: ({ row }) => row.original.province,
  },
  {
    id: "district",
    header: "Distrito",
    cell: ({ row }) => row.original.district,
  },
  {
    id: "address",
    header: "Dirección",
    cell: ({ row }) => row.original.address,
  },
  {
    id: "phone",
    header: "Teléfono",
    cell: ({ row }) => row.original.phone,
  },
  {
    id: "email",
    header: "Email",
    cell: ({ row }) => row.original.email,
  },
  {
    id: "isActive",
    header: "Activo",
    cell: ({ row }) => row.original.isActive,
  },
];
