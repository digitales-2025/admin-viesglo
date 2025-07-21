"use client";

import * as React from "react";

import { Skeleton } from "../ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

interface DataTableSkeletonProps {
  columns?: number;
  rows?: number;
  showToolbar?: boolean;
  showFilter?: boolean;
  numFilters?: number;
  showPagination?: boolean;
  showColumnHeader?: boolean;
  cellHeight?: number;
  columnWidths?: number[];
  className?: string;
}

export function DataTableSkeleton({
  columns = 5,
  rows = 5,
  showToolbar = true,
  showFilter = true,
  numFilters = 2,
  showPagination = true,
  showColumnHeader = true,
  cellHeight = 40,
  columnWidths: customColumnWidths,
  className = "",
}: DataTableSkeletonProps) {
  // Use fixed widths instead of random ones to avoid hydration mismatch
  const columnWidths = React.useMemo(() => {
    if (customColumnWidths && customColumnWidths.length === columns) {
      return customColumnWidths;
    }

    // Fixed pattern of widths that repeats if needed
    const baseWidths = [120, 150, 100, 180, 130, 160, 140, 110];
    return Array(columns)
      .fill(0)
      .map((_, i) => baseWidths[i % baseWidths.length]);
  }, [columns, customColumnWidths]);

  // Fixed filter widths
  const filterWidths = React.useMemo(() => {
    const baseFilterWidths = [100, 120, 140, 110, 130];
    return Array(numFilters)
      .fill(0)
      .map((_, i) => baseFilterWidths[i % baseFilterWidths.length]);
  }, [numFilters]);

  return (
    <div className={`space-y-4 w-full ${className}`}>
      {/* Toolbar Skeleton */}
      {showToolbar && (
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2">
            {showFilter && (
              <>
                <Skeleton className="h-8 w-[150px] lg:w-[250px]" />
                <div className="flex flex-wrap items-center gap-2">
                  {Array(numFilters)
                    .fill(0)
                    .map((_, index) => (
                      <Skeleton key={`filter-${index}`} className="h-8" style={{ width: `${filterWidths[index]}px` }} />
                    ))}
                </div>
              </>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      )}

      {/* Table Skeleton */}
      <div className="rounded-md border">
        <Table>
          {showColumnHeader && (
            <TableHeader>
              <TableRow>
                {Array(columns)
                  .fill(0)
                  .map((_, index) => (
                    <TableHead key={`header-${index}`} className={index > 2 ? "hidden md:table-cell" : ""}>
                      <Skeleton
                        style={{
                          height: `${Math.floor(cellHeight / 2)}px`,
                          width: `${columnWidths[index]}px`,
                        }}
                      />
                    </TableHead>
                  ))}
              </TableRow>
            </TableHeader>
          )}
          <TableBody>
            {Array(rows)
              .fill(0)
              .map((_, rowIndex) => (
                <TableRow key={`row-${rowIndex}`}>
                  {Array(columns)
                    .fill(0)
                    .map((_, colIndex) => (
                      <TableCell
                        key={`cell-${rowIndex}-${colIndex}`}
                        className={colIndex > 2 ? "hidden md:table-cell" : ""}
                      >
                        <Skeleton
                          style={{
                            height: `${Math.floor(cellHeight / 2)}px`,
                            width: `${columnWidths[colIndex]}px`,
                          }}
                        />
                      </TableCell>
                    ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Skeleton */}
      {showPagination && (
        <div className="flex items-center justify-between px-2">
          <div className="hidden flex-1 sm:block">
            <Skeleton className="h-4 w-[250px]" />
          </div>
          <div className="flex items-center sm:space-x-6 lg:space-x-8">
            <div className="hidden sm:flex items-center space-x-2">
              <Skeleton className="h-8 w-[70px]" />
            </div>
            <div className="flex w-[100px] items-center justify-center">
              <Skeleton className="h-4 w-[80px]" />
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="hidden lg:flex h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="hidden lg:flex h-8 w-8" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
