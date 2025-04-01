import { Plus } from "lucide-react";

import AlertMessage from "@/shared/components/alerts/Alert";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { ProjectResponse } from "../_types/tracking.types";
import ProjectServiceCard from "./ProjectServiceCard";

interface ProjectServicesProps {
  project: ProjectResponse;
}

export default function ProjectServices({ project }: ProjectServicesProps) {
  if (!project)
    return (
      <AlertMessage
        title="No hay servicios"
        description="No hay servicios asignados a este proyecto"
        variant="default"
      />
    );
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold flex items-center gap-2">
          Servicios <Badge variant="outline">{project.services.length}</Badge>
        </h3>
        <Button variant="outline" onClick={() => open("services", "create")}>
          <Plus className="size-4 mr-2" />
          Agregar servicio
        </Button>
      </div>
      <div className="flex flex-col gap-4">
        {project.services.length > 0 ? (
          project.services.map((service) => <ProjectServiceCard key={service.id} service={service} />)
        ) : (
          <AlertMessage
            title="No hay servicios"
            description="No hay servicios asignados a este proyecto"
            variant="default"
          />
        )}
      </div>
    </div>
  );
}
