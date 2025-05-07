"use client";

import { useState } from "react";
import { DollarSign, Save, Trash2 } from "lucide-react";

import AlertMessage from "@/shared/components/alerts/Alert";
import { Loading } from "@/shared/components/loading";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { DatePicker } from "@/shared/components/ui/date-picker";
import { Input } from "@/shared/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { useInstallmentPayments } from "../_hooks/useInstallmentPayment";
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
  // Estado para los pagos mensuales asociados a esta cotización
  const [newPayment, setNewPayment] = useState<Partial<PaymentItem>>({
    amount: 0,
  });

  // Calcular el total de los pagos
  const totalAmount = paymentItems?.reduce((sum, item) => sum + item.amount, 0) || 0;

  // Porcentaje pagado respecto al monto total de la cotización
  const percentagePaid = payment.amount > 0 ? (totalAmount / payment.amount) * 100 : 0;

  const handleAddPayment = () => {
    if (!newPayment.amount) return;

    const paymentItem: InstallmentPaymentCreate = {
      amount: Number(newPayment.amount),
      paymentDate: newPayment.paymentDate?.toISOString() || "",
      billingCode: newPayment.billingCode || "",
      billingDate: newPayment.billingDate?.toISOString() || "",
      emailBilling: newPayment.email || "",
      isPaid: true,
    };
    console.log("🚀 ~ handleAddPayment ~ paymentItem:", paymentItem);

    setNewPayment({ amount: 0 });
  };

  const handleRemovePayment = (id: string) => {
    console.log("🚀 ~ handleRemovePayment ~ id:", id);
  };

  return (
    <div className="p-4 bg-muted/30 rounded-md ">
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
      {isLoading && <Loading text="Cargando pagos mensuales..." />}
      {error && <AlertMessage variant="destructive" title="Error" description="Error al obtener los pagos mensuales" />}
      <div className="border rounded-md mb-4">
        <Table className="w-full text-sm">
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="p-2 text-left w-56">Monto</TableHead>
              <TableHead className="p-2 text-left w-56">Fecha de Pago</TableHead>
              <TableHead className="p-2 text-left w-56">Código Factura</TableHead>
              <TableHead className="p-2 text-left w-56">Fecha Factura</TableHead>
              <TableHead className="p-2 text-left w-56">Email</TableHead>
              <TableHead className="p-2 text-center w-56">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paymentItems && paymentItems.length > 0 ? (
              paymentItems.map((item) => (
                <TableRow key={item.id} className="border-t">
                  <TableCell className="p-2">
                    {new Intl.NumberFormat("es-PE", {
                      style: "currency",
                      currency: "PEN",
                    }).format(item.amount)}
                  </TableCell>
                  <TableCell className="p-2">
                    {item.paymentDate ? new Date(item.paymentDate).toLocaleDateString("es-PE") : "-"}
                  </TableCell>
                  <TableCell className="p-2">{item.billingCode || "-"}</TableCell>
                  <TableCell className="p-2">
                    {item.billingDate ? new Date(item.billingDate).toLocaleDateString("es-PE") : "-"}
                  </TableCell>
                  <TableCell className="p-2">{item.emailBilling || "-"}</TableCell>
                  <TableCell className="p-2 text-center">
                    <Button variant="ghost" size="icon" onClick={() => handleRemovePayment(item.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
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
                  placeholder="Monto"
                  className="h-8 w-56"
                />
              </TableCell>
              <TableCell className="p-2">
                <DatePicker
                  selected={newPayment.paymentDate}
                  onSelect={(date) => setNewPayment({ ...newPayment, paymentDate: date })}
                  placeholder="Fecha pago"
                  className="h-8 w-56"
                />
              </TableCell>
              <TableCell className="p-2">
                <Input
                  value={newPayment.billingCode || ""}
                  onChange={(e) => setNewPayment({ ...newPayment, billingCode: e.target.value })}
                  placeholder="Código"
                  className="h-8 w-56"
                />
              </TableCell>
              <TableCell className="p-2">
                <DatePicker
                  selected={newPayment.billingDate}
                  onSelect={(date) => setNewPayment({ ...newPayment, billingDate: date })}
                  placeholder="Fecha factura"
                  className="h-8 w-56"
                />
              </TableCell>
              <TableCell className="p-2">
                <Input
                  type="email"
                  value={newPayment.email || ""}
                  onChange={(e) => setNewPayment({ ...newPayment, email: e.target.value })}
                  placeholder="Email"
                  className="h-8 w-56"
                />
              </TableCell>
              <TableCell className="p-2 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddPayment}
                  disabled={paymentItems?.length === 0}
                  className="ml-2 border-emerald-500 text-emerald-500"
                >
                  <Save className="h-4 w-4 mr-1" />
                  Guardar Pago
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
                }).format(totalAmount)}
              </td>
              <td colSpan={5} className="p-2 text-right">
                <div className="flex items-center justify-end gap-2">
                  <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${Math.min(percentagePaid, 100)}%` }}></div>
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
