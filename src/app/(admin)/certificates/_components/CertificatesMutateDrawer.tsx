"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import AlertMessage from "@/shared/components/alerts/Alert";
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

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
      setSelectedFile(null);
      setFilePreview(null);
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

  const handleFileChange = (files: FileList | null) => {
    const file = files?.[0] || null;
    setSelectedFile(file);
    form.setValue("fileCertificate", file || undefined);

    // Crear una vista previa del archivo si es una imagen
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

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
    if (selectedFile) {
      formData.append("fileCertificate", selectedFile);
    }

    if (isUpdate) {
      updateCertificate(
        {
          id: currentRow.id,
          data: formData,
        },
        {
          onSuccess: () => {
            onOpenChange(false);
            setSelectedFile(null);
            setFilePreview(null);
          },
        }
      );
    } else {
      createCertificate(formData, {
        onSuccess: () => {
          onOpenChange(false);
          setSelectedFile(null);
          setFilePreview(null);
        },
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
        dateEmision: currentRow.dateEmision
          ? (() => {
              // Extraer directamente año, mes y día de la cadena ISO
              const [year, month, day] = currentRow.dateEmision.split("T")[0].split("-").map(Number);
              // Crear una nueva fecha local con estos valores exactos (mes - 1 porque en JS los meses van de 0-11)
              const date = new Date(year, month - 1, day, 12, 0, 0);
              return date.toISOString();
            })()
          : undefined,
        dateExpiration: currentRow.dateExpiration
          ? (() => {
              // Extraer directamente año, mes y día de la cadena ISO
              const [year, month, day] = currentRow.dateExpiration.split("T")[0].split("-").map(Number);
              // Crear una nueva fecha local con estos valores exactos (mes - 1 porque en JS los meses van de 0-11)
              const date = new Date(year, month - 1, day, 12, 0, 0);
              return date.toISOString();
            })()
          : undefined,
      });

      // Si hay un certificado existente con url, configurar vista previa
      if (currentRow.fileCertificate) {
        setFilePreview(currentRow.fileCertificate.originalName);
      }
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
                render={() => (
                  <FormItem>
                    <FormLabel>Certificado</FormLabel>

                    {filePreview &&
                      !filePreview.startsWith("data:image") &&
                      currentRow?.fileCertificate?.originalName && (
                        <AlertMessage
                          title="Certificado existente"
                          description={currentRow.fileCertificate.originalName}
                          variant="warning"
                        />
                      )}
                    <FormControl>
                      <FileInput
                        id="file-certificate"
                        accept="application/pdf, image/png, image/jpeg, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={handleFileChange}
                        buttonText={
                          currentRow?.fileCertificate?.originalName ? "Cambiar certificado" : "Seleccionar certificado"
                        }
                      />
                    </FormControl>
                    {filePreview && filePreview.startsWith("data:image") && (
                      <div className="mt-2">
                        <p className="text-sm text-muted-foreground mb-1">Vista previa:</p>
                        <img
                          src={filePreview}
                          alt="Vista previa del certificado"
                          className="max-w-full h-auto max-h-48 rounded-md border border-muted"
                        />
                      </div>
                    )}
                    {selectedFile && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Archivo seleccionado: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                      </p>
                    )}
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
