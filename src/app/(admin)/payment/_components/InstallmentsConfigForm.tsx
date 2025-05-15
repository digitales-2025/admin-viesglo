"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { CalendarDatePicker } from "@/shared/components/calendar-date-picker";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
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
import { Textarea } from "@/shared/components/ui/textarea";
import {
  useCreatePaymentInstallmentConfig,
  useUpdatePaymentInstallmentConfig,
} from "../_hooks/usePaymentInstallmentConfig";
import { PaymentInstallmentConfigResponse } from "../_types/installment-payment.types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentId: string;
  currentRow?: PaymentInstallmentConfigResponse;
}

// Esquema completo del formulario
const formSchema = z.object({
  installmentNumber: z.string().min(3, {
    message: "Ingrese la canitdad de cuotas en las que se dividirá el pago",
  }),
  installmentAmount: z.string().min(3, {
    message: "Ingrese el monto de cada cuota",
  }),
  installmentEmails: z.string().min(3, {
    message: "Ingrese los correos de los destinatarios",
  }),
  installmentDate: z.string().min(1, {
    message: "Ingrese las fechas en las que se realizarán los pagos",
  }),
  startServiceDate: z.object({
    from: z.date({
      required_error: "Seleccione la fecha de inicio del servicio",
    }),
    to: z.date(),
  }),
  endServiceDate: z.object({
    from: z.date({
      required_error: "Seleccione la fecha de inicio del servicio",
    }),
    to: z.date(),
  }),
});

export default function InstallmentsConfigForm({ open, onOpenChange, currentRow, paymentId }: Props) {
  const { mutate: createPaymentInstallmentConfig, isPending: isCreating } = useCreatePaymentInstallmentConfig();
  const { mutate: updatePaymentInstallmentConfig, isPending: isUpdating } = useUpdatePaymentInstallmentConfig();

  const isUpdate = !!currentRow?.id;
  const isPending = isCreating || isUpdating;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      installmentNumber: "",
      installmentAmount: "",
      installmentEmails: "",
      installmentDate: "",
      startServiceDate: {
        from: undefined,
        to: undefined,
      },
      endServiceDate: {
        from: undefined,
        to: undefined,
      },
    },
    mode: "onChange",
  });
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const { startServiceDate, endServiceDate } = values;

    const startDateService = startServiceDate.from.toISOString();
    const endDateService = endServiceDate.from.toISOString();

    if (isUpdate) {
      updatePaymentInstallmentConfig(
        {
          id: currentRow?.id,
          paymentId: paymentId,
          data: {
            installmentsQuantity: values.installmentNumber,
            installmentsAmount: values.installmentAmount,
            installmentsEmails: values.installmentEmails,
            installmentsDates: values.installmentDate,
            startDateService: (() => {
              // Extraer directamente año, mes y día de la cadena ISO
              const [year, month, day] = values.startServiceDate.from
                .toISOString()
                .split("T")[0]
                .split("-")
                .map(Number);
              // Crear una nueva fecha local con estos valores exactos (mes - 1 porque en JS los meses van de 0-11)
              const date = new Date(year, month - 1, day, 12, 0, 0);
              return date.toISOString();
            })(),
            endDateService: (() => {
              const [year, month, day] = values.endServiceDate.from.toISOString().split("T")[0].split("-").map(Number);
              const date = new Date(year, month - 1, day, 12, 0, 0);
              return date.toISOString();
            })(),
          },
        },
        {
          onSuccess: () => {
            form.reset();
            onOpenChange(false);
          },
        }
      );
    } else {
      createPaymentInstallmentConfig(
        {
          paymentId: paymentId,
          data: {
            installmentsQuantity: values.installmentNumber,
            installmentsAmount: values.installmentAmount,
            installmentsEmails: values.installmentEmails,
            installmentsDates: values.installmentDate,
            startDateService: (() => {
              const [year, month, day] = startDateService.split("T")[0].split("-").map(Number);
              const date = new Date(year, month - 1, day, 12, 0, 0);
              return date.toISOString();
            })(),
            endDateService: (() => {
              const [year, month, day] = endDateService.split("T")[0].split("-").map(Number);
              const date = new Date(year, month - 1, day, 12, 0, 0);
              return date.toISOString();
            })(),
          },
        },
        {
          onSuccess: () => {
            form.reset();
            onOpenChange(false);
          },
        }
      );
    }
  };

  useEffect(() => {
    if (isUpdate && currentRow?.id) {
      form.reset({
        installmentNumber: currentRow.installmentsQuantity || "",
        installmentAmount: currentRow.installmentsAmount || "",
        installmentEmails: currentRow.installmentsEmails || "",
        installmentDate: currentRow.installmentsDates || "",
        startServiceDate: {
          from: currentRow.startDateService ? new Date(currentRow.startDateService) : undefined,
          to: currentRow.startDateService ? new Date(currentRow.startDateService) : undefined,
        },
        endServiceDate: {
          from: currentRow.endDateService ? new Date(currentRow.endDateService) : undefined,
          to: currentRow.endDateService ? new Date(currentRow.endDateService) : undefined,
        },
      });
    } else {
      form.reset({
        installmentNumber: "",
        installmentAmount: "",
        installmentEmails: "",
        installmentDate: "",
        startServiceDate: {
          from: undefined,
          to: undefined,
        },
        endServiceDate: {
          from: undefined,
          to: undefined,
        },
      });
    }
  }, [isUpdate, currentRow, form]);

  useEffect(() => {
    if (!open) {
      form.reset({
        installmentNumber: "",
        installmentAmount: "",
        installmentEmails: "",
        installmentDate: "",
        startServiceDate: {
          from: undefined,
          to: undefined,
        },
        endServiceDate: {
          from: undefined,
          to: undefined,
        },
      });
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Configuración de cronograma de pagos</DialogTitle>
          <DialogDescription>Defina los detalles y condiciones del cronograma de pagos</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[calc(100vh-200px)]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 p-5">
              <FormField
                control={form.control}
                name="installmentNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cantidad de cuotas</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Ej: El pago se realizará en 3 cuotas" {...field} disabled={isPending} />
                    </FormControl>
                    <FormDescription>Detalle la cantidad de cuotas</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="installmentAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto de cada cuota</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ej: Los pagos serán de S/1500 cada una"
                        className="min-h-[80px]"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormDescription>Especifique el monto de cada cuota</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="installmentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Programación de pagos</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ej: Pagos los días 15 de cada mes"
                        className="min-h-[80px]"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormDescription>Indique cuándo deben realizarse los pagos</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="installmentEmails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correos para facturación</FormLabel>
                    <FormControl>
                      <Input placeholder="correo1@ejemplo.com, correo2@ejemplo.com" {...field} disabled={isPending} />
                    </FormControl>
                    <FormDescription>Separe múltiples correos con comas</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                <FormField
                  control={form.control}
                  name="startServiceDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inicio del servicio</FormLabel>
                      <FormControl>
                        <CalendarDatePicker
                          variant="outline"
                          date={field.value || { from: undefined, to: undefined }}
                          onDateSelect={({ from, to }) => {
                            form.setValue("startServiceDate", {
                              from: from || new Date(),
                              to: to || new Date(),
                            });
                          }}
                          numberOfMonths={1}
                          disabled={isPending}
                          closeOnSelect={true}
                        />
                      </FormControl>
                      <FormDescription>Fecha en que comienza el servicio</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endServiceDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fin del servicio</FormLabel>
                      <FormControl>
                        <CalendarDatePicker
                          variant="outline"
                          date={field.value || { from: undefined, to: undefined }}
                          onDateSelect={({ from, to }) => {
                            form.setValue("endServiceDate", {
                              from: from || new Date(),
                              to: to || new Date(),
                            });
                          }}
                          numberOfMonths={1}
                          disabled={isPending}
                          closeOnSelect={true}
                        />
                      </FormControl>
                      <FormDescription>Fecha de finalización del servicio</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter className="mt-6">
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    "Guardando..."
                  ) : isUpdate ? (
                    <>
                      Actualizar
                      <Check className="h-4 w-4 ml-1" />
                    </>
                  ) : (
                    "Crear"
                  )}
                </Button>
                <DialogClose asChild>
                  <Button variant="outline" disabled={isPending}>
                    Cancelar
                  </Button>
                </DialogClose>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
