"use client";

import { useState } from "react";
import {
  BarChart2,
  BarChart3,
  Calendar,
  CalendarCheck,
  ChartSpline,
  CheckCircle2,
  Clipboard,
  ClipboardCheck,
  ClipboardX,
  DollarSign,
  PieChart,
  TrendingDown,
  TrendingUp,
  TrendingUpDown,
  XCircle,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  LabelList,
  Pie,
  PieChart as ReChartPie,
  ResponsiveContainer,
  Sector,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";

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
import { useQuotationsForStats } from "../_hooks/useQuotations";
import { useQuotationsStore } from "../_hooks/useQuotationsStore";
import { LabelPaymentPlan, PaymentPlan } from "../_types/quotation.types";

// Usamos las variables de color definidas en globals.css
const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

export default function QuotationGraph() {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month");

  // Obtenemos los filtros del store
  const { filters } = useQuotationsStore();

  // Obtenemos los datos directamente de la API usando los filtros del store
  const { data, isLoading, error } = useQuotationsForStats({ ...filters });

  // Extraemos los datos de cotizaciones
  const quotations = data || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <span>Gráfico de cotizaciones</span>
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

  if (error || !quotations.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <span>Gráfico de cotizaciones</span>
            </div>
          </CardTitle>
          <CardDescription>No se pudieron cargar los datos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 w-full flex items-center justify-center">
            <Empty
              message={
                error instanceof Error ? error.message : "No hay datos de cotizaciones disponibles para mostrar."
              }
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calcular KPIs principales
  const totalQuotations = quotations.length;
  const totalAmount = quotations.reduce((sum: number, q: any) => sum + q.amount, 0);
  const totalPaidAmount = quotations
    .filter((q: any) => q.isConcrete)
    .reduce((sum: number, q: any) => sum + q.amount, 0);
  const totalUnpaidAmount = totalAmount - totalPaidAmount;

  // Calcular cotizaciones pagadas y no pagadas
  const concreteQuotations = quotations.filter((q: any) => q.isConcrete).length;
  const unConcreteQuotations = totalQuotations - concreteQuotations;
  const paymentCompletionRate = (concreteQuotations / (totalQuotations || 1)) * 100;

  // Procesar datos para el gráfico de pagos
  const getPaymentStatusData = () => {
    return [
      { name: "Concretadas", value: concreteQuotations, color: "var(--chart-1)" },
      { name: "No concretadas", value: unConcreteQuotations, color: "var(--chart-4)" },
    ];
  };

  // Procesar datos para el gráfico de tendencia temporal
  const getTimeData = () => {
    const now = new Date();
    let startDate: Date;
    let endDate = new Date(now);

    // Determinar fecha de inicio según el rango seleccionado
    if (timeRange === "week") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 6); // 7 días incluyendo hoy
      startDate.setHours(0, 0, 0, 0); // Inicio del día
      endDate.setHours(23, 59, 59, 999); // Fin del día
    } else if (timeRange === "month") {
      startDate = new Date(now);
      startDate.setDate(1); // Primer día del mes actual
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Último día del mes actual
      endDate.setHours(23, 59, 59, 999);
    } else {
      startDate = new Date(now.getFullYear(), 0, 1); // 1 enero del año actual
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), 11, 31); // 31 diciembre del año actual
      endDate.setHours(23, 59, 59, 999);
    }

    // Crear un array con todos los períodos (días o meses)
    type PeriodData = {
      date: string;
      dateObj: Date;
      cantidad: number;
      monto: number;
      label: string;
    };

    const allPeriods: PeriodData[] = [];

    if (timeRange === "year") {
      // Para año - genera todos los meses
      for (let month = 0; month < 12; month++) {
        const monthDate = new Date(now.getFullYear(), month, 1);
        allPeriods.push({
          date: `${month + 1}/${now.getFullYear()}`,
          dateObj: monthDate, // Para ordenar más tarde
          cantidad: 0,
          monto: 0,
          label: monthDate.toLocaleDateString("es-ES", { month: "short" }),
        });
      }
    } else if (timeRange === "month") {
      // Para mes - genera todos los días del mes
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const dayDate = new Date(now.getFullYear(), now.getMonth(), day);
        allPeriods.push({
          date: `${day}/${now.getMonth() + 1}`,
          dateObj: dayDate,
          cantidad: 0,
          monto: 0,
          label: day.toString(),
        });
      }
    } else {
      // Para semana - genera 7 días
      for (let i = 0; i < 7; i++) {
        const dayDate = new Date(now);
        dayDate.setDate(now.getDate() - 6 + i);
        allPeriods.push({
          date: `${dayDate.getDate()}/${dayDate.getMonth() + 1}`,
          dateObj: dayDate,
          cantidad: 0,
          monto: 0,
          label: dayDate.toLocaleDateString("es-ES", { weekday: "short" }),
        });
      }
    }

    // Agrupar cotizaciones por fecha
    const groupedByDate: { [key: string]: { count: number; amount: number } } = {};

    quotations.forEach((quotation: any) => {
      const date = new Date(quotation.dateQuotation || new Date());
      if (date >= startDate && date <= endDate) {
        // Formatear la fecha según el rango seleccionado
        let dateKey: string;
        if (timeRange === "year") {
          // Para año, agrupar por mes
          dateKey = `${date.getMonth() + 1}/${date.getFullYear()}`;
        } else {
          // Para semana o mes, agrupar por día
          dateKey = `${date.getDate()}/${date.getMonth() + 1}`;
        }

        if (!groupedByDate[dateKey]) {
          groupedByDate[dateKey] = { count: 0, amount: 0 };
        }
        groupedByDate[dateKey].count += 1;
        groupedByDate[dateKey].amount += quotation.amount;
      }
    });

    // Actualizar los períodos con los datos reales
    allPeriods.forEach((period) => {
      if (groupedByDate[period.date]) {
        period.cantidad = groupedByDate[period.date].count;
        period.monto = groupedByDate[period.date].amount;
      }
    });

    // Ordenar por fecha
    allPeriods.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

    // Eliminar la propiedad dateObj que solo se usó para ordenar
    return allPeriods.map(({ dateObj: _, ...rest }) => ({
      ...rest,
      date: rest.label, // Usar las etiquetas legibles
    }));
  };

  const getQuotationGroupData = () => {
    const groupCount: { [key: string]: number } = {};

    quotations.forEach((quotation: any) => {
      const groupName = quotation.quotationGroup?.name || "Sin grupo";

      if (!groupCount[groupName]) {
        groupCount[groupName] = 0;
      }
      groupCount[groupName] += 1;
    });

    return Object.entries(groupCount).map(([name, value]) => ({ name, cantidad: value }));
  };

  // Procesar datos para el gráfico de distribución por departamento
  const getDepartmentData = () => {
    const departmentCount: { [key: string]: number } = {};

    quotations.forEach((quotation: any) => {
      const department = quotation.department || "Sin especificar";
      if (!departmentCount[department]) {
        departmentCount[department] = 0;
      }
      departmentCount[department] += 1;
    });

    return Object.entries(departmentCount)
      .map(([name, value]) => ({ name, cantidad: value }))
      .sort((a, b) => b.cantidad - a.cantidad);
  };

  // Procesar datos para el gráfico de tipo de pago
  const getPaymentTypeData = () => {
    const paymentTypeCount: { [key: string]: number } = {
      [PaymentPlan.INSTALLMENTS]: 0,
      [PaymentPlan.SINGLE]: 0,
    };

    quotations.forEach((quotation: any) => {
      const paymentType = quotation.paymentPlan || PaymentPlan.SINGLE;
      paymentTypeCount[paymentType] += 1;
    });

    return Object.entries(paymentTypeCount).map(([name, value]) => ({
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
  const departmentData = getDepartmentData();
  const paymentTypeData = getPaymentTypeData();
  const paymentStatusData = getPaymentStatusData();
  const quotationGroupData = getQuotationGroupData();
  // Calculamos el período que estamos visualizando en forma de texto 2 mayo 2025 - 10 junio 2025
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

      // Si es un mes exacto del 01 al 31
      if (fromDate.getDate() === 1 && toDate.getDate() === 31) {
        return `${fromDate.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}`;
      }

      // Formatear fechas
      const from = fromDate.toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });
      const to = toDate.toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });
      return `${from} - ${to}`;
    } else {
      return `Año ${currentYear}`;
    }
  };

  // Si hay filtros activos, mostramos un mensaje indicando el número de resultados filtrados
  const hasFiltros = Object.keys(filters).some(
    (key) => key !== "from" && key !== "to" && filters[key as keyof typeof filters]
  );
  const filterMessage = hasFiltros ? `Mostrando ${totalQuotations} cotizaciones filtradas` : "";
  const periodLabel = getPeriodLabel();
  console.log("🚀 ~ QuotationGraph ~ periodLabel:", periodLabel);

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
          title="Total de cotizaciones"
          value={totalQuotations.toString()}
          description={
            <div className="flex items-center gap-1">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <CalendarCheck className="size-3 text-emerald-500" /> {periodLabel}
              </div>
            </div>
          }
          icon={<ClipboardCheck className="size-8 shrink-0 text-emerald-500 bg-emerald-500/20 rounded-md p-2" />}
        />

        <MetricCard
          title={`Monto total`}
          value={`S/. ${totalAmount.toLocaleString("es-PE")}`}
          description={
            <div className="text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <CalendarCheck className="size-3 text-emerald-500" /> {periodLabel}
              </div>
              <div className="flex items-center justify-between gap-1">
                <span className="flex items-center gap-1">
                  <Clipboard className="size-3 text-teal-500" /> De {totalQuotations} cotizaciones, {concreteQuotations}{" "}
                  son concretadas y {unConcreteQuotations} {""}
                  no son.
                </span>
                {concreteQuotations > unConcreteQuotations ? (
                  <span className="text-emerald-500">
                    <TrendingUp className="size-3" />
                  </span>
                ) : concreteQuotations === unConcreteQuotations ? (
                  <span className="text-sky-500">
                    <TrendingUpDown className="size-3" />
                  </span>
                ) : (
                  <span className="text-rose-500">
                    <TrendingDown className="size-3" />
                  </span>
                )}
              </div>
            </div>
          }
          icon={<DollarSign className="size-8 shrink-0 text-teal-500 bg-teal-500/20 rounded-md p-2" />}
        />

        <MetricCard
          title={`Monto total concretadas`}
          value={`S/. ${totalPaidAmount.toLocaleString("es-PE")}`}
          description={
            <div className="text-xs text-muted-foreground flex gap-1 flex-col">
              <div className="flex items-center gap-1">
                <CalendarCheck className="size-3 text-emerald-500" /> {periodLabel}
              </div>
              <div className="flex items-center gap-1 justify-between">
                <span className="flex items-center gap-1">
                  <ClipboardCheck className="size-3 text-emerald-500" /> De {concreteQuotations} cotizaciones
                  concretadas
                </span>
                {concreteQuotations > unConcreteQuotations ? (
                  <span className="text-emerald-500">
                    <TrendingUp className="size-3" />
                  </span>
                ) : concreteQuotations === unConcreteQuotations ? (
                  <span className="text-sky-500">
                    <TrendingUpDown className="size-3" />
                  </span>
                ) : (
                  <span className="text-rose-500">
                    <TrendingDown className="size-3" />
                  </span>
                )}
              </div>
            </div>
          }
          icon={<DollarSign className="size-8 shrink-0 text-cyan-500 bg-cyan-500/20 rounded-md p-2" />}
        />

        <MetricCard
          title={`Monto total a pagar`}
          value={`S/. ${totalUnpaidAmount.toLocaleString("es-PE")}`}
          description={
            <div className="text-xs text-muted-foreground flex gap-1 flex-col">
              <div className="flex items-center gap-1">
                <CalendarCheck className="size-3 text-emerald-500" /> {periodLabel}
              </div>
              <div className="flex items-center gap-1 justify-between">
                <span className="flex items-center gap-1">
                  <ClipboardX className="size-3 text-rose-500" /> De {unConcreteQuotations} cotizaciones no concretadas
                </span>
                {unConcreteQuotations > 0 ? (
                  <span className="text-rose-500">
                    <TrendingDown className="size-3" />
                  </span>
                ) : (
                  <span className="text-emerald-500">
                    <TrendingUp className="size-3" />
                  </span>
                )}
              </div>
            </div>
          }
          icon={<DollarSign className="size-8 shrink-0 text-rose-500 bg-rose-500/20 rounded-md p-2" />}
        />
      </div>

      {/* Gráfico principal de tendencia */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-0">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ChartSpline className="h-5 w-5 text-primary" />
                Cotizaciones por {timeRange === "week" ? "semana" : timeRange === "month" ? "mes" : "año"}
              </CardTitle>
              <CardDescription>Cantidad de cotizaciones por período</CardDescription>
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
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10 }}
                  tickMargin={5}
                  tickFormatter={(value) => value}
                  interval={timeRange === "year" ? 0 : timeRange === "month" ? Math.floor(timeData.length / 10) : 0}
                />
                <YAxis
                  dataKey="cantidad"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10 }}
                  tickMargin={5}
                  width={25}
                  allowDecimals={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const fecha = payload[0].payload.date;
                      const formattedDate =
                        timeRange === "year"
                          ? `${fecha} ${new Date().getFullYear()}`
                          : timeRange === "week"
                            ? `${fecha}`
                            : `${fecha} ${new Date().toLocaleDateString("es-ES", { month: "short" })}`;

                      return (
                        <div className="bg-card border border-border p-2 rounded-md shadow-md text-xs">
                          <p className="font-medium mb-1">{`Fecha: ${formattedDate}`}</p>
                          <p className="text-chart-1">{`Cantidad: ${payload[0].payload.cantidad}`}</p>
                          <p className="text-chart-2">{`Monto: S/ ${payload[0].payload.monto.toLocaleString("es-PE")}`}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <defs>
                  <linearGradient id="fillCantidad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <Area
                  dataKey="cantidad"
                  type="monotone"
                  fill="url(#fillCantidad)"
                  fillOpacity={0.4}
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
        <CardFooter className="pt-0 pb-2 px-4">
          <div className="flex justify-end items-center text-xs text-muted-foreground w-full">
            <TrendingUp className="h-3 w-3 mr-1 text-chart-1" />
            <span>Cantidad de cotizaciones</span>
          </div>
        </CardFooter>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Estado de Pagos (Donut Chart) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Estado de cotizaciones
            </CardTitle>
            <CardDescription>Cotizaciones concretadas vs. no concretadas</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col justify-center items-center">
              <div className="text-4xl font-bold">{paymentCompletionRate.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Tasa de conversión</div>
              <div className="mt-6 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-3 w-3 rounded-full bg-chart-1"></div>
                  <div className="flex justify-between w-full">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      Concretadas
                    </span>
                    <span className="font-medium">{concreteQuotations}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <div className="h-3 w-3 rounded-full bg-chart-4"></div>
                  <div className="flex justify-between w-full">
                    <span className="flex items-center gap-1">
                      <XCircle className="h-4 w-4 text-gray-500" />
                      No concretadas
                    </span>
                    <span className="font-medium">{unConcreteQuotations}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ReChartPie>
                  <Pie
                    data={paymentStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    strokeWidth={0}
                    activeIndex={0}
                    activeShape={({ outerRadius = 0, ...props }: PieSectorDataItem) => (
                      <Sector {...props} outerRadius={outerRadius + 10} />
                    )}
                  >
                    {paymentStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                              <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                                {totalQuotations}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 24}
                                className="fill-muted-foreground text-xs"
                              >
                                Cotizaciones
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
                        const value = Number(payload[0].value) || 0;
                        const percentage = totalQuotations ? ((value / totalQuotations) * 100).toFixed(1) : "0.0";
                        return (
                          <div className="bg-card border border-border p-2 rounded-md shadow-md text-xs">
                            <p className="font-medium mb-1">{`${payload[0].name}: ${value}`}</p>
                            <p className="text-muted-foreground">{`${percentage}%`}</p>
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
              <div className="text-2xl font-bold">{totalQuotations}</div>
              <div className="text-sm text-muted-foreground">Cotizaciones totales</div>

              <div className="mt-6 space-y-2">
                {paymentTypeData.map((payType, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                    ></div>
                    <div className="flex justify-between w-full">
                      <span>{payType.name}</span>
                      <span className="font-medium">{payType.value}</span>
                    </div>
                  </div>
                ))}

                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Proporción mensual/puntual:</span>
                    <span>
                      {paymentTypeData.length === 2
                        ? `${((paymentTypeData[0].value / (paymentTypeData[0].value + paymentTypeData[1].value)) * 100).toFixed(1)}%`
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
                    data={paymentTypeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="var(--chart-5)"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {paymentTypeData.map((_, index) => (
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

      {/* Gráficos de distribución */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-primary" />
              Distribución por grupo de cotizaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col justify-center">
              {/* Leyenda personalizada */}
              <div className="text-2xl font-bold">{quotationGroupData.length}</div>
              <div className="text-sm text-muted-foreground">Grupos con cotizaciones</div>

              <div className="mt-6 space-y-2 max-h-48 overflow-y-auto pr-2">
                {quotationGroupData.slice(0, 5).map((group, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                    ></div>
                    <div className="flex justify-between w-full">
                      <span className="truncate max-w-24">{group.name}</span>
                      <span className="font-medium">{group.cantidad}</span>
                    </div>
                  </div>
                ))}
                {quotationGroupData.length > 5 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Y {quotationGroupData.length - 5} grupos más...
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-2 h-64">
              <ChartContainer config={chartConfig} className="mx-auto max-h-[250px] px-0">
                <BarChart
                  accessibilityLayer
                  data={quotationGroupData}
                  margin={{
                    top: 20,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value}
                  />
                  <Bar dataKey="cantidad" radius={8}>
                    <LabelList position="top" offset={12} className="fill-foreground" fontSize={12} />
                    {quotationGroupData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" defaultValue="cantidad" />}
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Distribución por departamento
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col justify-center">
              {/* Leyenda personalizada */}
              <div className="text-2xl font-bold">{departmentData.length}</div>
              <div className="text-sm text-muted-foreground">Departamentos</div>

              <div className="mt-6 space-y-2 max-h-48 overflow-y-auto pr-2">
                {departmentData.slice(0, 5).map((dept, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                    ></div>
                    <div className="flex justify-between w-full">
                      <span className="truncate max-w-24">{dept.name}</span>
                      <span className="font-medium">{dept.cantidad}</span>
                    </div>
                  </div>
                ))}
                {departmentData.length > 5 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Y {departmentData.length - 5} departamentos más...
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-2 h-64">
              <ChartContainer config={chartConfig} className="mx-auto max-h-[250px] px-0">
                <BarChart
                  accessibilityLayer
                  data={departmentData}
                  layout="vertical"
                  margin={{
                    left: 100,
                    right: 20,
                    top: 10,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tick={{ fontSize: 11 }}
                    width={90}
                    tickFormatter={(value) => {
                      const name = departmentData.find((d) => d.name === value)?.name || "";
                      return name.length > 15 ? `${name.substring(0, 12)}...` : name;
                    }}
                  />
                  <XAxis dataKey="cantidad" type="number" hide />
                  <ChartTooltip
                    cursor={false}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-card border border-border p-2 rounded-md shadow-md text-xs">
                            <p className="font-medium mb-1">{payload[0].payload.name}</p>
                            <p className="text-chart-2">{`Cotizaciones: ${payload[0].value}`}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="cantidad" layout="vertical" radius={5} fill="var(--chart-4)">
                    {departmentData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                    <LabelList dataKey="cantidad" position="right" />
                  </Bar>
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
