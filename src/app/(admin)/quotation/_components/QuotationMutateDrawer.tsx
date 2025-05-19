"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { isValidPhoneNumber } from "react-phone-number-input";
import { z } from "zod";

import { CalendarDatePicker } from "@/shared/components/calendar-date-picker";
import { Loading } from "@/shared/components/loading";
import Redirect from "@/shared/components/redirect";
import UbigeoSelect from "@/shared/components/UbigeoSelect";
import { Button } from "@/shared/components/ui/button";
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
import { Label } from "@/shared/components/ui/label";
import { PhoneInput } from "@/shared/components/ui/phone-input";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
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
import { cn } from "@/shared/lib/utils";
import { useCreateQuotation, useUpdateQuotation } from "../_hooks/useQuotations";
import { PaymentPlan, QuotationCreate, QuotationResponse } from "../_types/quotation.types";
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
  position: z.string().optional(),
  phone: z.string().refine(isValidPhoneNumber, "El teléfono debe ser un número válido."),
  email: z.string().email("El email no es válido."),
  quotationGroup: z.string().min(1, "Se debe seleccionar un grupo de cotización."),
  paymentPlan: z.nativeEnum(PaymentPlan),
  dateQuotation: z.object(
    {
      from: z.date({ required_error: "La fecha de cotización es requerida." }),
      to: z.date({ required_error: "La fecha de cotización es requerida." }),
    },
    { required_error: "La fecha de cotización es requerida." }
  ),
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
      paymentPlan: PaymentPlan.SINGLE,
      dateQuotation: undefined,
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
      paymentPlan: data.paymentPlan as PaymentPlan,
      dateQuotation: data.dateQuotation?.from.toISOString(),
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
        paymentPlan: currentRow.paymentPlan as PaymentPlan,
        dateQuotation: currentRow.dateQuotation
          ? (() => {
              // Extraer directamente año, mes y día de la cadena ISO
              const [year, month, day] = currentRow.dateQuotation.split("T")[0].split("-").map(Number);
              // Crear una nueva fecha local con estos valores exactos (mes - 1 porque en JS los meses van de 0-11)
              return {
                from: new Date(year, month - 1, day, 12, 0, 0),
                to: new Date(year, month - 1, day, 12, 0, 0),
              };
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
        paymentPlan: PaymentPlan.SINGLE,
        dateQuotation: undefined,
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
        dateQuotation: undefined,
        paymentPlan: PaymentPlan.SINGLE,
      });
    } else {
      if (!isUpdate) {
        form.reset({
          ...form.getValues(),
          dateQuotation: undefined,
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
                            {quotationGroups && quotationGroups?.length > 0 ? (
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
                                          group.isActive
                                            ? ""
                                            : "text-rose-600 dark:text-rose-800 line-through opacity-50"
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
                            ) : (
                              <Redirect
                                text="No hay grupos de cotización"
                                to="/quotation-groups"
                                linkText="Ir a crear grupo de cotización"
                              />
                            )}
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
                    name="paymentPlan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Forma de Pago</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col gap-2 my-2"
                          >
                            <div className="flex items-center gap-2">
                              <RadioGroupItem
                                className="data-[state=checked]:fill-emerald-500 data-[state=checked]:text-emerald-600 data-[state=checked]:border-emerald-600"
                                value={PaymentPlan.INSTALLMENTS}
                                id="payment-plan-installments"
                              />
                              <Label
                                htmlFor="payment-plan-installments"
                                className={cn(
                                  "text-sm",
                                  field.value === PaymentPlan.INSTALLMENTS
                                    ? "text-emerald-500"
                                    : "text-muted-foreground"
                                )}
                              >
                                Pago Fraccionado
                                {field.value === PaymentPlan.INSTALLMENTS && <Check className="w-4 h-4" />}
                              </Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <RadioGroupItem
                                className="data-[state=checked]:fill-emerald-500 data-[state=checked]:text-emerald-600 data-[state=checked]:border-emerald-600"
                                value={PaymentPlan.SINGLE}
                                id="payment-plan-single"
                              />
                              <Label
                                htmlFor="payment-plan-single"
                                className={cn(
                                  "text-sm",
                                  field.value === PaymentPlan.SINGLE ? "text-emerald-500" : "text-muted-foreground"
                                )}
                              >
                                Pago Único
                                {field.value === PaymentPlan.SINGLE && <Check className="w-4 h-4" />}
                              </Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                        <FormDescription>
                          {field.value === PaymentPlan.INSTALLMENTS
                            ? "El pago se realizará en varias  cuotas fraccionadas."
                            : "El pago se realizará una sola vez."}
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dateQuotation"
                    render={({ field }) => {
                      return (
                        <FormItem>
                          <FormLabel>Fecha de Cotización</FormLabel>
                          <FormControl>
                            <CalendarDatePicker
                              variant="outline"
                              date={field.value || { from: undefined, to: undefined }}
                              onDateSelect={({ from, to }) => {
                                form.setValue("dateQuotation", {
                                  from: from || new Date(),
                                  to: to || new Date(),
                                });
                              }}
                              numberOfMonths={1}
                              disabled={isPending}
                              closeOnSelect={true}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
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
                          <FormLabel>Cargo de Contacto</FormLabel>
                          <FormControl>
                            <Input placeholder="Introduce el cargo de contacto" {...field} />
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
                          <FormLabel>Teléfono de Contacto</FormLabel>
                          <FormControl>
                            <PhoneInput
                              defaultCountry="PE"
                              placeholder="Introduce el teléfono de contacto"
                              {...field}
                            />
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
                          <FormLabel>Email de Contacto</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Introduce el email de contacto" {...field} />
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
