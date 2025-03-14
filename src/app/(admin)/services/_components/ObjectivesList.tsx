import { Loader2, Plus } from "lucide-react";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Separator } from "@/shared/components/ui/separator";
import { cn } from "@/shared/lib/utils";
import { useObjectivesByServiceId } from "../_hooks/useObjectives";
import { useServiceStore } from "../_hooks/useServiceStore";

export default function ObjectivesList() {
  const { selectedService, setSelectedObjective, selectedObjective } = useServiceStore();

  const { data: objectives, isLoading, error } = useObjectivesByServiceId(selectedService?.id || "");

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between min-h-14">
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-bold">Lista de Objetivos</h3>
        </div>
        <Button size="sm">
          <Plus className="w-4 h-4" />
          Nuevo Objetivo
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
            {objectives?.map((objective) => (
              <Card
                key={objective.id}
                className={cn(
                  "shadow-none hover:cursor-pointer",
                  selectedObjective?.id === objective.id && "border-primary"
                )}
                onClick={() => setSelectedObjective(objective)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 justify-between">
                    {objective.name}
                    <Badge variant="outline">{objective.activities?.length} Actividades</Badge>
                  </CardTitle>
                  <CardDescription>{objective.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
