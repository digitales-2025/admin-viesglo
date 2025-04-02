import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ClockArrowUp, User } from "lucide-react";

import AlertMessage from "@/shared/components/alerts/Alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { useProjectStore } from "../_hooks/useProjectStore";
import ProjectServices from "./ProjectServices";

export default function ProjectDetail() {
  const { selectedProject } = useProjectStore();
  if (!selectedProject)
    return (
      <AlertMessage title="No hay proyecto seleccionado" description="No hay proyecto seleccionado" variant="default" />
    );
  return (
    <Card className="shadow-none border-none h-full flex flex-col">
      <CardHeader className="flex-shrink-0 pb-3">
        <CardTitle className="text-2xl font-bold first-letter:uppercase">{selectedProject?.typeContract}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground text-balance">
          {selectedProject?.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col min-h-0">
        <div className="flex flex-col gap-6 h-full">
          <div className="flex flex-col gap-2 flex-shrink-0">
            <div className="text-sm text-muted-foreground grid grid-cols-1 sm:grid-cols-[200px_1fr] w-full">
              <span className="flex items-center gap-2">
                <User className="size-4 shrink-0" />
                Cliente:
              </span>{" "}
              <strong>{selectedProject?.client.name}</strong>
            </div>
            <div className="text-sm text-muted-foreground grid grid-cols-1 sm:grid-cols-[200px_1fr] w-full">
              <span className="flex items-center gap-2">
                <ClockArrowUp className="size-4 shrink-0" />
                Fecha de inicio:
              </span>{" "}
              <strong>
                {selectedProject?.startDate
                  ? format(new TZDate(selectedProject?.startDate, "America/Lima"), "PPP", { locale: es })
                  : "No hay fecha de inicio"}
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
}
