import { Loader2, Plus } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Separator } from "@/shared/components/ui/separator";
import { cn } from "@/shared/lib/utils";
import { useActivitiesByObjectiveId } from "../_hooks/useActivities";
import { useServiceStore } from "../_hooks/useServiceStore";

export default function ActivitiesList() {
  const { selectedObjective, setSelectedActivity, selectedActivity } = useServiceStore();

  const { data: activities, isLoading, error } = useActivitiesByObjectiveId(selectedObjective?.id || "");

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between min-h-14">
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-bold">Lista de Actividades</h3>
        </div>
        <Button size="sm">
          <Plus className="w-4 h-4" />
          Nueva Actividad
        </Button>
      </div>
      <Separator />
      {error && <div className="flex items-center justify-center h-full">{error.message}</div>}
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      ) : (
        <ScrollArea className="flex-1 h-full">
          <div className="flex flex-col gap-2 p-2">
            {activities?.map((activity) => (
              <Card
                key={activity.id}
                className={cn(
                  "shadow-none hover:cursor-pointer",
                  selectedActivity?.id === activity.id && "border-primary"
                )}
                onClick={() => setSelectedActivity(activity)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 justify-between">{activity.name}</CardTitle>
                  <CardDescription>{activity.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
