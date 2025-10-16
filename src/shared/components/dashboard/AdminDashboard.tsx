"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, BarChart3, Bell, FileText } from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  ProjectStatusEnum,
  ProjectTypeEnum,
} from "@/app/dashboard/admin/project-groups/[id]/projects/_types/project.enums";
import {
  projectStatusConfig,
  projectTypeConfig,
} from "@/app/dashboard/admin/project-groups/[id]/projects/_utils/projects.utils";
import { fetchProjectsDashboardSummary, fetchProjectsTypeDistribution } from "@/shared/lib/projects.service";
import { ServerDateRangeFacetedFilter } from "../filters/ServerDateRangeFacetedFilter";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import ClientsDashboard from "./_components/clients/ClientsDashboard";
import CostsDashboard from "./_components/costs/CostsDashboards";
import { ProjectsDashboard } from "./_components/projects";
import { StyledFacetedFilter } from "./_components/StyledFacetedFilter";

// Los datos de salud se derivan dinámicamente de clientes

// Paleta de colores para gráficos de proyectos
const COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

// Mapeo de colores usando las configuraciones de projects.utils.ts
const TYPE_COLOR_MAP: Record<string, string> = Object.fromEntries(
  Object.values(ProjectTypeEnum).map((type) => [
    projectTypeConfig[type].label,
    type === ProjectTypeEnum.DOCUMENTADO
      ? "#2563eb" // azul
      : type === ProjectTypeEnum.IMPLEMENTADO
        ? "#16a34a" // verde
        : type === ProjectTypeEnum.HIBRIDO
          ? "#8b5cf6" // violeta
          : "#6b7280", // gris por defecto
  ])
);

const milestoneData = [
  { name: "Hito 1", value: 186 },
  { name: "Hito 2", value: 305 },
  { name: "Hito 3", value: 237 },
];

const reminders = [
  {
    id: 1,
    title: "Recordatorio 1",
    description: "Actividad a vencer",
    priority: "Urgente",
    priorityColor: "destructive",
  },
  {
    id: 2,
    title: "Recordatorio 2",
    description: "Entregable próximo a vencer",
    priority: "Urgente",
    priorityColor: "destructive",
  },
  {
    id: 3,
    title: "Recordatorio 3",
    description: "Entregable vence esta semana",
    priority: "Pendiente",
    priorityColor: "secondary",
  },
];

// Realtime del dashboard de clientes se maneja en el propio módulo de Clientes

export default function Dashboard() {
  const [typeFilters, setTypeFilters] = useState<string[]>([]);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

  // Crear objeto de filtros para enviar a los endpoints
  const filterParams = {
    projectType: typeFilters.length === 1 ? typeFilters[0] : undefined,
    status: statusFilters.length === 1 ? statusFilters[0] : undefined,
    startDate: dateRange.from ? dateRange.from.toISOString().split("T")[0] : undefined,
    endDate: dateRange.to ? dateRange.to.toISOString().split("T")[0] : undefined,
  };

  // Datos de distribución de tipos de proyectos
  const { data: typeDist } = useQuery({
    queryKey: ["projects", "dashboard", "type", filterParams],
    queryFn: () => fetchProjectsTypeDistribution(filterParams),
    staleTime: 60_000,
  });

  // Datos del resumen de proyectos
  const { data: projectsSummary } = useQuery({
    queryKey: ["projects", "dashboard", "summary", filterParams],
    queryFn: () => fetchProjectsDashboardSummary(filterParams),
    staleTime: 60_000,
  });

  // Derivar métricas simples desde clientes (placeholder de negocio)
  const totalCostos = 45231.89; // TODO: reemplazar con endpoint real de costos

  // Procesar datos de tipos de proyectos usando los enums
  const DEFAULT_TYPES = Object.values(ProjectTypeEnum).map((type) => ({
    type,
    count: 0,
  }));

  // Opciones para los filtros usando las configuraciones de projects.utils.ts
  const TYPE_OPTIONS = Object.values(ProjectTypeEnum).map((type) => ({
    value: type,
    label: projectTypeConfig[type].label,
    icon: projectTypeConfig[type].icon,
    badgeVariant: projectTypeConfig[type].badge as "default" | "secondary" | "destructive" | "outline",
    className: projectTypeConfig[type].className,
    textClass: projectTypeConfig[type].textClass,
    borderColor: projectTypeConfig[type].borderColor,
    iconClass: projectTypeConfig[type].iconClass,
  }));

  const STATUS_OPTIONS = Object.values(ProjectStatusEnum).map((status) => ({
    value: status,
    label: projectStatusConfig[status].label,
    icon: projectStatusConfig[status].icon,
    badgeVariant: projectStatusConfig[status].badge as "default" | "secondary" | "destructive" | "outline",
    className: projectStatusConfig[status].className,
    textClass: projectStatusConfig[status].textClass,
    borderColor: projectStatusConfig[status].borderColor,
    iconClass: projectStatusConfig[status].iconClass,
  }));

  const typeData = projectsSummary?.summary?.projectsByType?.length
    ? projectsSummary.summary.projectsByType
    : DEFAULT_TYPES;
  const typeDistribution = typeDist?.distribution ?? [];

  // Mapeo de etiquetas usando las configuraciones de projects.utils.ts
  const TYPE_LABELS: Record<string, string> = Object.fromEntries(
    Object.values(ProjectTypeEnum).map((type) => [type, projectTypeConfig[type].label])
  );

  // Funciones de filtrado
  const applyFilters = (data: any[]) => {
    let filteredData = [...data];

    // Filtrar por tipo de proyecto
    if (typeFilters.length > 0) {
      filteredData = filteredData.filter((item) => typeFilters.includes(item.type || item.typeLabel));
    }

    // Filtrar por estado
    if (statusFilters.length > 0) {
      filteredData = filteredData.filter((item) => statusFilters.includes(item.status || item.statusLabel));
    }

    // Filtrar por rango de fechas (si el item tiene fecha)
    if (dateRange.from || dateRange.to) {
      filteredData = filteredData.filter((item) => {
        if (!item.createdAt && !item.updatedAt && !item.date) return true;

        const itemDate = new Date(item.createdAt || item.updatedAt || item.date);

        if (dateRange.from && itemDate < dateRange.from) return false;
        if (dateRange.to && itemDate > dateRange.to) return false;

        return true;
      });
    }

    return filteredData;
  };

  // Aplicar filtros a los datos de proyectos
  const filteredTypeData = applyFilters(typeData);
  const filteredTypeDistribution = applyFilters(typeDistribution);

  // Recalcular datos filtrados
  const filteredTypeDataLabeled = filteredTypeData.map((t: any) => ({
    ...t,
    typeLabel: TYPE_LABELS[t.type] ?? t.type,
  }));

  const filteredTypeDistributionLabeled = filteredTypeDistribution.map((t: any) => ({
    ...t,
    typeLabel: TYPE_LABELS[t.type] ?? t.type,
  }));

  // Datos filtrados para gráficos
  const filteredTypePercentageChartData = (
    filteredTypeDistributionLabeled.length
      ? filteredTypeDistributionLabeled
      : filteredTypeDataLabeled.map((t: any) => ({ typeLabel: t.typeLabel, percentage: 0 }))
  ).map((d: any) => ({ ...d, percentageLabel: `${d.percentage ?? 0}%` }));

  const filteredTypeAvgProgressChartData = (
    filteredTypeDistributionLabeled.length
      ? filteredTypeDistributionLabeled
      : filteredTypeDataLabeled.map((t: any) => ({ typeLabel: t.typeLabel, averageProgress: 0 }))
  ).map((d: any) => ({ ...d, averageProgressLabel: `${d.averageProgress ?? 0}%` }));

  // Versiones ordenadas filtradas
  const filteredTypeCountChartDataSorted = [...filteredTypeDataLabeled].sort((a, b) => (b.count ?? 0) - (a.count ?? 0));
  const filteredTypePercentageChartDataSorted = [...filteredTypePercentageChartData].sort(
    (a, b) => (b.percentage ?? 0) - (a.percentage ?? 0)
  );
  const filteredTypeAvgProgressChartDataSorted = [...filteredTypeAvgProgressChartData].sort(
    (a, b) => (b.averageProgress ?? 0) - (a.averageProgress ?? 0)
  );

  // Calcular métricas filtradas
  const filteredTotalActivos = filteredTypeData.reduce((sum, item) => sum + (item.count || 0), 0);
  const filteredTotalRetraso = Math.max(0, Math.floor(filteredTotalActivos * 0.2));

  const projectHealthData = [
    { name: "Saludables", value: Math.max(0, filteredTotalActivos - filteredTotalRetraso), color: "#22c55e" },
    { name: "En riesgo", value: Math.floor(filteredTotalRetraso * 0.6), color: "#eab308" },
    {
      name: "Críticos",
      value: Math.max(0, filteredTotalRetraso - Math.floor(filteredTotalRetraso * 0.6)),
      color: "#ef4444",
    },
  ];

  // Fase 2: se gestiona en <ClientsDashboard /> para aislar resuscripciones

  return (
    <div>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <div className="flex items-center gap-4">
            <StyledFacetedFilter
              title="Tipo de proyecto"
              options={TYPE_OPTIONS}
              selectedValues={typeFilters}
              onSelectedValuesChange={(vals) => setTypeFilters((vals as string[]) || [])}
            />
            <StyledFacetedFilter
              title="Estado"
              options={STATUS_OPTIONS}
              selectedValues={statusFilters}
              onSelectedValuesChange={(vals) => setStatusFilters((vals as string[]) || [])}
            />

            <ServerDateRangeFacetedFilter
              title="Rango de fechas"
              from={dateRange.from}
              to={dateRange.to}
              onChange={setDateRange}
            />
          </div>
        </div>

        {/* Indicador de filtros activos */}
        {(typeFilters.length > 0 || statusFilters.length > 0 || dateRange.from || dateRange.to) && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-sm font-medium text-blue-700 dark:text-blue-300">Filtros activos:</div>
            <div className="flex items-center gap-2 flex-wrap">
              {typeFilters.length > 0 && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  {typeFilters.length} tipo{typeFilters.length > 1 ? "s" : ""} seleccionado
                  {typeFilters.length > 1 ? "s" : ""}
                </Badge>
              )}
              {statusFilters.length > 0 && (
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                >
                  {statusFilters.length} estado{statusFilters.length > 1 ? "s" : ""} seleccionado
                  {statusFilters.length > 1 ? "s" : ""}
                </Badge>
              )}
              {(dateRange.from || dateRange.to) && (
                <Badge
                  variant="secondary"
                  className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                >
                  Rango de fechas
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setTypeFilters([]);
                  setStatusFilters([]);
                  setDateRange({});
                }}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
              >
                Limpiar todos
              </Button>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <Tabs defaultValue="general" className="w-full ">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="general">
              <span className="truncate text-ellipsis font-medium">General</span>
            </TabsTrigger>
            <TabsTrigger value="clientes">
              <span className="truncate text-ellipsis font-medium">Clientes</span>
            </TabsTrigger>
            <TabsTrigger value="proyectos">
              <span className="truncate text-ellipsis font-medium">Proyectos</span>
            </TabsTrigger>
            <TabsTrigger value="costos">
              <span className="truncate text-ellipsis font-medium">Costos</span>
            </TabsTrigger>
            <TabsTrigger value="analiticas">
              <span className="truncate text-ellipsis font-medium">Analíticas</span>
            </TabsTrigger>
            <TabsTrigger value="reportes">
              <span className="truncate text-ellipsis font-medium">Reportes</span>
            </TabsTrigger>
            <TabsTrigger value="notificaciones">
              <span className="truncate text-ellipsis font-medium">Notificaciones</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            {/* Metric Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Proyectos activos</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{filteredTotalActivos}</div>
                  <p className="text-xs text-muted-foreground">Número total de proyectos activos</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Proyectos con retraso</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{filteredTotalRetraso}</div>
                  <p className="text-xs text-muted-foreground">Total de proyectos con retraso</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de costos</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    S/ {totalCostos.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-muted-foreground">Suma de todos los costos de los proyectos</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts and Reminders */}
            <div className="grid gap-4 md:grid-cols-3">
              {/* Project Health Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Salud de los proyectos</CardTitle>
                  <CardDescription>Distribución de proyectos por estado</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={projectHealthData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {projectHealthData.map((entry) => (
                            <Cell key={`cell-${entry.name}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 space-y-2">
                    {projectHealthData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span>{item.name}</span>
                        </div>
                        <span className="font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Milestone Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Proyectos por hito</CardTitle>
                  <CardDescription>Rendimiento de proyectos por hito</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={milestoneData}
                        layout="horizontal"
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={60} />
                        <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 space-y-2">
                    {milestoneData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-sm">
                        <span>{item.name}</span>
                        <span className="font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Reminders */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recordatorios</CardTitle>
                  <CardDescription>Actividades a las que debes prestar atención</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {reminders.map((reminder) => (
                    <div key={reminder.id} className="flex items-start gap-3 p-3 rounded-lg border">
                      <Bell className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{reminder.title}</p>
                          <Badge variant={reminder.priorityColor as "destructive" | "secondary"} className="text-xs">
                            {reminder.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{reminder.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Gráficos de Proyectos */}
            <div className="grid gap-4 md:grid-cols-3">
              {/* Proyectos por Tipo - Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Proyectos por Tipo</CardTitle>
                  <CardDescription>Distribución de proyectos por tipo</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={filteredTypeCountChartDataSorted}
                          dataKey="count"
                          nameKey="typeLabel"
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={2}
                          label
                          isAnimationActive
                          animationDuration={700}
                          animationEasing="ease-out"
                        >
                          {filteredTypeCountChartDataSorted.map((entry, index) => (
                            <Cell key={index} fill={TYPE_COLOR_MAP[entry.typeLabel] ?? COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [value as any, "Cantidad"]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Distribución por Tipo (Porcentaje) */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Distribución por Tipo (%)</CardTitle>
                  <CardDescription>Proporción de proyectos por tipo</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={filteredTypePercentageChartDataSorted}>
                        <defs>
                          <linearGradient id="barViolet" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.9} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="typeLabel" />
                        <YAxis unit="%" domain={[0, 100]} />
                        <Tooltip formatter={(value, name) => [`${value}%`, name as string]} />
                        <Legend />
                        <Bar
                          dataKey="percentage"
                          name="Porcentaje"
                          fill="url(#barViolet)"
                          radius={[4, 4, 0, 0]}
                          isAnimationActive
                          animationDuration={700}
                          animationEasing="ease-out"
                        >
                          <LabelList dataKey="percentageLabel" position="top" />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Progreso Promedio por Tipo */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Progreso Promedio por Tipo</CardTitle>
                  <CardDescription>Promedio (%) de progreso por tipo</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={filteredTypeAvgProgressChartDataSorted}>
                        <defs>
                          <linearGradient id="barCyan" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#67e8f9" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.9} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="typeLabel" />
                        <YAxis unit="%" domain={[0, 100]} />
                        <Tooltip formatter={(value, name) => [`${value}%`, name as string]} />
                        <Legend />
                        <Bar
                          dataKey="averageProgress"
                          name="Promedio de progreso"
                          fill="url(#barCyan)"
                          radius={[4, 4, 0, 0]}
                          isAnimationActive
                          animationDuration={700}
                          animationEasing="ease-out"
                        >
                          <LabelList dataKey="averageProgressLabel" position="top" />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="clientes">
            <ClientsDashboard />
          </TabsContent>

          <TabsContent value="proyectos">
            <ProjectsDashboard filters={filterParams} />
          </TabsContent>

          <TabsContent value="costos">
            <CostsDashboard filters={filterParams} />
          </TabsContent>

          <TabsContent value="analiticas">
            <Card>
              <CardHeader>
                <CardTitle>Analíticas</CardTitle>
                <CardDescription>Análisis detallado de rendimiento y métricas</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Contenido de analíticas en desarrollo...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reportes">
            <Card>
              <CardHeader>
                <CardTitle>Reportes</CardTitle>
                <CardDescription>Generación y gestión de reportes</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Contenido de reportes en desarrollo...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notificaciones">
            <Card>
              <CardHeader>
                <CardTitle>Notificaciones</CardTitle>
                <CardDescription>Centro de notificaciones y alertas</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Contenido de notificaciones en desarrollo...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
