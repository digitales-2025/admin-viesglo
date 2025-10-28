import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronRight, Loader2, Paperclip, Plus, SquareDashed } from "lucide-react";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Separator } from "@/shared/components/ui/separator";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { ACTIVITIES_KEYS, useActivitiesByObjectiveId } from "../_hooks/useActivities";
import { OBJECTIVES_KEYS } from "../_hooks/useObjectives";
import { SERVICES_KEYS, useServices } from "../_hooks/useServices";
import { useServiceStore } from "../_hooks/useServiceStore";
import CardItem from "./CardItem";

export default function ActivitiesList() {
  const { selectedObjective, setSelectedActivity, selectedActivity, clearOnActivityDelete, setSelectedObjective } =
    useServiceStore();

  const { data: activities, isLoading, error, refetch } = useActivitiesByObjectiveId(selectedObjective?.id || "");
  const { data: services } = useServices();
  const { open, isOpenForModule } = useDialogStore();
  const queryClient = useQueryClient();
  // Refrescar la lista cuando cambian los servicios (por si el objetivo actual tiene nuevas actividades)
  useEffect(() => {
    if (selectedObjective && services) {
      // Buscar el servicio que contiene este objetivo
      const service = services.find((s) => s.objectives?.some((obj) => obj.id === selectedObjective.id));

      if (service) {
        // Buscar el objetivo actualizado
        const updatedObjective = service.objectives?.find((obj) => obj.id === selectedObjective.id);
        if (updatedObjective) {
          // Actualizar el objetivo seleccionado con los datos más recientes
          setSelectedObjective(updatedObjective);
        }
      }

      // Refrescar la lista de actividades
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [services, selectedObjective?.id, setSelectedObjective, refetch]);

  // Escuchar los diálogos de actividades para refrescar después de crear/editar/eliminar
  useEffect(() => {
    const isActivityDialogOpen = isOpenForModule("activities");

    // Cuando se cierra el diálogo de actividades
    if (!isActivityDialogOpen) {
      // Refrescar todos los datos que puedan haber cambiado
      queryClient.invalidateQueries({ queryKey: ACTIVITIES_KEYS.all });
      queryClient.invalidateQueries({ queryKey: OBJECTIVES_KEYS.all });
      queryClient.invalidateQueries({ queryKey: SERVICES_KEYS.lists() });
    }
  }, [isOpenForModule, queryClient]);

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
      <div className="flex items-start flex-wrap justify-between min-h-14">
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-bold">Lista de Actividades</h3>
        </div>
        <>
          <Button
            size="sm"
            disabled={!selectedObjective}
            variant="outline"
            onClick={() => open("activities", "create")}
          >
            <Plus className="w-4 h-4" />
            Nueva Actividad
          </Button>
        </>
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
