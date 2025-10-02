"use client";

import * as React from "react";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/shared/components/ui/context-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { cn } from "@/shared/lib/utils";

type ColumnDef<TRow> = {
  key: keyof TRow | "actions";
  header: React.ReactNode;
  render?: (row: TRow) => React.ReactNode;
  className?: string;
};

type ContextMenuAction<TRow> = {
  label: string;
  onClick: (row: TRow) => void;
  disabled?: (row: TRow) => boolean;
  destructive?: boolean;
  icon?: React.ReactNode;
  children?: Array<ContextMenuAction<TRow>>;
};

export interface ContextMenuTableProps<TRow> {
  columns: Array<ColumnDef<TRow>>;
  data: TRow[];
  getRowId: (row: TRow, index: number) => string;
  actions?: Array<ContextMenuAction<TRow>>;
  className?: string;
  emptyMessage?: string;
  onRowClick?: (row: TRow, index: number) => void;
}

export function ContextMenuTable<TRow>({
  columns,
  data,
  getRowId,
  actions,
  className,
  emptyMessage = "Sin datos",
  onRowClick,
}: ContextMenuTableProps<TRow>) {
  return (
    <div className={cn("w-full rounded-lg border overflow-x-auto", className)}>
      <Table>
        <TableHeader>
          <TableRow className="border-b">
            {columns.map((col) => (
              <TableHead key={String(col.key)} className={cn("font-medium", col.className)}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center text-sm text-muted-foreground py-8">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, index) => {
              const rowId = getRowId(row, index);
              return (
                <ContextMenu key={rowId}>
                  <ContextMenuTrigger asChild>
                    <TableRow
                      className="cursor-pointer hover:bg-muted/30 transition-colors border-b last:border-b-0"
                      onClick={() => onRowClick?.(row, index)}
                    >
                      {columns.map((col) => (
                        <TableCell key={String(col.key)} className={col.className}>
                          {col.render ? col.render(row) : (row[col.key as keyof TRow] as React.ReactNode)}
                        </TableCell>
                      ))}
                    </TableRow>
                  </ContextMenuTrigger>
                  {actions && actions.length > 0 && (
                    <ContextMenuContent className="w-52">
                      {actions.map((action, i) => {
                        const key = `${rowId}-action-${i}`;
                        const isDisabled = action.disabled ? action.disabled(row) : false;
                        if (action.children && action.children.length > 0) {
                          return (
                            <React.Fragment key={key}>
                              {i > 0 && <ContextMenuSeparator />}
                              <ContextMenuSub>
                                <ContextMenuSubTrigger disabled={isDisabled}>
                                  {action.icon && action.icon}
                                  {action.label}
                                </ContextMenuSubTrigger>
                                <ContextMenuSubContent className="w-48">
                                  {action.children.map((child, ci) => (
                                    <ContextMenuItem
                                      key={`${key}-child-${ci}`}
                                      onClick={() => child.onClick(row)}
                                      disabled={child.disabled ? child.disabled(row) : false}
                                      {...(child.destructive ? { variant: "destructive" as const } : {})}
                                    >
                                      {child.icon && child.icon}
                                      {child.label}
                                    </ContextMenuItem>
                                  ))}
                                </ContextMenuSubContent>
                              </ContextMenuSub>
                            </React.Fragment>
                          );
                        }
                        return (
                          <React.Fragment key={key}>
                            {i > 0 && <ContextMenuSeparator />}
                            <ContextMenuItem
                              onClick={() => action.onClick(row)}
                              disabled={isDisabled}
                              {...(action.destructive ? { variant: "destructive" as const } : {})}
                            >
                              {action.icon && action.icon}
                              {action.label}
                            </ContextMenuItem>
                          </React.Fragment>
                        );
                      })}
                    </ContextMenuContent>
                  )}
                </ContextMenu>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
