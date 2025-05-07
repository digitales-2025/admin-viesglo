"use client";

import { useState } from "react";
import { TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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
import { LabelTypePayment, TypePayment } from "../_types/quotation.types";

// Usamos las variables de color definidas en globals.css
const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

export default function QuotationGraph() {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month");

  // Obtenemos los filtros del store
  const { filters } = useQuotationsStore();

  // Obtenemos los datos directamente de la API usando los filtros del store y
  const { data, isLoading, error } = useQuotationsForStats({ ...filters });

  // Extraemos los datos de cotizaciones
  const quotations = data || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gráfico de cotizaciones</CardTitle>
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
          <CardTitle>Gráfico de cotizaciones</CardTitle>
          <CardDescription>Error al cargar los datos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 w-full flex items-center justify-center">
            <p className="text-destructive">
              {error instanceof Error ? error.message : "No hay datos de cotizaciones disponibles para mostrar."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calcular KPIs principales
  const totalQuotations = quotations.length;
  const totalAmount = quotations.reduce((sum: number, q: any) => sum + q.amount, 0);
  const averageAmount = totalAmount / (totalQuotations || 1);
  const concreteQuotations = quotations.filter((q: any) => q.isConcrete).length;
  const conversionRate = (concreteQuotations / (totalQuotations || 1)) * 100;

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

    quotations.forEach((quotation: any) => {
      // Asumimos que hay una propiedad de fecha de creación o similar
      const date = new Date(quotation.dateStart || new Date());
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
        groupedByDate[dateKey].amount += quotation.amount;
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

  // Procesar datos para el gráfico de distribución por servicios
  const getServiceData = () => {
    const serviceCount: { [key: string]: number } = {};

    quotations.forEach((quotation: any) => {
      const service = quotation.service || "Sin especificar";
      if (!serviceCount[service]) {
        serviceCount[service] = 0;
      }
      serviceCount[service] += 1;
    });

    return Object.entries(serviceCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Limitar a los 6 servicios más comunes
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
      [TypePayment.MONTHLY]: 0,
      [TypePayment.PUNCTUAL]: 0,
    };

    quotations.forEach((quotation: any) => {
      const paymentType = quotation.typePayment || TypePayment.PUNCTUAL;
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

  const serviceData = getServiceData();
  const departmentData = getDepartmentData();
  const paymentTypeData = getPaymentTypeData();

  // Si hay filtros activos, mostramos un mensaje indicando el número de resultados filtrados
  const filterMessage = Object.keys(filters).length > 0 ? `Mostrando ${totalQuotations} cotizaciones filtradas` : "";

  return (
    <div className="space-y-4">
      {/* Mensaje de filtros aplicados */}
      {filterMessage && <div className="text-sm text-muted-foreground mb-2">{filterMessage}</div>}

      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de cotizaciones</CardDescription>
            <CardTitle className="text-3xl">{totalQuotations}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Monto total</CardDescription>
            <CardTitle className="text-3xl">S/ {totalAmount.toLocaleString("es-PE")}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Monto promedio</CardDescription>
            <CardTitle className="text-3xl">
              S/ {averageAmount.toLocaleString("es-PE", { maximumFractionDigits: 2 })}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tasa de conversión</CardDescription>
            <CardTitle className="text-3xl">{conversionRate.toFixed(1)}%</CardTitle>
            <CardDescription className="text-xs">{concreteQuotations} cotizaciones concretadas</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Gráfico principal de tendencia */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-0">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <div>
              <CardTitle>
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
            <span>Cantidad de cotizaciones</span>
          </div>
        </CardFooter>
      </Card>

      {/* Gráficos de distribución */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Distribución por servicio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ChartContainer config={chartConfig} className="mx-auto max-h-[250px] px-0">
                <PieChart>
                  <Pie
                    data={serviceData}
                    labelLine={false}
                    outerRadius={80}
                    fill="var(--chart-3)"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {serviceData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                </PieChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución por departamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ChartContainer config={chartConfig} className="mx-auto max-h-[250px] px-0">
                <BarChart
                  accessibilityLayer
                  data={departmentData}
                  layout="vertical"
                  margin={{
                    left: 0,
                  }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => departmentData.find((d) => d.name === value)?.name || ""}
                  />
                  <XAxis dataKey="cantidad" type="number" hide />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" defaultValue="cantidad" />}
                  />
                  <Bar dataKey="cantidad" layout="vertical" radius={5} fill="var(--chart-4)">
                    {departmentData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                    <LabelList dataKey="cantidad" position="right" fill="var(--chart-4)" />
                  </Bar>
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de tipo de pago */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución por tipo de pago</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ChartContainer config={chartConfig} className="mx-auto max-h-[250px] px-0">
              <PieChart>
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
                  {paymentTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <ChartLegend content={({ payload }) => <ChartLegendContent payload={payload} nameKey="name" />} />
              </PieChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
