import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/shared/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
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
} from "@/shared/components/ui/sheet-responsive";
import { Textarea } from "@/shared/components/ui/textarea";
import { useCreateObjectiveProject, useUpdateObjectiveProject } from "../../_hooks/useObjectivesProject";
import { CreateProjectObjective, ProjectObjectiveResponse } from "../../_types/tracking.types";

interface ObjectiveMutateDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: ProjectObjectiveResponse | undefined;
  serviceId: string;
}

const formSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  description: z.string().optional(),
}) satisfies z.ZodType<CreateProjectObjective>;

type ObjectivesForm = z.infer<typeof formSchema>;

export default function ObjectiveMutateDrawer({
  open,
  onOpenChange,
  currentRow,
  serviceId,
}: ObjectiveMutateDrawerProps) {
  const { mutate: createObjective, isPending: isCreating } = useCreateObjectiveProject();
  const { mutate: updateObjective, isPending: isUpdating } = useUpdateObjectiveProject();

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
      updateObjective(
        { serviceId, objectiveId: currentRow.id, objective: data },
        {
          onSuccess: () => {
            onOpenChange(false);
            form.reset();
          },
        }
      );
    } else {
      createObjective(
        { serviceId, objective: data },
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
      <SheetContent className="flex flex-col">
        <SheetHeader className="text-left">
          <SheetTitle className="text-2xl font-bold capitalize">
            {isUpdate ? "Editar objetivo" : "Crear objetivo"}
          </SheetTitle>
          <SheetDescription>
            {isUpdate
              ? "Actualiza el objetivo proporcionando la información necesaria."
              : "Agrega un nuevo objetivo proporcionando la información necesaria."}{" "}
            Haz clic en guardar cuando hayas terminado.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-200px)] sm:h-[calc(100vh-250px)]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 flex-1 p-4" id="objective-form">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </ScrollArea>
        <SheetFooter className="gap-2">
          <Button form="objective-form" type="submit" disabled={isPending}>
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
