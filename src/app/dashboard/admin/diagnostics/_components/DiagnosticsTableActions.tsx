"use client";

import { Edit, FileCheck, FileX, MoreHorizontal, RotateCcw, Trash } from "lucide-react";

import { ProtectedComponent } from "@/auth/presentation/components/ProtectedComponent";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import {
  useActivateDiagnosticInSystem,
  useDeactivateDiagnosticInSystem,
  useToggleIncludeReportsDiagnostic,
} from "../../medical-records/_hooks/useMedicalRecords";
import { DiagnosticEntity } from "../../medical-records/_types/medical-record.types";
import { EnumAction, EnumResource } from "../../roles/_utils/groupedPermission";

interface DiagnosticsTableActionsProps {
  row: DiagnosticEntity;
}

export default function DiagnosticsTableActions({ row }: DiagnosticsTableActionsProps) {
  const { open } = useDialogStore();
  const activateDiagnosticMutation = useActivateDiagnosticInSystem();
  const deactivateDiagnosticMutation = useDeactivateDiagnosticInSystem();
  const { mutateAsync: toggleIncludeReportsDiagnosticMutation, isPending: toggleIncludeReportsDiagnosticIsPending } =
    useToggleIncludeReportsDiagnostic();
  // Constante para módulo
  const MODULE = "diagnostics";

  const handleEdit = () => {
    open(MODULE, "edit", row);
  };

  const handleActivate = async () => {
    await activateDiagnosticMutation.mutateAsync(row.id);
  };

  const handleDeactivate = async () => {
    await deactivateDiagnosticMutation.mutateAsync(row.id);
  };

  const handleToggleIncludeReports = () => {
    toggleIncludeReportsDiagnosticMutation(row.id);
  };

  return (
    <ProtectedComponent
      requiredPermissions={[
        { resource: EnumResource.diagnostic, action: EnumAction.update },
        { resource: EnumResource.diagnostic, action: EnumAction.delete },
      ]}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="bg-background" size="icon">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <ProtectedComponent requiredPermissions={[{ resource: EnumResource.diagnostic, action: EnumAction.update }]}>
            <DropdownMenuItem onClick={handleEdit} disabled={!row.isActive}>
              Editar
              <DropdownMenuShortcut>
                <Edit className="size-4 mr-2" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </ProtectedComponent>

          {row.isActive === false && (
            <ProtectedComponent
              requiredPermissions={[{ resource: EnumResource.diagnostic, action: EnumAction.update }]}
            >
              <DropdownMenuItem onClick={handleActivate} disabled={activateDiagnosticMutation.isPending}>
                Reactivar
                <DropdownMenuShortcut>
                  <RotateCcw className="size-4 mr-2 text-yellow-500" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </ProtectedComponent>
          )}
          {row.isActive === true && (
            <ProtectedComponent
              requiredPermissions={[{ resource: EnumResource.diagnostic, action: EnumAction.update }]}
            >
              <DropdownMenuItem onClick={handleDeactivate} disabled={deactivateDiagnosticMutation.isPending}>
                Eliminar
                <DropdownMenuShortcut>
                  <Trash className="size-4 mr-2 " />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </ProtectedComponent>
          )}

          <ProtectedComponent requiredPermissions={[{ resource: EnumResource.diagnostic, action: EnumAction.update }]}>
            <DropdownMenuItem onClick={handleToggleIncludeReports} disabled={toggleIncludeReportsDiagnosticIsPending}>
              {!row.isDefaultIncluded ? "Incluir en informes" : "Excluir de informes"}
              <DropdownMenuShortcut>
                {!row.isDefaultIncluded ? (
                  <FileCheck className="size-4 mr-2 text-green-500" />
                ) : (
                  <FileX className="size-4 mr-2 text-red-500" />
                )}
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </ProtectedComponent>
        </DropdownMenuContent>
      </DropdownMenu>
    </ProtectedComponent>
  );
}
