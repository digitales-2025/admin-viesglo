"use client";

import { useEffect, useState } from "react";
import {
  BarChart2,
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronRight,
  DollarSign,
  PieChart,
  TrendingUp,
  Users,
  Wallet,
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
import { LabelTypePayment, TypePayment } from "../../quotation/_types/quotation.types";

// Usamos las variables de color definidas en globals.css
const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

export default function PaymentGraph() {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month");

  // Obtenemos los filtros del store
  const { filters, updateFilter } = usePaymentsStore();

  // Si no hay filtros de fecha, establecer el año actual
  useEffect(() => {
    // Solo aplicar filtro del año actual si no hay filtros de fecha explícitos
    if (!filters.from && !filters.to) {
      const currentYear = new Date().getFullYear();
      const startOfYear = new Date(currentYear, 0, 1); // 1 de enero del año actual
      const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59); // 31 de diciembre del año actual

      updateFilter("from", startOfYear);
      updateFilter("to", endOfYear);
    }
  }, [filters.from, filters.to, updateFilter]);

  // Obtenemos los datos directamente de la API usando los filtros del store
  const { data, isLoading, error } = usePaymentsForStats({ ...filters });

  // Extraemos los datos de pagos
  const payments = data || [];

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
          <CardDescription>Error al cargar los datos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 w-full flex items-center justify-center">
            <p className="text-destructive">
              {error instanceof Error ? error.message : "No hay datos de pagos disponibles para mostrar."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calcular KPIs principales
  const totalPayments = payments.length;
  const totalAmount = payments.reduce((sum: number, p: any) => sum + p.amount, 0);
  const averageAmount = totalAmount / (totalPayments || 1);
  const paidPayments = payments.filter((p: any) => p.isPaid).length;
  const paymentRate = (paidPayments / (totalPayments || 1)) * 100;

  // Calcular pagos pagados y no pagados
  const unpaidPayments = totalPayments - paidPayments;
  const paymentCompletionRate = (paidPayments / (totalPayments || 1)) * 100;

  // Procesar datos para el gráfico de pagos
  const getPaymentStatusData = () => {
    return [
      { name: "Pagados", value: paidPayments, color: "var(--chart-1)" },
      { name: "Pendientes", value: unpaidPayments, color: "var(--chart-4)" },
    ];
  };

  // Procesar datos para el gráfico de tendencia temporal
  const getTimeData = () => {
    const now = new Date();
    let startDate: Date;

    // Determinar fecha de inicio según el rango seleccionado
    if (timeRange === "week") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    } else if (timeRange === "month") {
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
    } else {
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 1);
    }

    // Agrupar por fecha
    const groupedByDate: { [key: string]: { count: number; amount: number } } = {};

    payments.forEach((payment: any) => {
      // Asumimos que hay una propiedad de fecha de creación o similar
      const date = new Date(payment.dateStart || new Date());
      if (date >= startDate) {
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
        groupedByDate[dateKey].amount += payment.amount;
      }
    });

    // Convertir a array para el gráfico
    const result = Object.entries(groupedByDate).map(([date, data]) => ({
      date,
      cantidad: data.count,
      monto: data.amount,
    }));

    // Ordenar según el formato de fecha
    if (timeRange === "year") {
      // Ordenar por mes/año
      result.sort((a, b) => {
        const [aMonth, aYear] = a.date.split("/").map(Number);
        const [bMonth, bYear] = b.date.split("/").map(Number);
        if (aYear !== bYear) return aYear - bYear;
        return aMonth - bMonth;
      });
    } else {
      // Ordenar por día/mes
      result.sort((a, b) => {
        const [aDay, aMonth] = a.date.split("/").map(Number);
        const [bDay, bMonth] = b.date.split("/").map(Number);
        if (aMonth !== bMonth) return aMonth - bMonth;
        return aDay - bDay;
      });
    }

    return result;
  };

  const getPaymentGroupData = () => {
    const groupCount: { [key: string]: number } = {};

    payments.forEach((payment: any) => {
      const groupName = payment.quotationGroup?.name || "Sin grupo";

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

    payments.forEach((payment: any) => {
      const department = payment.department || "Sin especificar";
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
      [TypePayment.MONTHLY]: 0,
      [TypePayment.PUNCTUAL]: 0,
    };

    payments.forEach((payment: any) => {
      const paymentType = payment.typePayment || TypePayment.PUNCTUAL;
      paymentTypeCount[paymentType] += 1;
    });

    return Object.entries(paymentTypeCount).map(([name, value]) => ({
      name: LabelTypePayment[name as TypePayment],
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
  const paymentGroupData = getPaymentGroupData();
  // Calculamos el período que estamos visualizando
  const getPeriodLabel = () => {
    if (filters.from && filters.to) {
      const fromDate = new Date(filters.from);
      const toDate = new Date(filters.to);

      // Si es todo el año actual
      const currentYear = new Date().getFullYear();
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
    return "";
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
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de pagos</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              {totalPayments}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Monto total</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              S/ {totalAmount.toLocaleString("es-PE")}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Monto promedio</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              S/ {averageAmount.toLocaleString("es-PE", { maximumFractionDigits: 2 })}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ratio de pagos</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              {paymentRate.toFixed(1)}%
            </CardTitle>
            <CardDescription className="text-xs flex items-center gap-1">
              <ChevronRight className="h-3 w-3" />
              {paidPayments} pagos completados
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Gráfico principal de tendencia */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-0">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Pagos por {timeRange === "week" ? "semana" : timeRange === "month" ? "mes" : "año"}
              </CardTitle>
              <CardDescription>Cantidad de pagos por período</CardDescription>
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
                <YAxis
                  dataKey="cantidad"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10 }}
                  tickMargin={5}
                  width={25}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-card border border-border p-2 rounded-md shadow-md text-xs">
                          <p className="font-medium mb-1">{`Fecha: ${payload[0].payload.date}`}</p>
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
            <span>Cantidad de pagos</span>
          </div>
        </CardFooter>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Estado de Pagos (Donut Chart) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Estado de pagos
            </CardTitle>
            <CardDescription>Pagos completados vs. pendientes</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col justify-center items-center">
              <div className="text-4xl font-bold">{paymentCompletionRate.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Ratio de pagos</div>
              <div className="mt-6 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-3 w-3 rounded-full bg-chart-1"></div>
                  <div className="flex justify-between w-full">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      Pagados
                    </span>
                    <span className="font-medium">{paidPayments}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <div className="h-3 w-3 rounded-full bg-chart-4"></div>
                  <div className="flex justify-between w-full">
                    <span className="flex items-center gap-1">
                      <XCircle className="h-4 w-4 text-gray-500" />
                      Pendientes
                    </span>
                    <span className="font-medium">{unpaidPayments}</span>
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
                    strokeWidth={5}
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
                                {totalPayments}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 24}
                                className="fill-muted-foreground text-xs"
                              >
                                Pagos
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
                        const percentage = totalPayments ? ((value / totalPayments) * 100).toFixed(1) : "0.0";
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
              <div className="text-2xl font-bold">{totalPayments}</div>
              <div className="text-sm text-muted-foreground">Pagos totales</div>

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
              Distribución por grupo de pagos
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col justify-center">
              {/* Leyenda personalizada */}
              <div className="text-2xl font-bold">{paymentGroupData.length}</div>
              <div className="text-sm text-muted-foreground">Grupos con pagos</div>

              <div className="mt-6 space-y-2 max-h-48 overflow-y-auto pr-2">
                {paymentGroupData.slice(0, 5).map((group, index) => (
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
                {paymentGroupData.length > 5 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Y {paymentGroupData.length - 5} grupos más...
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-2 h-64">
              <ChartContainer config={chartConfig} className="mx-auto max-h-[250px] px-0">
                <BarChart
                  accessibilityLayer
                  data={paymentGroupData}
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
                    {paymentGroupData.map((_, index) => (
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
                            <p className="text-chart-2">{`Pagos: ${payload[0].value}`}</p>
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
