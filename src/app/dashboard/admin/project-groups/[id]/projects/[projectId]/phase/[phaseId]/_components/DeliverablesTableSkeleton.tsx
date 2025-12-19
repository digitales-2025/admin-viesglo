import { Skeleton } from "@/shared/components/ui/skeleton";

export function DeliverablesTableSkeleton() {
  return (
    <div className="space-y-4 px-6 pb-6">
      {/* Header de la tabla con búsqueda y filtros */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Skeleton className="h-10 w-full sm:w-80" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Tabla skeleton */}
      <div className="border rounded-lg overflow-hidden">
        {/* Header de la tabla */}
        <div className="border-b bg-muted/50 p-4">
          <div className="grid grid-cols-12 gap-4">
            <Skeleton className="h-4 w-full col-span-2" />
            <Skeleton className="h-4 w-full col-span-2" />
            <Skeleton className="h-4 w-full col-span-2" />
            <Skeleton className="h-4 w-full col-span-2" />
            <Skeleton className="h-4 w-full col-span-2" />
            <Skeleton className="h-4 w-full col-span-2" />
          </div>
        </div>

        {/* Filas de la tabla */}
        <div className="divide-y">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="p-4">
              <div className="grid grid-cols-12 gap-4 items-center">
                <Skeleton className="h-4 w-full col-span-2" />
                <Skeleton className="h-4 w-full col-span-2" />
                <Skeleton className="h-4 w-full col-span-2" />
                <Skeleton className="h-4 w-full col-span-2" />
                <Skeleton className="h-4 w-full col-span-2" />
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Paginación skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>
    </div>
  );
}
