import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ProjectServiceResponse } from "../_types/tracking.types";

interface ProjectServiceCardProps {
  service: ProjectServiceResponse;
}

export default function ProjectServiceCard({ service }: ProjectServiceCardProps) {
  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>{service.name}</CardTitle>
        <CardDescription>{service.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>{service.isActive ? "Activo" : "Inactivo"}</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline">Ver más</Button>
      </CardFooter>
    </Card>
  );
}
