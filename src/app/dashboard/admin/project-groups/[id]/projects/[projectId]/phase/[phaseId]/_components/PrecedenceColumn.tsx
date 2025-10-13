"use client";

import React from "react";
import { ArrowRight, Check, ChevronDown, Plus, Trash } from "lucide-react";

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
}

export function PrecedenceColumn({
  deliverable,
  rowIndex,
  allDeliverables,
  openDropdowns,
  setOpenDropdowns,
  onPrecedentSelect,
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
        <DropdownMenu
          open={openDropdowns[currentDeliverableId]}
          onOpenChange={(open) => setOpenDropdowns((prev) => ({ ...prev, [currentDeliverableId]: open }))}
        >
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-6 px-2 text-xs font-medium border-border bg-background text-foreground hover:bg-muted rounded-sm flex items-center justify-between"
            >
              <div className="flex items-center">
                <Plus className="h-3 w-3 mr-1" />
                Asignar
              </div>
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="start" className="w-72">
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground border-b">Seleccionar precedente</div>
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
      </div>
    );
  }

  // Caso 3: Tiene un precedente asignado
  const precedentDeliverable = allDeliverables.find((d) => d.id === precedentId);
  const precedentIndex = allDeliverables.findIndex((d) => d.id === precedentDeliverable?.id) + 1;

  return (
    <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
      <DropdownMenu
        open={openDropdowns[currentDeliverableId]}
        onOpenChange={(open) => setOpenDropdowns((prev) => ({ ...prev, [currentDeliverableId]: open }))}
      >
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-6 px-2 text-xs font-medium border-border bg-background text-foreground hover:bg-muted cursor-pointer flex items-center justify-between rounded-sm"
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
                  >
                    <div className="flex items-center justify-center w-4 h-4 rounded bg-primary text-primary-foreground text-xs font-medium">
                      {globalIndex}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-medium text-foreground truncate">{d.name || "Sin nombre"}</span>
                      {d.description && <span className="text-xs text-muted-foreground truncate">{d.description}</span>}
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
          >
            <Trash className="h-3 w-3" />
            <span className="text-xs">Quitar precedente</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
