import AlertMessage from "@/shared/components/alerts/Alert";
import { useServicesProject } from "../_hooks/useServicesProject";
import ProjectServiceCard from "./ProjectServiceCard";

interface ProjectServicesProps {
  projectId: string;
}

export default function ProjectServices({ projectId }: ProjectServicesProps) {
  const { data: services, isLoading, error } = useServicesProject(projectId);
  if (isLoading) return <div>Cargando...</div>;
  if (error) return <AlertMessage title="Error" description={error.message} variant="destructive" />;
  if (!services)
    return (
      <AlertMessage
        title="No hay servicios"
        description="No hay servicios asignados a este proyecto"
        variant="default"
      />
    );
  return (
    <div className="flex flex-col gap-4">
      {services.length > 0 ? (
        services.map((service) => <ProjectServiceCard key={service.id} service={service} />)
      ) : (
        <AlertMessage
          title="No hay servicios"
          description="No hay servicios asignados a este proyecto"
          variant="default"
        />
      )}
    </div>
  );
}
