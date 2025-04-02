import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
} from "@/shared/components/ui/sheet";
import { Textarea } from "@/shared/components/ui/textarea";
import { useCreateServiceProject, useUpdateServiceProject } from "../_hooks/useServicesProject";
import { CreateProjectService, ProjectServiceResponse } from "../_types/tracking.types";
import ProjectServicesSelecteMutateDrawer from "./ProjectServicesSelectedMutateDrawer";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: ProjectServiceResponse;
  projectId: string;
}

const formSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  description: z.string().optional(),
});

type ServicesForm = z.infer<typeof formSchema>;

export default function ProjectServicesMutateDrawer({ open, onOpenChange, currentRow, projectId }: Props) {
  const { mutate: createService, isPending: isCreating } = useCreateServiceProject();
  const { mutate: updateService, isPending: isUpdating } = useUpdateServiceProject();
  const [isSelectingExisting, setIsSelectingExisting] = useState(false);

  const isUpdate = !!currentRow?.id;
  const isPending = isCreating || isUpdating;
  const form = useForm<ServicesForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = (data: ServicesForm) => {
    if (isUpdate && currentRow?.id) {
      updateService(
        { projectId: currentRow.projectId, serviceId: currentRow.id, service: data as any },
        {
          onSuccess: () => {
            onOpenChange(false);
            form.reset();
          },
        }
      );
    } else if (currentRow?.projectId || projectId) {
      const targetProjectId = currentRow?.projectId || projectId;

      if (!targetProjectId) {
        toast.error("No se pudo determinar el projectId");
        return;
      }

      createService(
        {
          projectId: targetProjectId,
          service: data as CreateProjectService,
        },
        {
          onSuccess: () => {
            onOpenChange(false);
            form.reset();
          },
        }
      );
    } else {
      toast.error("No se pudo determinar el projectId");
    }
  };

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

  useEffect(() => {
    if (!open) {
      form.reset({
        name: "",
        description: "",
      });
      setIsSelectingExisting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const renderManualForm = () => (
    <>
      <SheetHeader className="text-left">
        <SheetTitle className="text-2xl font-bold capitalize">{isUpdate ? "Actualizar" : "Crear"} servicio</SheetTitle>
        <SheetDescription className="space-y-4" asChild>
          <div>
            <p>
              {isUpdate
                ? "Actualiza el servicio proporcionando la información necesaria."
                : "Puedes crear un nuevo servicio desde cero o seleccionar uno existente."}
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>¿Ya tienes un servicio creado?</span>
              <Button variant="ghost" size="sm" onClick={() => setIsSelectingExisting(true)}>
                <PlusCircle className="mr-2 size-4 text-primary" />
                Seleccionar servicio existente
              </Button>
            </div>
          </div>
        </SheetDescription>
      </SheetHeader>
      <ScrollArea className="h-[calc(100vh-250px)]">
        <Form {...form}>
          <form id="services-form" onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-5 p-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ingrese un nombre" disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Ingrese una descripción" disabled={isPending} />
                  </FormControl>
                  <FormMessage />
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
  );

  const renderServiceSelector = () => (
    <ProjectServicesSelecteMutateDrawer setIsSelectingExisting={setIsSelectingExisting} />
  );

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!isPending) {
          onOpenChange(v);
          if (!v) {
            form.reset();
            setIsSelectingExisting(false);
          }
        }
      }}
    >
      <SheetContent
        className="flex flex-col transition-all duration-300"
        width={isSelectingExisting ? "sm:max-w-2xl" : ""}
      >
        {isSelectingExisting ? renderServiceSelector() : renderManualForm()}
      </SheetContent>
    </Sheet>
  );
}
