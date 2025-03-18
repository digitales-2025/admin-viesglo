"use client";

import { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/shared/components/data-table/DataTableColumnHeaderProps";
import { Badge } from "@/shared/components/ui/badge";
import { ClinicResponse } from "../_types/clinics.types";
import ClinicsTableActions from "./ClinicsTableActions";

export const columnsClinics = (): ColumnDef<ClinicResponse>[] => [
  {
    id: "ruc",
    accessorKey: "ruc",
    header: ({ column }) => <DataTableColumnHeader column={column} title="RUC" />,
    cell: ({ row }) => <div className="font-semibold capitalize min-w-[150px]">{row.getValue("ruc")}</div>,
  },
  {
    id: "nombre",
    size: 300,
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre" />,
    cell: ({ row }) => <div className="font-semibold capitalize min-w-[300px]">{row.getValue("nombre")}</div>,
  },
  {
    id: "departamento",
    accessorKey: "department",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Departamento" />,
    cell: ({ row }) => (
      <div className="truncate max-w-[300px]">{row.getValue("departamento") ? row.getValue("departamento") : "--"}</div>
    ),
  },
  {
    id: "provincia",
    accessorKey: "province",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Provincia" />,
    cell: ({ row }) => (
      <div className="truncate max-w-[300px]">{row.getValue("provincia") ? row.getValue("provincia") : "--"}</div>
    ),
  },
  {
    id: "distrito",
    accessorKey: "district",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Distrito" />,
    cell: ({ row }) => (
      <div className="truncate max-w-[300px]">{row.getValue("distrito") ? row.getValue("distrito") : "--"}</div>
    ),
  },
  {
    id: "direccion",
    accessorKey: "address",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Dirección" />,
    cell: ({ row }) => (
      <div className="truncate min-w-[300px]">{row.getValue("direccion") ? row.getValue("direccion") : "--"}</div>
    ),
  },
  {
    id: "telefono",
    accessorKey: "phone",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Teléfono" />,
    cell: ({ row }) => (
      <div className="truncate max-w-[300px]">{row.getValue("telefono") ? row.getValue("telefono") : "--"}</div>
    ),
  },
  {
    id: "email",
    accessorKey: "email",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
    cell: ({ row }) => (
      <div className="truncate max-w-[300px]">{row.getValue("email") ? row.getValue("email") : "--"}</div>
    ),
  },
  {
    id: "estado",
    accessorKey: "isActive",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
    cell: ({ row }) => (
      <div className="truncate max-w-[300px]">
        {row.getValue("estado") ? (
          <Badge variant="successOutline"> Activo</Badge>
        ) : (
          <Badge variant="errorOutline">Inactivo</Badge>
        )}
      </div>
    ),
  },
  {
    id: "actions",
    size: 100,
    cell: ({ row }) => {
      const item = row.original;

      return <ClinicsTableActions row={item} />;
    },
  },
];
