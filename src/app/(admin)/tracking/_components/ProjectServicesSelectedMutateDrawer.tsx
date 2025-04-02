import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/shared/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/shared/components/ui/form";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { SheetClose, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/shared/components/ui/sheet";
import { ProjectServiceResponse } from "../_types/tracking.types";
import { useServices } from "../../services/_hooks/useServices";
import TreeServices from "./TreeServices";

interface Props {
  setIsSelectingExisting: (isSelectingExisting: boolean) => void;
  currentRow?: ProjectServiceResponse;
}

const serviceFormSchema = z.object({
  services: z
    .array(
      z.object({
        serviceId: z.string(),
        objectives: z.array(
          z.object({
            objectiveId: z.string(),
            activities: z.array(
              z.object({
                activityId: z.string(),
              })
            ),
          })
        ),
      })
    )
    .optional(),
});
type ServiceForm = z.infer<typeof serviceFormSchema>;

export default function ProjectServicesSelecteMutateDrawer({ setIsSelectingExisting, currentRow }: Props) {
  const { data: services, isLoading, error } = useServices();

  const isUpdate = !!currentRow?.id;
  // const isPending = isCreating || isUpdating;
  const isPending = false;

  const form = useForm<ServiceForm>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      services: [],
    },
  });

  const onSubmit = (data: ServiceForm) => {
    console.log(data);
  };

  return (
    <>
      {isLoading && (
        <div className="flex h-full items-center justify-center">
          <Loader2 className="size-5 animate-spin" />
        </div>
      )}
      {error && (
        <div className="flex h-full items-center justify-center">
          <p>Error al cargar los servicios</p>
        </div>
      )}
      {services && (
        <>
          <SheetHeader className="text-left">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setIsSelectingExisting(false)}>
                <ArrowLeft className="size-5" />
              </Button>
              <SheetTitle className="text-2xl font-bold">Seleccionar servicio existente</SheetTitle>
            </div>
            <SheetDescription className="mt-4">
              Selecciona un servicio predefinido de la lista o utiliza la búsqueda para encontrarlo.
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-250px)]">
            <Form {...form}>
              <form id="services-form" onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-5 p-4">
                <FormField
                  control={form.control}
                  name="services"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel>Servicios</FormLabel>
                      <FormControl>
                        <TreeServices services={services} value={field.value} onChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </ScrollArea>
          <SheetFooter className="gap-2">
            <Button form="services-form" type="submit" disabled={isPending}>
              {isPending ? "Guardando..." : isUpdate ? "Actualizar" : "Crear"}
            </Button>
            <SheetClose asChild>
              <Button variant="outline" disabled={isPending}>
                Cancelar
              </Button>
            </SheetClose>
          </SheetFooter>
        </>
      )}
    </>
  );
}
