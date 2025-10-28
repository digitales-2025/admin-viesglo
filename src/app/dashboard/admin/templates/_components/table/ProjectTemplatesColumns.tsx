"use client";

import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { CheckCircle, XCircle } from "lucide-react";

import { DataTableColumnHeader } from "@/shared/components/data-table/data-table-column-header";
import { Badge } from "@/shared/components/ui/badge";
import { ProjectTemplateResponseDto } from "../../_types/templates.types";
import ProjectTemplatesTableActions from "./ProjectTemplatesTableActions";

export const columnsProjectTemplates = (): ColumnDef<ProjectTemplateResponseDto>[] => [
  {
    id: "nombre",
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre" />,
    cell: ({ row }) => {
      const projectTemplate = row.original;
      return (
        <Link href={`/project-templates/${projectTemplate.id}`} className="font-medium">
          {projectTemplate.name}
        </Link>
      );
    },
  },
  {
    id: "descripción",
    accessorKey: "description",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Descripción" />,
    cell: ({ row }) => {
      const projectTemplate = row.original;
      return <p className="line-clamp-2">{projectTemplate.description}</p>;
    },
  },
  {
    id: "estado",
    accessorKey: "isActive",
    header: ({ column }) => <DataTableColumnHeader column={column} className="justify-center" title="Estado" />,
    cell: ({ row }) => {
      const isActive = row.original.isActive;

      return (
        <div className="min-w-[120px] space-y-1 flex justify-center">
          <Badge variant={isActive ? "default" : "destructive"} className="flex items-center gap-1 w-fit">
            {isActive ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}

            {isActive ? "Activo" : "Inactivo"}
          </Badge>
        </div>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      // Si filterValue es un array, revisa si el valor está incluido
      if (Array.isArray(filterValue)) {
        return filterValue.includes(row.getValue(columnId));
      }
      // Si es un valor único, compara directamente
      return row.getValue(columnId) === filterValue;
    },
  },

  {
    id: "actions",
    size: 20,
    cell: ({ row }) => <ProjectTemplatesTableActions projectTemplate={row.original} />,
  },
];
