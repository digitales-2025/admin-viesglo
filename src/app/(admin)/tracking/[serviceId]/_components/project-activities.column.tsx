import { useState } from "react";
import { TZDate } from "@date-fns/tz";
import { ColumnDef } from "@tanstack/react-table";
import { Check, CircleFadingArrowUp, Clock, Download, Image, Loader2, Trash, X } from "lucide-react";

import { User as UserResponse } from "@/app/(admin)/users/_types/user.types";
import { DataTableColumnHeader } from "@/shared/components/data-table/DataTableColumnHeaderProps";
import { FileUpload } from "@/shared/components/file-upload";
import { FileUploadAlert } from "@/shared/components/file-upload-alert";
import { Doc, File, Pdf } from "@/shared/components/icons/Files";
import AutocompleteSelect from "@/shared/components/ui/autocomplete-select";
import { Button } from "@/shared/components/ui/button";
import { DatePicker } from "@/shared/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { cn } from "@/shared/lib/utils";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import {
  StatusProjectActivity,
  StatusProjectActivityColor,
  StatusProjectActivityOptions,
} from "../_types/activities.types";
import {
  useDeleteEvidence,
  useDownloadEvidence,
  useUpdateTrackingActivity,
  useUploadEvidence,
} from "../../_hooks/useActivitiesProject";
import { FileType, ProjectActivityResponse } from "../../_types/tracking.types";
import ProjectActivitiesActions from "./ProjectActivitiesActions";
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
      const responsibleUser = users.find((user) => user.id === row.original.responsibleUser.id);
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
    cell: function Cell({ row }) {
      const { mutate: uploadEvidence, isPending, error } = useUploadEvidence();
      const { mutate: deleteEvidence, isPending: isDeleting } = useDeleteEvidence();
      const { mutate: downloadEvidence, isPending: isDownloading } = useDownloadEvidence();
      const [files, setFiles] = useState<File[]>([]);
      const handleFileChange = (files: FileList | null) => {
        if (files && files.length > 0) {
          uploadEvidence({
            objectiveId,
            activityId: row.original.id,
            evidence: files[0],
          });
          setFiles([files[0]]);
        }
      };

      const handleDeleteEvidence = () => {
        deleteEvidence({
          objectiveId,
          activityId: row.original.id,
        });
      };

      const handleDownloadEvidence = () => {
        downloadEvidence({
          objectiveId,
          activityId: row.original.id,
        });
      };

      const { open } = useDialogStore();

      return row.getValue("evidenceRequired") ? (
        <div className="flex items-center gap-2">
          {row.original.evidence?.id ? (
            <div
              className="flex items-center gap-2 cursor-pointer group/evidence"
              onClick={() => {
                console.log("Abriendo diálogo de vista previa para:", {
                  row: row.original,
                  id: row.original.id,
                  objectiveId: objectiveId,
                });

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
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadEvidence();
                    }}
                    disabled={isDownloading}
                    className="group-hover/evidence:visible invisible"
                    title="Descargar evidencia"
                  >
                    {isDownloading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                    ) : (
                      <Download className="size-4 text-sky-500" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteEvidence();
                    }}
                    disabled={isDeleting}
                    className="group-hover/evidence:visible invisible"
                    title="Eliminar evidencia"
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin text-rose-500" />
                    ) : (
                      <Trash className="size-4 text-rose-500" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <FileUpload
              onChange={handleFileChange}
              variant="ghost"
              defaultText="Subir evidencia"
              disabled={isPending}
            />
          )}

          {isPending && (
            <FileUploadAlert file={files[0]} onClose={() => {}} progress={0} isUploading={isPending} error={error} />
          )}
        </div>
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
      const status = row.getValue("status");
      const { mutate: updateTrackingActivity, isPending } = useUpdateTrackingActivity();

      const handleChange = (value: StatusProjectActivity) => {
        updateTrackingActivity({
          objectiveId,
          activityId: row.original.id,
          trackingActivity: { status: value },
        });
      };
      return (
        status && (
          <Select value={status as string} onValueChange={handleChange} disabled={isPending}>
            <SelectTrigger
              className={cn(
                "border-none shadow-none font-semibold",
                isPending && "cursor-not-allowed opacity-50",
                StatusProjectActivityColor[status as StatusProjectActivity]
              )}
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {status === StatusProjectActivity.PENDING && <Clock className="size-4" />}
              {status === StatusProjectActivity.IN_PROGRESS && <CircleFadingArrowUp className="size-4" />}
              {status === StatusProjectActivity.COMPLETED && <Check className="size-4" />}
              {status === StatusProjectActivity.CANCELLED && <X className="size-4" />}
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              {StatusProjectActivityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      );
    },
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
