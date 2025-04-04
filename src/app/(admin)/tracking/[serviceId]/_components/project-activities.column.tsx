import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Calendar, Check, Clock, Paperclip, User, X } from "lucide-react";

import { DataTableColumnHeader } from "@/shared/components/data-table/DataTableColumnHeaderProps";
import { Badge } from "@/shared/components/ui/badge";
import {
  StatusProjectActivity,
  StatusProjectActivityColor,
  StatusProjectActivityLabel,
} from "../_types/activities.types";
import { ProjectActivityResponse } from "../../_types/tracking.types";
import ProjectActivitiesActions from "./ProjectActivitiesActions";

function getIconByStatus(status: StatusProjectActivity) {
  switch (status) {
    case StatusProjectActivity.PENDING:
      return <Clock className=" h-4 w-4" />;
    case StatusProjectActivity.IN_PROGRESS:
      return <Clock className=" h-4 w-4" />;
    case StatusProjectActivity.COMPLETED:
      return <Check className=" h-4 w-4" />;
    case StatusProjectActivity.CANCELLED:
      return <X className=" h-4 w-4" />;
  }
}
export const columnsActivities = (): ColumnDef<ProjectActivityResponse>[] => [
  {
    id: "name",
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre" />,
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
  {
    id: "description",
    accessorKey: "description",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Descripción" />,
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate text-muted-foreground">
        {row.getValue("description") || "Sin descripción"}
      </div>
    ),
  },
  {
    id: "responsibleUserId",
    accessorKey: "responsibleUserId",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Responsable" />,
    cell: ({ row }) => {
      console.log("🚀 ~ row:", row.original);
      return (
        <div className="flex items-center">
          <User className="mr-2 h-4 w-4 text-muted-foreground" />
          {row.original.responsibleUser ? (
            <span>{row.original.responsibleUser.fullName}</span>
          ) : (
            <span>Sin asignar</span>
          )}
        </div>
      );
    },
  },
  {
    id: "scheduledDate",
    accessorKey: "scheduledDate",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Fecha programada" />,
    cell: ({ row }) => (
      <Badge variant="outline">
        <Calendar className="ml-2 h-4 w-4 text-muted-foreground" />
        {row.getValue("scheduledDate") ? format(row.getValue("scheduledDate"), "dd/MM/yyyy") : "Sin programar"}
      </Badge>
    ),
  },
  {
    id: "executionDate",
    accessorKey: "executionDate",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Fecha de ejecución" />,
    cell: ({ row }) => (
      <Badge variant="outline">
        <Calendar className="ml-2 h-4 w-4 text-muted-foreground" />
        {row.getValue("executionDate") ? row.getValue("executionDate") : "Sin ejecutar"}
      </Badge>
    ),
  },
  {
    id: "evidenceRequired",
    accessorKey: "evidenceRequired",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Evidencia" />,
    cell: ({ row }) =>
      row.getValue("evidenceRequired") ? (
        <Paperclip className="mr-2 h-4 w-4 text-muted-foreground" />
      ) : (
        <span className="text-xs text-muted-foreground">No se requiere evidencia</span>
      ),
  },
  {
    id: "status",
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
    cell: ({ row }) =>
      row.getValue("status") && (
        <Badge
          className={StatusProjectActivityColor[row.getValue("status") as keyof typeof StatusProjectActivityColor]}
        >
          {getIconByStatus(row.getValue("status") as StatusProjectActivity)}
          {StatusProjectActivityLabel[row.getValue("status") as keyof typeof StatusProjectActivityLabel] ||
            "No definido"}
        </Badge>
      ),
  },
  {
    id: "actions",
    accessorKey: "actions",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Acciones" />,
    cell: ({ row }) => <ProjectActivitiesActions row={row.original} />,
    enableHiding: false,
    enableSorting: false,
  },
];
