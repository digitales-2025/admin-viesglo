"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import {
  fetchProjectsDashboardSummary,
  fetchProjectsPerformance,
  fetchProjectsProgress,
  fetchProjectsStatusDistribution,
} from "@/shared/lib/projects.service";

/**
 * Componente KPI para mostrar métricas clave
 */
function Kpi({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}

/**
 * Dashboard de proyectos con métricas, gráficos y KPIs
 * Muestra resumen general, distribuciones, progreso y rendimiento
 */
export default function ProjectsDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["projects", "dashboard", "summary"],
    queryFn: fetchProjectsDashboardSummary,
    staleTime: 60_000,
  });
  const { data: statusDist } = useQuery({
    queryKey: ["projects", "dashboard", "status"],
    queryFn: fetchProjectsStatusDistribution,
    staleTime: 60_000,
  });
  const { data: progressData } = useQuery({
    queryKey: ["projects", "dashboard", "progress"],
    queryFn: fetchProjectsProgress,
    staleTime: 60_000,
  });
  const { data: performanceData } = useQuery({
    queryKey: ["projects", "dashboard", "performance"],
    queryFn: fetchProjectsPerformance,
    staleTime: 60_000,
  });

  const summary = data?.summary;

  // Datos por defecto cuando no hay información
  const DEFAULT_STATUS = [
    { status: "CREADO", count: 0 },
    { status: "EN_PROGRESO", count: 0 },
    { status: "COMPLETO_OFICIALMENTE", count: 0 },
  ];

  const statusData = summary?.projectsByStatus?.length ? summary.projectsByStatus : DEFAULT_STATUS;
  const totalProjects = summary?.totalProjects ?? 0;
  const avgProgress = summary?.averageProgress ?? 0;
  const overdue = summary?.overdueProjects ?? 0;
  const active = summary?.activeProjects ?? 0;
  const statusDistribution = statusDist?.distribution ?? [];
  const progressDistribution = progressData?.overallProgress?.progressDistribution ?? [];
  const weeklyProgress = progressData?.trends?.weeklyProgress ?? [];
  const monthlyProgress = progressData?.trends?.monthlyProgress ?? [];
  const performance = performanceData?.performance ?? {
    completionRate: 0,
    onTimeDelivery: 0,
    averageProjectDuration: 0,
    productivityIndex: 0,
  };
  const quality = performanceData?.quality ?? {
    projectsWithoutIssues: 0,
    projectsWithIssues: 0,
    issueResolutionRate: 0,
  };
  const resourceUtilization = performanceData?.resourceUtilization ?? {
    teamUtilization: 0,
    resourceEfficiency: 0,
  };

  // Mapeo de etiquetas a español para todos los gráficos
  const STATUS_LABELS: Record<string, string> = {
    CREATED: "Creado",
    IN_PROGRESS: "En progreso",
    OFFICIALLY_COMPLETED: "Completado",
    PAUSED: "Pausado",
    CANCELLED: "Cancelado",
  };

  const statusDataLabeled = statusData.map((s) => ({ ...s, statusLabel: STATUS_LABELS[s.status] ?? s.status }));
  const statusDistributionLabeled = statusDistribution.map((s) => ({
    ...s,
    statusLabel: STATUS_LABELS[s.status] ?? s.status,
  }));

  // Conjuntos derivados con labels para valores en barras
  const statusPercentageChartData = (
    statusDistributionLabeled.length
      ? statusDistributionLabeled
      : statusDataLabeled.map((s) => ({ statusLabel: s.statusLabel, percentage: 0 }))
  ).map((d) => ({ ...d, percentageLabel: `${d.percentage ?? 0}%` }));

  // Versiones ordenadas (desc) para facilitar lectura
  const statusCountChartDataSorted = [...statusDataLabeled].sort((a, b) => (b.count ?? 0) - (a.count ?? 0));
  const statusPercentageChartDataSorted = [...statusPercentageChartData].sort(
    (a, b) => (b.percentage ?? 0) - (a.percentage ?? 0)
  );

  // Progreso general - defaults y formatos
  const DEFAULT_PROGRESS_RANGE = [
    { range: "0-25%", percentage: 0 },
    { range: "26-50%", percentage: 0 },
    { range: "51-75%", percentage: 0 },
    { range: "76-100%", percentage: 0 },
  ];

  const progressRangeData = (progressDistribution.length ? progressDistribution : DEFAULT_PROGRESS_RANGE).map((r) => ({
    ...r,
    percentageLabel: `${r.percentage ?? 0}%`,
  }));

  const weeklyTrendData = (
    weeklyProgress.length
      ? weeklyProgress
      : [
          { week: "Semana 1", averageProgress: 0 },
          { week: "Semana 2", averageProgress: 0 },
          { week: "Semana 3", averageProgress: 0 },
          { week: "Semana 4", averageProgress: 0 },
        ]
  ).map((w) => ({ ...w, label: `${w.averageProgress}%` }));

  // Generar meses dinámicos (últimos 6 meses)
  const generateDynamicMonths = () => {
    const months = [];
    const currentDate = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthNames = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
      const monthName = monthNames[date.getMonth()];
      const year = date.getFullYear();
      months.push({ month: `${monthName} ${year}`, averageProgress: 0 });
    }

    return months;
  };

  const monthlyTrendData = (monthlyProgress.length ? monthlyProgress : generateDynamicMonths()).map((m) => ({
    ...m,
    label: `${m.averageProgress}%`,
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-1">
          <CardTitle>Proyectos</CardTitle>
          <CardDescription>Resumen general del estado de los proyectos</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Cargando resumen...</div>
        ) : (
          <div className="space-y-6">
            {/* Métricas clave */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Kpi label="Total Proyectos" value={totalProjects} />
              <Kpi label="Promedio de Progreso" value={`${avgProgress}%`} />
              <Kpi label="Atrasados" value={overdue} />
              <Kpi label="Activos" value={active} />
            </div>

            <Separator />

            {/* Distribuciones */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Proyectos por Estado</CardTitle>
                </CardHeader>
                <CardContent className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusCountChartDataSorted}>
                      <defs>
                        <linearGradient id="barBlue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#2563eb" stopOpacity={0.9} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="statusLabel" />
                      <YAxis allowDecimals={false} />
                      <Tooltip formatter={(value, name) => [value as any, name as string]} />
                      <Legend />
                      <Bar
                        dataKey="count"
                        name="Cantidad"
                        fill="url(#barBlue)"
                        radius={[4, 4, 0, 0]}
                        isAnimationActive
                        animationDuration={700}
                        animationEasing="ease-out"
                      >
                        <LabelList dataKey="count" position="top" className="fill-current" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Distribución por Estado (%)</CardTitle>
                  <CardDescription>Proporción de proyectos por estado</CardDescription>
                </CardHeader>
                <CardContent className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusPercentageChartDataSorted}>
                      <defs>
                        <linearGradient id="barGreen" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#22c55e" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#16a34a" stopOpacity={0.9} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="statusLabel" />
                      <YAxis unit="%" domain={[0, 100]} />
                      <Tooltip formatter={(value, name) => [`${value}%`, name as string]} />
                      <Legend />
                      <Bar
                        dataKey="percentage"
                        name="Porcentaje"
                        fill="url(#barGreen)"
                        radius={[4, 4, 0, 0]}
                        isAnimationActive
                        animationDuration={700}
                        animationEasing="ease-out"
                      >
                        <LabelList dataKey="percentageLabel" position="top" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Progreso general */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Distribución por Rango de Progreso</CardTitle>
                  <CardDescription>Porcentaje de proyectos por intervalo</CardDescription>
                </CardHeader>
                <CardContent className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={progressRangeData}>
                      <defs>
                        <linearGradient id="barAmber" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.9} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis unit="%" domain={[0, 100]} />
                      <Tooltip formatter={(value, name) => [`${value}%`, name as string]} />
                      <Legend />
                      <Bar
                        dataKey="percentage"
                        name="Porcentaje"
                        fill="url(#barAmber)"
                        radius={[4, 4, 0, 0]}
                        isAnimationActive
                        animationDuration={700}
                        animationEasing="ease-out"
                      >
                        <LabelList dataKey="percentageLabel" position="top" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tendencia Semanal de Progreso</CardTitle>
                  <CardDescription>Promedio (%) por semana</CardDescription>
                </CardHeader>
                <CardContent className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyTrendData}>
                      <defs>
                        <linearGradient id="areaWeekly" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis unit="%" domain={[0, 100]} />
                      <Tooltip formatter={(value, name) => [`${value}%`, name as string]} />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="averageProgress"
                        name="Promedio"
                        stroke="#14b8a6"
                        fill="url(#areaWeekly)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tendencia Mensual de Progreso</CardTitle>
                  <CardDescription>Promedio (%) por mes</CardDescription>
                </CardHeader>
                <CardContent className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyTrendData}>
                      <defs>
                        <linearGradient id="areaMonthly" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis unit="%" domain={[0, 100]} />
                      <Tooltip formatter={(value, name) => [`${value}%`, name as string]} />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="averageProgress"
                        name="Promedio"
                        stroke="#f43f5e"
                        fill="url(#areaMonthly)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Métricas de rendimiento */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Rendimiento</CardTitle>
                  <CardDescription>KPIs de finalización y productividad</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Kpi label="Tasa de finalización" value={`${performance.completionRate}%`} />
                    <Kpi label="Entrega a tiempo" value={`${performance.onTimeDelivery}%`} />
                    <Kpi label="Duración promedio (días)" value={performance.averageProjectDuration} />
                    <Kpi label="Índice de productividad" value={performance.productivityIndex} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Calidad</CardTitle>
                  <CardDescription>Incidencias y resolución</CardDescription>
                </CardHeader>
                <CardContent className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: "Sin incidencias", value: quality.projectsWithoutIssues },
                        { name: "Con incidencias", value: quality.projectsWithIssues },
                      ]}
                    >
                      <defs>
                        <linearGradient id="barQuality" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#34d399" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#10b981" stopOpacity={0.9} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="value"
                        name="Cantidad"
                        fill="url(#barQuality)"
                        radius={[4, 4, 0, 0]}
                        isAnimationActive
                        animationDuration={700}
                        animationEasing="ease-out"
                      >
                        <LabelList dataKey="value" position="top" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Uso de Recursos</CardTitle>
                  <CardDescription>Utilización y eficiencia (%)</CardDescription>
                </CardHeader>
                <CardContent className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: "Utilización del equipo", value: resourceUtilization.teamUtilization },
                        { name: "Eficiencia de recursos", value: resourceUtilization.resourceEfficiency },
                      ]}
                    >
                      <defs>
                        <linearGradient id="barResources" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.9} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis unit="%" domain={[0, 100]} />
                      <Tooltip formatter={(value) => [`${value}%`, "Porcentaje"]} />
                      <Legend />
                      <Bar
                        dataKey="value"
                        name="Porcentaje"
                        fill="url(#barResources)"
                        radius={[4, 4, 0, 0]}
                        isAnimationActive
                        animationDuration={700}
                        animationEasing="ease-out"
                      >
                        <LabelList dataKey="value" position="top" formatter={(v: any) => `${v}%`} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
