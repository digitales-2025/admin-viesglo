import { Loader2, Plus } from "lucide-react";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Separator } from "@/shared/components/ui/separator";
import { cn } from "@/shared/lib/utils";
import { useServices } from "../_hooks/useServices";
import { useServiceStore } from "../_hooks/useServiceStore";
import CardItem from "./CardItem";

export default function ServicesList() {
  const { data: services, isLoading, error } = useServices();
  const { setSelectedService, selectedService } = useServiceStore();

  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between min-h-3.5">
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-bold">Lista de Servicios</h3>
          <p className="text-sm text-muted-foreground">Aquí puedes ver todos los servicios que tienes disponibles.</p>
        </div>
        <Button size="sm" disabled={isLoading} variant="outline">
          <Plus className="w-4 h-4" />
          Nuevo Servicio
        </Button>
      </div>
      <Separator />
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      ) : (
        <ScrollArea className="flex-1 h-full">
          <div className="flex flex-col gap-2 p-2">
            {services?.map((service) => (
              <CardItem
                key={service.id}
                title={service.name}
                description={service.description ?? ""}
                badge={<Badge variant="outline">{service.objectives.length} Objetivos</Badge>}
                onEdit={() => {}}
                onDelete={() => {}}
                onClick={() => setSelectedService(service)}
                className={cn(selectedService?.id === service.id && "border-sky-400  outline-4 outline-sky-300/10")}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
