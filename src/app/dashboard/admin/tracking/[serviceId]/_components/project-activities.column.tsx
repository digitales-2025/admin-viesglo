import { useEffect, useState } from "react";
import { TZDate } from "@date-fns/tz";
import { ColumnDef } from "@tanstack/react-table";
import { Check, CircleFadingArrowUp, Clock, ClockFading, Download, Image, Loader2, Trash, X } from "lucide-react";
import { toast } from "sonner";

import { AuditResponse, AuditType } from "@/shared/actions/audit/audit.types";
import { useAudit } from "@/shared/actions/audit/useAudit";
import { DataTableColumnHeader } from "@/shared/components/data-table/data-table-column-header";
import { FileUpload } from "@/shared/components/file-upload";
import { FileUploadAlert } from "@/shared/components/file-upload-alert";
import { Doc, File, Pdf } from "@/shared/components/icons/Files";
import { Button } from "@/shared/components/ui/button";
import { DatePicker } from "@/shared/components/ui/date-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
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

export const columnsActivities = (objectiveId: string): ColumnDef<ProjectActivityResponse>[] => [
  {
    id: "name",
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Actividad" />,
    cell: ({ row }) => (
      <div className="font-medium truncate max-w-[200px]" title={row.getValue("name")}>
        {row.getValue("name")}
      </div>
    ),
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
      const status = row.getValue("status") as StatusProjectActivity;
      const { mutate: updateTrackingActivity, isPending } = useUpdateTrackingActivity();

      // Inicializar optimisticStatus como null (no con un valor derivado)
      const [optimisticStatus, setOptimisticStatus] = useState<StatusProjectActivity | null>(null);

      // Actualizar optimisticStatus cuando cambie status
      useEffect(() => {
        setOptimisticStatus(status);
      }, [status]);

      const handleChange = (value: StatusProjectActivity) => {
        // Actualizar el estado local inmediatamente (Optimistic UI)
        setOptimisticStatus(value);

        // Enviar la actualización al servidor
        updateTrackingActivity(
          {
            objectiveId,
            activityId: row.original.id,
            trackingActivity: { status: value },
          },
          {
            // En caso de error, revertir al estado anterior
            onError: () => {
              setOptimisticStatus(status);
              toast.error("Error al actualizar el estado. Se ha revertido el cambio.");
            },
          }
        );
      };

      // Usar el estado optimista para renderizar la UI, con fallback a status
      const displayStatus = optimisticStatus ?? status;

      return (
        displayStatus && (
          <Select value={displayStatus} onValueChange={handleChange} disabled={isPending}>
            <SelectTrigger
              className={cn(
                "border-none shadow-none font-semibold w-[150px]",
                isPending && "cursor-not-allowed opacity-50",
                StatusProjectActivityColor[displayStatus]
              )}
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {displayStatus === StatusProjectActivity.PENDING && <Clock className="size-4" />}
              {displayStatus === StatusProjectActivity.IN_PROGRESS && <CircleFadingArrowUp className="size-4" />}
              {displayStatus === StatusProjectActivity.COMPLETED && <Check className="size-4" />}
              {displayStatus === StatusProjectActivity.CANCELLED && <X className="size-4" />}
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
  {
    id: "history",
    cell: function Cell({ row }) {
      const [isOpen, setIsOpen] = useState(false);
      const [page, setPage] = useState(1);
      const [auditItems, setAuditItems] = useState<AuditResponse[]>([]);
      // Usar refetch para controlar manualmente la carga de datos
      const { data: audit, isLoading: isAuditLoading } = useAudit(row.original.id, {
        page,
        limit: 10,
      });
      useEffect(() => {
        if (audit) {
          setAuditItems(audit?.response.data || []);
        }
      }, [isAuditLoading, audit]);

      const handleHistoryActivity = async (open: boolean) => {
        if (open === isOpen) return;
        setIsOpen(open);
      };

      return (
        <div className="flex items-center gap-2">
          <Popover open={isOpen} onOpenChange={handleHistoryActivity}>
            <PopoverTrigger>
              <ClockFading className="size-4 text-muted-foreground hover:text-primary cursor-pointer" />
            </PopoverTrigger>
            <PopoverContent className="max-h-[300px] overflow-y-auto w-[350px] p-3">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-sm font-medium">Historial de actividad</h4>
                {isAuditLoading && page === 1 && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
              </div>

              {auditItems && auditItems.length > 0 ? (
                <>
                  {page > 1 && (
                    <Button variant="ghost" size="sm" onClick={() => setPage(page - 1)}>
                      Mostrar anterior
                    </Button>
                  )}
                  <ul className="space-y-2">
                    {auditItems.map((item) => (
                      <li key={item.id} className="flex items-start gap-1 text-xs">
                        {item.action === AuditType.UPDATE && (
                          <span className="text-muted-foreground">
                            Última <span className="text-amber-500 font-semibold">modificación</span> por{" "}
                            <span className="font-semibold capitalize">{item.performedBy.fullName}</span> a las{" "}
                            <span className="font-semibold capitalize">
                              {new TZDate(item.createdAt as string).toLocaleString()}
                            </span>
                          </span>
                        )}
                        {item.action === AuditType.CREATE && (
                          <span className="text-muted-foreground">
                            <span className="text-emerald-500 font-semibold">Creada</span> por{" "}
                            <span className="font-semibold capitalize">{item.performedBy.fullName}</span> a las{" "}
                            <span className="font-semibold capitalize">
                              {new TZDate(item.createdAt as string).toLocaleString()}
                            </span>
                          </span>
                        )}
                        {item.action === AuditType.DELETE && (
                          <span className="text-muted-foreground">
                            <span className="text-rose-500 font-semibold">Eliminada</span> por{" "}
                            <span className="font-semibold capitalize">{item.performedBy.fullName}</span> a las{" "}
                            <span className="font-semibold capitalize">
                              {new TZDate(item.createdAt as string).toLocaleString()}
                            </span>
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                  {audit?.response?.meta &&
                    "totalItems" in audit.response.meta &&
                    "totalPages" in audit.response.meta &&
                    audit.response.meta.totalItems > auditItems.length &&
                    audit.response.meta.totalPages > page && (
                      <Button
                        variant="ghost"
                        className="text-xs mt-3 flex items-center justify-center"
                        size="sm"
                        onClick={() => setPage(page + 1)}
                      >
                        Cargar más
                      </Button>
                    )}
                </>
              ) : isAuditLoading ? (
                <div className="flex justify-center py-2">
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No hay historial disponible</p>
              )}
            </PopoverContent>
          </Popover>
        </div>
      );
    },
    enableHiding: false,
    enableSorting: false,
    size: 20,
  },
];
