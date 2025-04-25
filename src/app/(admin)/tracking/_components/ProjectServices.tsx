import { memo } from "react";
import { Info, Loader2, PlusCircle } from "lucide-react";

import AlertMessage from "@/shared/components/alerts/Alert";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { useServicesProject } from "../_hooks/useServicesProject";
import { ProjectResponse } from "../_types/tracking.types";
import ProjectServiceCard from "./ProjectServiceCard";

interface ProjectServicesProps {
  project: ProjectResponse;
}

// Componente optimizado con memo para evitar re-renders innecesarios
const ProjectServices = memo(function ProjectServices({ project }: ProjectServicesProps) {
  const { open } = useDialogStore();
  const isMobile = useIsMobile();
  const { data: services, isLoading, error } = useServicesProject(project.id);

  if (!project)
    return (
      <AlertMessage
        title="No hay servicios"
        description="No hay servicios asignados a este proyecto"
        variant="default"
      />
    );

  if (error)
    return <AlertMessage title="Error al cargar los servicios" description={error.message} variant="destructive" />;

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="size-5 sm:size-6 animate-spin text-primary" />
      </div>
    );

  if (!services)
    return (
      <AlertMessage
        title="No hay servicios"
        description="No hay servicios asignados a este proyecto"
        variant="default"
      />
    );

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex justify-between items-center flex-shrink-0 mb-2 sm:mb-4">
        <div className="flex items-center gap-1 sm:gap-2">
          <h3 className="text-base sm:text-lg font-bold flex items-center gap-1 sm:gap-2">
            Servicios{" "}
            <Badge variant="outline" className="text-xs">
              {services.length}
            </Badge>
          </h3>
          {!isMobile && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="size-3 sm:size-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-xs sm:text-sm">
                    Aquí puedes gestionar los servicios asociados a este proyecto
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <Button
          variant="outline"
          size={isMobile ? "sm" : "default"}
          className="text-xs sm:text-sm font-medium h-8 sm:h-9"
          onClick={() => open("project-services", "create")}
        >
          <PlusCircle className="size-3 sm:size-4 mr-1 sm:mr-2" />
          <span className={isMobile ? "sr-only" : ""}>Agregar servicio</span>
        </Button>
      </div>
      {services.length > 0 ? (
        <ScrollArea className="flex-grow min-h-0 bg-muted rounded-md p-2 sm:p-4 relative">
          {services.length > 2 && !isMobile && (
            <div className="absolute bottom-2 right-2 z-10 bg-background/80 text-muted-foreground text-xs px-2 py-1 rounded-sm border backdrop-blur-sm">
              Desplaza para ver más
            </div>
          )}
          <div className="flex flex-col gap-2 sm:gap-4 pr-2 sm:pr-4">
            {services.map((service) => (
              <ProjectServiceCard key={service.id} service={service} />
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="flex-grow min-h-0 flex items-center justify-center border rounded-md p-3 sm:p-8">
          <div className="text-center">
            <h4 className="font-medium text-base sm:text-lg mb-1 sm:mb-2">No hay servicios asociados</h4>
            <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-4">
              Agrega servicios a este proyecto para comenzar
            </p>
            <Button
              onClick={() => open("project-services", "create")}
              size={isMobile ? "sm" : "default"}
              className="text-xs sm:text-sm"
            >
              <PlusCircle className="size-3 sm:size-4 mr-1 sm:mr-2" />
              Agregar primer servicio
            </Button>
          </div>
        </div>
      )}
    </div>
  );
});

export default ProjectServices;
