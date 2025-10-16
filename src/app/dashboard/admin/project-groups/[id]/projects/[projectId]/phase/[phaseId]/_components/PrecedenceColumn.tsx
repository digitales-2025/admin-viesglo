"use client";

import React from "react";
import { ArrowRight, Check, ChevronDown, Plus, Trash } from "lucide-react";

import { EnumAction, EnumResource } from "@/app/dashboard/admin/settings/_types/roles.types";
import { PermissionProtected } from "@/shared/components/protected-component";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { DeliverableDetailedResponseDto } from "../../../../_types";

interface PrecedenceColumnProps {
  deliverable: DeliverableDetailedResponseDto;
  rowIndex: number;
  allDeliverables: DeliverableDetailedResponseDto[];
  openDropdowns: Record<string, boolean>;
  setOpenDropdowns: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onPrecedentSelect: (deliverableId: string, selectedPrecedentId: string) => void;
  milestoneStatus?: string; // Agregar milestoneStatus para la lógica de readonly
}

export function PrecedenceColumn({
  deliverable,
  rowIndex,
  allDeliverables,
  openDropdowns,
  setOpenDropdowns,
  onPrecedentSelect,
  milestoneStatus,
}: PrecedenceColumnProps) {
  const precedentId = (deliverable as any).precedentId;
  const currentDeliverableId = deliverable.id;

  // Caso 1: Primer elemento, no requiere precedente
  if (rowIndex === 0) {
    return (
      <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
        <Badge variant="outline" className="h-6 px-2 text-xs font-medium bg-muted text-muted-foreground border-border">
          <Check className="h-3 w-3 mr-1" />
          Inicial
        </Badge>
      </div>
    );
  }

  // Caso 2: No tiene precedente asignado
  if (!precedentId) {
    return (
      <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
        <PermissionProtected
          permissions={[
            { resource: EnumResource.deliverables, action: EnumAction.write },
            { resource: EnumResource.deliverables, action: EnumAction.manage },
          ]}
          requireAll={false}
          hideOnUnauthorized={false} // Mostrar siempre, pero en readonly si no tiene permisos
          fallback={
            <Button
              variant="outline"
              size="sm"
              className="h-6 px-2 text-xs font-medium border-border bg-background text-muted-foreground rounded-sm flex items-center justify-between cursor-not-allowed opacity-50"
              disabled
            >
              <div className="flex items-center">
                <Plus className="h-3 w-3 mr-1" />
                Asignar
              </div>
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          }
        >
          <DropdownMenu
            open={openDropdowns[currentDeliverableId]}
            onOpenChange={(open) => setOpenDropdowns((prev) => ({ ...prev, [currentDeliverableId]: open }))}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 text-xs font-medium border-border bg-background text-foreground hover:bg-muted rounded-sm flex items-center justify-between"
                disabled={milestoneStatus !== "PLANNING"} // Readonly si milestone no está en PLANNING
              >
                <div className="flex items-center">
                  <Plus className="h-3 w-3 mr-1" />
                  Asignar
                </div>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" className="w-72">
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground border-b">
                Seleccionar precedente
              </div>
              <div className="py-1 max-h-64 overflow-y-auto">
                {allDeliverables
                  .filter((d) => d.id !== currentDeliverableId)
                  .map((d) => {
                    const globalIndex = allDeliverables.findIndex((del) => del.id === d.id) + 1;
                    return (
                      <DropdownMenuItem
                        key={d.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onPrecedentSelect(currentDeliverableId, d.id);
                        }}
                        className="flex items-center gap-2 py-2 px-3 cursor-pointer"
                        disabled={milestoneStatus !== "PLANNING"} // Readonly si milestone no está en PLANNING
                      >
                        <div className="flex items-center justify-center w-4 h-4 rounded bg-primary text-primary-foreground text-xs font-medium">
                          {globalIndex}
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-sm font-medium text-foreground truncate">{d.name || "Sin nombre"}</span>
                          {d.description && (
                            <span className="text-xs text-muted-foreground truncate">{d.description}</span>
                          )}
                        </div>
                      </DropdownMenuItem>
                    );
                  })}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </PermissionProtected>
      </div>
    );
  }

  // Caso 3: Tiene un precedente asignado
  const precedentDeliverable = allDeliverables.find((d) => d.id === precedentId);
  const precedentIndex = allDeliverables.findIndex((d) => d.id === precedentDeliverable?.id) + 1;

  return (
    <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
      <PermissionProtected
        permissions={[
          { resource: EnumResource.deliverables, action: EnumAction.write },
          { resource: EnumResource.deliverables, action: EnumAction.manage },
        ]}
        requireAll={false}
        hideOnUnauthorized={false} // Mostrar siempre, pero en readonly si no tiene permisos
        fallback={
          <Button
            variant="outline"
            size="sm"
            className="h-6 px-2 text-xs font-medium border-border bg-background text-muted-foreground cursor-not-allowed flex items-center justify-between rounded-sm opacity-50"
            disabled
          >
            <div className="flex items-center">
              <ArrowRight className="h-3 w-3 mr-1" />#{precedentIndex}{" "}
              {precedentDeliverable?.name || `ID: ${precedentId}`}
            </div>
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        }
      >
        <DropdownMenu
          open={openDropdowns[currentDeliverableId]}
          onOpenChange={(open) => setOpenDropdowns((prev) => ({ ...prev, [currentDeliverableId]: open }))}
        >
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-6 px-2 text-xs font-medium border-border bg-background text-foreground hover:bg-muted cursor-pointer flex items-center justify-between rounded-sm"
              disabled={milestoneStatus !== "PLANNING"} // Readonly si milestone no está en PLANNING
            >
              <div className="flex items-center">
                <ArrowRight className="h-3 w-3 mr-1" />#{precedentIndex}{" "}
                {precedentDeliverable?.name || `ID: ${precedentId}`}
              </div>
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="start" className="w-72">
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground border-b">Cambiar precedente</div>
            <div className="py-1 max-h-64 overflow-y-auto">
              {allDeliverables
                .filter((d) => d.id !== currentDeliverableId)
                .map((d) => {
                  const globalIndex = allDeliverables.findIndex((del) => del.id === d.id) + 1;
                  return (
                    <DropdownMenuItem
                      key={d.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onPrecedentSelect(currentDeliverableId, d.id);
                      }}
                      className="flex items-center gap-2 py-2 px-3 cursor-pointer"
                      disabled={milestoneStatus !== "PLANNING"} // Readonly si milestone no está en PLANNING
                    >
                      <div className="flex items-center justify-center w-4 h-4 rounded bg-primary text-primary-foreground text-xs font-medium">
                        {globalIndex}
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-sm font-medium text-foreground truncate">{d.name || "Sin nombre"}</span>
                        {d.description && (
                          <span className="text-xs text-muted-foreground truncate">{d.description}</span>
                        )}
                      </div>
                    </DropdownMenuItem>
                  );
                })}
            </div>
            <div className="border-t" />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onPrecedentSelect(currentDeliverableId, "");
              }}
              className="flex items-center gap-2 py-2 px-3 cursor-pointer text-muted-foreground hover:text-destructive"
              disabled={milestoneStatus !== "PLANNING"} // Readonly si milestone no está en PLANNING
            >
              <Trash className="h-3 w-3" />
              <span className="text-xs">Quitar precedente</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </PermissionProtected>
    </div>
  );
}
