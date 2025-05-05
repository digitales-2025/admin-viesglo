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
} from "@/shared/components/ui/sheet";
import { Textarea } from "@/shared/components/ui/textarea";
import { useCreateQuotationGroup, useUpdateQuotationGroup } from "../_hooks/useQuotationGroup";
import { QuotationGroupResponse } from "../_types/quotation-groups.types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: QuotationGroupResponse;
}

const createSchema = z.object({
  code: z.string().min(1, "El código es requerido."),
  name: z.string().min(1, "El nombre es requerido."),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof createSchema>;

export default function QuotationGroupMutateDrawer({ open, onOpenChange, currentRow }: Props) {
  const { mutate: createQuotationGroup, isPending: isCreating } = useCreateQuotationGroup();
  const { mutate: updateQuotationGroup, isPending: isUpdating } = useUpdateQuotationGroup();

  const isUpdate = !!currentRow?.id;
  const isPending = isCreating || isUpdating;

  const form = useForm<FormValues>({
    resolver: zodResolver(createSchema) as any,
    defaultValues: {
      code: "",
      name: "",
      description: "",
    },
    mode: "onChange",
  });

  const onSubmit = (data: FormValues) => {
    if (isUpdate) {
      updateQuotationGroup(
        { id: currentRow.id, data },
        {
          onSuccess: () => {
            onOpenChange(false);
            form.reset();
          },
        }
      );
    } else {
      createQuotationGroup(data, {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
        },
      });
    }
  };

  useEffect(() => {
    if (isUpdate && currentRow?.id) {
      form.reset({
        code: currentRow.code,
        name: currentRow.name,
        description: currentRow.description,
      });
    } else {
      form.reset({
        code: "",
        name: "",
        description: "",
      });
    }
  }, [isUpdate, currentRow, form]);

  useEffect(() => {
    if (!open) {
      form.reset({
        code: "",
        name: "",
        description: "",
      });
    }
  }, [open, form]);
  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!isPending) {
          onOpenChange(v);
        }
      }}
    >
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>{isUpdate ? "Editar grupo de cotizaciones" : "Crear grupo de cotizaciones"}</SheetTitle>
          <SheetDescription>
            {isUpdate ? "Actualiza los datos del grupo de cotizaciones" : "Crea un nuevo grupo de cotizaciones"}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-500px)] sm:h-[calc(100vh-250px)]">
          <Form {...form}>
            <form id="quotation-group-form" onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-5 p-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </ScrollArea>
        <SheetFooter className="gap-2">
          <Button form="quotation-group-form" type="submit" disabled={isPending}>
            {isPending ? "Guardando..." : isUpdate ? "Actualizar" : "Crear"}
          </Button>
          <SheetClose asChild>
            <Button variant="outline">Cancelar</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
