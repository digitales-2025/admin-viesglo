import { TZDate } from "@date-fns/tz";
import { ColumnDef } from "@tanstack/react-table";
import { Check, Clock, Loader2, Paperclip, X } from "lucide-react";

import { User as UserResponse } from "@/app/(admin)/users/_types/user.types";
import { DataTableColumnHeader } from "@/shared/components/data-table/DataTableColumnHeaderProps";
import AutocompleteSelect from "@/shared/components/ui/autocomplete-select";
import { Badge } from "@/shared/components/ui/badge";
import { DatePicker } from "@/shared/components/ui/date-picker";
import {
  StatusProjectActivity,
  StatusProjectActivityColor,
  StatusProjectActivityLabel,
} from "../_types/activities.types";
import { useUpdateTrackingActivity } from "../../_hooks/useActivitiesProject";
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
export const columnsActivities = (users: UserResponse[], objectiveId: string): ColumnDef<ProjectActivityResponse>[] => [
  {
    id: "name",
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Actividad" />,
    cell: ({ row }) => (
      <div className="font-medium" title={row.getValue("name")}>
        {row.getValue("name")}
      </div>
    ),
  },
  {
    id: "responsibleUserId",
    accessorKey: "responsibleUserId",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Responsable" />,
    cell: function Cell({ row }) {
      const responsibleUser = users.find((user) => user.id === row.original.responsibleUserId);
      const { mutate: updateResponsibleUserId, isPending } = useUpdateTrackingActivity();
      const onUpdateResponsibleUserId = (id: string) => {
        updateResponsibleUserId({
          objectiveId,
          activityId: row.original.id,
          trackingActivity: {
            responsibleUserId: id,
          },
        });
      };

      return (
        <div className="flex items-center w-[220px]" title={responsibleUser?.fullName}>
          <AutocompleteSelect
            label="Responsable"
            options={users.map((user) => ({ value: user.id, label: user.fullName }))}
            value={responsibleUser?.id || ""}
            onChange={onUpdateResponsibleUserId}
            isLoading={isPending}
            className="border-none"
          />
        </div>
      );
    },
  },
  {
    id: "scheduledDate",
    accessorKey: "scheduledDate",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Fecha programada" />,
    cell: function Cell({ row }) {
      const scheduledDate = row.getValue("scheduledDate");
      const scheduledDateFormatted = scheduledDate ? new Date(scheduledDate as string) : undefined;
      const { mutate: updateTrackingActivity, isPending } = useUpdateTrackingActivity();

      const handleChange = (date: Date | undefined) => {
        updateTrackingActivity({
          objectiveId,
          activityId: row.original.id,
          trackingActivity: {
            scheduledDate: date
              ? new TZDate(date.getFullYear(), date.getMonth(), date.getDate(), "America/Lima").toISOString()
              : null,
          },
        });
      };
      return (
        <div className="relative">
          {isPending && <Loader2 className="absolute -left-2 top-1/3 h-4 w-4  animate-spin text-emerald-500" />}
          <DatePicker
            selected={scheduledDateFormatted}
            onSelect={handleChange}
            disabled={isPending}
            clearable={true}
            className="border-none"
          />
        </div>
      );
    },
  },
  {
    id: "executionDate",
    accessorKey: "executionDate",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Fecha de ejecución" />,
    cell: function Cell({ row }) {
      const executionDate = row.original.executionDate;
      const executionDateFormatted = executionDate ? new TZDate(executionDate as string) : undefined;

      const { mutate: updateTrackingActivity, isPending } = useUpdateTrackingActivity();

      const handleChange = (date: Date | undefined) => {
        updateTrackingActivity({
          objectiveId,
          activityId: row.original.id,
          trackingActivity: {
            executionDate: date
              ? new TZDate(date.getFullYear(), date.getMonth(), date.getDate(), "America/Lima").toISOString()
              : null,
          },
        });
      };

      return (
        <div className="relative">
          {isPending && <Loader2 className="absolute -left-2 top-1/3 h-4 w-4  animate-spin text-emerald-500" />}
          <DatePicker
            selected={executionDateFormatted}
            onSelect={handleChange}
            disabled={isPending}
            clearable={true}
            className="border-none"
          />
        </div>
      );
    },
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
          variant={
            StatusProjectActivityColor[row.getValue("status") as keyof typeof StatusProjectActivityColor] as
              | "default"
              | "secondary"
              | "destructive"
              | "outline"
              | "success"
              | "error"
          }
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
    size: 20,
  },
];
