import { useMemo } from "react";

import { DataTable } from "@/shared/components/data-table/DataTable";
import { useActivitiesProject } from "../../_hooks/useActivitiesProject";
import { columnsActivities } from "./project-activities.column";

interface TableActivitiesProps {
  objectiveId: string;
}

export default function TableActivities({ objectiveId }: TableActivitiesProps) {
  const { data: activities, isLoading, error } = useActivitiesProject(objectiveId);
  const columns = useMemo(() => columnsActivities(), []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-muted-foreground">Hubo un error al cargar las actividades</p>
      </div>
    );
  }

  return (
    <DataTable
      className="border-none max-h-[calc(100vh-20rem)] overflow-y-auto"
      columns={columns}
      data={activities || []}
      isLoading={isLoading}
      toolBar={false}
      pagination={false}
    />
  );
}
