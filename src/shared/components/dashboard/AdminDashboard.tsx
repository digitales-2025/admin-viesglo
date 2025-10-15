"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, BarChart3, Bell, Calendar, FileText } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
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

import { fetchClientsDashboardSummary } from "@/shared/lib/clients.service";
import { fetchProjectsDashboardSummary, fetchProjectsTypeDistribution } from "@/shared/lib/projects.service";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import ClientsDashboard from "./_components/clients/ClientsDashboard";
import { ProjectsDashboard } from "./_components/projects";

// Los datos de salud se derivan dinámicamente de clientes

// Paleta de colores para gráficos de proyectos
const COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];
const TYPE_COLOR_MAP: Record<string, string> = {
  Documentado: "#2563eb", // azul
  Implementado: "#16a34a", // verde
  Híbrido: "#8b5cf6", // violeta
};

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
  const [selectedArea, setSelectedArea] = useState("Área");
  const [selectedProjectType, setSelectedProjectType] = useState("Tipo de proyecto");
  const [selectedStatus, setSelectedStatus] = useState("Estado");

  // Fase 1: carga inicial HTTP
  const { data: dashboardSummary } = useQuery({
    queryKey: ["clients", "dashboard", "summary"],
    queryFn: fetchClientsDashboardSummary,
    staleTime: 60_000,
  });

  // Datos de distribución de tipos de proyectos
  const { data: typeDist } = useQuery({
    queryKey: ["projects", "dashboard", "type"],
    queryFn: fetchProjectsTypeDistribution,
    staleTime: 60_000,
  });

  // Datos del resumen de proyectos
  const { data: projectsSummary } = useQuery({
    queryKey: ["projects", "dashboard", "summary"],
    queryFn: fetchProjectsDashboardSummary,
    staleTime: 60_000,
  });

  // Derivar métricas simples desde clientes (placeholder de negocio)
  const totalActivos = dashboardSummary?.summary?.totalClients ?? 0;
  const totalRetraso = Math.max(0, Math.floor(totalActivos * 0.2));
  const totalCostos = 45231.89; // TODO: reemplazar con endpoint real de costos

  // Procesar datos de tipos de proyectos
  const DEFAULT_TYPES = [
    { type: "DOCUMENTADO", count: 0 },
    { type: "IMPLEMENTADO", count: 0 },
    { type: "HIBRIDO", count: 0 },
  ];

  const typeData = projectsSummary?.summary?.projectsByType?.length
    ? projectsSummary.summary.projectsByType
    : DEFAULT_TYPES;
  const typeDistribution = typeDist?.distribution ?? [];

  // Mapeo de etiquetas a español
  const TYPE_LABELS: Record<string, string> = {
    DOCUMENTADO: "Documentado",
    IMPLEMENTADO: "Implementado",
    HIBRIDO: "Híbrido",
  };

  const typeDataLabeled = typeData.map((t: any) => ({ ...t, typeLabel: TYPE_LABELS[t.type] ?? t.type }));
  const typeDistributionLabeled = typeDistribution.map((t: any) => ({
    ...t,
    typeLabel: TYPE_LABELS[t.type] ?? t.type,
  }));

  // Datos para gráficos
  const typePercentageChartData = (
    typeDistributionLabeled.length
      ? typeDistributionLabeled
      : typeDataLabeled.map((t: any) => ({ typeLabel: t.typeLabel, percentage: 0 }))
  ).map((d: any) => ({ ...d, percentageLabel: `${d.percentage ?? 0}%` }));

  const typeAvgProgressChartData = (
    typeDistributionLabeled.length
      ? typeDistributionLabeled
      : typeDataLabeled.map((t: any) => ({ typeLabel: t.typeLabel, averageProgress: 0 }))
  ).map((d: any) => ({ ...d, averageProgressLabel: `${d.averageProgress ?? 0}%` }));

  // Versiones ordenadas (desc) para facilitar lectura
  const typeCountChartDataSorted = [...typeDataLabeled].sort((a, b) => (b.count ?? 0) - (a.count ?? 0));
  const typePercentageChartDataSorted = [...typePercentageChartData].sort(
    (a, b) => (b.percentage ?? 0) - (a.percentage ?? 0)
  );
  const typeAvgProgressChartDataSorted = [...typeAvgProgressChartData].sort(
    (a, b) => (b.averageProgress ?? 0) - (a.averageProgress ?? 0)
  );

  const projectHealthData = [
    { name: "Saludables", value: Math.max(0, totalActivos - totalRetraso), color: "#22c55e" },
    { name: "En riesgo", value: Math.floor(totalRetraso * 0.6), color: "#eab308" },
    { name: "Críticos", value: Math.max(0, totalRetraso - Math.floor(totalRetraso * 0.6)), color: "#ef4444" },
  ];

  // Fase 2: se gestiona en <ClientsDashboard /> para aislar resuscripciones

  return (
    <div>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <div className="flex items-center gap-4">
            <Select value={selectedArea} onValueChange={setSelectedArea}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Área">Calidad</SelectItem>
                <SelectItem value="Norte">Digitales</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedProjectType} onValueChange={setSelectedProjectType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tipo de proyecto">Documentado</SelectItem>
                <SelectItem value="Construcción">Híbrido</SelectItem>
                <SelectItem value="Consultoría">Implementado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Estado">Estado</SelectItem>
                <SelectItem value="Activo">Activo</SelectItem>
                <SelectItem value="Pausado">Pausado</SelectItem>
                <SelectItem value="Completado">Completado</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="gap-2">
              <Calendar className="h-4 w-4" />
              20 Ene, 2023 - 09 Feb, 2023
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs defaultValue="general" className="w-full ">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="general">
              <span className="truncate text-ellipsis font-medium">General</span>
            </TabsTrigger>
            <TabsTrigger value="clientes">
              <span className="truncate text-ellipsis font-medium">Clientes</span>
            </TabsTrigger>
            <TabsTrigger value="proyectos">
              <span className="truncate text-ellipsis font-medium">Proyectos</span>
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
                  <div className="text-2xl font-bold">{totalActivos}</div>
                  <p className="text-xs text-muted-foreground">Número total de proyectos activos</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Proyectos con retraso</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalRetraso}</div>
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
                        <CartesianGrid strokeDasharray="3 3" />
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
                          data={typeCountChartDataSorted}
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
                          {typeCountChartDataSorted.map((entry, index) => (
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
                      <BarChart data={typePercentageChartDataSorted}>
                        <defs>
                          <linearGradient id="barViolet" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.9} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
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
                      <BarChart data={typeAvgProgressChartDataSorted}>
                        <defs>
                          <linearGradient id="barCyan" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#67e8f9" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.9} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
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
            <ProjectsDashboard />
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
