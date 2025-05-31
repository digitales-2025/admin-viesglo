"use client";

import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Mail, MapPin, Phone } from "lucide-react";
import { formatPhoneNumberIntl } from "react-phone-number-input";

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
    cell: ({ row }) => (
      <div className="font-semibold truncate capitalize min-w-[200px] max-w-[300px]" title={row.getValue("nombre")}>
        {row.getValue("nombre")}
      </div>
    ),
  },
  {
    id: "departamento",
    accessorKey: "department",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Departamento" />,
    cell: ({ row }) => (
      <div className="truncate max-w-[300px]">
        {row.getValue("departamento") ? (
          <Badge variant="outline">
            <MapPin className="size-4" /> {row.getValue("departamento")}
          </Badge>
        ) : (
          "--"
        )}
      </div>
    ),
  },
  {
    id: "provincia",
    accessorKey: "province",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Provincia" />,
    cell: ({ row }) => (
      <div className="truncate max-w-[300px]">
        {row.getValue("provincia") ? (
          <Badge variant="outline">
            <MapPin className="size-4" /> {row.getValue("provincia")}
          </Badge>
        ) : (
          "--"
        )}
      </div>
    ),
  },
  {
    id: "distrito",
    accessorKey: "district",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Distrito" />,
    cell: ({ row }) => (
      <div className="truncate max-w-[300px]">
        {row.getValue("distrito") ? (
          <Badge variant="outline">
            <MapPin className="size-4" /> {row.getValue("distrito")}
          </Badge>
        ) : (
          "--"
        )}
      </div>
    ),
  },
  {
    id: "direccion",
    accessorKey: "address",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Dirección" />,
    cell: ({ row }) => (
      <div className="truncate min-w-[200px] max-w-[300px]" title={row.getValue("direccion")}>
        {row.getValue("direccion")}
      </div>
    ),
  },
  {
    id: "telefono",
    accessorKey: "phone",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Teléfono" />,
    cell: ({ row }) => (
      <div className="truncate max-w-[300px]">
        {row.getValue("telefono") ? (
          <Link href={`tel:${row.getValue("telefono")}`}>
            <Badge variant="outline">
              <Phone className="size-4" />
              {formatPhoneNumberIntl(row.getValue("telefono"))}
            </Badge>
          </Link>
        ) : (
          "--"
        )}
      </div>
    ),
  },
  {
    id: "email",
    accessorKey: "email",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
    cell: ({ row }) => (
      <div className="truncate max-w-[300px]">
        {row.getValue("email") ? (
          <Link href={`mailto:${row.getValue("email")}`}>
            <Badge variant="outline">
              <Mail className="size-4" />
              {row.getValue("email")}
            </Badge>
          </Link>
        ) : (
          "--"
        )}
      </div>
    ),
  },
  {
    id: "estado",
    accessorKey: "isActive",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
    cell: ({ row }) => (
      <div className="truncate max-w-[300px]">
        {row.getValue("estado") ? <Badge variant="success"> Activo</Badge> : <Badge variant="error">Inactivo</Badge>}
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
    enablePinning: true,
  },
];
