import { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/shared/components/data-table/data-table-column-header";
import { Badge } from "@/shared/components/ui/badge";
import { QuotationGroupResponse } from "../_types/quotation-groups.types";
import QuotationGroupActions from "./QuotationGroupActions";

export const columnsQuotationGroups = (): ColumnDef<QuotationGroupResponse>[] => [
  {
    id: "codigo",
    accessorKey: "code",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Código" />,
    cell: ({ row }) => (
      <div className="font-semibold capitalize text-emerald-500 min-w-[150px]">{row.getValue("codigo")}</div>
    ),
  },
  {
    id: "nombre",
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre" />,
    cell: ({ row }) => <div className="font-semibold capitalize min-w-[150px]">{row.getValue("nombre")}</div>,
  },
  {
    id: "descripcion",
    accessorKey: "description",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Descripción" />,
    cell: ({ row }) => <div className="font-semibold capitalize min-w-[150px]">{row.getValue("descripcion")}</div>,
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
    cell: ({ row }) => <QuotationGroupActions row={row.original} />,
  },
];
