"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import {
  CostsFilterParams,
  fetchCostsDashboardByProject,
  fetchCostsDashboardCostEfficiency,
  fetchCostsDashboardMonthlyBreakdown,
  fetchCostsDashboardPieDistribution,
  fetchCostsDashboardSummary,
} from "@/shared/lib/costs.service";

/**
 * Componente KPI para mostrar métricas clave de costos
 */
function CostKpi({
  label,
  value,
  description,
  icon,
}: {
  label: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <div className="text-muted-foreground">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Props del componente CostsDashboard
 */
interface CostsDashboardProps {
  filters?: CostsFilterParams;
}

export default function CostsDashboard({ filters }: CostsDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Queries para obtener los datos
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["costs", "dashboard", "summary", filters],
    queryFn: () => fetchCostsDashboardSummary(filters),
    staleTime: 60_000,
  });

  const { data: pieData, isLoading: pieLoading } = useQuery({
    queryKey: ["costs", "dashboard", "pie-distribution", filters],
    queryFn: () => fetchCostsDashboardPieDistribution(filters),
    staleTime: 60_000,
  });

  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ["costs", "dashboard", "by-project", filters],
    queryFn: () => fetchCostsDashboardByProject(filters),
    staleTime: 60_000,
  });

  const { data: efficiencyData, isLoading: efficiencyLoading } = useQuery({
    queryKey: ["costs", "dashboard", "cost-efficiency", filters],
    queryFn: () => fetchCostsDashboardCostEfficiency(filters),
    staleTime: 60_000,
  });

  const { data: monthlyBreakdownData, isLoading: monthlyBreakdownLoading } = useQuery({
    queryKey: ["costs", "dashboard", "monthly-breakdown", filters],
    queryFn: () => fetchCostsDashboardMonthlyBreakdown(filters),
    staleTime: 60_000,
  });

  const generateDynamicMonthlyBreakdown = () => {
    const currentYear = new Date().getFullYear();
    const monthlyBreakdown = [];

    for (let month = 1; month <= 12; month++) {
      const monthStr = `${currentYear}-${String(month).padStart(2, "0")}`;
      monthlyBreakdown.push({
        month: monthStr,
        totalSpent: 0,
        directCosts: 0,
        indirectCosts: 0,
        expenses: 0,
        transactionCount: 0,
      });
    }

    return {
      year: currentYear,
      monthlyBreakdown,
      summary: {
        totalYearSpent: 0,
        averageMonthlySpent: 0,
        peakMonth: {
          month: `${currentYear}-01`,
          totalSpent: 0,
          directCosts: 0,
          indirectCosts: 0,
          expenses: 0,
          transactionCount: 0,
        },
      },
    };
  };

  const generateDynamicEfficiency = () => {
    return {
      summary: {
        totalProjects: 0,
        totalCost: 0,
        averageCostPerProject: 0,
        maxCost: 0,
        minCost: 0,
        median: 0,
      },
      distribution: [
        { range: "0-10K", count: 0, percentage: 0 },
        { range: "10K-50K", count: 0, percentage: 0 },
        { range: "50K-100K", count: 0, percentage: 0 },
        { range: "100K+", count: 0, percentage: 0 },
      ],
    };
  };

  // Datos por defecto cuando no hay información
  const defaultSummary = {
    totalSpent: 0,
    totalDirectCosts: 0,
    totalIndirectCosts: 0,
    totalExpenses: 0,
  };

  const defaultPieData = {
    total: 0,
    distribution: [
      { category: "DIRECT_COSTS", amount: 0, percentage: 0 },
      { category: "INDIRECT_COSTS", amount: 0, percentage: 0 },
      { category: "EXPENSES", amount: 0, percentage: 0 },
    ],
  };

  const summaryData = summary || defaultSummary;
  const pieChartData = pieData || defaultPieData;
  const projects = Array.isArray(projectsData) ? projectsData : [];

  // Usar datos dinámicos para eficiencia
  const efficiency = efficiencyData || generateDynamicEfficiency();

  // Usar datos dinámicos para desglose mensual (año actual completo)
  const monthlyBreakdown = monthlyBreakdownData || generateDynamicMonthlyBreakdown();

  // Procesar datos del desglose mensual para mejor visualización
  const processedMonthlyData = monthlyBreakdown.monthlyBreakdown.map((item) => ({
    ...item,
    monthLabel: new Date(item.month + "-01").toLocaleDateString("es-ES", {
      month: "short",
      year: "numeric",
    }),
  }));

  // Mapeo de categorías a español
  const CATEGORY_LABELS: Record<string, string> = {
    DIRECT_COSTS: "Costos Directos",
    INDIRECT_COSTS: "Costos Indirectos",
    EXPENSES: "Gastos",
  };

  // Mapeo de tipos de proyecto a español
  const PROJECT_TYPE_LABELS: Record<string, string> = {
    DOCUMENTADO: "Documentado",
    IMPLEMENTADO: "Implementado",
    HIBRIDO: "Híbrido",
  };

  // Colores para el gráfico de torta
  const COLORS = ["#3b82f6", "#ef4444", "#f59e0b", "#10b981", "#8b5cf6"];

  // Datos procesados para el gráfico de torta
  const pieChartProcessedData = pieChartData.distribution.map((item) => ({
    ...item,
    categoryLabel: CATEGORY_LABELS[item.category || ""] || item.category || "Desconocido",
  }));

  // Filtrar proyectos por término de búsqueda
  const filteredProjects = projects.filter((project) =>
    project.projectName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const isLoading = summaryLoading || pieLoading || projectsLoading || efficiencyLoading || monthlyBreakdownLoading;

  return (
    <div className="space-y-6">
      {/* Tarjetas KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <CostKpi
          label="Monto total gastado"
          value={formatCurrency(summaryData.totalSpent)}
          description="Monto total de costos registrados"
          icon={
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          }
        />
        <CostKpi
          label="Monto total en costos directos"
          value={formatCurrency(summaryData.totalDirectCosts)}
          description="Monto total de costos directos registrados"
          icon={
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          }
        />
        <CostKpi
          label="Monto total en costos indirectos"
          value={formatCurrency(summaryData.totalExpenses)}
          description="Monto total de costos indirectos registrados"
          icon={
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
          }
        />
        <CostKpi
          label="Monto total en gastos"
          value={formatCurrency(summaryData.totalIndirectCosts)}
          description="Monto total de gastos registrados"
          icon={
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
          }
        />
      </div>

      {/* Gráfico de torta y tabla */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de torta */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribución de gastos por tipo de costo</CardTitle>
            <CardDescription>Proporción de costos por categoría</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-sm text-muted-foreground">Cargando gráfico...</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartProcessedData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ categoryLabel, percentage }) => `${categoryLabel}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {pieChartProcessedData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), "Monto"]}
                    labelFormatter={(label) => CATEGORY_LABELS[label as string] || label}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Tabla de costos por proyecto */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Torre de Costos</CardTitle>
            <CardDescription>Desglose de costos por proyecto</CardDescription>
            <div className="flex items-center gap-2 mt-4">
              <Input
                placeholder="Buscar proyectos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Cargando tabla...</div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input type="checkbox" className="rounded" />
                      </TableHead>
                      <TableHead>Proyecto</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Costo Total</TableHead>
                      <TableHead className="text-right">Costo Directo</TableHead>
                      <TableHead className="text-right">Costo Indirecto</TableHead>
                      <TableHead className="text-right">Gasto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProjects.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          {searchTerm ? "No se encontraron proyectos" : "No hay proyectos registrados"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProjects.map((project) => (
                        <TableRow key={project.projectId}>
                          <TableCell>
                            <input type="checkbox" className="rounded" />
                          </TableCell>
                          <TableCell className="font-medium">{project.projectName}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {PROJECT_TYPE_LABELS[project.projectType] || project.projectType}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(project.totalSpent)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(project.totalDirectCosts)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(project.totalExpenses)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(project.totalIndirectCosts)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráficos adicionales */}

      {/* Eficiencia de costos y Desglose mensual */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Eficiencia de costos - Gráfico de barras con KPIs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Eficiencia de Costos</CardTitle>
            <CardDescription>Distribución de costos por rango</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* KPIs de eficiencia */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg border bg-blue-50 border-blue-200 dark:bg-blue-900/40 dark:border-blue-700">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-200">Total Proyectos</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-50">
                    {efficiency.summary.totalProjects}
                  </p>
                </div>
                <div className="text-center p-3 rounded-lg border bg-green-50 border-green-200 dark:bg-green-900/40 dark:border-green-700">
                  <p className="text-sm font-medium text-green-700 dark:text-green-200">Costo Promedio</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-50">
                    {formatCurrency(efficiency.summary.averageCostPerProject ?? 0)}
                  </p>
                </div>
                <div className="text-center p-3 rounded-lg border bg-orange-50 border-orange-200 dark:bg-orange-900/40 dark:border-orange-700">
                  <p className="text-sm font-medium text-orange-700 dark:text-orange-200">Costo Máximo</p>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-50">
                    {formatCurrency(efficiency.summary.maxCost ?? 0)}
                  </p>
                </div>
                <div className="text-center p-3 rounded-lg border bg-purple-50 border-purple-200 dark:bg-purple-900/40 dark:border-purple-700">
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-200">Costo Mínimo</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-50">
                    {formatCurrency(efficiency.summary.minCost ?? 0)}
                  </p>
                </div>
              </div>

              {/* Gráfico de distribución */}
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={efficiency.distribution}>
                    <defs>
                      <linearGradient id="barEfficiency" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#0891b2" stopOpacity={0.9} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        name === "count" ? value : `${value}%`,
                        name === "count" ? "Cantidad" : "Porcentaje",
                      ]}
                    />
                    <Bar
                      dataKey="count"
                      fill="url(#barEfficiency)"
                      radius={[4, 4, 0, 0]}
                      isAnimationActive
                      animationDuration={700}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Desglose mensual - Gráfico de área apilada */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Desglose Mensual de Costos</CardTitle>
            <CardDescription>Año {monthlyBreakdown.year} - Evolución mensual</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-sm text-muted-foreground">Cargando desglose mensual...</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={processedMonthlyData}>
                  <defs>
                    <linearGradient id="areaDirect" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="areaIndirect" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="areaExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="monthLabel" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), ""]}
                    labelFormatter={(label) => `Mes: ${label}`}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="directCosts"
                    stackId="1"
                    stroke="#10b981"
                    fill="url(#areaDirect)"
                    name="Costos Directos"
                  />
                  <Area
                    type="monotone"
                    dataKey="indirectCosts"
                    stackId="1"
                    stroke="#f59e0b"
                    fill="url(#areaIndirect)"
                    name="Costos Indirectos"
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stackId="1"
                    stroke="#ef4444"
                    fill="url(#areaExpenses)"
                    name="Gastos"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Resumen del desglose mensual */}
      {monthlyBreakdown.summary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resumen Anual {monthlyBreakdown.year}</CardTitle>
            <CardDescription>Métricas clave del año</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg border bg-blue-50 border-blue-200 dark:bg-blue-900/40 dark:border-blue-700">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-200">Total Gastado en el Año</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-50">
                  {formatCurrency(monthlyBreakdown.summary.totalYearSpent ?? 0)}
                </p>
              </div>
              <div className="text-center p-4 rounded-lg border bg-green-50 border-green-200 dark:bg-green-900/40 dark:border-green-700">
                <p className="text-sm font-medium text-green-700 dark:text-green-200">Promedio Mensual</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-50">
                  {formatCurrency(monthlyBreakdown.summary.averageMonthlySpent ?? 0)}
                </p>
              </div>
              <div className="text-center p-4 rounded-lg border bg-orange-50 border-orange-200 dark:bg-orange-900/40 dark:border-orange-700">
                <p className="text-sm font-medium text-orange-700 dark:text-orange-200">Mes Pico</p>
                <p className="text-lg font-bold text-orange-900 dark:text-orange-50">
                  {monthlyBreakdown.summary.peakMonth?.month || "N/A"}
                </p>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  {formatCurrency(monthlyBreakdown.summary.peakMonth?.totalSpent ?? 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
