"use client";

import { ColumnDef } from "@tanstack/react-table";
import { FileText, Info, ToggleLeft } from "lucide-react";

import { DataTableColumnHeader } from "@/shared/components/data-table/data-table-column-header";
import { Badge } from "@/shared/components/ui/badge";
import { DiagnosticEntity } from "../../medical-records/_types/medical-record.types";
import DiagnosticsTableActions from "./DiagnosticsTableActions";

export const columnsDiagnostics = (): ColumnDef<DiagnosticEntity>[] => [
  {
    id: "name",
    size: 300,
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre" />,
    cell: ({ row }) => (
      <div className="font-semibold truncate capitalize min-w-[200px] max-w-[300px]" title={row.getValue("name")}>
        <Badge variant="outline">
          <FileText className="size-4" /> {row.getValue("name")}
        </Badge>
      </div>
    ),
  },
  {
    id: "description",
    accessorKey: "description",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Descripción" />,
    cell: ({ row }) => (
      <div className="truncate max-w-[300px]">
        {row.getValue("description") ? (
          <Badge variant="outline">
            <Info className="size-4" /> {row.getValue("description")}
          </Badge>
        ) : (
          <span className="text-xs italic text-accent-foreground">Sin descripción</span>
        )}
      </div>
    ),
  },
  {
    id: "isActive",
    accessorKey: "isActive",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
    cell: ({ row }) => (
      <div className="truncate max-w-[300px]">
        {row.getValue("isActive") ? <Badge variant="success">Activo</Badge> : <Badge variant="error">Inactivo</Badge>}
      </div>
    ),
  },
  {
    id: "isDefaultIncluded",
    accessorKey: "isDefaultIncluded",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Incluido en reportes" />,
    cell: ({ row }) => (
      <div className="truncate max-w-[300px]">
        {row.getValue("isDefaultIncluded") ? (
          <Badge variant="success">
            <ToggleLeft className="size-4" /> Sí
          </Badge>
        ) : (
          <Badge variant="secondary">
            <ToggleLeft className="size-4" /> No
          </Badge>
        )}
      </div>
    ),
  },
  {
    id: "actions",
    size: 100,
    cell: ({ row }) => {
      const item = row.original;
      return <DiagnosticsTableActions row={item} />;
    },
    enablePinning: true,
  },
];
