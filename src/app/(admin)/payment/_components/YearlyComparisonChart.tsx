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

  // Obtener datos de la API sin filtros para tener datos completos anuales
  const { data: apiData, isLoading, error } = useComparePaymentsWithPreviousYears({});

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

  // Ordenar años de más reciente a más antiguo
  const sortedYears = [...data.years].sort((a, b) => b.year - a.year);

  // Limitar la cantidad de años a mostrar según la selección del usuario
  const numYears = parseInt(yearsToCompare, 10);
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

  // Colores para el gráfico
  const chartColors = ["var(--chart-4)", "var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-5)"];

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
          <div className="flex items-center gap-2">
            <Select value={yearsToCompare} onValueChange={setYearsToCompare}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Cantidad de años" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Último año</SelectItem>
                <SelectItem value="2">Últimos 2 años</SelectItem>
                <SelectItem value="3">Últimos 3 años</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <Tabs value={viewType} onValueChange={setViewType} className="mt-4">
          <TabsList>
            <TabsTrigger value="paid">Pagos Concretados</TabsTrigger>
            <TabsTrigger value="billed">Pagos Facturados</TabsTrigger>
          </TabsList>
        </Tabs>
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
                        <stop offset="5%" stopColor={chartColors[index % chartColors.length]} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={chartColors[index % chartColors.length]} stopOpacity={0.1} />
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 mt-8">
            {filteredYears.map((yearData, index) => {
              // Calcular el crecimiento si hay datos disponibles
              const compareKey = `${yearData.year}-${yearData.year - 1}`;
              const growthKey = viewType === "paid" ? "percentagePaidChangeByYear" : "percentageBilledChangeByYear";
              const growthPercentage = data.comparison?.[growthKey]?.[compareKey];

              const amountValue = viewType === "paid" ? yearData.paidAmount : yearData.billedAmount;
              const title = viewType === "paid" ? "Pagado" : "Facturado";

              return (
                <div key={yearData.year} className="bg-card border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Año {yearData.year}</span>
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: chartColors[index % chartColors.length] }}
                    ></div>
                  </div>
                  <div className="text-2xl font-bold">S/. {amountValue.toLocaleString("es-PE")}</div>
                  <div className="text-sm text-muted-foreground flex justify-between">
                    <span>Total {title}</span>
                    {growthPercentage !== undefined && (
                      <span className={growthPercentage >= 0 ? "text-emerald-500" : "text-rose-500"}>
                        {growthPercentage > 0 ? "+" : ""}
                        {growthPercentage.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Datos de crecimiento general */}
          {data.comparison?.averageGrowth !== undefined && (
            <div className="mt-4 p-4 border rounded-lg">
              <div className="text-sm font-medium mb-2">Resumen de crecimiento</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Crecimiento promedio</div>
                  <div
                    className={`text-lg font-bold ${data.comparison.averageGrowth >= 0 ? "text-emerald-500" : "text-rose-500"}`}
                  >
                    {data.comparison.averageGrowth > 0 ? "+" : ""}
                    {data.comparison.averageGrowth.toFixed(1)}%
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Crecimiento en facturación</div>
                  <div
                    className={`text-lg font-bold ${data.comparison.averageBilledGrowth >= 0 ? "text-emerald-500" : "text-rose-500"}`}
                  >
                    {data.comparison.averageBilledGrowth > 0 ? "+" : ""}
                    {data.comparison.averageBilledGrowth.toFixed(1)}%
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Crecimiento en cobros</div>
                  <div
                    className={`text-lg font-bold ${data.comparison.averagePaidGrowth >= 0 ? "text-emerald-500" : "text-rose-500"}`}
                  >
                    {data.comparison.averagePaidGrowth > 0 ? "+" : ""}
                    {data.comparison.averagePaidGrowth.toFixed(1)}%
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
