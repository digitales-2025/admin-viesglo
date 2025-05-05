import { ColumnDef } from "@tanstack/react-table";
import { Check, CircleFadingArrowUp, Clock, Download, Image, Loader2, X } from "lucide-react";

import { useDownloadEvidence } from "@/app/(admin)/tracking/_hooks/useActivitiesProject";
import { FileType, ProjectActivityResponse } from "@/app/(admin)/tracking/_types/tracking.types";
import {
  StatusProjectActivity,
  StatusProjectActivityColor,
  StatusProjectActivityOptions,
} from "@/app/(admin)/tracking/[serviceId]/_types/activities.types";
import { User as UserResponse } from "@/app/(admin)/users/_types/user.types";
import { DataTableColumnHeader } from "@/shared/components/data-table/DataTableColumnHeaderProps";
import { Doc, File, Pdf } from "@/shared/components/icons/Files";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { MODULE_PROJECT_ACTIVITIES } from "./ProjectActivitiesDialogs";

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
      const responsibleUser = users.find((user) => user.id === row.original.responsibleUser?.id);
      return (
        <div className="w-[220px] truncate" title={responsibleUser?.fullName}>
          {responsibleUser?.fullName || "—"}
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
      const scheduledDateFormatted = scheduledDate
        ? new Date(scheduledDate as string).toLocaleDateString("es-PE")
        : "—";

      return <div>{scheduledDateFormatted}</div>;
    },
  },
  {
    id: "executionDate",
    accessorKey: "executionDate",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Fecha de ejecución" />,
    cell: function Cell({ row }) {
      const executionDate = row.original.executionDate;
      const executionDateFormatted = executionDate
        ? new Date(executionDate as string).toLocaleDateString("es-PE")
        : "—";

      return <div>{executionDateFormatted}</div>;
    },
  },

  {
    id: "evidenceRequired",
    accessorKey: "evidenceRequired",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Evidencia" />,
    cell: function Cell({ row }) {
      const { mutate: downloadEvidence, isPending: isDownloading } = useDownloadEvidence();
      const { open } = useDialogStore();

      const handleDownloadEvidence = () => {
        downloadEvidence({
          objectiveId,
          activityId: row.original.id,
        });
      };

      return row.getValue("evidenceRequired") ? (
        row.original.evidence?.id ? (
          <div
            className="flex items-center gap-2 cursor-pointer group/evidence"
            onClick={() => {
              const activityWithObjectiveId = {
                ...row.original,
                objectiveId: objectiveId,
              };
              open(MODULE_PROJECT_ACTIVITIES, "view", activityWithObjectiveId);
            }}
          >
            <div className="flex items-center gap-2">
              <span>
                {row.original.evidence.fileType === FileType.PDF ? (
                  <Pdf className="size-4 text-red-500" />
                ) : row.original.evidence.fileType === FileType.DOCUMENT ? (
                  <Doc className="size-4 text-blue-500" />
                ) : row.original.evidence.fileType === FileType.IMAGE ? (
                  <Image className="size-4 text-green-500" />
                ) : (
                  <File className="size-4 text-gray-500" />
                )}
              </span>
              <span className="text-xs text-muted-foreground">{row.original.evidence.originalName}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownloadEvidence();
                }}
                disabled={isDownloading}
                className=""
                title="Descargar evidencia"
              >
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                ) : (
                  <Download className="size-4 text-sky-500" />
                )}
              </Button>
            </div>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">No se ha subido evidencia</span>
        )
      ) : (
        <span className="text-xs text-muted-foreground">No se requiere evidencia</span>
      );
    },
  },

  {
    id: "status",
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
    cell: function Cell({ row }) {
      const status = row.getValue("status") as StatusProjectActivity;

      return (
        <div
          className={cn(
            "inline-flex items-center gap-2 font-semibold px-3 py-1 rounded-md",
            StatusProjectActivityColor[status]
          )}
        >
          {status === StatusProjectActivity.PENDING && <Clock className="size-4" />}
          {status === StatusProjectActivity.IN_PROGRESS && <CircleFadingArrowUp className="size-4" />}
          {status === StatusProjectActivity.COMPLETED && <Check className="size-4" />}
          {status === StatusProjectActivity.CANCELLED && <X className="size-4" />}
          <span>{StatusProjectActivityOptions.find((opt) => opt.value === status)?.label}</span>
        </div>
      );
    },
  },
];
