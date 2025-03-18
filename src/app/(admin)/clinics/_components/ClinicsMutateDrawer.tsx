import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import UbigeoSelect from "@/shared/components/UbigeoSelect";
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
import { useCreateClinic, useUpdateClinic } from "../_hooks/useClinics";
import { ClinicCreate, ClinicResponse } from "../_types/clinics.types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: ClinicResponse;
}

const formSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  ruc: z.string().min(1, "El RUC es requerido."),
  address: z.string().min(1, "La dirección es requerida."),
  phone: z.string().min(1, "El teléfono es requerido."),
  email: z.string().min(1, "El email es requerido."),
  password: z.string().min(1, "La contraseña es requerida."),
  department: z.string().min(1, "El departamento es requerido.").optional(),
  province: z.string().min(1, "La provincia es requerida.").optional(),
  district: z.string().min(1, "El distrito es requerido.").optional(),
}) satisfies z.ZodType<ClinicCreate>;
type ClinicsForm = z.infer<typeof formSchema>;

export function ClinicsMutateDrawer({ open, onOpenChange, currentRow }: Props) {
  const { mutate: createClinic, isPending: isCreating } = useCreateClinic();
  const { mutate: updateClinic, isPending: isUpdating } = useUpdateClinic();

  const isUpdate = !!currentRow?.id;
  const isPending = isCreating || isUpdating;

  const form = useForm<ClinicsForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      ruc: "",
      address: "",
      phone: "",
      email: "",
      password: "",
      department: "",
      province: "",
      district: "",
    },
  });

  const onSubmit = (data: ClinicsForm) => {
    if (isUpdate) {
      updateClinic(
        { id: currentRow.id, data: { ...data } },
        {
          onSuccess: () => {
            onOpenChange(false);
            form.reset();
          },
        }
      );
    } else {
      createClinic(data, {
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
        name: currentRow.name,
        ruc: currentRow.ruc,
        address: currentRow.address,
        phone: currentRow.phone,
        email: currentRow.email,
        password: "",
        department: currentRow.department,
        province: currentRow.province,
        district: currentRow.district,
      });
    } else {
      form.reset({
        name: "",
        ruc: "",
        address: "",
        phone: "",
        email: "",
        password: "",
        department: "",
        province: "",
        district: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUpdate, currentRow?.id, form]);

  useEffect(() => {
    if (!open) {
      form.reset({
        name: "",
        ruc: "",
        address: "",
        phone: "",
        email: "",
        password: "",
        department: "",
        province: "",
        district: "",
      });
    }
  }, [open, form]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col ">
        <SheetHeader className="text-left">
          <SheetTitle className="text-2xl font-bold capitalize">{isUpdate ? "Actualizar" : "Crear"} clínica</SheetTitle>
          <SheetDescription>
            {isUpdate ? "Actualiza los datos de la clínica" : "Crea una nueva clínica"}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-250px)]">
          <Form {...form}>
            <form id="clinics-form" onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-5 p-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Introduce el nombre de la clínica" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ruc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RUC</FormLabel>
                    <FormControl>
                      <Input placeholder="Introduce el RUC de la clínica" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                      <Input placeholder="Introduce la dirección de la clínica" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input placeholder="Introduce el teléfono de la clínica" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Componente de selección de ubigeo (Departamento, Provincia, Distrito) */}
              <UbigeoSelect
                control={form.control}
                initialValues={{
                  department: form.getValues("department"),
                  province: form.getValues("province"),
                  district: form.getValues("district"),
                }}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usuario (Correo electrónico)</FormLabel>
                    <FormControl>
                      <Input placeholder="Introduce el email de la clínica" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={
                          isUpdate
                            ? "Dejar en blanco para mantener la contraseña actual"
                            : "Introduce la contraseña de la clínica"
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </ScrollArea>
        <SheetFooter className="gap-2">
          <Button form="clinics-form" type="submit" disabled={isPending}>
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
