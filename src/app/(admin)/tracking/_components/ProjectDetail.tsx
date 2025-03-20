import AlertMessage from "@/shared/components/alerts/Alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { useProjectStore } from "../_hooks/useProjectStore";
import ProjectServices from "./ProjectServices";

export default function ProjectDetail() {
  const { selectedProject } = useProjectStore();
  if (!selectedProject)
    return (
      <AlertMessage title="No hay proyecto seleccionado" description="No hay proyecto seleccionado" variant="default" />
    );
  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{selectedProject?.typeContract}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground text-balance">
          {selectedProject?.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ProjectServices projectId={selectedProject?.id} />
      </CardContent>
      <CardFooter>
        <p>Card Footer</p>
      </CardFooter>
    </Card>
  );
}
