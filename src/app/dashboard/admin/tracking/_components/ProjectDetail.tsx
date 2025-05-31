import { memo } from "react";
import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ClockArrowUp, User, UserCog } from "lucide-react";

import AlertMessage from "@/shared/components/alerts/Alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { useProjectStore } from "../_hooks/useProjectStore";
import ProjectServices from "./ProjectServices";

// Usar memo para evitar re-renders innecesarios
const ProjectDetail = memo(function ProjectDetail() {
  const { selectedProject } = useProjectStore();

  if (!selectedProject)
    return (
      <AlertMessage title="No hay proyecto seleccionado" description="No hay proyecto seleccionado" variant="default" />
    );

  // Formatear fecha solo cuando existe (evita cálculos innecesarios)
  const formattedDate = selectedProject?.startDate
    ? format(new TZDate(selectedProject.startDate, "America/Lima"), "PPP", { locale: es })
    : "No hay fecha de inicio";

  return (
    <Card className="shadow-none border-none h-full flex flex-col bg-accent/10">
      <CardHeader className="flex-shrink-0 pb-3 px-3 pt-3 sm:px-6 sm:pt-6">
        <CardTitle className="text-xl sm:text-2xl font-bold first-letter:uppercase line-clamp-2">
          {selectedProject?.typeContract}
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm text-muted-foreground text-balance line-clamp-3">
          {selectedProject?.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col min-h-0 px-3 pb-3 sm:px-6 sm:pb-6">
        <div className="flex flex-col gap-4 sm:gap-6 h-full">
          <div className="flex flex-col gap-2 flex-shrink-0">
            <div className="text-xs sm:text-sm text-muted-foreground grid grid-cols-1 sm:grid-cols-[150px_1fr] lg:grid-cols-[200px_1fr] w-full">
              <span className="flex items-center gap-2">
                <User className="size-3 sm:size-4 shrink-0" />
                Cliente:
              </span>
              <strong className="line-clamp-1 sm:line-clamp-none">{selectedProject?.client.name}</strong>
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground grid grid-cols-1 sm:grid-cols-[150px_1fr] lg:grid-cols-[200px_1fr] w-full">
              <span className="flex items-center gap-2">
                <ClockArrowUp className="size-3 sm:size-4 shrink-0" />
                Fecha de inicio:
              </span>
              <strong>{formattedDate}</strong>
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground grid grid-cols-1 sm:grid-cols-[150px_1fr] lg:grid-cols-[200px_1fr] w-full">
              <span className="flex items-center gap-2">
                <UserCog className="size-3 sm:size-4 shrink-0" />
                Responsable:
              </span>
              <strong className="line-clamp-1 sm:line-clamp-none capitalize">
                {selectedProject.responsibleUser?.fullName}
              </strong>
            </div>
          </div>
          <div className="flex-grow flex flex-col min-h-0">
            <ProjectServices project={selectedProject} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default ProjectDetail;
