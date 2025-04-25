"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/shared/components/ui/button";
import { DatePicker } from "@/shared/components/ui/date-picker";
import { FileInput } from "@/shared/components/ui/file-input";
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
import { useCreateCertificate, useUpdateCertificate } from "../_hooks/useCertificates";
import { CertificateResponse, CreateCertificate } from "../_types/certificates.types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: CertificateResponse;
}

const schema = z.object({
  ruc: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        return z
          .string()
          .regex(/^[0-9]+$/)
          .regex(/^\d{11}$/)
          .safeParse(val).success;
      },
      {
        message: "El RUC debe ser un número válido.",
      }
    ),
  businessName: z.string().optional(),
  nameCapacitation: z.string().min(1, "El nombre de la capacitación es requerido."),
  nameUser: z.string().min(1, "El nombre del usuario es requerido."),
  lastNameUser: z.string().min(1, "El apellido del usuario es requerido."),
  emailUser: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        return z.string().email().safeParse(val).success;
      },
      {
        message: "El correo electrónico del usuario debe ser un correo electrónico válido.",
      }
    ),
  dateEmision: z.string().min(1, "La fecha de emisión es requerida."),
  dateExpiration: z.string().min(1, "La fecha de expiración es requerida."),
}) satisfies z.ZodType<CreateCertificate>;

type FormValues = z.infer<typeof schema> & {
  fileCertificate?: File;
};

export function CertificatesMutateDrawer({ open, onOpenChange, currentRow }: Props) {
  const { mutate: createCertificate, isPending: isCreating } = useCreateCertificate();
  const { mutate: updateCertificate, isPending: isUpdating } = useUpdateCertificate();

  const isUpdate = !!currentRow?.id;
  const isPending = isCreating || isUpdating;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      ruc: "",
      businessName: "",
      nameCapacitation: "",
      nameUser: "",
      lastNameUser: "",
      emailUser: "",
      dateEmision: new Date().toISOString(),
      dateExpiration: "",
    },
    mode: "onChange",
  });
  useEffect(() => {
    if (!open) {
      form.reset({
        ruc: "",
        businessName: "",
        nameCapacitation: "",
        nameUser: "",
        lastNameUser: "",
        emailUser: "",
        dateEmision: "",
        dateExpiration: "",
      });
    } else if (!isUpdate) {
      const today = new Date().toISOString();
      form.reset({
        ...form.getValues(),
        dateEmision: today,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isUpdate]);

  useEffect(() => {
    if (form.getValues("dateEmision")) {
      const expirationDate = new Date(form.getValues("dateEmision"));
      expirationDate.setFullYear(expirationDate.getFullYear() + 1);
      form.setValue("dateExpiration", expirationDate.toISOString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, form.watch("dateEmision")]);

  const onSubmit = (data: FormValues) => {
    const formData = new FormData();
    formData.append("ruc", data.ruc || "");
    formData.append("businessName", data.businessName || "");
    formData.append("nameCapacitation", data.nameCapacitation);
    formData.append("nameUser", data.nameUser);
    formData.append("lastNameUser", data.lastNameUser);
    formData.append("emailUser", data.emailUser || "");
    formData.append("dateEmision", data.dateEmision);
    formData.append("dateExpiration", data.dateExpiration);
    if (data.fileCertificate) {
      formData.append("fileCertificate", data.fileCertificate);
    }

    if (isUpdate) {
      updateCertificate(
        {
          id: currentRow.id,
          data: formData,
        },
        {
          onSuccess: () => onOpenChange(false),
        }
      );
    } else {
      createCertificate(formData, {
        onSuccess: () => onOpenChange(false),
      });
    }
  };

  useEffect(() => {
    if (isUpdate && currentRow?.id) {
      form.reset({
        ruc: currentRow.ruc,
        businessName: currentRow.businessName,
        nameCapacitation: currentRow.nameCapacitation,
        nameUser: currentRow.nameUser,
        lastNameUser: currentRow.lastNameUser,
        emailUser: currentRow.emailUser,
        dateEmision: currentRow.dateEmision,
        dateExpiration: currentRow.dateExpiration,
      });
    } else {
      form.reset();
    }
  }, [isUpdate, currentRow, form]);

  useEffect(() => {
    form.clearErrors();
    if (isUpdate) {
      form.reset(form.getValues());
    } else {
      form.reset({
        ...form.getValues(),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUpdate]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{isUpdate ? "Actualizar" : "Crear"} certificado</SheetTitle>
          <SheetDescription>
            {isUpdate ? "Actualiza los datos del certificado" : "Crea un nuevo certificado"}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-500px)] sm:h-[calc(100vh-250px)]">
          <Form {...form}>
            <form id="certificates-form" onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-5 p-4">
              <FormField
                control={form.control}
                name="ruc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RUC</FormLabel>
                    <FormControl>
                      <Input placeholder="Introduce el RUC del cliente" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la empresa</FormLabel>
                    <FormControl>
                      <Input placeholder="Introduce el nombre de la empresa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nameCapacitation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tema de la capacitación</FormLabel>
                    <FormControl>
                      <Input placeholder="Introduce el tema de la capacitación" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nameUser"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del usuario</FormLabel>
                    <FormControl>
                      <Input placeholder="Introduce el nombre del usuario" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastNameUser"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellido del usuario</FormLabel>
                    <FormControl>
                      <Input placeholder="Introduce el apellido del usuario" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="emailUser"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electrónico del usuario</FormLabel>
                    <FormControl>
                      <Input placeholder="Introduce el correo electrónico del usuario" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dateEmision"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de emisión</FormLabel>
                    <FormControl>
                      <DatePicker
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => field.onChange(date?.toISOString())}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dateExpiration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de expiración</FormLabel>
                    <FormControl>
                      <DatePicker
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => field.onChange(date?.toISOString())}
                      />
                    </FormControl>
                    <FormDescription>La fecha de expiración será el mismo día de aquí a un año.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fileCertificate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Certificado</FormLabel>
                    <FormControl>
                      <FileInput
                        id="file-certificate"
                        accept="application/pdf, image/png, image/jpeg, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={(files) => field.onChange(files?.[0])}
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
          <Button form="certificates-form" type="submit" disabled={isPending}>
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
