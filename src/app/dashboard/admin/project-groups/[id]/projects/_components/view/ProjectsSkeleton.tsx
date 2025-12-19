import { Card, CardContent, CardFooter } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function ProjectsSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index}>
          <CardContent>
            {/* Header con botones y título */}
            <div className="flex items-center justify-between mb-3 gap-4">
              <Skeleton className="h-4 w-4 shrink-0" />
              <Skeleton className="h-5 w-32 flex-1" />
              <Skeleton className="h-4 w-4 shrink-0" />
            </div>

            {/* Bullet Chart skeleton */}
            <div className="mb-4">
              <Skeleton className="h-6 w-full rounded-full mb-3" />
              <div className="flex items-center justify-between px-1">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>

            {/* Información del proyecto */}
            <div className="space-y-2">
              {/* Cliente */}
              <div className="flex flex-row items-center gap-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>

              {/* Coordinador */}
              <div className="flex flex-row items-center gap-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-28" />
              </div>

              {/* Estado */}
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-6 w-20 rounded-md" />
              </div>

              {/* Hitos */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-4 w-8" />
              </div>

              {/* Nivel de retraso */}
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-6 w-24 rounded-md" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Skeleton className="h-4 w-4 shrink-0" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-6 w-20 rounded-md" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
