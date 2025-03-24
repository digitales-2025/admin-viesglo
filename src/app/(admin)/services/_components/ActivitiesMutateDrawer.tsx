import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/shared/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
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
import { Switch } from "@/shared/components/ui/switch";
import { Textarea } from "@/shared/components/ui/textarea";
import { cn } from "@/shared/lib/utils";
import { useCreateActivity, useUpdateActivity } from "../_hooks/useActivities";
import { useServiceStore } from "../_hooks/useServiceStore";
import { ActivityResponse } from "../_types/services.types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: ActivityResponse;
}

const formSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  evidenceRequired: z.boolean().default(false),
});

type ActivitiesForm = z.infer<typeof formSchema>;

export const ActivitiesMutateDrawer = ({ open, onOpenChange, currentRow }: Props) => {
  const { mutate: createActivity, isPending: isCreating } = useCreateActivity();
  const { mutate: updateActivity, isPending: isUpdating } = useUpdateActivity();
  const { selectedObjective } = useServiceStore();

  const isUpdate = !!currentRow?.id;
  const isPending = isCreating || isUpdating;

  // Si el drawer está abierto y no hay un objetivo seleccionado, cerrar y mostrar error
  useEffect(() => {
    if (open && !selectedObjective) {
      onOpenChange(false);
      toast.error("Debe seleccionar un objetivo antes de crear o editar una actividad");
    }
  }, [open, selectedObjective, onOpenChange]);

  const form = useForm<ActivitiesForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      evidenceRequired: false,
    },
  });

  const onSubmit = (data: ActivitiesForm) => {
    if (!selectedObjective) {
      toast.error("No se pudo procesar la actividad. No hay un objetivo seleccionado.");
      onOpenChange(false);
      return;
    }

    if (isUpdate) {
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

  // Resetear formulario cuando cambia entre edición y creación
  useEffect(() => {
    if (isUpdate && currentRow?.id) {
      form.reset({
        name: currentRow.name,
        description: currentRow.description || "",
        evidenceRequired: currentRow.evidenceRequired || false,
      });
    } else {
      form.reset({
        name: "",
        description: "",
        evidenceRequired: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUpdate, currentRow?.id]);

  // Resetear al cerrar el modal
  useEffect(() => {
    if (!open) {
      form.reset({
        name: "",
        description: "",
        evidenceRequired: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

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
                    <FormLabel>Nombre de la actividad</FormLabel>
                    <FormControl>
                      <Input placeholder="Introduce el nombre de la actividad" {...field} />
                    </FormControl>
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
                      <Textarea placeholder="Describe brevemente la actividad..." className="resize-none" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="evidenceRequired"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Requiere Evidencia</FormLabel>
                      <FormDescription>Activa si la actividad requiere evidencia para ser completada</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isPending}
                        className={cn(field.value ? "bg-green-500" : "")}
                      />
                    </FormControl>
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
