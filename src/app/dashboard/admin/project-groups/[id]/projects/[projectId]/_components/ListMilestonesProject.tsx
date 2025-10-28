import { useParams } from "next/navigation";

import { EnumAction, EnumResource } from "@/app/dashboard/admin/settings/_types/roles.types";
import { PermissionProtected } from "@/shared/components/protected-component";
import { NoInfoSection } from "@/shared/components/ui/noinfosection";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useProjectContext } from "../_context/ProjectContext";
import { MilestoneDetailedResponseDto } from "../../_types";
import CardProjectMilestone from "./CardProjectMilestone";

export const ListMilestonesProject = () => {
  const params = useParams();
  const projectId = params.projectId as string;
  const { projectData, isLoading: isProjectDataLoading } = useProjectContext();
  const milestones = projectData?.milestones;

  if (!projectData || milestones?.length === 0) {
    return <NoInfoSection message="No hay hitos aún. Crea el primero para comenzar a gestionar el proyecto." />;
  }

  return (
    <PermissionProtected
      permissions={[
        { resource: EnumResource.milestones, action: EnumAction.read },
        { resource: EnumResource.projects, action: EnumAction.read },
      ]}
      requireAll={false} // OR: necesita AL MENOS UNO de estos permisos
      fallback={<NoInfoSection message="No tienes permisos para ver los hitos de este proyecto." />}
    >
      <div className="flex flex-col gap-2 pl-4">
        {isProjectDataLoading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Skeleton key={idx} className="h-24 w-full" />
            ))}
          </div>
        ) : (
          milestones?.map((milestone: MilestoneDetailedResponseDto) => (
            <CardProjectMilestone
              key={milestone.id}
              milestone={milestone}
              projectId={projectId}
              projectStartDate={projectData.startDate || ""}
              projectEndDate={projectData.endDate || ""}
              projectStatus={projectData.status}
            />
          ))
        )}
      </div>
    </PermissionProtected>
  );
};
