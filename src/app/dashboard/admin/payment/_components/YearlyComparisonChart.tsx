"use client";

import { useState } from "react";
import { BarChart3, ChevronDown, ChevronUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts";

import Empty from "@/shared/components/empty";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip } from "@/shared/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { useComparePaymentsWithPreviousYears } from "../_hooks/usePayments";

// Definir las interfaces para los datos
interface YearData {
  year: number;
  months: MonthData[];
  totalAmount: number;
  billedAmount: number;
  paidAmount: number;
}

interface MonthData {
  month: number;
  totalCount: number;
  billingsCount: number;
  paymentsCount: number;
  totalAmount: number;
  billedAmount: number;
  paidAmount: number;
}

interface ComparisonData {
  percentageChangeByYear: Record<string, number>;
  percentageBilledChangeByYear: Record<string, number>;
  percentagePaidChangeByYear: Record<string, number>;
  averageGrowth: number;
  averageBilledGrowth: number;
  averagePaidGrowth: number;
}

interface CompareResponse {
  years: YearData[];
  comparison: ComparisonData;
}

// Convertir número de mes a abreviatura
const getMonthName = (monthNumber: number): string => {
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  return months[monthNumber - 1] || "";
};

// Función para transformar los datos según el tipo de visualización (pagos realizados vs facturados)
function transformDataForChart(
  data: CompareResponse,
  selectedYears: number[],
  viewType: string
): Record<string, any>[] {
  if (!data?.years?.length) return [];

  // Filtrar los años seleccionados
  const filteredYears = data.years.filter((y) => selectedYears.includes(y.year));
  if (filteredYears.length === 0) return [];

  // Crear un array con todos los meses (1-12)
  const monthsData = Array.from({ length: 12 }, (_, i) => {
    const monthNumber = i + 1;
    return {
      month: monthNumber,
      monthName: getMonthName(monthNumber),
    };
  });

  // Para cada mes, agregar los valores de los años seleccionados
  return monthsData.map((monthItem) => {
    const dataPoint: Record<string, any> = {
      month: monthItem.monthName,
    };

    // Determinar qué campo usar según el tipo de visualización
    const fieldToUse = viewType === "paid" ? "paidAmount" : "billedAmount";

    // Agregar datos de cada año para este mes
    filteredYears.forEach((yearData) => {
      const monthData = yearData.months.find((m) => m.month === monthItem.month);
      dataPoint[`y${yearData.year}`] = monthData?.[fieldToUse] || 0;
    });

    return dataPoint;
  });
}

export default function YearlyComparisonChart() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [viewType, setViewType] = useState<string>("paid");
  const [yearsToCompare, setYearsToCompare] = useState<string>("3");

  // Calcular los años que queremos solicitar a la API
  const currentYear = new Date().getFullYear();
  const numYears = parseInt(yearsToCompare, 10);
  const yearsToRequest = Array.from({ length: numYears }, (_, i) => currentYear - i);

  // Obtener datos de la API con el filtro de años
  const {
    data: apiData,
    isLoading,
    error,
  } = useComparePaymentsWithPreviousYears({
    years: yearsToRequest,
  });

  // Cast data to expected format
  const data = apiData as unknown as CompareResponse;
  // Si está cargando, mostrar skeleton
  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <Skeleton className="h-6 w-48" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-72" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <Skeleton className="h-full w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Si hay error o no hay datos, mostrar mensaje
  if (error || !data || !data.years?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Comparación Anual de Pagos
          </CardTitle>
          <CardDescription>No se pudieron obtener los datos comparativos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full flex items-center justify-center">
            <Empty message={error instanceof Error ? error.message : "No hay datos comparativos disponibles."} />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Función para obtener la etiqueta descriptiva del selector
  const getYearSelectorLabel = (value: string): string => {
    const num = parseInt(value);
    switch (num) {
      case 1:
        return "Último año";
      case 2:
        return "Últimos 2 años";
      case 3:
        return "Últimos 3 años";
      case 4:
        return "Últimos 4 años";
      case 5:
        return "Últimos 5 años";
      case 6:
        return "Últimos 6 años";
      case 7:
        return "Últimos 7 años";
      case 8:
        return "Últimos 8 años";
      case 9:
        return "Últimos 9 años";
      case 10:
        return "Últimos 10 años";
      default:
        return `Últimos ${num} años`;
    }
  };

  // Ordenar años de más reciente a más antiguo
  const sortedYears = [...data.years].sort((a, b) => b.year - a.year);

  // Limitar la cantidad de años a mostrar según la selección del usuario
  const filteredYears = sortedYears.slice(0, numYears);
  const selectedYearsIds = filteredYears.map((y) => y.year);

  // Título y descripción según el tipo de visualización
  const viewTitles = {
    paid: {
      title: "Comparación de Pagos Concretados",
      description: "Análisis comparativo de pagos efectivamente cobrados por año",
    },
    billed: {
      title: "Comparación de Facturación",
      description: "Análisis comparativo de montos facturados por año",
    },
  };

  // Colores para el gráfico (ampliado para hasta 10 años)
  const chartColors = [
    "var(--chart-1)", // Azul
    "var(--chart-2)", // Verde
    "var(--chart-3)", // Amarillo
    "var(--chart-4)", // Rojo
    "var(--chart-5)", // Violeta
    "#8884d8", // Púrpura claro
    "#82ca9d", // Verde agua
    "#ffc658", // Naranja
    "#ff7300", // Naranja oscuro
    "#00C49F", // Verde esmeralda
  ];

  // Configuración del gráfico
  const chartConfig = filteredYears.reduce(
    (acc, year, index) => {
      acc[`y${year.year}`] = {
        label: `Año ${year.year}`,
        color: chartColors[index % chartColors.length],
      };
      return acc;
    },
    {} as Record<string, { label: string; color: string }>
  );

  // Transformar datos para el gráfico según el tipo de visualización
  const chartData = transformDataForChart(data, selectedYearsIds, viewType);
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              {viewTitles[viewType as keyof typeof viewTitles].title}
            </CardTitle>
            <CardDescription>{viewTitles[viewType as keyof typeof viewTitles].description}</CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground mb-1">Período de comparación</span>
              <Select value={yearsToCompare} onValueChange={setYearsToCompare}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Seleccionar período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Último año</SelectItem>
                  <SelectItem value="2">Últimos 2 años</SelectItem>
                  <SelectItem value="3">Últimos 3 años</SelectItem>
                  <SelectItem value="4">Últimos 4 años</SelectItem>
                  <SelectItem value="5">Últimos 5 años</SelectItem>
                  <SelectItem value="6">Últimos 6 años</SelectItem>
                  <SelectItem value="7">Últimos 7 años</SelectItem>
                  <SelectItem value="8">Últimos 8 años</SelectItem>
                  <SelectItem value="9">Últimos 9 años</SelectItem>
                  <SelectItem value="10">Últimos 10 años</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Tabs value={viewType} onValueChange={setViewType}>
            <TabsList>
              <TabsTrigger value="paid">Pagos Concretados</TabsTrigger>
              <TabsTrigger value="billed">Pagos Facturados</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="text-sm text-muted-foreground">Comparando: {getYearSelectorLabel(yearsToCompare)}</div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          {/* Gráfico de áreas */}
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
                <AreaChart data={chartData}>
                  <defs>
                    {filteredYears.map((year, index) => (
                      <linearGradient
                        key={`gradient-${year.year}`}
                        id={`fill-${year.year}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor={chartColors[index % chartColors.length]} stopOpacity={0.8} />
                        <stop offset="5%" stopColor={chartColors[index % chartColors.length]} stopOpacity={0.1} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => `S/. ${value.toLocaleString("es-PE", { maximumFractionDigits: 0 })}`}
                    width={80}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-card border border-border p-3 rounded-md shadow-md">
                            <div className="font-medium mb-2">{label}</div>
                            <div className="space-y-2">
                              {payload.map((entry, index) => {
                                // Extraer el año del dataKey (formato: "y2023")
                                const dataKey = entry.dataKey as string;
                                const year = dataKey.startsWith("y") ? dataKey.substring(1) : dataKey;

                                return (
                                  <div key={`tooltip-${index}`} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <div className="size-2 rounded-xs" style={{ backgroundColor: entry.color }} />
                                      <span className="text-xs font-bold text-muted-foreground/70 mr-2">{year}</span>
                                    </div>
                                    <span className="text-sm font-medium">
                                      S/. {Number(entry.value).toLocaleString("es-PE")}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />

                  {/* Renderizar una área para cada año */}
                  {filteredYears.map((yearData, index) => (
                    <Area
                      key={`area-${yearData.year}`}
                      type="linear"
                      dataKey={`y${yearData.year}`}
                      name={`y${yearData.year}`}
                      stroke={chartColors[index % chartColors.length]}
                      fill={`url(#fill-${yearData.year})`}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                      dot={{
                        fill: chartColors[index % chartColors.length],
                        r: 4,
                        strokeWidth: 0,
                      }}
                    />
                  ))}

                  <ChartLegend content={<ChartLegendContent />} />
                </AreaChart>
              </ChartContainer>
            </ResponsiveContainer>
          </div>

          {/* Resumen de totales por año */}
          <div className="space-y-4 mt-8">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Resumen por Año</h3>
              <span className="text-sm text-muted-foreground">
                {viewType === "paid" ? "Montos pagados" : "Montos facturados"}
              </span>
            </div>

            {/* Diseño adaptativo: Cards para pocos años, tabla para muchos */}
            {filteredYears.length <= 4 ? (
              // Diseño con Cards (para 1-4 años)
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredYears.map((yearData, index) => {
                  // Calcular el crecimiento si hay datos disponibles
                  const compareKey = `${yearData.year}-${yearData.year - 1}`;
                  const growthKey = viewType === "paid" ? "percentagePaidChangeByYear" : "percentageBilledChangeByYear";
                  const growthPercentage = data.comparison?.[growthKey]?.[compareKey];

                  const amountValue = viewType === "paid" ? yearData.paidAmount : yearData.billedAmount;
                  const title = viewType === "paid" ? "Pagado" : "Facturado";

                  // Determinar si es el año más reciente
                  const isCurrentYear = index === 0;
                  const isLastYear = index === 1;

                  return (
                    <div
                      key={yearData.year}
                      className={`relative bg-card border rounded-lg p-4 space-y-3 transition-all hover:shadow-md ${
                        isCurrentYear ? "ring-2 ring-primary/20 bg-primary/5" : ""
                      }`}
                    >
                      {isCurrentYear && (
                        <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                          Actual
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-lg font-bold">Año {yearData.year}</span>
                          {isCurrentYear && (
                            <span className="block text-xs text-primary font-medium">Año más reciente</span>
                          )}
                          {isLastYear && <span className="block text-xs text-muted-foreground">Año anterior</span>}
                        </div>
                        <div
                          className="h-4 w-4 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: chartColors[index % chartColors.length] }}
                        ></div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-2xl font-bold text-foreground">
                          S/. {amountValue.toLocaleString("es-PE")}
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Total {title}</span>
                          {growthPercentage !== undefined && (
                            <div className="flex items-center gap-1">
                              <span
                                className={`font-semibold ${growthPercentage >= 0 ? "text-emerald-600" : "text-rose-600"}`}
                              >
                                {growthPercentage > 0 ? "+" : ""}
                                {growthPercentage.toFixed(1)}%
                              </span>
                              <span className="text-xs text-muted-foreground">vs anterior</span>
                            </div>
                          )}
                        </div>

                        {/* Información adicional */}
                        <div className="pt-2 border-t border-border/50">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-muted-foreground">Facturado:</span>
                              <div className="font-medium">S/. {yearData.billedAmount.toLocaleString("es-PE")}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Pagado:</span>
                              <div className="font-medium">S/. {yearData.paidAmount.toLocaleString("es-PE")}</div>
                            </div>
                          </div>

                          {/* Indicador de eficiencia de cobro */}
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Eficiencia de cobro</span>
                              <span className="font-medium">
                                {yearData.billedAmount > 0
                                  ? `${((yearData.paidAmount / yearData.billedAmount) * 100).toFixed(1)}%`
                                  : "N/A"}
                              </span>
                            </div>
                            <div className="w-full bg-muted h-1.5 rounded-full mt-1">
                              <div
                                className="bg-primary h-1.5 rounded-full transition-all"
                                style={{
                                  width: `${
                                    yearData.billedAmount > 0
                                      ? Math.min((yearData.paidAmount / yearData.billedAmount) * 100, 100)
                                      : 0
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Diseño con Tabla (para 5+ años)
              <div className="bg-card border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 font-medium">Año</th>
                        <th className="text-right p-3 font-medium">{viewType === "paid" ? "Pagado" : "Facturado"}</th>
                        <th className="text-right p-3 font-medium">Facturado</th>
                        <th className="text-right p-3 font-medium">Cobrado</th>
                        <th className="text-center p-3 font-medium">Eficiencia</th>
                        <th className="text-center p-3 font-medium">Crecimiento</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredYears.map((yearData, index) => {
                        const compareKey = `${yearData.year}-${yearData.year - 1}`;
                        const growthKey =
                          viewType === "paid" ? "percentagePaidChangeByYear" : "percentageBilledChangeByYear";
                        const growthPercentage = data.comparison?.[growthKey]?.[compareKey];
                        const amountValue = viewType === "paid" ? yearData.paidAmount : yearData.billedAmount;
                        const isCurrentYear = index === 0;
                        const efficiency =
                          yearData.billedAmount > 0 ? (yearData.paidAmount / yearData.billedAmount) * 100 : 0;

                        return (
                          <tr
                            key={yearData.year}
                            className={`border-t transition-colors hover:bg-muted/30 ${
                              isCurrentYear ? "bg-primary/5" : ""
                            }`}
                          >
                            <td className="p-3">
                              <div className="flex items-center gap-3">
                                <div
                                  className="h-3 w-3 rounded-full border border-white shadow-sm"
                                  style={{ backgroundColor: chartColors[index % chartColors.length] }}
                                ></div>
                                <div>
                                  <div className="font-semibold flex items-center gap-2">
                                    {yearData.year}
                                    {isCurrentYear && (
                                      <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded">
                                        Actual
                                      </span>
                                    )}
                                  </div>
                                  {isCurrentYear && <div className="text-xs text-primary">Más reciente</div>}
                                </div>
                              </div>
                            </td>

                            <td className="p-3 text-right">
                              <div className="font-bold text-lg">S/. {amountValue.toLocaleString("es-PE")}</div>
                            </td>

                            <td className="p-3 text-right">
                              <div className="text-sm font-medium">
                                S/. {yearData.billedAmount.toLocaleString("es-PE")}
                              </div>
                            </td>

                            <td className="p-3 text-right">
                              <div className="text-sm font-medium">
                                S/. {yearData.paidAmount.toLocaleString("es-PE")}
                              </div>
                            </td>

                            <td className="p-3 text-center">
                              <div className="space-y-1">
                                <div className="text-sm font-medium">{efficiency.toFixed(1)}%</div>
                                <div className="w-16 mx-auto bg-muted h-1.5 rounded-full">
                                  <div
                                    className="bg-primary h-1.5 rounded-full transition-all"
                                    style={{ width: `${Math.min(efficiency, 100)}%` }}
                                  />
                                </div>
                              </div>
                            </td>

                            <td className="p-3 text-center">
                              {growthPercentage !== undefined ? (
                                <div className="space-y-1">
                                  <div
                                    className={`text-sm font-semibold ${
                                      growthPercentage >= 0 ? "text-emerald-600" : "text-rose-600"
                                    }`}
                                  >
                                    {growthPercentage > 0 ? "+" : ""}
                                    {growthPercentage.toFixed(1)}%
                                  </div>
                                  <div className="text-xs text-muted-foreground">vs anterior</div>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">N/A</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Resumen estadístico compacto */}
                <div className="border-t bg-muted/20 p-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-xs text-muted-foreground">Promedio Anual</div>
                      <div className="font-semibold">
                        S/.{" "}
                        {(
                          filteredYears.reduce(
                            (sum, year) => sum + (viewType === "paid" ? year.paidAmount : year.billedAmount),
                            0
                          ) / filteredYears.length
                        ).toLocaleString("es-PE", { maximumFractionDigits: 0 })}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Mejor Año</div>
                      <div className="font-semibold text-emerald-600">
                        {
                          filteredYears.reduce((best, year) =>
                            (viewType === "paid" ? year.paidAmount : year.billedAmount) >
                            (viewType === "paid" ? best.paidAmount : best.billedAmount)
                              ? year
                              : best
                          ).year
                        }
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Eficiencia Promedio</div>
                      <div className="font-semibold">
                        {(
                          filteredYears.reduce(
                            (sum, year) =>
                              sum + (year.billedAmount > 0 ? (year.paidAmount / year.billedAmount) * 100 : 0),
                            0
                          ) / filteredYears.length
                        ).toFixed(1)}
                        %
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Datos de crecimiento general */}
          {data.comparison?.averageGrowth !== undefined && filteredYears.length > 1 && (
            <div className="mt-6 space-y-4">
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Análisis de Tendencias de Crecimiento</h3>

                {/* Descripción contextual */}
                <div className="bg-muted/30 rounded-lg p-4 mb-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>¿Qué significa esto?</strong> Los siguientes indicadores muestran cómo ha cambiado el
                    rendimiento financiero en promedio durante los {filteredYears.length} años seleccionados, comparando
                    cada año con el anterior.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Crecimiento Total */}
                  <div className="bg-card border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                      <div>
                        <div className="font-medium">Crecimiento General</div>
                        <div className="text-xs text-muted-foreground">Rendimiento global promedio</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div
                        className={`text-3xl font-bold ${data.comparison.averageGrowth >= 0 ? "text-emerald-600" : "text-rose-600"}`}
                      >
                        {data.comparison.averageGrowth > 0 ? "+" : ""}
                        {data.comparison.averageGrowth.toFixed(1)}%
                      </div>

                      <div className="text-xs text-muted-foreground">
                        {data.comparison.averageGrowth >= 0
                          ? "📈 Tu negocio está creciendo en promedio cada año"
                          : "📉 Hay una tendencia de disminución año tras año"}
                      </div>

                      <div className="pt-2 border-t border-border/50">
                        <div className="text-xs">
                          <span className="font-medium">Interpretación: </span>
                          {data.comparison.averageGrowth >= 10
                            ? "Crecimiento excelente y sostenido"
                            : data.comparison.averageGrowth >= 5
                              ? "Crecimiento saludable y estable"
                              : data.comparison.averageGrowth >= 0
                                ? "Crecimiento lento pero positivo"
                                : data.comparison.averageGrowth >= -5
                                  ? "Disminución leve, requiere atención"
                                  : "Disminución significativa, requiere acción"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Crecimiento en Facturación */}
                  <div className="bg-card border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-8 bg-orange-500 rounded-full"></div>
                      <div>
                        <div className="font-medium">Facturación</div>
                        <div className="text-xs text-muted-foreground">Crecimiento en ventas/servicios</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div
                        className={`text-3xl font-bold ${data.comparison.averageBilledGrowth >= 0 ? "text-emerald-600" : "text-rose-600"}`}
                      >
                        {data.comparison.averageBilledGrowth > 0 ? "+" : ""}
                        {data.comparison.averageBilledGrowth.toFixed(1)}%
                      </div>

                      <div className="text-xs text-muted-foreground">
                        {data.comparison.averageBilledGrowth >= 0
                          ? "💼 Estás facturando más cada año"
                          : "💼 La facturación está disminuyendo"}
                      </div>

                      <div className="pt-2 border-t border-border/50">
                        <div className="text-xs">
                          <span className="font-medium">Estado: </span>
                          {data.comparison.averageBilledGrowth >= 15
                            ? "Expansión de negocio muy fuerte"
                            : data.comparison.averageBilledGrowth >= 8
                              ? "Crecimiento sólido en ventas"
                              : data.comparison.averageBilledGrowth >= 0
                                ? "Crecimiento moderado en facturación"
                                : "Reducción en volumen de facturación"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Crecimiento en Cobros */}
                  <div className="bg-card border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-8 bg-green-500 rounded-full"></div>
                      <div>
                        <div className="font-medium">Cobros Efectivos</div>
                        <div className="text-xs text-muted-foreground">Dinero realmente recibido</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div
                        className={`text-3xl font-bold ${data.comparison.averagePaidGrowth >= 0 ? "text-emerald-600" : "text-rose-600"}`}
                      >
                        {data.comparison.averagePaidGrowth > 0 ? "+" : ""}
                        {data.comparison.averagePaidGrowth.toFixed(1)}%
                      </div>

                      <div className="text-xs text-muted-foreground">
                        {data.comparison.averagePaidGrowth >= 0
                          ? "💰 Estás cobrando más dinero efectivamente"
                          : "💰 Los cobros están disminuyendo"}
                      </div>

                      <div className="pt-2 border-t border-border/50">
                        <div className="text-xs">
                          <span className="font-medium">Flujo de caja: </span>
                          {data.comparison.averagePaidGrowth >= 10
                            ? "Excelente liquidez y cobranza"
                            : data.comparison.averagePaidGrowth >= 5
                              ? "Buena gestión de cobranza"
                              : data.comparison.averagePaidGrowth >= 0
                                ? "Cobranza estable"
                                : "Problemas de cobranza detectados"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Análisis comparativo */}
                <div className="mt-6 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20 rounded-lg p-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <span>🎯</span>
                    Resumen Ejecutivo
                  </h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {/* Análisis inteligente basado en los datos */}
                    {data.comparison.averageBilledGrowth > data.comparison.averagePaidGrowth + 5 ? (
                      <p>
                        ⚠️ <strong>Oportunidad de mejora:</strong> Estás facturando bien pero tienes espacio para
                        mejorar la cobranza. La diferencia de{" "}
                        {(data.comparison.averageBilledGrowth - data.comparison.averagePaidGrowth).toFixed(1)}% sugiere
                        optimizar procesos de cobro.
                      </p>
                    ) : data.comparison.averagePaidGrowth > data.comparison.averageBilledGrowth + 3 ? (
                      <p>
                        ✅ <strong>Excelente gestión:</strong> Tu eficiencia de cobranza es superior al crecimiento de
                        facturación, lo que indica una excelente gestión de cobros y posible recuperación de cuentas
                        pendientes.
                      </p>
                    ) : Math.abs(data.comparison.averageBilledGrowth - data.comparison.averagePaidGrowth) <= 3 ? (
                      <p>
                        👌 <strong>Balance óptimo:</strong> Hay una buena correlación entre lo que facturas y lo que
                        cobras, manteniendo un flujo de caja saludable y predecible.
                      </p>
                    ) : (
                      <p>
                        📊 <strong>Análisis en progreso:</strong> Los datos muestran variaciones normales en el ciclo de
                        negocio. Continúa monitoreando las tendencias para identificar patrones.
                      </p>
                    )}

                    <p className="mt-2">
                      <strong>Período analizado:</strong> {filteredYears[filteredYears.length - 1]?.year} -{" "}
                      {filteredYears[0]?.year}({filteredYears.length} {filteredYears.length === 1 ? "año" : "años"})
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
