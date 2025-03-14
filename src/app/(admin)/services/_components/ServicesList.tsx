import { Plus } from "lucide-react";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Separator } from "@/shared/components/ui/separator";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";
import { useServices } from "../_hooks/useServices";
import { useServiceStore } from "../_hooks/useServiceStore";

export default function ServicesList() {
  const { data: services, isLoading, error } = useServices();
  const { setSelectedService, selectedService } = useServiceStore();

  if (isLoading)
    return (
      <div className="flex h-full flex-col gap-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between min-h-3.5">
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-bold">Lista de Servicios</h3>
          <p className="text-sm text-muted-foreground">Aquí puedes ver todos los servicios que tienes disponibles.</p>
        </div>
        <Button size="sm">
          <Plus className="w-4 h-4" />
          Nuevo Servicio
        </Button>
      </div>
      <Separator />
      <ScrollArea className="flex-1 h-full">
        <div className="flex flex-col gap-2 p-2">
          {services?.map((service) => (
            <Card
              key={service.id}
              className={cn("shadow-none hover:cursor-pointer", selectedService?.id === service.id && "border-primary")}
              onClick={() => setSelectedService(service)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 justify-between">
                  {service.name}
                  <Badge variant="outline">{service.objectives.length} Objetivos</Badge>
                </CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
