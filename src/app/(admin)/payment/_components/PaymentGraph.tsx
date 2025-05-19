"use client";

import { useState } from "react";
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  FileInput,
  PieChart,
  TrendingDown,
  TrendingUp,
  TrendingUpDown,
  Users,
  Wallet,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Label,
  Pie,
  PieChart as ReChartPie,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import MetricCard from "@/shared/components/dashboard/MetricCard";
import Empty from "@/shared/components/empty";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/components/ui/chart";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { usePaymentsForStats } from "../_hooks/usePayments";
import { usePaymentsStore } from "../_hooks/usePaymentStore";
import { PaymentResponse } from "../_types/payment.types";
import { LabelPaymentPlan, PaymentPlan } from "../../quotation/_types/quotation.types";
import YearlyComparisonChart from "./YearlyComparisonChart";

// Usamos las variables de color definidas en globals.css
const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

export default function PaymentGraph() {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month");

  // Obtenemos los filtros del store
  const { filters } = usePaymentsStore();

  // Obtenemos los datos directamente de la API usando los filtros del store
  const { data, isLoading, error } = usePaymentsForStats({ ...filters });
  // Extraemos los datos de pagos
  const payments = data || [];

  // Configuración de fechas según el rango seleccionado
  const now = new Date();
  let startDate = new Date(now);
  let endDate = new Date(now);

  // Determinar fechas de inicio y fin según el rango seleccionado
  if (timeRange === "week") {
    startDate.setDate(now.getDate() - 7);
  } else if (timeRange === "month") {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1); // Primer día del mes actual
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Último día del mes actual
  } else {
    startDate = new Date(now.getFullYear(), 0, 1); // 1 de enero del año actual
    endDate = new Date(now.getFullYear(), 11, 31); // 31 de diciembre del año actual
  }

  // Obtenemos el nombre del mes para mostrar en el título
  const nombreMesActual = timeRange === "month" ? startDate.toLocaleString("es-ES", { month: "long" }) : "";

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <span>Gráfico de pagos</span>
            </div>
          </CardTitle>
          <CardDescription>Cargando datos...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 w-full">
            <Skeleton className="h-full w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !payments.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <span>Gráfico de pagos</span>
            </div>
          </CardTitle>
          <CardDescription>No se pudieron obtener los datos de pagos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 w-full flex items-center justify-center">
            <Empty
              message={error instanceof Error ? error.message : "No hay datos de pagos disponibles para mostrar."}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calcular KPIs principales
  const totalPayments = payments.length;
  const paidPayments = payments.filter((p: any) => p.isPaid).length;

  const totalAmount = payments.reduce((sum: number, p: any) => sum + p.amount, 0);
  const totalPaidAmount = payments.filter((p: any) => p.isPaid).reduce((sum: number, p: any) => sum + p.amount, 0);
  const totalUnpaidAmount = totalAmount - totalPaidAmount;

  // Calcular pagos pagados y no pagados
  const unpaidPayments = totalPayments - paidPayments;

  // Métrica de usuarios únicos facturados (considerando RUC o clientId como identificador único)
  const uniqueClients = new Set();
  payments.forEach((payment: PaymentResponse) => {
    // Usar clientId, clientRuc o algún otro identificador único del cliente
    const clientIdentifier = payment.code || payment.ruc || payment.businessName || payment.id;
    if (clientIdentifier) {
      uniqueClients.add(clientIdentifier);
    }
  });
  const uniqueClientsCount = uniqueClients.size;

  // Efectividad de cobro
  const collectionEffectiveness = (totalPaidAmount / (totalAmount || 1)) * 100;

  // Análisis de pagos pendientes
  const duePaymentsPercentage = (unpaidPayments / (totalPayments || 1)) * 100;

  // Agrupar pagos por tipo de servicio o departamento
  const paymentsByQuotationGroup: { [key: string]: { count: number; amount: number; paid: number; color: string } } =
    {};

  // Colores para los diferentes grupos de cotización
  const groupColors = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
    "var(--chart-6)",
  ];

  // Clasificar pagos por tipo de servicio o departamento
  payments.forEach((payment: PaymentResponse) => {
    // Extraer un posible identificador de grupo desde el código del pago
    let groupCategory = "No especificado";

    if (payment.code) {
      // Intentar extraer un prefijo del código que podría representar un grupo
      const parts = payment.code.split("-");
      if (parts.length > 1) {
        groupCategory = parts[0].toUpperCase();
      } else {
        // Si no tiene guión, tomar los primeros caracteres
        groupCategory = payment.code.substring(0, 4).toUpperCase();
      }
    } else {
      // Si no hay código, usar el servicio como alternativa
      groupCategory = payment.service || "No especificado";
    }

    if (!paymentsByQuotationGroup[groupCategory]) {
      paymentsByQuotationGroup[groupCategory] = {
        count: 0,
        amount: 0,
        paid: 0,
        color: groupColors[Object.keys(paymentsByQuotationGroup).length % groupColors.length],
      };
    }

    paymentsByQuotationGroup[groupCategory].count += 1;
    paymentsByQuotationGroup[groupCategory].amount += payment.amount || 0;

    if (payment.isPaid) {
      paymentsByQuotationGroup[groupCategory].paid += payment.amount || 0;
    }
  });

  // Procesar datos para el gráfico de pagos por grupo de cotización
  const getPaymentsByGroupData = () => {
    const data = Object.entries(paymentsByQuotationGroup).map(([name, data]) => ({
      name,
      value: data.amount,
      count: data.count,
      paid: data.paid,
      paidPercentage: (data.paid / (data.amount || 1)) * 100,
      color: data.color,
    }));

    // Ordenar por monto
    return data.sort((a, b) => b.value - a.value);
  };

  // Procesar datos para el gráfico de tendencia temporal
  const getTimeData = () => {
    // Nombres de meses y días para mostrar en el gráfico
    const nombresMeses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const nombresDias = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

    // Inicializar estructura para almacenar todos los períodos posibles
    const allPeriods: {
      [key: string]: {
        total: number;
        facturas: number; // Pagos facturados ese día
        pagos: number; // Pagos concretados ese día
        paid: number;
        unpaid: number;
        amount: number;
        label: string;
        rawDate: string;
      };
    } = {};

    // Generar todos los períodos posibles según el rango seleccionado
    if (timeRange === "year") {
      // Para año: generar todos los meses
      for (let month = 0; month < 12; month++) {
        // Guardamos el mes/año numérico como clave para matching
        const monthKey = `${month + 1}/${now.getFullYear()}`;
        // Pero también guardamos el nombre del mes para mostrar
        const label = nombresMeses[month];
        allPeriods[monthKey] = {
          total: 0,
          facturas: 0,
          pagos: 0,
          paid: 0,
          unpaid: 0,
          amount: 0,
          label,
          rawDate: monthKey,
        };
      }
    } else if (timeRange === "month") {
      // Para mes: generar todos los días del mes actual
      const year = startDate.getFullYear();
      const month = startDate.getMonth(); // 0-11
      // Obtenemos la cantidad de días en el mes actual
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      for (let day = 1; day <= daysInMonth; day++) {
        const dayKey = `${day}/${month + 1}`;
        // Solo el número del día
        const label = `${day}`;
        allPeriods[dayKey] = {
          total: 0,
          facturas: 0,
          pagos: 0,
          paid: 0,
          unpaid: 0,
          amount: 0,
          label,
          rawDate: dayKey,
        };
      }
    } else if (timeRange === "week") {
      // Para semana: generar todos los días de la semana
      const tempDate = new Date(startDate);
      while (tempDate <= endDate) {
        const dayKey = `${tempDate.getDate()}/${tempDate.getMonth() + 1}`;
        const dayOfWeek = tempDate.getDay(); // 0-6 (domingo-sábado)
        // Para semana usamos nombre del día + número
        const label = `${nombresDias[dayOfWeek]} ${tempDate.getDate()}`;
        allPeriods[dayKey] = {
          total: 0,
          facturas: 0,
          pagos: 0,
          paid: 0,
          unpaid: 0,
          amount: 0,
          label,
          rawDate: dayKey,
        };
        tempDate.setDate(tempDate.getDate() + 1);
      }
    }

    // Ahora procesamos los pagos y los asignamos a los períodos correspondientes
    payments.forEach((payment: any) => {
      // Fecha de facturación (creación del pago)
      const fechaFacturacion = payment.createdAt ? new Date(payment.createdAt) : new Date();

      // Fecha del pago efectivo (si existe, sino usamos null)
      const fechaPago = payment.paymentDate ? new Date(payment.paymentDate) : null;

      // Formatear la fecha de facturación según el rango seleccionado
      let facturaKey: string | null = null;
      if (fechaFacturacion >= startDate && fechaFacturacion <= endDate) {
        if (timeRange === "year") {
          // Para año, agrupar por mes
          facturaKey = `${fechaFacturacion.getMonth() + 1}/${fechaFacturacion.getFullYear()}`;
        } else {
          // Para semana o mes, agrupar por día
          facturaKey = `${fechaFacturacion.getDate()}/${fechaFacturacion.getMonth() + 1}`;
        }

        // Registrar factura en su fecha correspondiente
        if (facturaKey && allPeriods[facturaKey]) {
          allPeriods[facturaKey].facturas += 1;
          allPeriods[facturaKey].total += 1;

          // Contabilizar como pagado o no pagado según su estado actual
          if (payment.isPaid) {
            allPeriods[facturaKey].paid += 1;
          } else {
            allPeriods[facturaKey].unpaid += 1;
          }

          allPeriods[facturaKey].amount += payment.amount;
        }
      }

      // Si tiene fecha de pago, registrarlo en esa fecha
      if (fechaPago && fechaPago >= startDate && fechaPago <= endDate) {
        let pagoKey: string;
        if (timeRange === "year") {
          // Para año, agrupar por mes
          pagoKey = `${fechaPago.getMonth() + 1}/${fechaPago.getFullYear()}`;
        } else {
          // Para semana o mes, agrupar por día
          pagoKey = `${fechaPago.getDate()}/${fechaPago.getMonth() + 1}`;
        }

        // Registrar pago en su fecha correspondiente
        if (allPeriods[pagoKey]) {
          allPeriods[pagoKey].pagos += 1;
        }
      }
    });

    // Convertir a array para el gráfico
    const result = Object.entries(allPeriods).map(([_, data]: [string, any]) => ({
      date: data.label, // Usamos la etiqueta con nombres en lugar de la fecha numérica
      dateRaw: data.rawDate, // Mantenemos la fecha original para ordenación
      total: data.total,
      facturados: data.facturas, // Pagos facturados en esta fecha
      concretados: data.pagos, // Pagos efectivamente pagados en esta fecha
      pagados: data.paid,
      pendientes: data.unpaid,
      monto: data.amount,
    }));

    // Ordenar según el formato de fecha original
    if (timeRange === "year") {
      // Ordenar por mes/año
      result.sort((a, b) => {
        const [aMonth, aYear] = a.dateRaw.split("/").map(Number);
        const [bMonth, bYear] = b.dateRaw.split("/").map(Number);
        if (aYear !== bYear) return aYear - bYear;
        return aMonth - bMonth;
      });
    } else {
      // Ordenar por día/mes
      result.sort((a, b) => {
        const [aDay, aMonth] = a.dateRaw.split("/").map(Number);
        const [bDay, bMonth] = b.dateRaw.split("/").map(Number);
        if (aMonth !== bMonth) return aMonth - bMonth;
        return aDay - bDay;
      });
    }

    return result;
  };

  // Procesar datos para el gráfico de tipo de pago
  const getPaymentPlanData = () => {
    const paymentPlanCount: { [key: string]: number } = {
      [PaymentPlan.INSTALLMENTS]: 0,
      [PaymentPlan.SINGLE]: 0,
    };

    payments.forEach((payment: any) => {
      const paymentPlan = payment.paymentPlan || PaymentPlan.SINGLE;
      paymentPlanCount[paymentPlan] += 1;
    });

    return Object.entries(paymentPlanCount).map(([name, value]) => ({
      name: LabelPaymentPlan[name as PaymentPlan],
      value,
    }));
  };

  // Configuración de colores para los gráficos usando variables CSS
  const chartConfig = {
    monto: {
      theme: {
        light: "var(--chart-2)",
        dark: "var(--chart-2)",
      },
      label: "Monto Total",
    },
    cantidad: {
      theme: {
        light: "var(--chart-1)",
        dark: "var(--chart-1)",
      },
      label: "Cantidad",
    },
    service: {
      theme: {
        light: "var(--chart-3)",
        dark: "var(--chart-3)",
      },
      label: "Servicios",
    },
    department: {
      theme: {
        light: "var(--chart-4)",
        dark: "var(--chart-4)",
      },
      label: "Departamentos",
    },
  };

  const timeData = getTimeData();
  const paymentPlanData = getPaymentPlanData();
  // Calculamos el período que estamos visualizando
  const getPeriodLabel = () => {
    const currentYear = new Date().getFullYear();
    if (filters.from && filters.to) {
      const fromDate = new Date(filters.from);
      const toDate = new Date(filters.to);

      // Si es todo el año actual
      if (
        fromDate.getFullYear() === currentYear &&
        fromDate.getMonth() === 0 &&
        fromDate.getDate() === 1 &&
        toDate.getFullYear() === currentYear &&
        toDate.getMonth() === 11 &&
        toDate.getDate() === 31
      ) {
        return `Año ${currentYear}`;
      }

      // Formatear fechas
      const from = fromDate.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
      const to = toDate.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
      return `${from} - ${to}`;
    }
    return `Año ${currentYear}`;
  };

  // Si hay filtros activos, mostramos un mensaje indicando el número de resultados filtrados
  const hasFiltros = Object.keys(filters).some(
    (key) => key !== "from" && key !== "to" && filters[key as keyof typeof filters]
  );
  const filterMessage = hasFiltros ? `Mostrando ${totalPayments} pagos filtrados` : "";
  const periodLabel = getPeriodLabel();

  return (
    <div className="space-y-4">
      {/* Mensaje de filtros aplicados y período */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        {filterMessage && <div className="text-sm text-muted-foreground">{filterMessage}</div>}
        {periodLabel && (
          <div className="text-sm font-medium flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-primary" />
            <span>Período: {periodLabel}</span>
          </div>
        )}
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Facturado"
          value={`S/. ${totalAmount.toLocaleString("es-PE", { maximumFractionDigits: 0 })}`}
          icon={<FileInput className="size-8 text-orange-500 bg-orange-500/20 rounded-md p-2" />}
          description={
            <div className="text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="size-3 text-primary" /> {periodLabel}
              </div>
              <div className="flex items-center justify-between gap-1 mt-1">
                <span className="text-muted-foreground">Facturas:</span>
                <span className="font-semibold">{totalPayments} emitidas</span>
              </div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-muted-foreground">Clientes facturados:</span>
                <span className="font-semibold inline-flex items-center gap-1">
                  {uniqueClientsCount} <Users className="size-3 text-muted-foreground/50" />
                </span>
              </div>
            </div>
          }
        />

        <MetricCard
          title="Total Cobrado"
          value={`S/. ${totalPaidAmount.toLocaleString("es-PE", { maximumFractionDigits: 0 })}`}
          icon={<Wallet className="size-8 text-emerald-500 bg-emerald-500/20 rounded-md p-2" />}
          description={
            <div className="text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="size-3 text-primary" /> {periodLabel}
              </div>
              <div className="flex items-center justify-between gap-1 mt-1">
                <span className="text-muted-foreground">Efectividad:</span>
                <span className="font-semibold text-emerald-500">{collectionEffectiveness.toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-muted-foreground">Facturas pagadas:</span>
                <span className="font-semibold">
                  {paidPayments} de {totalPayments}
                </span>
              </div>
            </div>
          }
        />

        <MetricCard
          title="Pendiente de Cobro"
          value={`S/. ${totalUnpaidAmount.toLocaleString("es-PE", { maximumFractionDigits: 0 })}`}
          icon={<Wallet className="size-8 text-rose-500 bg-rose-500/20 rounded-md p-2" />}
          description={
            <div className="text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="size-3 text-primary" /> {periodLabel}
              </div>
              <div className="flex items-center justify-between gap-1 mt-1">
                <span className="text-muted-foreground">Facturas pendientes:</span>
                <span className="font-semibold text-rose-500">{unpaidPayments}</span>
              </div>
              <div className="flex items-center justify-between gap-1">
                <span className="text-muted-foreground">% pendiente:</span>
                <span className="font-semibold">{duePaymentsPercentage.toFixed(1)}% del total</span>
              </div>
            </div>
          }
        />

        <MetricCard
          title="Estado de Cobros"
          value={`${collectionEffectiveness.toFixed(0)}% cobrado`}
          icon={
            collectionEffectiveness >= 80 ? (
              <CheckCircle2 className="size-8 text-emerald-500 bg-emerald-500/20 rounded-md p-2" />
            ) : collectionEffectiveness >= 60 ? (
              <TrendingUp className="size-8 text-teal-500 bg-teal-500/20 rounded-md p-2" />
            ) : collectionEffectiveness >= 40 ? (
              <TrendingUpDown className="size-8 text-amber-500 bg-amber-500/20 rounded-md p-2" />
            ) : (
              <TrendingDown className="size-8 text-rose-500 bg-rose-500/20 rounded-md p-2" />
            )
          }
          description={
            <div className="text-xs text-muted-foreground">
              <div className="flex flex-col gap-1">
                {/* Barra de progreso visual */}
                <div className="w-full bg-gray-100 rounded-full h-2.5 mb-1">
                  <div
                    className={`h-2.5 rounded-full ${
                      collectionEffectiveness >= 80
                        ? "bg-emerald-500"
                        : collectionEffectiveness >= 60
                          ? "bg-teal-500"
                          : collectionEffectiveness >= 40
                            ? "bg-amber-500"
                            : "bg-rose-500"
                    }`}
                    style={{ width: `${Math.min(100, collectionEffectiveness)}%` }}
                  ></div>
                </div>

                {/* Explicación directa del estado financiero */}
                <div className="text-center text-[11px] text-muted-foreground mb-1">
                  {collectionEffectiveness >= 80
                    ? `Se ha cobrado la mayoría de lo facturado (${collectionEffectiveness.toFixed(0)}%)`
                    : collectionEffectiveness >= 60
                      ? `Más de la mitad cobrado (${collectionEffectiveness.toFixed(0)}%)`
                      : collectionEffectiveness >= 40
                        ? `Menos de la mitad cobrado (${collectionEffectiveness.toFixed(0)}%)`
                        : `Bajo nivel de cobros (${collectionEffectiveness.toFixed(0)}%)`}
                </div>

                {/* Estadísticas de respaldo */}
                <div className="flex justify-between mt-1 text-[11px] border-t pt-1">
                  <span>Cobrado:</span>
                  <span className="font-medium">
                    S/. {totalPaidAmount.toLocaleString("es-PE", { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>Pendiente:</span>
                  <span className="font-medium">
                    S/. {totalUnpaidAmount.toLocaleString("es-PE", { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>Facturas pagadas:</span>
                  <span className="font-medium">
                    {paidPayments} de {totalPayments}
                  </span>
                </div>
              </div>
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Estado de Pagos (Donut Chart) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Distribución por Código de Grupo
            </CardTitle>
            <CardDescription>Montos facturados agrupados por código identificador</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col justify-center items-center">
              <div className="text-3xl font-bold">
                S/. {totalAmount.toLocaleString("es-PE", { maximumFractionDigits: 0 })}
              </div>
              <div className="text-sm text-muted-foreground">Total facturado</div>

              {/* Desglose por grupos de cotización */}
              <div className="mt-4 space-y-2 w-full">
                {getPaymentsByGroupData()
                  .slice(0, 5)
                  .map((group, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: group.color }}></div>
                      <div className="flex justify-between w-full">
                        <span className="truncate" title={group.name}>
                          {group.name.length > 14 ? `${group.name.slice(0, 14)}...` : group.name}
                        </span>
                        <span className="font-medium">{group.count} pagos</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="md:col-span-2 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ReChartPie>
                  <Pie
                    data={getPaymentsByGroupData()}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="name"
                    strokeWidth={0}
                  >
                    {getPaymentsByGroupData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                              <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                                {totalPayments}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 24}
                                className="fill-muted-foreground text-xs"
                              >
                                Facturas
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const percentage = totalAmount ? ((data.value / totalAmount) * 100).toFixed(1) : "0.0";
                        return (
                          <div className="bg-card border border-border p-2 rounded-md shadow-md text-xs">
                            <p className="font-medium mb-1">{data.name}</p>
                            <div className="space-y-1">
                              <p className="flex justify-between">
                                <span>Monto:</span>
                                <span className="font-medium">S/. {data.value.toLocaleString("es-PE")}</span>
                              </p>
                              <p className="flex justify-between">
                                <span>Facturas:</span>
                                <span className="font-medium">{data.count}</span>
                              </p>
                              <p className="flex justify-between">
                                <span>% del total:</span>
                                <span className="font-medium">{percentage}%</span>
                              </p>
                              <p className="flex justify-between">
                                <span>Cobrado:</span>
                                <span className="font-medium">{data.paidPercentage.toFixed(0)}%</span>
                              </p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </ReChartPie>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        {/* Gráfico de tipo de pago */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Distribución por tipo de pago
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col justify-center">
              {/* Leyenda personalizada */}
              <div className="text-2xl font-bold">{totalPayments}</div>
              <div className="text-sm text-muted-foreground">Pagos totales</div>

              <div className="mt-6 space-y-2">
                {paymentPlanData.map((payPlan, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                    ></div>
                    <div className="flex justify-between w-full">
                      <span>{payPlan.name}</span>
                      <span className="font-medium">{payPlan.value}</span>
                    </div>
                  </div>
                ))}

                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Proporción mensual/puntual:</span>
                    <span>
                      {paymentPlanData.length === 2
                        ? `${((paymentPlanData[0].value / (paymentPlanData[0].value + paymentPlanData[1].value)) * 100).toFixed(1)}%`
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 h-64">
              <ChartContainer config={chartConfig} className="mx-auto max-h-[250px] px-0">
                <ReChartPie>
                  <Pie
                    data={paymentPlanData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="var(--chart-5)"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {paymentPlanData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <ChartLegend content={({ payload }) => <ChartLegendContent payload={payload} nameKey="name" />} />
                </ReChartPie>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Gráfico principal de tendencia */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-0">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                {timeRange === "week"
                  ? "Actividad de facturación y pagos por semana"
                  : timeRange === "month"
                    ? `Actividad de facturación y pagos: ${nombreMesActual}`
                    : "Actividad de facturación y pagos anual"}
              </CardTitle>
              <CardDescription>
                Comparación entre fechas de emisión de facturas y fechas de pago efectivo por{" "}
                {timeRange === "week" ? "día" : timeRange === "month" ? "día del mes" : "mes"}
              </CardDescription>
            </div>
            <Tabs defaultValue="month" onValueChange={(value) => setTimeRange(value as any)}>
              <TabsList className="h-8">
                <TabsTrigger value="week" className="text-xs px-2">
                  Semana
                </TabsTrigger>
                <TabsTrigger value="month" className="text-xs px-2">
                  Mes
                </TabsTrigger>
                <TabsTrigger value="year" className="text-xs px-2">
                  Año
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="pt-4 pb-0 px-2">
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={timeData}
                margin={{
                  top: 5,
                  right: 5,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} tickMargin={5} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} tickMargin={5} width={25} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      let label = "";

                      // Formatear la etiqueta según el timeRange
                      if (timeRange === "year") {
                        // Convertir número de mes a nombre
                        const [month, year] = data.dateRaw.split("/");
                        const monthNames = [
                          "Enero",
                          "Febrero",
                          "Marzo",
                          "Abril",
                          "Mayo",
                          "Junio",
                          "Julio",
                          "Agosto",
                          "Septiembre",
                          "Octubre",
                          "Noviembre",
                          "Diciembre",
                        ];
                        label = `${monthNames[parseInt(month) - 1]} ${year}`;
                      } else if (timeRange === "month") {
                        // Para mes, mostrar el día y mes
                        const [day, month] = data.dateRaw.split("/");
                        label = `${day} de ${["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"][parseInt(month) - 1]}`;
                      } else {
                        // Para semana, mostrar el día de semana y fecha
                        const [day, month] = data.dateRaw.split("/");
                        const currentYear = new Date().getFullYear();
                        const date = new Date(currentYear, parseInt(month) - 1, parseInt(day));
                        const dayName = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"][date.getDay()];
                        label = `${dayName} ${day}/${month}`;
                      }

                      return (
                        <div className="bg-card border border-border p-2 rounded-md shadow-md text-xs">
                          <p className="font-medium mb-2 text-center border-b pb-1">{label}</p>
                          <div className="space-y-1">
                            <p className="flex justify-between">
                              <span className="text-muted-foreground">Facturas emitidas:</span>
                              <span className="font-medium text-chart-3">{data.facturados}</span>
                            </p>
                            <p className="flex justify-between">
                              <span className="text-muted-foreground">Pagos realizados:</span>
                              <span className="font-medium text-chart-1">{data.concretados}</span>
                            </p>
                            <div className="border-t mt-1 pt-1">
                              <p className="flex justify-between">
                                <span className="text-muted-foreground">Monto total:</span>
                                <span className="font-medium text-chart-2">
                                  S/ {data.monto.toLocaleString("es-PE")}
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <defs>
                  <linearGradient id="fillPagados" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="fillFacturados" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <Area
                  dataKey="concretados"
                  name="Pagos realizados"
                  type="monotone"
                  fill="url(#fillPagados)"
                  fillOpacity={0.4}
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                />
                <Area
                  dataKey="facturados"
                  name="Facturas emitidas"
                  type="monotone"
                  fill="url(#fillFacturados)"
                  fillOpacity={0.2}
                  stroke="var(--chart-3)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
        <CardFooter className="pt-0 pb-2 px-4">
          <div className="flex justify-end items-center gap-4 text-xs text-muted-foreground w-full">
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-chart-1"></div>
              <span>Pagos realizados en la fecha</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-chart-3"></div>
              <span>Facturas emitidas en la fecha</span>
            </div>
          </div>
        </CardFooter>
      </Card>
      <YearlyComparisonChart />
    </div>
  );
}
