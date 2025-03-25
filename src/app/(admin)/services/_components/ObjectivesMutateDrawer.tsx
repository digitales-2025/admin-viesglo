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
import { useCreateObjective, useUpdateObjective } from "../_hooks/useObjectives";
import { useServiceStore } from "../_hooks/useServiceStore";
import { ObjectiveCreate, ObjectiveResponse } from "../_types/services.types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: ObjectiveResponse;
}

const formSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  description: z.string().optional(),
}) satisfies z.ZodType<ObjectiveCreate>;

type ObjectivesForm = z.infer<typeof formSchema>;

export default function ObjectivesMutateDrawer({ open, onOpenChange, currentRow }: Props) {
  const { mutate: createObjective, isPending: isCreating } = useCreateObjective();
  const { mutate: updateObjective, isPending: isUpdating } = useUpdateObjective();
  const { selectedService } = useServiceStore();

  const isUpdate = !!currentRow?.id;
  const isPending = isCreating || isUpdating;

  const form = useForm<ObjectivesForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = (data: ObjectivesForm) => {
    if (isUpdate && currentRow?.id) {
      if (!selectedService) return toast.error("No se pudo actualizar el objetivo. Por favor, intente nuevamente.");
      updateObjective(
        { id: currentRow.id, data: { serviceId: selectedService.id, ...data } },
        {
          onSuccess: () => {
            onOpenChange(false);
            form.reset();
          },
        }
      );
    } else {
      if (!selectedService) return toast.error("No se pudo crear el objetivo. Por favor, intente nuevamente.");
      createObjective(
        { serviceId: selectedService.id, ...data },
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
      });
    } else {
      form.reset({
        name: "",
        description: "",
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
            {isUpdate ? "Actualizar" : "Crear"} objetivo
          </SheetTitle>
          <SheetDescription>
            {isUpdate
              ? "Actualiza el objetivo proporcionando la información necesaria."
              : "Agrega un nuevo objetivo proporcionando la información necesaria."}{" "}
            Haz clic en guardar cuando hayas terminado.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-250px)]">
          <Form {...form}>
            <form id="objectives-form" onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-5 p-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Ingrese un nombre" disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </ScrollArea>
        <SheetFooter className="gap-2">
          <Button form="objectives-form" type="submit" disabled={isPending}>
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
}
