import { Loader2, Plus, SquareDashed } from "lucide-react";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Separator } from "@/shared/components/ui/separator";
import { cn } from "@/shared/lib/utils";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { useServices } from "../_hooks/useServices";
import { useServiceStore } from "../_hooks/useServiceStore";
import { ServiceResponse } from "../_types/services.types";
import CardItem from "./CardItem";

export default function ServicesList() {
  const { data: services, isLoading, error } = useServices();
  const { open } = useDialogStore();
  const { setSelectedService, selectedService, setSelectedObjective, setSelectedActivity } = useServiceStore();

  if (error) return <div>Error: {error.message}</div>;

  const handleDelete = (service: ServiceResponse) => {
    open("services", "delete", service);
  };

  const handleServiceClick = (service: ServiceResponse) => {
    if (selectedService?.id === service.id) {
      setSelectedService(null);
      setSelectedObjective(null);
      setSelectedActivity(null);
    } else {
      setSelectedService(service);
      setSelectedObjective(null);
      setSelectedActivity(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-start flex-wrap justify-between min-h-3.5">
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-bold">Lista de Servicios</h3>
          <p className="text-sm text-muted-foreground">Aquí puedes ver todos los servicios que tienes disponibles.</p>
        </div>
        <Button size="sm" disabled={isLoading} variant="outline" onClick={() => open("services", "create")}>
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
            {services?.length && services?.length > 0 ? (
              services?.map((service) => (
                <CardItem
                  key={service.id}
                  title={service.name}
                  description={service.description ?? ""}
                  badge={<Badge variant="outline">{service.objectives?.length ?? 0} Objetivos</Badge>}
                  onEdit={() => open("services", "edit", service)}
                  onDelete={() => handleDelete(service)}
                  onClick={() => handleServiceClick(service)}
                  className={cn(selectedService?.id === service.id && "border-sky-400  outline-4 outline-sky-300/10")}
                />
              ))
            ) : (
              <div className="text-center py-12 px-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                  <SquareDashed className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className=" text-muted-foreground text-xs">No hay servicios</p>
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
