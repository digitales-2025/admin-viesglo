import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Bot, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { isValidPhoneNumber } from "react-phone-number-input";
import { z } from "zod";

import AlertMessage from "@/shared/components/alerts/Alert";
import UbigeoSelect from "@/shared/components/UbigeoSelect";
import { Button } from "@/shared/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { PhoneInput } from "@/shared/components/ui/phone-input";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { useCreateClinic, useUpdateClinic } from "../_hooks/useClinics";
import { ClinicCreate, ClinicResponse } from "../_types/clinics.types";
import { generateRandomPass } from "../../users/_utils/generateRandomPass";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: ClinicResponse;
}

// Esquema base para los campos comunes
const baseSchema = {
  name: z.string().min(1, "El nombre es requerido."),
  ruc: z.string().min(1, "El RUC es requerido."),
  address: z.string().min(1, "La dirección es requerida."),
  phone: z.string().refine(isValidPhoneNumber, "El teléfono es requerido."),
  email: z.string().email("El email no es válido."),
  department: z.string().optional(),
  province: z.string().optional(),
  district: z.string().optional(),
};

// Esquema para crear (contraseña requerida)
const createSchema = z.object({
  ...baseSchema,
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres.")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
      "La contraseña debe tener al menos una letra mayúscula, una letra minúscula y un número."
    ),
});

// Esquema para actualizar (contraseña opcional)
const updateSchema = z.object({
  ...baseSchema,
  password: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true; // Si no hay valor, es válido (opcional)
        return val.length >= 8 && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(val);
      },
      {
        message:
          "La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una letra minúscula y un número.",
      }
    ),
});

// Tipo unificado para el formulario
type FormValues = z.infer<typeof createSchema> & {
  password?: string;
};

export function ClinicsMutateDrawer({ open, onOpenChange, currentRow }: Props) {
  const { mutate: createClinic, isPending: isCreating } = useCreateClinic();
  const { mutate: updateClinic, isPending: isUpdating } = useUpdateClinic();

  const isUpdate = !!currentRow?.id;
  const isPending = isCreating || isUpdating;

  const form = useForm<FormValues>({
    resolver: zodResolver(isUpdate ? updateSchema : createSchema) as any,
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
    mode: "onChange",
  });

  // Obtener los valores actuales del formulario para usarlos en UbigeoSelect
  const watchedUbigeoValues = form.watch(["department", "province", "district"]);
  const [watchedDepartment, watchedProvince, watchedDistrict] = watchedUbigeoValues;

  const onSubmit = (data: FormValues) => {
    if (isUpdate) {
      // Si la contraseña está vacía y estamos actualizando, la omitimos para mantener la actual
      const updateData = { ...data };
      if (updateData.password === "") {
        const { password: _, ...rest } = updateData;
        updateClinic(
          { id: currentRow.id, data: rest },
          {
            onSuccess: () => {
              onOpenChange(false);
              form.reset();
            },
          }
        );
      } else {
        updateClinic(
          { id: currentRow.id, data: updateData },
          {
            onSuccess: () => {
              onOpenChange(false);
              form.reset();
            },
          }
        );
      }
    } else {
      createClinic(data as ClinicCreate, {
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

  // Actualiza el formulario cuando cambia el modo entre crear y actualizar
  useEffect(() => {
    // Limpiar errores previos
    form.clearErrors();

    // Al cambiar entre crear y actualizar, reiniciar el formulario para aplicar
    // las nuevas reglas de validación, ya que no podemos cambiar el resolver directamente
    if (isUpdate) {
      form.reset(form.getValues());
    } else {
      // Si cambia a modo creación, asegurarnos que el campo password esté vacío
      const values = form.getValues();
      form.reset({
        ...values,
        password: "",
      });
    }
  }, [isUpdate, form]);

  // Generar una clave única para UbigeoSelect basada en el formulario y estado de edición
  const ubigeoSelectKey = `ubigeo-${isUpdate ? "edit" : "create"}-${currentRow?.id || "new"}`;

  const isChangePassword = isUpdate && form.watch("password");

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
            {isUpdate ? "Actualizar" : "Crear"} usuario tipo clínica
          </SheetTitle>
          <SheetDescription>
            {isUpdate ? "Actualiza los datos del usuario tipo clínica" : "Crea un nuevo usuario tipo clínica"}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-500px)] sm:h-[calc(100vh-250px)]">
          <Form {...form}>
            <form id="clinics-form" onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-5 p-4">
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre comercial</FormLabel>
                    <FormControl>
                      <Input placeholder="Introduce el nombre de la clínica" {...field} />
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
                      <PhoneInput
                        placeholder="Introduce el teléfono de la clínica"
                        defaultCountry="PE"
                        {...field}
                        onChange={(value) => {
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Componente de selección de ubigeo (Departamento, Provincia, Distrito) */}
              <UbigeoSelect
                key={ubigeoSelectKey}
                control={form.control}
                initialValues={{
                  department: watchedDepartment,
                  province: watchedProvince,
                  district: watchedDistrict,
                }}
                onChange={{
                  department: (value) => form.setValue("department", value, { shouldValidate: true }),
                  province: (value) => form.setValue("province", value, { shouldValidate: true }),
                  district: (value) => form.setValue("district", value, { shouldValidate: true }),
                }}
              />
              <fieldset className="flex flex-col gap-2 border rounded-md p-4 border-muted">
                <legend className="text-xs font-semibold text-muted-foreground">Credenciales</legend>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usuario (Correo electrónico)</FormLabel>
                      <FormControl>
                        <Input placeholder="Introduce el email del usuario tipo clínica" {...field} />
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
                      <FormLabel>Contraseña {!isUpdate && <span className="text-red-500">*</span>}</FormLabel>
                      <FormControl>
                        <div className="inline-flex gap-1">
                          <Input
                            placeholder={
                              isUpdate
                                ? "Dejar en blanco para mantener la contraseña actual"
                                : "Introduce la contraseña del usuario tipo clínica"
                            }
                            {...field}
                          />
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => field.onChange(generateRandomPass())}
                                  type="button"
                                >
                                  <Bot />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Generar contraseña aleatoria</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </FormControl>
                      <FormMessage />
                      {isUpdate && (
                        <AlertMessage
                          title="Cambiar la contraseña del usuario tipo clínica."
                          description="Si desea cambiar la contraseña del usuario tipo clínica, genere una nueva contraseña y se enviará al correo electrónico del usuario tipo clínica."
                          variant="info"
                        />
                      )}
                    </FormItem>
                  )}
                />
              </fieldset>
            </form>
          </Form>
        </ScrollArea>
        <SheetFooter className="gap-2">
          <Button form="clinics-form" type="submit" disabled={isPending}>
            {isPending ? (
              "Guardando..."
            ) : isUpdate ? (
              <>
                Actualizar
                {isChangePassword && (
                  <>
                    {" "}
                    y enviar credenciales
                    <Send className="w-4 h-4" />
                  </>
                )}
              </>
            ) : (
              "Crear"
            )}
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
