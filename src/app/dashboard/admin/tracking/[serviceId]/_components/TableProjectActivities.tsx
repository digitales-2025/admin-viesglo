import { useMemo } from "react";

import { DataTable } from "@/shared/components/data-table/DataTable";
import { useActivitiesProject } from "../../_hooks/useActivitiesProject";
import { useUsersProject } from "../../_hooks/useProjectTraking";
import { columnsActivities } from "./project-activities.column";

interface TableProjectActivitiesProps {
  objectiveId: string;
}

export default function TableProjectActivities({ objectiveId }: TableProjectActivitiesProps) {
  const { data: activities, isLoading, error } = useActivitiesProject(objectiveId);
  const { data: users, isLoading: isLoadingUsers } = useUsersProject();
  const columns = useMemo(() => columnsActivities(users || [], objectiveId), [users, objectiveId]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-muted-foreground">Hubo un error al cargar las actividades</p>
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={activities || []}
      isLoading={isLoading || isLoadingUsers}
      toolBar={false}
      pagination={false}
      className="rounded-t-none"
    />
  );
}
