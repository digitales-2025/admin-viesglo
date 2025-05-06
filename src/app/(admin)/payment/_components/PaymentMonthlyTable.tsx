import { useState } from "react";
import { DollarSign, PlusCircle, Save, Trash2 } from "lucide-react";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { DatePicker } from "@/shared/components/ui/date-picker";
import { Input } from "@/shared/components/ui/input";
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
  // Estado para los pagos mensuales asociados a esta cotización
  const [paymentItems, setPaymentItems] = useState<PaymentItem[]>([]);
  const [newPayment, setNewPayment] = useState<Partial<PaymentItem>>({
    amount: 0,
  });

  // Calcular el total de los pagos
  const totalAmount = paymentItems.reduce((sum, item) => sum + item.amount, 0);

  // Porcentaje pagado respecto al monto total de la cotización
  const percentagePaid = payment.amount > 0 ? (totalAmount / payment.amount) * 100 : 0;

  const handleAddPayment = () => {
    if (!newPayment.amount) return;

    const paymentItem: PaymentItem = {
      id: Date.now().toString(),
      amount: Number(newPayment.amount),
      paymentDate: newPayment.paymentDate,
      billingCode: newPayment.billingCode,
      billingDate: newPayment.billingDate,
      email: newPayment.email,
    };

    setPaymentItems([...paymentItems, paymentItem]);
    setNewPayment({ amount: 0 });
  };

  const handleRemovePayment = (id: string) => {
    setPaymentItems(paymentItems.filter((item) => item.id !== id));
  };

  // TODO: Implementar guardado de pagos en backend
  const handleSavePayments = () => {
    console.log("Guardando pagos:", paymentItems);
    // Lógica para guardar en backend
  };

  return (
    <div className="p-4 bg-muted/30 rounded-md ">
      <div className="flex justify-between items-center mb-4">
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
      <div className="border rounded-md mb-4">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-2 text-left">Monto</th>
              <th className="p-2 text-left">Fecha de Pago</th>
              <th className="p-2 text-left">Código Factura</th>
              <th className="p-2 text-left">Fecha Factura</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paymentItems.length > 0 ? (
              paymentItems.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="p-2">
                    {new Intl.NumberFormat("es-PE", {
                      style: "currency",
                      currency: "PEN",
                    }).format(item.amount)}
                  </td>
                  <td className="p-2">
                    {item.paymentDate ? new Date(item.paymentDate).toLocaleDateString("es-PE") : "-"}
                  </td>
                  <td className="p-2">{item.billingCode || "-"}</td>
                  <td className="p-2">
                    {item.billingDate ? new Date(item.billingDate).toLocaleDateString("es-PE") : "-"}
                  </td>
                  <td className="p-2">{item.email || "-"}</td>
                  <td className="p-2 text-center">
                    <Button variant="ghost" size="icon" onClick={() => handleRemovePayment(item.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-4 text-center text-muted-foreground">
                  No hay pagos registrados
                </td>
              </tr>
            )}
            {/* Fila para agregar nuevo pago */}
            <tr className="border-t bg-muted/30">
              <td className="p-2">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newPayment.amount || ""}
                  onChange={(e) => setNewPayment({ ...newPayment, amount: parseFloat(e.target.value) })}
                  placeholder="Monto"
                  className="h-8"
                />
              </td>
              <td className="p-2">
                <DatePicker
                  selected={newPayment.paymentDate}
                  onSelect={(date) => setNewPayment({ ...newPayment, paymentDate: date })}
                  placeholder="Fecha pago"
                  className="h-8"
                />
              </td>
              <td className="p-2">
                <Input
                  value={newPayment.billingCode || ""}
                  onChange={(e) => setNewPayment({ ...newPayment, billingCode: e.target.value })}
                  placeholder="Código"
                  className="h-8"
                />
              </td>
              <td className="p-2">
                <DatePicker
                  selected={newPayment.billingDate}
                  onSelect={(date) => setNewPayment({ ...newPayment, billingDate: date })}
                  placeholder="Fecha factura"
                  className="h-8"
                />
              </td>
              <td className="p-2">
                <Input
                  type="email"
                  value={newPayment.email || ""}
                  onChange={(e) => setNewPayment({ ...newPayment, email: e.target.value })}
                  placeholder="Email"
                  className="h-8"
                />
              </td>
              <td className="p-2 text-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleAddPayment}
                  disabled={!newPayment.amount}
                  className="h-8 w-8"
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          </tbody>
          <tfoot className="bg-muted/50">
            <tr>
              <td className="p-2 font-semibold">
                {new Intl.NumberFormat("es-PE", {
                  style: "currency",
                  currency: "PEN",
                }).format(totalAmount)}
              </td>
              <td colSpan={5} className="p-2 text-right">
                <div className="flex items-center justify-end gap-2">
                  <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${Math.min(percentagePaid, 100)}%` }}></div>
                  </div>
                  <span className="text-xs text-muted-foreground">{percentagePaid.toFixed(0)}% del total</span>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSavePayments}
                    disabled={paymentItems.length === 0}
                    className="ml-2"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Guardar
                  </Button>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
