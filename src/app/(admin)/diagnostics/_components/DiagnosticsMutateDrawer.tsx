"use client";

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
import {
  useCreateDiagnosticInSystem,
  useUpdateDiagnosticInSystem,
} from "../../medical-records/_hooks/useMedicalRecords";
import {
  DiagnosticEntity,
  SystemCreateDiagnosticRequest,
  SystemUpdateDiagnosticRequest,
} from "../../medical-records/_types/medical-record.types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: DiagnosticEntity;
}

const formSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  description: z.string().optional(),
  isDefaultIncluded: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export default function DiagnosticsMutateDrawer({ open, onOpenChange, currentRow }: Props) {
  const { mutate: createSystemDiagnostic, isPending: isCreating } = useCreateDiagnosticInSystem();
  const { mutate: updateSystemDiagnostic, isPending: isUpdating } = useUpdateDiagnosticInSystem();

  const isUpdate = !!currentRow?.id;
  const isPending = isCreating || isUpdating;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      isDefaultIncluded: true,
    },
    mode: "onChange",
  });

  const onSubmit = (data: FormValues) => {
    if (isUpdate && currentRow?.id) {
      const updateData: SystemUpdateDiagnosticRequest = {
        name: data.name,
        description: data.description,
        isDefaultIncluded: data.isDefaultIncluded,
      };
      updateSystemDiagnostic(
        { diagnosticId: currentRow.id, data: updateData },
        {
          onSuccess: () => {
            onOpenChange(false);
            form.reset();
          },
        }
      );
    } else {
      const createData: SystemCreateDiagnosticRequest = {
        name: data.name,
        description: data.description,
        dataType: "JSON",
        isDefaultIncluded: data.isDefaultIncluded,
      };
      createSystemDiagnostic(createData, {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
        },
      });
    }
  };

  useEffect(() => {
    if (isUpdate && currentRow) {
      form.reset({
        name: currentRow.name || "",
        description: currentRow.description || "",
        isDefaultIncluded: currentRow.isDefaultIncluded === undefined ? true : currentRow.isDefaultIncluded,
      });
    } else {
      form.reset({
        name: "",
        description: "",
        isDefaultIncluded: true,
      });
    }
  }, [isUpdate, currentRow, form]);

  useEffect(() => {
    if (!open) {
      form.reset({
        name: "",
        description: "",
        isDefaultIncluded: true,
      });
    }
  }, [open, form]);

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
            {isUpdate ? "Actualizar" : "Crear"} Diagnóstico
          </SheetTitle>
          <SheetDescription>
            {isUpdate
              ? "Actualiza el nombre y descripción del diagnóstico."
              : "Crea un nuevo diagnóstico para el sistema."}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-250px)] flex-grow pr-6 pl-1">
          <Form {...form}>
            <form id="diagnostics-system-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-1">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Diagnóstico</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Audiometría" {...field} />
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
                      <Textarea placeholder="Describe brevemente el diagnóstico" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </ScrollArea>
        <SheetFooter className="gap-2 pt-6">
          <Button form="diagnostics-system-form" type="submit" disabled={isPending}>
            {isPending ? "Guardando..." : isUpdate ? "Actualizar Diagnóstico" : "Crear Diagnóstico"}
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
