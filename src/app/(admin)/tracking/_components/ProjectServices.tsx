import { Info, PlusCircle } from "lucide-react";

import AlertMessage from "@/shared/components/alerts/Alert";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { ProjectResponse } from "../_types/tracking.types";
import ProjectServiceCard from "./ProjectServiceCard";

interface ProjectServicesProps {
  project: ProjectResponse;
}

export default function ProjectServices({ project }: ProjectServicesProps) {
  const { open } = useDialogStore();

  if (!project)
    return (
      <AlertMessage
        title="No hay servicios"
        description="No hay servicios asignados a este proyecto"
        variant="default"
      />
    );
  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex justify-between items-center flex-shrink-0 mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold flex items-center gap-2">
            Servicios <Badge variant="outline">{project.services.length}</Badge>
          </h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="size-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Aquí puedes gestionar los servicios asociados a este proyecto</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Button variant="outline" size="sm" className="font-medium" onClick={() => open("project-services", "create")}>
          <PlusCircle className="size-4 mr-2" />
          Agregar servicio
        </Button>
      </div>
      {project.services.length > 0 ? (
        <ScrollArea className="flex-grow min-h-0 border rounded-md p-4 relative">
          {project.services.length > 3 && (
            <div className="absolute bottom-2 right-2 z-10 bg-background/80 text-muted-foreground text-xs px-2 py-1 rounded-sm border backdrop-blur-sm">
              Desplaza para ver más
            </div>
          )}
          <div className="flex flex-col gap-4 pr-4">
            {project.services.map((service) => (
              <ProjectServiceCard key={service.id} service={service} />
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="flex-grow min-h-0 flex items-center justify-center border rounded-md p-4 sm:p-8">
          <div className="text-center">
            <h4 className="font-medium text-lg mb-2">No hay servicios asociados</h4>
            <p className="text-muted-foreground mb-4">Agrega servicios a este proyecto para comenzar</p>
            <Button onClick={() => open("project-services", "create")}>
              <PlusCircle className="size-4 mr-2" />
              Agregar primer servicio
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
