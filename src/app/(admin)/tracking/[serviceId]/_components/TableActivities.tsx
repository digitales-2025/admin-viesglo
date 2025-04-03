import { useMemo } from "react";

import { DataTable } from "@/shared/components/data-table/DataTable";
import { ProjectActivityResponse } from "../../_types/tracking.types";
import { columnsActivities } from "./project-activities.column";

interface TableActivitiesProps {
  activities: ProjectActivityResponse[];
}

export default function TableActivities({ activities }: TableActivitiesProps) {
  const columns = useMemo(() => columnsActivities(), []);

  return <DataTable className="border-none" columns={columns} data={activities} toolBar={false} pagination={false} />;
}
