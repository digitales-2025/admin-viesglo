"use client";

import { ColumnDef } from "@tanstack/react-table";

import { ProjectGroupsTableActions } from "@/app/dashboard/admin/project-groups/_components/table/ProjectGroupsTableActions";
import { DataTableColumnHeader } from "@/shared/components/data-table/data-table-column-header";
import { Badge } from "@/shared/components/ui/badge";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { ProjectGroupResponseDto } from "../../_types/project-groups.types";

const getStatusLabel = (status: string): string => {
  const statusMap: Record<string, string> = {
    activo: "Activo",
    inactivo: "Inactivo",
  };
  return statusMap[status] || status;
};

const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  const variantMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    activo: "default",
    inactivo: "secondary",
  };
  return variantMap[status] || "default";
};

const getPeriodLabel = (period: string): string => {
  return period;
};

export const columnsProjectGroups: ColumnDef<ProjectGroupResponseDto>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Seleccionar todos"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Seleccionar fila"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre del Grupo" />,
    cell: ({ row }) => {
      return (
        <div className="max-w-[200px]">
          <div className="font-medium">{row.getValue("name")}</div>
          {row.original.description && (
            <div className="text-sm text-muted-foreground truncate">{row.original.description}</div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "period",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Período" />,
    cell: ({ row }) => {
      const period = row.getValue("period") as string;
      return (
        <div>
          <span className="text-sm font-medium">{getPeriodLabel(period)}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "progressPercentage",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Progreso" />,
    cell: ({ row }) => {
      const progress = row.getValue("progressPercentage") as number | undefined;
      return (
        <div>
          <div className="text-sm font-medium">{progress !== undefined ? `${progress}%` : "N/A"}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "totalProjects",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Total Proyectos" />,
    cell: ({ row }) => {
      const total = row.getValue("totalProjects") as number | undefined;
      return (
        <div>
          <div className="text-sm font-medium">{total !== undefined ? total : "N/A"}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <div>
          <Badge variant={getStatusVariant(status)}>{getStatusLabel(status)}</Badge>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ProjectGroupsTableActions projectGroup={row.original} />,
  },
];
