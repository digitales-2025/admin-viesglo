import { useParams } from "next/navigation";

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

  console.log(JSON.stringify(projectData, null, 2));

  if (!projectData || milestones?.length === 0) {
    return <NoInfoSection message="No hay hitos aún. Crea el primero para comenzar a gestionar el proyecto." />;
  }

  return (
    <div className="flex flex-col">
      {isProjectDataLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Skeleton key={idx} className="h-24 w-full" />
          ))}
        </div>
      ) : (
        milestones?.map((milestone: MilestoneDetailedResponseDto) => (
          <CardProjectMilestone key={milestone.id} milestone={milestone} projectId={projectId} />
        ))
      )}
    </div>
  );
};
