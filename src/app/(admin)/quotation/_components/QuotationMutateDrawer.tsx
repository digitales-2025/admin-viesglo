"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { isValidPhoneNumber } from "react-phone-number-input";
import { z } from "zod";

import { Loading } from "@/shared/components/loading";
import UbigeoSelect from "@/shared/components/UbigeoSelect";
import { Button } from "@/shared/components/ui/button";
import { DatePicker } from "@/shared/components/ui/date-picker";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { PhoneInput } from "@/shared/components/ui/phone-input";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { SelectCombobox } from "@/shared/components/ui/select-combobox";
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
import { cn } from "@/shared/lib/utils";
import { useCreateQuotation, useUpdateQuotation } from "../_hooks/useQuotations";
import { QuotationCreate, QuotationResponse, TypePayment } from "../_types/quotation.types";
import { useQuotationGroups } from "../../quotation-groups/_hooks/useQuotationGroup";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: QuotationResponse;
}

const baseSchema = {
  ruc: z
    .string()
    .min(1, "El RUC es requerido.")
    .regex(/^[0-9]+$/, "El RUC debe contener solo números.")
    .regex(/^\d{11}$/, "El RUC debe tener 11 dígitos."),
  businessName: z.string().min(1, "La razón social es requerida."),
  economicActivity: z.string().min(1, "La actividad económica es requerida."),
  numberOfWorkers: z.string().min(1, "El número de trabajadores es requerido."),
  service: z.string().min(1, "El servicio es requerido."),
  amount: z.string().min(1, "El monto es requerido."),
  address: z.string().min(1, "La dirección es requerida."),
  department: z.string().optional(),
  province: z.string().optional(),
  district: z.string().optional(),
  mainContact: z.string().min(1, "El contacto principal es requerido."),
  position: z.string().min(1, "El cargo es requerido."),
  phone: z.string().refine(isValidPhoneNumber, "El teléfono debe ser un número válido."),
  email: z.string().email("El email no es válido."),
  quotationGroup: z.string().min(1, "Se debe seleccionar un grupo de cotización."),
  typePayment: z.nativeEnum(TypePayment),
  dateStart: z.date().optional(),
  dateEnd: z.date().optional(),
};

const createSchema = z.object(baseSchema);
const updateSchema = z.object(baseSchema);

type FormValues = z.infer<typeof createSchema>;

export function QuotationMutateDrawer({ open, onOpenChange, currentRow }: Props) {
  const { mutate: createQuotation, isPending: isCreating } = useCreateQuotation();
  const { mutate: updateQuotation, isPending: isUpdating } = useUpdateQuotation();
  const { data: quotationGroups, isLoading: isLoadingQuotationGroups } = useQuotationGroups();
  const isUpdate = !!currentRow?.id;
  const isPending = isCreating || isUpdating;

  const form = useForm<FormValues>({
    resolver: zodResolver(isUpdate ? updateSchema : createSchema) as any,
    defaultValues: {
      ruc: "",
      businessName: "",
      economicActivity: "",
      numberOfWorkers: "",
      service: "",
      amount: "",
      address: "",
      department: "",
      province: "",
      district: "",
      mainContact: "",
      position: "",
      phone: "",
      email: "",
      quotationGroup: "",
      typePayment: TypePayment.PUNCTUAL,
      dateStart: undefined,
      dateEnd: undefined,
    },
    mode: "onChange",
  });
  const watchedUbigeoValues = form.watch(["department", "province", "district"]);
  const [watchedDepartment, watchedProvince, watchedDistrict] = watchedUbigeoValues;

  const onSubmit = (data: FormValues) => {
    const { quotationGroup, ...rest } = data;
    const formattedData = {
      ...rest,
      amount: parseFloat(data.amount),
      numberOfWorkers: parseInt(data.numberOfWorkers),
      quotationGroupId: quotationGroup,
      typePayment: data.typePayment as TypePayment,
      dateStart: data.dateStart?.toISOString(),
      dateEnd: data.dateEnd?.toISOString(),
    };

    if (isUpdate) {
      updateQuotation(
        { id: currentRow.id, data: formattedData },
        {
          onSuccess: () => {
            onOpenChange(false);
            form.reset();
          },
        }
      );
    } else {
      createQuotation(formattedData as QuotationCreate, {
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
        ruc: currentRow.ruc,
        businessName: currentRow.businessName,
        economicActivity: currentRow.economicActivity,
        numberOfWorkers: currentRow.numberOfWorkers.toString(),
        service: currentRow.service,
        amount: currentRow.amount.toString(),
        address: currentRow.address,
        department: currentRow.department,
        province: currentRow.province,
        district: currentRow.district,
        mainContact: currentRow.mainContact,
        position: currentRow.position,
        phone: currentRow.phone,
        email: currentRow.email,
        quotationGroup: currentRow.quotationGroup?.id,
        typePayment: currentRow.typePayment as TypePayment,
        dateStart: currentRow.dateStart
          ? (() => {
              // Extraer directamente año, mes y día de la cadena ISO
              const [year, month, day] = currentRow.dateStart.split("T")[0].split("-").map(Number);
              // Crear una nueva fecha local con estos valores exactos (mes - 1 porque en JS los meses van de 0-11)
              return new Date(year, month - 1, day, 12, 0, 0);
            })()
          : undefined,
        dateEnd: currentRow.dateEnd
          ? (() => {
              // Extraer directamente año, mes y día de la cadena ISO
              const [year, month, day] = currentRow.dateEnd.split("T")[0].split("-").map(Number);
              // Crear una nueva fecha local con estos valores exactos (mes - 1 porque en JS los meses van de 0-11)
              return new Date(year, month - 1, day, 12, 0, 0);
            })()
          : undefined,
      });
    } else {
      form.reset({
        ruc: "",
        businessName: "",
        economicActivity: "",
        numberOfWorkers: "",
        service: "",
        amount: "",
        address: "",
        department: "",
        province: "",
        district: "",
        mainContact: "",
        position: "",
        phone: "",
        email: "",
        quotationGroup: "",
        typePayment: TypePayment.MONTHLY,
        dateStart: undefined,
        dateEnd: undefined,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUpdate, currentRow?.id]);

  useEffect(() => {
    if (!open) {
      form.reset({
        ruc: "",
        businessName: "",
        economicActivity: "",
        numberOfWorkers: "",
        service: "",
        amount: "",
        address: "",
        department: "",
        province: "",
        district: "",
        mainContact: "",
        position: "",
        phone: "",
        email: "",
        quotationGroup: "",
        dateStart: undefined,
        dateEnd: undefined,
        typePayment: TypePayment.MONTHLY,
      });
    } else {
      if (!isUpdate) {
        form.reset({
          ...form.getValues(),
          dateStart: undefined,
          dateEnd: undefined,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  // Generar una clave única para UbigeoSelect basada en el formulario y estado de edición
  const ubigeoSelectKey = `ubigeo-${isUpdate ? "edit" : "create"}-${currentRow?.id || "new"}`;

  // Limpiar errores previos
  useEffect(() => {
    form.clearErrors();

    if (isUpdate) {
      form.reset(form.getValues());
    } else {
      form.reset({
        ...form.getValues(),
      });
    }
  }, [isUpdate, form]);

  return (
    <>
      {isLoadingQuotationGroups ? (
        <Loading />
      ) : (
        <Sheet
          open={open}
          onOpenChange={(v) => {
            if (!isPending) {
              onOpenChange(v);
              if (!v) {
                form.reset();
              }
            }
          }}
        >
          <SheetContent className="flex flex-col">
            <SheetHeader className="text-left">
              <SheetTitle className="text-2xl font-bold capitalize">
                {isUpdate ? "Actualizar" : "Crear"} Cotización
              </SheetTitle>
              <SheetDescription>
                {isUpdate ? "Actualiza los datos de la cotización" : "Crea una nueva cotización"}
              </SheetDescription>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-500px)] sm:h-[calc(100vh-250px)]">
              <Form {...form}>
                <form id="quotations-form" onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-5 p-4">
                  <FormField
                    control={form.control}
                    name="ruc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>RUC</FormLabel>
                        <FormControl>
                          <Input placeholder="Introduce el RUC" {...field} />
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
                        <FormLabel>Razón Social</FormLabel>
                        <FormControl>
                          <Input placeholder="Introduce la razón social" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="economicActivity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Actividad Económica</FormLabel>
                        <FormControl>
                          <Input placeholder="Introduce la actividad económica" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="numberOfWorkers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Trabajadores</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} placeholder="Introduce el número de trabajadores" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <fieldset className="flex flex-col gap-2 border rounded-md p-4 border-muted">
                    <legend className="text-xs font-semibold text-muted-foreground">Datos de la Cotización</legend>
                    <FormField
                      control={form.control}
                      name="quotationGroup"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Grupo de Cotización</FormLabel>
                          <FormControl>
                            <SelectCombobox
                              value={field.value}
                              onChange={field.onChange}
                              width="w-full"
                              options={
                                quotationGroups?.map((group) => ({
                                  label: (
                                    <div
                                      className={cn(
                                        "inline-flex items-center gap-2",
                                        group.isActive ? "" : "text-rose-600 dark:text-rose-800 line-through opacity-50"
                                      )}
                                    >
                                      <span className="text-xs text-muted-foreground">({group.code})</span>
                                      <span className="text-sm font-semibold">{group.name}</span>
                                    </div>
                                  ),
                                  value: group.id,
                                })) || []
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="service"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Servicio</FormLabel>
                          <FormControl>
                            <Input placeholder="Introduce el servicio" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </fieldset>

                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monto</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} step="0.01" placeholder="Introduce el monto" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="typePayment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Pago</FormLabel>
                        <FormControl>
                          <div className="flex items-center justify-center space-x-2">
                            <span
                              className={`text-sm font-medium ${field.value === TypePayment.MONTHLY ? "text-primary" : "text-muted-foreground"}`}
                            >
                              Pago Mensual
                            </span>

                            <Switch
                              checked={field.value === TypePayment.PUNCTUAL}
                              onCheckedChange={() =>
                                field.onChange(
                                  field.value === TypePayment.PUNCTUAL ? TypePayment.MONTHLY : TypePayment.PUNCTUAL
                                )
                              }
                              aria-label="Cambiar entre pago mensual y pago único"
                              className="data-[state=checked]:bg-primary"
                            />

                            <span
                              className={`text-sm font-medium ${field.value === TypePayment.PUNCTUAL ? "text-primary" : "text-muted-foreground"}`}
                            >
                              Pago Único
                            </span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dateStart"
                    render={({ field }) => {
                      return (
                        <FormItem>
                          <FormLabel>Fecha de Inicio</FormLabel>
                          <FormControl>
                            <DatePicker
                              selected={field.value}
                              onSelect={(date) => field.onChange(date)}
                              placeholder="Selecciona la fecha de inicio"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                  <FormField
                    control={form.control}
                    name="dateEnd"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha concluida</FormLabel>
                        <FormControl>
                          <DatePicker
                            selected={field.value}
                            onSelect={(date) => field.onChange(date)}
                            placeholder="Selecciona la fecha de fin"
                          />
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
                          <Input placeholder="Introduce la dirección" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                    <legend className="text-xs font-semibold text-muted-foreground">Datos de Contacto</legend>

                    <FormField
                      control={form.control}
                      name="mainContact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contacto Principal</FormLabel>
                          <FormControl>
                            <Input placeholder="Introduce el contacto principal" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cargo</FormLabel>
                          <FormControl>
                            <Input placeholder="Introduce el cargo" {...field} />
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
                            <PhoneInput defaultCountry="PE" placeholder="Introduce el teléfono" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Introduce el email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </fieldset>
                </form>
              </Form>
            </ScrollArea>
            <SheetFooter className="gap-2">
              <Button form="quotations-form" type="submit" disabled={isPending}>
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
      )}
    </>
  );
}
