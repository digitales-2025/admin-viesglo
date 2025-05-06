import { Calendar, DollarSign, Mail } from "lucide-react";

import { Badge } from "@/shared/components/ui/badge";
import { PaymentResponse } from "../_types/payment.types";

interface PaymentMonthlyTableProps {
  payment: PaymentResponse;
}

export default function PaymentMonthlyTable({ payment }: PaymentMonthlyTableProps) {
  return (
    <div className="p-4 bg-slate-50 rounded-md border border-slate-200">
      <h3 className="text-lg font-semibold mb-4">Detalles de Pago Mensual</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-medium">Monto:</p>
            <p className="text-lg font-semibold">
              {new Intl.NumberFormat("es-PE", {
                style: "currency",
                currency: "PEN",
              }).format(payment.amount)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-medium">Fecha de Pago:</p>
            <p className="text-lg">
              {payment.paymentDate ? (
                new Date(payment.paymentDate).toLocaleDateString("es-PE")
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  Sin fecha
                </Badge>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-medium">Email:</p>
            <p className="text-lg">{payment.email || "No disponible"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
