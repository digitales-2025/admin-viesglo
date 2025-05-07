"use client";

import { useState } from "react";
import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Check, DollarSign, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { cn } from "@/lib/utils";
import AlertMessage from "@/shared/components/alerts/Alert";
import { Loading } from "@/shared/components/loading";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { DatePicker } from "@/shared/components/ui/date-picker";
import { Input } from "@/shared/components/ui/input";
import { Progress } from "@/shared/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import {
  useCreateInstallmentPayment,
  useDeleteInstallmentPayment,
  useInstallmentPayments,
  useUpdateInstallmentPayment,
} from "../_hooks/useInstallmentPayment";
import { InstallmentPaymentCreate } from "../_types/installment-payment.types";
import { PaymentResponse } from "../_types/payment.types";

interface PaymentItem {
  id: string;
  amount: number;
  paymentDate?: Date;
  billingCode?: string;
  billingDate?: Date;
  email?: string;
}

interface PaymentMonthlyTableProps {
  payment: PaymentResponse;
}

export default function PaymentMonthlyTable({ payment }: PaymentMonthlyTableProps) {
  const { data: paymentItems, isLoading, error } = useInstallmentPayments(payment.id);
  const { mutate: createInstallmentPayment, isPending: isCreating } = useCreateInstallmentPayment();
  const { mutate: updateInstallmentPayment, isPending: isUpdating } = useUpdateInstallmentPayment();
  const { mutate: deleteInstallmentPayment, isPending: isDeleting } = useDeleteInstallmentPayment();

  const [newPayment, setNewPayment] = useState<Partial<PaymentItem>>({
    amount: 0,
  });

  // Estado para controlar qué fila se está editando
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingPayment, setEditingPayment] = useState<Partial<PaymentItem>>({});

  // Calcular el total de los pagos
  const totalAmountPaid = paymentItems?.reduce((sum, item) => sum + (item.isActive ? item.amount : 0), 0) || 0;
  const percentagePaid = payment.amount > 0 ? (totalAmountPaid / payment.amount) * 100 : 0;

  // Función para formatear fechas preservando el día exacto sin ajustes de zona horaria
  const formatDatePreserveDay = (dateString: string | undefined) => {
    if (!dateString) return "-";

    // Extraer directamente año, mes y día de la cadena ISO
    const [datePart] = dateString.split("T");
    if (!datePart) return "-";

    const [year, month, day] = datePart.split("-").map(Number);
    if (!year || !month || !day) return "-";

    // Crear una nueva fecha local con estos valores exactos
    // Ajustamos el día a mediodía para evitar problemas de cambio de día
    const date = new Date(year, month - 1, day, 12, 0, 0);

    return format(date, "PPP", { locale: es });
  };

  // Función para convertir fecha a TZDate preservando el día exacto
  const createTZDatePreserveDay = (date: Date | undefined) => {
    if (!date) return undefined;

    // Extraer componentes de la fecha
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    // Crear un TZDate con esos componentes exactos
    return new TZDate(year, month, day, "America/Lima").toISOString();
  };

  const handleAddPayment = () => {
    if (!newPayment.amount) {
      toast.error("Ingrese un monto de pago.");
      return;
    }

    if (newPayment.amount <= 0 || newPayment.amount > payment.amount) {
      toast.error("El monto de pago debe ser mayor que 0 y menor que el monto de la cotización.");
      return;
    }

    if (!newPayment.paymentDate) {
      toast.error("Ingrese una fecha de pago");
      return;
    }

    if (!newPayment.billingCode || newPayment.billingCode.trim() === "") {
      toast.error("Ingrese un código de factura");
      return;
    }

    if (!z.string().email().safeParse(newPayment.email).success && newPayment.email) {
      toast.error("Ingrese un email válido");
      return;
    }

    const paymentItem: InstallmentPaymentCreate = {
      amount: Number(newPayment.amount),
      paymentDate:
        createTZDatePreserveDay(newPayment.paymentDate) ||
        new TZDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), "America/Lima").toISOString(),
      billingCode: newPayment.billingCode || "",
      billingDate: createTZDatePreserveDay(newPayment.billingDate),
      emailBilling: newPayment.email || "",
      isPaid: true,
    };

    createInstallmentPayment(
      {
        paymentId: payment.id,
        data: paymentItem,
      },
      {
        onSuccess: () => {
          setNewPayment({ amount: 0 });
          toast.success("Pago mensual creado correctamente");
        },
      }
    );
  };

  const handleEditPayment = (id: string) => {
    const paymentToEdit = paymentItems?.find((item) => item.id === id);
    if (paymentToEdit) {
      setEditingId(id);

      // Para las fechas, extraemos el año, mes y día directamente de la cadena ISO
      // y creamos una nueva fecha a mediodía para evitar problemas de zona horaria
      let paymentDate: Date | undefined = undefined;
      let billingDate: Date | undefined = undefined;

      if (paymentToEdit.paymentDate) {
        const [datePart] = paymentToEdit.paymentDate.split("T");
        if (datePart) {
          const [year, month, day] = datePart.split("-").map(Number);
          if (year && month && day) {
            // Crear fecha a mediodía para evitar problemas de zona horaria
            paymentDate = new Date(year, month - 1, day, 12, 0, 0);
          }
        }
      }

      if (paymentToEdit.billingDate) {
        const [datePart] = paymentToEdit.billingDate.split("T");
        if (datePart) {
          const [year, month, day] = datePart.split("-").map(Number);
          if (year && month && day) {
            // Crear fecha a mediodía para evitar problemas de zona horaria
            billingDate = new Date(year, month - 1, day, 12, 0, 0);
          }
        }
      }

      setEditingPayment({
        amount: paymentToEdit.amount,
        paymentDate: paymentDate,
        billingCode: paymentToEdit.billingCode,
        billingDate: billingDate,
        email: paymentToEdit.emailBilling,
      });
    }
  };

  const handleSaveEdit = (id: string) => {
    if (!editingPayment.amount) {
      toast.error("Ingrese un monto de pago.");
      return;
    }

    if (editingPayment.amount <= 0 || editingPayment.amount > payment.amount) {
      toast.error("El monto de pago debe ser mayor que 0 y menor que el monto de la cotización.");
      return;
    }

    if (!editingPayment.paymentDate) {
      toast.error("Ingrese una fecha de pago");
      return;
    }

    if (!editingPayment.billingCode || editingPayment.billingCode.trim() === "") {
      toast.error("Ingrese un código de factura");
      return;
    }

    if (!z.string().email().safeParse(editingPayment.email).success && editingPayment.email) {
      toast.error("Ingrese un email válido");
      return;
    }
    updateInstallmentPayment(
      {
        id,
        data: {
          amount: editingPayment.amount,
          paymentDate: createTZDatePreserveDay(editingPayment.paymentDate),
          billingCode: editingPayment.billingCode,
          billingDate: createTZDatePreserveDay(editingPayment.billingDate),
          emailBilling: editingPayment.email || "",
        },
      },
      {
        onSuccess: () => {
          setEditingId(null);
          setEditingPayment({});
          toast.success("Pago mensual actualizado correctamente");
        },
      }
    );
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingPayment({});
  };

  const disabledAddPayment = !newPayment.amount || !newPayment.paymentDate || !newPayment.billingCode;

  const handleRemovePayment = (id: string) => {
    deleteInstallmentPayment(id);
  };

  return (
    <div className="p-4 bg-muted/30 rounded-md">
      <div className="flex gap-4 items-center mb-4">
        <h3 className="text-lg font-semibold">Detalles de Pago Mensual</h3>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-700/30">
            <DollarSign className="h-4 w-4 mr-1 text-primary" />
            Monto Total:{" "}
            {new Intl.NumberFormat("es-PE", {
              style: "currency",
              currency: "PEN",
            }).format(payment.amount)}
          </Badge>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Cotización:</span>
          <Badge variant="outline" className="w-fit">
            {payment.code}
          </Badge>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Cliente:</span>
          <Badge variant="outline" className="w-fit">
            {payment.businessName}
          </Badge>
        </div>
      </div>

      {/* Tabla de pagos */}
      {error && <AlertMessage variant="destructive" title="Error" description="Error al obtener los pagos mensuales" />}
      <div className="border rounded-md mb-4">
        <Table className="w-full text-sm">
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="p-2 text-left w-56">Monto</TableHead>
              <TableHead className="p-2 text-left w-56">Fecha de Pago</TableHead>
              <TableHead className="p-2 text-left w-56">Código Factura</TableHead>
              <TableHead className="p-2 text-left w-56">Fecha Factura</TableHead>
              <TableHead className="p-2 text-left w-56">Email destinatario</TableHead>
              <TableHead className="p-2 text-left w-56">Estado</TableHead>
              <TableHead className="p-2 text-center w-56">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="p-4 text-center text-muted-foreground">
                  <Loading text="Cargando pagos mensuales..." />
                </TableCell>
              </TableRow>
            ) : paymentItems && paymentItems.length > 0 ? (
              paymentItems.map((item) => {
                return (
                  <TableRow key={item.id} className={cn("border-t", editingId === item.id && "bg-muted/50")}>
                    <TableCell className="p-2">
                      {editingId === item.id ? (
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editingPayment.amount || ""}
                          onChange={(e) => setEditingPayment({ ...editingPayment, amount: parseFloat(e.target.value) })}
                          className="h-8 w-56"
                        />
                      ) : (
                        <span className={cn(!item.isActive && "text-destructive line-through")}>
                          {new Intl.NumberFormat("es-PE", {
                            style: "currency",
                            currency: "PEN",
                          }).format(item.amount)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="p-2">
                      {editingId === item.id ? (
                        <DatePicker
                          selected={editingPayment.paymentDate}
                          onSelect={(date) => setEditingPayment({ ...editingPayment, paymentDate: date })}
                          className="h-8 w-56"
                        />
                      ) : (
                        <span className={cn(!item.isActive && "text-destructive line-through")}>
                          {formatDatePreserveDay(item.paymentDate as string)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="p-2">
                      {editingId === item.id ? (
                        <Input
                          value={editingPayment.billingCode || ""}
                          onChange={(e) => setEditingPayment({ ...editingPayment, billingCode: e.target.value })}
                          className="h-8 w-56"
                        />
                      ) : (
                        <span className={cn(!item.isActive && "text-destructive line-through")}>
                          {item.billingCode || "-"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="p-2">
                      {editingId === item.id ? (
                        <DatePicker
                          selected={editingPayment.billingDate}
                          onSelect={(date) => setEditingPayment({ ...editingPayment, billingDate: date })}
                          className="h-8 w-56"
                        />
                      ) : (
                        <span className={cn(!item.isActive && "text-destructive line-through")}>
                          {formatDatePreserveDay(item.billingDate as string)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="p-2">
                      {editingId === item.id ? (
                        <Input
                          type="email"
                          value={editingPayment.email || ""}
                          onChange={(e) => setEditingPayment({ ...editingPayment, email: e.target.value })}
                          className="h-8 w-56"
                        />
                      ) : (
                        <span className={cn(!item.isActive && "text-destructive line-through")}>
                          {item.emailBilling || "-"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="p-2 text-center">
                      {item.isActive ? (
                        <Badge variant="success">Activo</Badge>
                      ) : (
                        <Badge variant="error">Inactivo</Badge>
                      )}
                    </TableCell>
                    <TableCell className="p-2 text-center">
                      {editingId === item.id ? (
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSaveEdit(item.id)}
                            disabled={isUpdating}
                            className="border-emerald-500 text-emerald-500"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Guardar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancelEdit}
                            className="border-destructive text-destructive"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancelar
                          </Button>
                        </div>
                      ) : (
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditPayment(item.id)}
                            disabled={isUpdating}
                          >
                            <Pencil className="h-4 w-4 text-sky-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemovePayment(item.id)}
                            disabled={isDeleting || !item.isActive}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="p-4 text-center text-muted-foreground">
                  No hay pagos registrados
                </TableCell>
              </TableRow>
            )}
            {/* Fila para agregar nuevo pago */}
            <TableRow className="border-t bg-muted/30">
              <TableCell className="p-2">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newPayment.amount || ""}
                  onChange={(e) => setNewPayment({ ...newPayment, amount: parseFloat(e.target.value) })}
                  placeholder="Ingrese el monto a pagar"
                  className="h-8 w-56"
                />
              </TableCell>
              <TableCell className="p-2">
                <DatePicker
                  selected={newPayment.paymentDate}
                  onSelect={(date) => setNewPayment({ ...newPayment, paymentDate: date })}
                  placeholder="Seleccionar fecha"
                  className="h-8 w-56"
                />
              </TableCell>
              <TableCell className="p-2">
                <Input
                  value={newPayment.billingCode || ""}
                  onChange={(e) => setNewPayment({ ...newPayment, billingCode: e.target.value })}
                  placeholder="Ingrese el código de factura"
                  className="h-8 w-56"
                />
              </TableCell>
              <TableCell className="p-2">
                <DatePicker
                  selected={newPayment.billingDate}
                  onSelect={(date) => setNewPayment({ ...newPayment, billingDate: date })}
                  placeholder="Seleccionar fecha"
                  className="h-8 w-56"
                />
              </TableCell>
              <TableCell className="p-2">
                <Input
                  type="email"
                  value={newPayment.email || ""}
                  onChange={(e) => setNewPayment({ ...newPayment, email: e.target.value })}
                  placeholder="Ingrese el email destinatario"
                  className="h-8 w-56"
                />
              </TableCell>

              <TableCell className="p-2 text-center" colSpan={2}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddPayment}
                  disabled={disabledAddPayment || isCreating}
                  className="ml-2 border-emerald-500 text-emerald-500"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Realizar el pago
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
          <TableFooter className="bg-muted/50">
            <tr>
              <td className="p-2 font-semibold">
                {new Intl.NumberFormat("es-PE", {
                  style: "currency",
                  currency: "PEN",
                }).format(totalAmountPaid)}
              </td>
              <td colSpan={6} className="p-2 text-right">
                <div className="flex items-center justify-end gap-2">
                  <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                    <Progress value={Math.min(percentagePaid, 100)} />
                  </div>
                  <span className="text-xs text-muted-foreground">{percentagePaid.toFixed(0)}% del total</span>
                </div>
              </td>
            </tr>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
}
