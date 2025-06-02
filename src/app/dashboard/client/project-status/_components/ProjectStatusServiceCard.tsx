import { useRouter } from "next/navigation";
import { CheckCircle, Circle, Clock } from "lucide-react";

import { ProjectServiceResponse } from "@/app/dashboard/admin/tracking/_types/tracking.types";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";
import { cn } from "@/shared/lib/utils";

interface ProjectStatusServiceCardProps {
  service: ProjectServiceResponse;
}

export default function ProjectStatusServiceCard({ service }: ProjectStatusServiceCardProps) {
  const router = useRouter();

  return (
    <div className="max-h-[500px] overflow-auto scrollbar-none">
      <Card
        className="shadow-none border-transparent p-2 px-1 cursor-pointer hover:bg-accent/70 transition-all duration-300 hover:border-dashed hover:border-sky-500/50 "
        onClick={() => router.push(`/dashboard/client/project-status/${service.id}`)}
      >
        <CardHeader>
          <CardTitle className="grid grid-cols-[1fr_auto] justify-between items-center gap-4">
            <div className="inline-flex gap-2 items-center justify-between">
              <div className="flex items-center gap-2">
                {service.progress === 100 ? (
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                ) : service.progress === 0 ? (
                  <Circle className="w-4 h-4 text-red-500" />
                ) : (
                  <Clock className="w-4 h-4 text-yellow-500" />
                )}
                <span className="first-letter:uppercase">{service.name}</span>
              </div>
            </div>
          </CardTitle>
          <CardDescription className="flex flex-col gap-2 ">{service.description}</CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col gap-2 w-full">
          <div className="flex items-center gap-2 justify-between w-full text-sm text-muted-foreground">
            <span className="first-letter:uppercase">
              {service.completedActivities} / {service.activities} Actividades completadas
            </span>
            <span className="flex items-center gap-2">{service.progress?.toFixed(0)}%</span>
          </div>
          <Progress
            value={service.progress}
            color={cn(
              service.progress && service.progress < 50 && "bg-orange-500",
              service.progress && service.progress >= 50 && "bg-yellow-500",
              service.progress && service.progress >= 90 && "bg-teal-500",
              service.progress && service.progress >= 100 && "bg-emerald-500"
            )}
            className="bg-slate-500/10"
          />
        </CardFooter>
      </Card>
    </div>
  );
}
