import { ChevronRight, Loader2, Paperclip, Plus, SquareDashed } from "lucide-react";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Separator } from "@/shared/components/ui/separator";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { useActivitiesByObjectiveId } from "../_hooks/useActivities";
import { useServiceStore } from "../_hooks/useServiceStore";
import CardItem from "./CardItem";

export default function ActivitiesList() {
  const { selectedObjective, setSelectedActivity, selectedActivity, clearOnActivityDelete } = useServiceStore();

  const { data: activities, isLoading, error } = useActivitiesByObjectiveId(selectedObjective?.id || "");

  const { open } = useDialogStore();

  const handleActivityClick = (activity: any) => {
    // Si ya está seleccionada, la deseleccionamos
    if (selectedActivity?.id === activity.id) {
      setSelectedActivity(null);
    } else {
      // Si no está seleccionada, la seleccionamos
      setSelectedActivity(activity);
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between min-h-14">
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-bold">Lista de Actividades</h3>
        </div>
        <Button size="sm" disabled={!selectedObjective} variant="outline" onClick={() => open("activities", "create")}>
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
            {selectedObjective ? (
              activities?.length && activities?.length > 0 ? (
                activities?.map((activity) => (
                  <CardItem
                    key={activity.id}
                    title={activity.name}
                    description={activity.description ?? ""}
                    onClick={() => handleActivityClick(activity)}
                    onEdit={() => {
                      clearOnActivityDelete(activity.id);
                      open("activities", "edit", activity);
                    }}
                    onDelete={() => {
                      clearOnActivityDelete(activity.id);
                      open("activities", "delete", activity);
                    }}
                    className={
                      activity.id === selectedActivity?.id
                        ? "border-sky-400 outline-4 outline-sky-300/10"
                        : "hover:cursor-pointer"
                    }
                    badge={
                      activity.evidenceRequired && (
                        <Badge variant="infoOutline">
                          <Paperclip className="w-4 h-4" />
                          Requiere evidencia
                        </Badge>
                      )
                    }
                  />
                ))
              ) : (
                <div className="text-center py-12 px-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                    <SquareDashed className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className=" text-muted-foreground text-xs">No hay actividades para este objetivo</p>
                </div>
              )
            ) : (
              <div className="text-center py-12 px-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                  <ChevronRight className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">Selecciona un objetivo</h3>
                <p className="text-muted-foreground mt-2">
                  Selecciona un objetivo desde el lado izquierdo para ver sus actividades
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
