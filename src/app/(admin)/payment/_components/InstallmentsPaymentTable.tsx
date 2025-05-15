"use client";

import { useMemo, useState } from "react";
import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Check, FileText, IterationCcw, Pencil, Trash2, X } from "lucide-react";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";

import { useAuthPermissions } from "@/app/(auth)/sign-in/_hooks/useAuth";
import { AdminComponent } from "@/auth/presentation/components/AdminComponent";
import { ProtectedComponent } from "@/auth/presentation/components/ProtectedComponent";
import { cn } from "@/lib/utils";
import AlertMessage from "@/shared/components/alerts/Alert";
import { CalendarDatePicker } from "@/shared/components/calendar-date-picker";
import { Loading } from "@/shared/components/loading";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Progress } from "@/shared/components/ui/progress";
import { Switch } from "@/shared/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Textarea } from "@/shared/components/ui/textarea";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import {
  useConcretizeInstallmentPayment,
  useCreateInstallmentPayment,
  useInstallmentPayments,
  useToggleInstallmentPayment,
  useUpdateInstallmentPayment,
} from "../_hooks/useInstallmentPayment";
import { InstallmentPaymentCreate } from "../_types/installment-payment.types";
import { PaymentResponse } from "../_types/payment.types";
import { EnumAction, EnumResource } from "../../roles/_utils/groupedPermission";
import { MODULE_INSTALLMENT_PAYMENTS } from "./InstallmentsDialogs";

interface PaymentItem {
  id: string;
  amount: number;
  paymentDate?: DateRange;
  billingCode?: string;
  billingDate?: DateRange;
  email?: string;
}

interface InstallmentsPaymentTableProps {
  payment: PaymentResponse;
}

export default function InstallmentsPaymentTable({ payment }: InstallmentsPaymentTableProps) {
  const { data: paymentItems, isLoading, error } = useInstallmentPayments(payment.id);
  const { mutate: createInstallmentPayment, isPending: isCreating } = useCreateInstallmentPayment();
  const { mutate: updateInstallmentPayment, isPending: isUpdating } = useUpdateInstallmentPayment();
  const { mutate: toggleInstallmentPayment, isPending: isToggling } = useToggleInstallmentPayment();
  const { mutate: concretizeInstallmentPayment, isPending: isConcretizing } = useConcretizeInstallmentPayment();

  // Verificar permisos
  const { data: permissions } = useAuthPermissions();
  const canCreatePayment = useMemo(() => {
    if (!permissions) return false;
    return permissions.some((p) => p.resource === EnumResource.payments && p.action === EnumAction.create);
  }, [permissions]);

  const [newPayment, setNewPayment] = useState<Partial<PaymentItem>>({
    amount: 0,
    paymentDate: undefined,
    billingDate: undefined,
  });

  // Estado para controlar qué fila se está editando
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingPayment, setEditingPayment] = useState<Partial<PaymentItem>>({
    paymentDate: undefined,
    billingDate: undefined,
  });

  // Utilizar el store de diálogos
  const { open } = useDialogStore();

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

  // Funciones de manejo de pagos
  const handleAddPayment = () => {
    const paymentItem: InstallmentPaymentCreate = {
      amount: Number(newPayment.amount),
      paymentDate: createTZDatePreserveDay(newPayment.paymentDate?.from),
      billingCode: newPayment.billingCode || "",
      billingDate: createTZDatePreserveDay(newPayment.billingDate?.from),
      emailBilling: newPayment.email || "",
      isPaid: false,
    };
    createInstallmentPayment(
      {
        paymentId: payment.id,
        data: paymentItem,
      },
      {
        onSuccess: () => {
          setNewPayment({ amount: 0 });
          toast.success("Pago facturado correctamente");
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
      let paymentDate: DateRange | undefined = undefined;
      let billingDate: DateRange | undefined = undefined;

      if (paymentToEdit.paymentDate) {
        const [datePart] = paymentToEdit.paymentDate.split("T");
        if (datePart) {
          const [year, month, day] = datePart.split("-").map(Number);
          if (year && month && day) {
            // Crear fecha a mediodía para evitar problemas de zona horaria
            paymentDate = {
              from: new Date(year, month - 1, day, 12, 0, 0),
              to: new Date(year, month - 1, day, 12, 0, 0),
            };
          }
        }
      }

      if (paymentToEdit.billingDate) {
        const [datePart] = paymentToEdit.billingDate.split("T");
        if (datePart) {
          const [year, month, day] = datePart.split("-").map(Number);
          if (year && month && day) {
            // Crear fecha a mediodía para evitar problemas de zona horaria
            billingDate = {
              from: new Date(year, month - 1, day, 12, 0, 0),
              to: new Date(year, month - 1, day, 12, 0, 0),
            };
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
    updateInstallmentPayment(
      {
        id,
        data: {
          amount: editingPayment.amount,
          paymentDate: createTZDatePreserveDay(editingPayment.paymentDate?.from),
          billingCode: editingPayment.billingCode,
          billingDate: createTZDatePreserveDay(editingPayment.billingDate?.from),
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

  const handleConcretizePayment = (id: string) => {
    const paymentItem = paymentItems?.find((item) => item.id === id);
    const paymentDate = paymentItem?.paymentDate;
    const billingCode = paymentItem?.billingCode;

    if (!paymentDate) {
      toast.error("Tienes que seleccionar una fecha de pago para concretizar el pago");
      return;
    }

    if (!billingCode) {
      toast.error("Tienes que seleccionar un código de factura para concretizar el pago");
      return;
    }

    concretizeInstallmentPayment({
      id,
      installmentPayment: {
        isPaid: !paymentItem?.isPaid,
        paymentDate,
        billingCode,
      },
    });
  };

  const disabledAddPayment =
    !!newPayment.amount ||
    !!newPayment.paymentDate?.from ||
    !!newPayment.billingCode ||
    !!newPayment.billingDate?.from ||
    !!newPayment.email;

  const handleTogglePayment = (id: string) => {
    toggleInstallmentPayment(id);
  };

  return (
    <div>
      {/* Tabla de pagos */}
      {error && <AlertMessage variant="destructive" title="Error" description="Error al obtener los pagos mensuales" />}
      <div className="border rounded-md mb-4">
        <Table className="w-full text-sm">
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="p-2 text-left w-56">Monto</TableHead>
              <TableHead className="p-2 text-left w-56">Código factura</TableHead>
              <TableHead className="p-2 text-left w-56">Fecha facturación</TableHead>
              <TableHead className="p-2 text-left w-56">Email destinatario</TableHead>
              <TableHead className="p-2 text-left w-56">Fecha de pago</TableHead>
              <TableHead className="p-2 text-left w-56">Estado</TableHead>
              <TableHead className="p-2 text-left w-56">Estado de pago</TableHead>
              <TableHead className="p-2 text-center w-56">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="p-4 text-center text-muted-foreground">
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
                        <span
                          className={cn(
                            !item.isActive && "text-destructive line-through",
                            item.isPaid && "text-emerald-500 font-semibold"
                          )}
                        >
                          {new Intl.NumberFormat("es-PE", {
                            style: "currency",
                            currency: "PEN",
                          }).format(item.amount)}
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
                        <span
                          className={cn(
                            !item.isActive && "text-destructive line-through",
                            item.isPaid && "text-emerald-500 font-semibold"
                          )}
                        >
                          {item.billingCode || "-"}
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="p-2">
                      {editingId === item.id ? (
                        <CalendarDatePicker
                          variant="outline"
                          numberOfMonths={1}
                          date={editingPayment.billingDate || { from: undefined, to: undefined }}
                          onDateSelect={(date) => setEditingPayment({ ...editingPayment, billingDate: date })}
                          onClear={() => setEditingPayment({ ...editingPayment, billingDate: undefined })}
                          closeOnSelect={true}
                        />
                      ) : (
                        <span
                          className={cn(
                            !item.isActive && "text-destructive line-through",
                            item.isPaid && "text-emerald-500 font-semibold"
                          )}
                        >
                          {formatDatePreserveDay(item.billingDate as string)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="p-2">
                      {editingId === item.id ? (
                        <Textarea
                          value={editingPayment.email || ""}
                          onChange={(e) => setEditingPayment({ ...editingPayment, email: e.target.value })}
                          className="min-h-7 w-56"
                        />
                      ) : (
                        <span
                          className={cn(
                            "text-wrap",
                            !item.isActive && "text-destructive line-through",
                            item.isPaid && "text-emerald-500 font-semibold"
                          )}
                        >
                          {item.emailBilling || "-"}
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="p-2">
                      {editingId === item.id ? (
                        <CalendarDatePicker
                          variant="outline"
                          numberOfMonths={1}
                          date={editingPayment.paymentDate || { from: undefined, to: undefined }}
                          onDateSelect={(date) => setEditingPayment({ ...editingPayment, paymentDate: date })}
                          onClear={() => setEditingPayment({ ...editingPayment, paymentDate: undefined })}
                          closeOnSelect={true}
                        />
                      ) : (
                        <span
                          className={cn(
                            !item.isActive && "text-destructive line-through",
                            item.isPaid && "text-emerald-500 font-semibold"
                          )}
                        >
                          {formatDatePreserveDay(item.paymentDate as string)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="p-2 text-center">
                      <AdminComponent>
                        {item.isActive ? (
                          <Badge variant="success">Activo</Badge>
                        ) : (
                          <Badge variant="error">Inactivo</Badge>
                        )}
                      </AdminComponent>
                    </TableCell>
                    <TableCell className="p-2 text-center">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={item.isPaid}
                          onCheckedChange={() => handleConcretizePayment(item.id)}
                          disabled={isConcretizing || payment.isPaid}
                          className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-rose-500 dark:data-[state=checked]:bg-emerald-500 dark:data-[state=unchecked]:bg-rose-500"
                        />
                        {item.isPaid ? (
                          <Badge variant="success">Pagado</Badge>
                        ) : (
                          <Badge variant="error">Pendiente</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="p-2 text-center">
                      <ProtectedComponent
                        requiredPermissions={[
                          { resource: EnumResource.payments, action: EnumAction.update },
                          { resource: EnumResource.payments, action: EnumAction.delete },
                        ]}
                      >
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
                            <ProtectedComponent
                              requiredPermissions={[{ resource: EnumResource.payments, action: EnumAction.update }]}
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditPayment(item.id)}
                                disabled={isUpdating || payment.isPaid || item.isPaid}
                                title="Editar pago"
                                className="hover:text-sky-600"
                              >
                                <Pencil className="h-4 w-4 " />
                              </Button>
                            </ProtectedComponent>
                            {item.isActive ? (
                              <ProtectedComponent
                                requiredPermissions={[{ resource: EnumResource.payments, action: EnumAction.delete }]}
                              >
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    open(MODULE_INSTALLMENT_PAYMENTS, "delete", {
                                      paymentId: payment.id,
                                      installmentId: item.id,
                                    });
                                  }}
                                  disabled={!item.isActive || payment.isPaid || item.isPaid}
                                  title="Eliminar pago"
                                  className="hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 " />
                                </Button>
                              </ProtectedComponent>
                            ) : (
                              <ProtectedComponent
                                requiredPermissions={[{ resource: EnumResource.payments, action: EnumAction.delete }]}
                              >
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleTogglePayment(item.id)}
                                  disabled={isToggling || payment.isPaid}
                                  title="Reactivar pago"
                                >
                                  <IterationCcw className="h-4 w-4 text-yellow-600 scale-x-[-1]" />
                                </Button>
                              </ProtectedComponent>
                            )}
                          </div>
                        )}
                      </ProtectedComponent>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="p-4 text-center text-muted-foreground">
                  No hay pagos registrados
                </TableCell>
              </TableRow>
            )}
            {/* Fila para agregar nuevo pago - renderizada condicionalmente */}
            {canCreatePayment ? (
              <TableRow className="border-t bg-muted/30">
                <TableCell className="p-2">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newPayment.amount || ""}
                    onChange={(e) => setNewPayment({ ...newPayment, amount: parseFloat(e.target.value) })}
                    placeholder="Ingrese el monto a pagar"
                    disabled={payment.isPaid}
                  />
                </TableCell>
                <TableCell className="p-2">
                  <Input
                    value={newPayment.billingCode || ""}
                    onChange={(e) => setNewPayment({ ...newPayment, billingCode: e.target.value })}
                    placeholder="Ingrese el código de factura"
                    className="h-8 w-56"
                    disabled={payment.isPaid}
                  />
                </TableCell>
                <TableCell className="p-2">
                  <CalendarDatePicker
                    variant="outline"
                    numberOfMonths={1}
                    date={newPayment.billingDate || { from: undefined, to: undefined }}
                    onDateSelect={(date) => setNewPayment({ ...newPayment, billingDate: date })}
                    onClear={() => setNewPayment({ ...newPayment, billingDate: undefined })}
                    disabled={payment.isPaid}
                    closeOnSelect={true}
                  />
                </TableCell>
                <TableCell className="p-2">
                  <Textarea
                    value={newPayment.email || ""}
                    onChange={(e) => setNewPayment({ ...newPayment, email: e.target.value })}
                    placeholder="Ingrese los emails destinatarios"
                    disabled={payment.isPaid}
                    className="w-56 min-h-7"
                  />
                </TableCell>
                <TableCell className="p-2">
                  <CalendarDatePicker
                    variant="outline"
                    numberOfMonths={1}
                    date={newPayment.paymentDate || { from: undefined, to: undefined }}
                    onDateSelect={(date) => setNewPayment({ ...newPayment, paymentDate: date })}
                    onClear={() => setNewPayment({ ...newPayment, paymentDate: undefined })}
                    disabled={payment.isPaid}
                    closeOnSelect={true}
                  />
                </TableCell>
                <TableCell className="p-2 text-center" colSpan={3}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddPayment}
                    disabled={!disabledAddPayment || isCreating || payment.isPaid}
                    className="ml-2 border-emerald-500 text-emerald-500"
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Realizar facturación
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              <TableRow className="border-t bg-muted/30">
                <TableCell className="p-2" colSpan={7}>
                  No tienes permisos para agregar pagos
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter className="bg-muted/50">
            <tr>
              <td className="p-2 font-semibold">
                {new Intl.NumberFormat("es-PE", {
                  style: "currency",
                  currency: "PEN",
                }).format(totalAmountPaid)}
              </td>
              <td colSpan={7} className="p-2 text-right">
                <div className="flex items-center justify-end gap-2">
                  <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                    <Progress value={Math.min(percentagePaid, 100)} color="bg-yellow-500" />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {percentagePaid.toFixed(0)}% facturado del total
                  </span>
                </div>
              </td>
            </tr>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
}
