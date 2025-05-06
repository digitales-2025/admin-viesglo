import { Loader2 } from "lucide-react";

import { useObjectivesProject } from "@/app/(admin)/tracking/_hooks/useObjectivesProject";
import { NoInfoSection } from "@/shared/components/ui/noinfosection";
import CardProjectObjective from "./CardProjectObjective";

interface ListObjectivesProps {
  serviceId: string;
}

export const ListObjectives = ({ serviceId }: ListObjectivesProps) => {
  const { data: objectives, isLoading } = useObjectivesProject(serviceId);

  if (isLoading) {
    return (
      <div>
        <Loader2 className="w-4 h-4 animate-spin" />
      </div>
    );
  }

  if (!objectives) {
    return <NoInfoSection message="No se encontraron objetivos" />;
  }

  if (objectives?.length === 0) {
    return <NoInfoSection message="No se encontraron objetivos" />;
  }

  return (
    <div className="flex flex-col gap-4">
      {objectives?.map((objective) => <CardProjectObjective key={objective.id} objective={objective} />)}
    </div>
  );
};
