import { ChevronRight, Plus, SquareDashed } from "lucide-react";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Separator } from "@/shared/components/ui/separator";
import { cn } from "@/shared/lib/utils";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { useServiceStore } from "../_hooks/useServiceStore";
import CardItem from "./CardItem";

export default function ObjectivesList() {
  const { selectedService, setSelectedObjective, selectedObjective, clearOnObjectiveDelete, setSelectedActivity } =
    useServiceStore();

  const { open } = useDialogStore();

  const handleObjectiveClick = (objective: any) => {
    // Si ya está seleccionado, lo deseleccionamos y limpiamos la actividad
    if (selectedObjective?.id === objective.id) {
      setSelectedObjective(null);
      setSelectedActivity(null);
    } else {
      // Si seleccionamos un nuevo objetivo, limpiamos la actividad anterior
      setSelectedObjective(objective);
      setSelectedActivity(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between min-h-14">
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-bold">Lista de Objetivos</h3>
        </div>
        <Button size="sm" disabled={!selectedService} variant="outline" onClick={() => open("objectives", "create")}>
          <Plus className="w-4 h-4" />
          Nuevo Objetivo
        </Button>
      </div>
      <Separator />
      <ScrollArea className="flex-1 h-full">
        <div className="flex flex-col gap-2 p-2">
          {selectedService ? (
            selectedService.objectives?.length && selectedService.objectives?.length > 0 ? (
              selectedService.objectives?.map((objective) => (
                <CardItem
                  key={objective.id}
                  title={objective.name}
                  badge={<Badge variant="outline">{objective.activities?.length} Actividades</Badge>}
                  description={objective.description ?? ""}
                  onClick={() => handleObjectiveClick(objective)}
                  onEdit={() => open("objectives", "edit", objective)}
                  onDelete={() => {
                    clearOnObjectiveDelete(objective.id);
                    open("objectives", "delete", objective);
                  }}
                  className={cn(
                    selectedObjective?.id === objective.id && "border-sky-400  outline-4 outline-sky-300/10"
                  )}
                />
              ))
            ) : (
              <div className="text-center py-12 px-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                  <SquareDashed className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-muted-foreground text-xs">No hay objetivos</h3>
              </div>
            )
          ) : (
            <div className="text-center py-12 px-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                <ChevronRight className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">Selecciona un servicio</h3>
              <p className="text-muted-foreground mt-2">
                Selecciona un servicio desde el lado izquierdo para ver sus objetivos
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
