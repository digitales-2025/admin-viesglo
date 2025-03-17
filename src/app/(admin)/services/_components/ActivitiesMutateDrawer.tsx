import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/shared/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import { Textarea } from "@/shared/components/ui/textarea";
import { useCreateActivity, useUpdateActivity } from "../_hooks/useActivities";
import { useServiceStore } from "../_hooks/useServiceStore";
import { ActivityCreate, ActivityResponse } from "../_types/services.types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: ActivityResponse;
}

const formSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  description: z.string().min(1, "La descripción es requerida."),
}) satisfies z.ZodType<ActivityCreate>;

type ActivitiesForm = z.infer<typeof formSchema>;

export const ActivitiesMutateDrawer = ({ open, onOpenChange, currentRow }: Props) => {
  const { mutate: createActivity, isPending: isCreating } = useCreateActivity();
  const { mutate: updateActivity, isPending: isUpdating } = useUpdateActivity();
  const { selectedObjective } = useServiceStore();

  const isUpdate = !!currentRow?.id;
  const isPending = isCreating || isUpdating;

  const form = useForm<ActivitiesForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: currentRow?.name || "",
      description: currentRow?.description || "",
    },
  });

  const onSubmit = (data: ActivitiesForm) => {
    if (isUpdate) {
      if (!selectedObjective) return toast.error("No se pudo actualizar la actividad. Por favor, intente nuevamente.");
      updateActivity(
        { id: currentRow.id, data: { ...data, objectiveId: selectedObjective.id } },
        {
          onSuccess: () => {
            onOpenChange(false);
            form.reset();
          },
        }
      );
    } else {
      if (!selectedObjective) return toast.error("No se pudo crear la actividad. Por favor, intente nuevamente.");
      createActivity(
        { ...data, objectiveId: selectedObjective.id },
        {
          onSuccess: () => {
            onOpenChange(false);
            form.reset();
          },
        }
      );
    }
  };

  useEffect(() => {
    if (isUpdate && currentRow?.id) {
      form.reset({
        name: currentRow.name,
        description: currentRow.description || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUpdate, currentRow?.id]);

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!isPending) {
          onOpenChange(v);
          if (!v) form.reset();
        }
      }}
    >
      <SheetContent className="flex flex-col ">
        <SheetHeader className="text-left">
          <SheetTitle className="text-2xl font-bold capitalize">
            {isUpdate ? "Actualizar" : "Crear"} actividad
          </SheetTitle>
          <SheetDescription>
            {isUpdate ? "Actualiza los datos de la actividad" : "Crea una nueva actividad"}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-250px)]">
          <Form {...form}>
            <form id="activities-form" onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-5 p-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </ScrollArea>
        <SheetFooter className="gap-2">
          <Button form="activities-form" type="submit" disabled={isPending}>
            {isPending ? "Guardando..." : isUpdate ? "Actualizar" : "Crear"}
          </Button>
          <SheetClose asChild>
            <Button variant="outline" disabled={isPending}>
              Cancelar
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
