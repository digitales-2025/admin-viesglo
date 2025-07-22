import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import Autocomplete from "@/shared/components/ui/autocomplete";
import { Button } from "@/shared/components/ui/button";
import { DatePicker } from "@/shared/components/ui/date-picker";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
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
import { Switch } from "@/shared/components/ui/switch";
import { Textarea } from "@/shared/components/ui/textarea";
import { cn } from "@/shared/lib/utils";
import { useCreateActivityProject, useUpdateActivityProject } from "../../_hooks/useActivitiesProject";
import { useUsersProject } from "../../_hooks/useProjectTraking";
import { ProjectActivityResponse } from "../../_types/tracking.types";

interface ProjectActivityMutateDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: ProjectActivityResponse | undefined;
  objectiveId: string;
}

const formSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  description: z.string().optional(),
  responsibleUserId: z.string().optional(),
  scheduledDate: z.string().nullable().optional(),
  evidenceRequired: z.boolean(),
});

type ObjectivesForm = z.infer<typeof formSchema>;

export default function ProjectActivityMutateDrawer({
  open,
  onOpenChange,
  currentRow,
  objectiveId,
}: ProjectActivityMutateDrawerProps) {
  const { data: users, isPending: isLoadingUsers } = useUsersProject();
  const { mutate: createActivity, isPending: isCreating } = useCreateActivityProject();
  const { mutate: updateActivity, isPending: isUpdating } = useUpdateActivityProject();
  const isUpdate = !!currentRow?.id;
  const isPending = isCreating || isUpdating;

  const form = useForm<ObjectivesForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      responsibleUserId: "",
      scheduledDate: "",
      evidenceRequired: false,
    },
  });

  const onSubmit = (data: ObjectivesForm) => {
    if (isUpdate && currentRow?.id) {
      updateActivity(
        {
          objectiveId,
          activityId: currentRow.id,
          activity: {
            ...data,
            scheduledDate: data.scheduledDate || undefined,
          },
        },
        {
          onSuccess: () => {
            onOpenChange(false);
            form.reset();
          },
        }
      );
    } else {
      createActivity(
        { objectiveId, activity: { ...data, scheduledDate: data.scheduledDate || undefined } },
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
        responsibleUserId: currentRow.responsibleUser.id,
        scheduledDate: currentRow.scheduledDate || "",
        evidenceRequired: currentRow.evidenceRequired,
      });
    } else {
      form.reset({
        name: "",
        description: "",
        responsibleUserId: "",
        scheduledDate: "",
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
        responsibleUserId: "",
        scheduledDate: "",
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
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{isUpdate ? "Editar actividad" : "Crear actividad"}</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? "Actualiza la actividad proporcionando la información necesaria."
              : "Agrega una nueva actividad proporcionando la información necesaria."}{" "}
            Haz clic en guardar cuando hayas terminado.
          </SheetDescription>
        </SheetHeader>
        {isLoadingUsers ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
        ) : (
          <>
            <ScrollArea className="h-[calc(100vh-250px)]">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 flex-1 p-4" id="activity-form">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isPending} />
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
                          <Textarea {...field} disabled={isPending} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="responsibleUserId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Responsable</FormLabel>
                        <FormControl>
                          <Autocomplete
                            value={
                              field.value
                                ? {
                                    id: field.value,
                                    label: users?.find((user) => user.id === field.value)?.name || "",
                                    value: field.value,
                                    name: users?.find((user) => user.id === field.value)?.name || "",
                                  }
                                : null
                            }
                            onChange={(value) => field.onChange(value?.id)}
                            placeholder="Buscar responsable por nombre, email o teléfono"
                            minChars={2}
                            onSearch={(query) => {
                              return Promise.resolve(
                                users
                                  ?.filter((user) => user.name.toLowerCase().includes(query.toLowerCase()))
                                  .map((user) => ({
                                    id: user.id,
                                    label: user.name,
                                    value: user.id,
                                    name: user.name,
                                  })) || []
                              );
                            }}
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="scheduledDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha programada</FormLabel>
                        <FormControl>
                          <DatePicker
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => {
                              const dateString = date ? date.toISOString() : "";
                              field.onChange(dateString);
                            }}
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="evidenceRequired"
                    render={({ field }) => (
                      <FormItem
                        className={cn(
                          "flex flex-row items-center justify-between rounded-lg border p-3",
                          form.watch("evidenceRequired") ? "border-emerald-500" : ""
                        )}
                      >
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Requiere Evidencia</FormLabel>
                          <FormDescription>
                            Activa si la actividad requiere evidencia para ser completada
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} disabled={isPending} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </ScrollArea>
            <SheetFooter className="gap-2">
              <Button form="activity-form" type="submit" disabled={isPending}>
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
      </SheetContent>
    </Sheet>
  );
}
