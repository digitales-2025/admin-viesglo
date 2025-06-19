"use client";

import { useState } from "react";
import { AlertTriangle, BarChart3, Bell, Calendar, FileText } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

// Datos de ejemplo basados en la imagen
const projectHealthData = [
  { name: "Saludables", value: 45, color: "#22c55e" },
  { name: "En riesgo", value: 20, color: "#eab308" },
  { name: "Críticos", value: 11, color: "#ef4444" },
];

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

export default function Dashboard() {
  const [selectedArea, setSelectedArea] = useState("Área");
  const [selectedProjectType, setSelectedProjectType] = useState("Tipo de proyecto");
  const [selectedStatus, setSelectedStatus] = useState("Estado");

  return (
    <div className=" bg-gray-50">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
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
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-96">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="analiticas">Analíticas</TabsTrigger>
            <TabsTrigger value="reportes">Reportes</TabsTrigger>
            <TabsTrigger value="notificaciones">Notificaciones</TabsTrigger>
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
                  <div className="text-2xl font-bold">76</div>
                  <p className="text-xs text-muted-foreground">Número total de proyectos activos</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Proyectos con retraso</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">26</div>
                  <p className="text-xs text-muted-foreground">Total de proyectos con retraso</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de costos</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">S/ 45,231.89</div>
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
                          {projectHealthData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 space-y-2">
                    {projectHealthData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
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
                    {milestoneData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
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
