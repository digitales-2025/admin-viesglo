import { useRouter } from "next/navigation";
import { CheckCircle, Circle, Clock, Edit, MoreVertical, Trash } from "lucide-react";

import { ProtectedComponent } from "@/auth/presentation/components/ProtectedComponent";
import { Button } from "@/shared/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Progress } from "@/shared/components/ui/progress";
import { cn } from "@/shared/lib/utils";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { ProjectServiceResponse } from "../_types/tracking.types";
import { EnumAction, EnumResource } from "../../roles/_utils/groupedPermission";
import { PROJECT_SERVICE_MODULE } from "./ProjectsDialogs";

interface ProjectServiceCardProps {
  service: ProjectServiceResponse;
}

export default function ProjectServiceCard({ service }: ProjectServiceCardProps) {
  const { open } = useDialogStore();

  const handleEditService = () => {
    open(PROJECT_SERVICE_MODULE, "edit", service);
  };

  const handleDeleteService = () => {
    open(PROJECT_SERVICE_MODULE, "delete", service);
  };

  const router = useRouter();

  return (
    <Card
      className="shadow-none border-transparent p-2 px-1 cursor-pointer hover:bg-accent/70 transition-all duration-300 hover:border-dashed hover:border-sky-500/50 "
      onClick={(e) => {
        e.stopPropagation();
        router.push(`/dashboard/admin/tracking/${service.id}`);
      }}
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
          <ProtectedComponent
            requiredPermissions={[
              { resource: EnumResource.projects, action: EnumAction.edit },
              { resource: EnumResource.projects, action: EnumAction.delete },
            ]}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <ProtectedComponent
                  requiredPermissions={[{ resource: EnumResource.projects, action: EnumAction.edit }]}
                >
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditService();
                    }}
                  >
                    Editar
                    <DropdownMenuShortcut>
                      <Edit />
                    </DropdownMenuShortcut>
                  </DropdownMenuItem>
                </ProtectedComponent>
                <ProtectedComponent
                  requiredPermissions={[{ resource: EnumResource.projects, action: EnumAction.delete }]}
                >
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteService();
                    }}
                  >
                    Eliminar
                    <DropdownMenuShortcut>
                      <Trash />
                    </DropdownMenuShortcut>
                  </DropdownMenuItem>
                </ProtectedComponent>
              </DropdownMenuContent>
            </DropdownMenu>
          </ProtectedComponent>
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
  );
}
