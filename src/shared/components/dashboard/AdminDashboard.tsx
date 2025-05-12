"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  ClipboardList,
  Clock,
  FileBarChart,
  FileText,
  LineChart,
  PieChart,
  Timer,
} from "lucide-react";

import { useCertificates } from "@/app/(admin)/certificates/_hooks/useCertificates";
import AdminDashboardLayout from "@/app/(admin)/layout";
import { usePaymentsForStats } from "@/app/(admin)/payment/_hooks/usePayments";
import { useQuotationsForStats } from "@/app/(admin)/quotation/_hooks/useQuotations";
import { useServices } from "@/app/(admin)/services/_hooks/useServices";
import { useProjects } from "@/app/(admin)/tracking/_hooks/useProject";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { Skeleton } from "../ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

function MetricCard({
  className,
  title,
  value,
  description,
  icon,
  isLoading,
}: {
  className?: string;
  title: string;
  value: string;
  description?: string;
  icon: React.ReactNode;
  isLoading?: boolean;
}) {
  return isLoading ? (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          <Skeleton className="w-24 h-4" />
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          <Skeleton className="w-24 h-4" />
        </div>
        <div className="text-xs text-muted-foreground">
          <Skeleton className="w-24 h-4" />
        </div>
      </CardContent>
    </Card>
  ) : (
    <Card className={cn("border-transparent", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="text-3xl font-bold">{value}</div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("general");

  const { data: projects, isLoading: isProjectsLoading } = useProjects();
  const { data: quotations, isLoading: isQuotationsLoading } = useQuotationsForStats();
  const { data: payments, isLoading: isPaymentsLoading } = usePaymentsForStats();
  const { data: certifications, isLoading: isCertificationsLoading } = useCertificates();

  // Obtener servicios para mostrar distribución por tipo
  const { data: services, isLoading: isServicesLoading } = useServices();
  console.log("🚀 ~ AdminDashboard ~ services:", services);

  // Agrupar proyectos por estado
  const projectsByStatus = useMemo(() => {
    if (!projects) return {};

    return projects.reduce(
      (acc, project) => {
        const status = project.status || "No definido";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
  }, [projects]);

  // Calcular ingresos totales y pendientes
  const financialStats = useMemo(() => {
    if (!payments) return { total: 0, pending: 0, paid: 0 };

    const total = payments.reduce((acc, payment) => acc + payment.amount, 0);
    const paid = payments.filter((p) => p.isPaid).reduce((acc, payment) => acc + payment.amount, 0);

    return {
      total,
      paid,
      pending: total - paid,
    };
  }, [payments]);

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Bienvenido al Sistema de Gestión de Ms&M Consulting</h2>
        </div>

        <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-end mb-6">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="proyectos">Proyectos</TabsTrigger>
              <TabsTrigger value="salud">Salud Ocupacional</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="general" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Proyectos Activos"
                value={projects?.filter((p) => p.status === "ACTIVE").length?.toString() || "0"}
                description={`${projects?.length} totales`}
                icon={<Briefcase className="size-8 shrink-0 text-sky-400 bg-sky-500/20 p-2 rounded-md" />}
                isLoading={isProjectsLoading}
                className="bg-sky-500/10 hover:border-sky-200 transition-colors duration-300"
              />
              <MetricCard
                title="Cotizaciones Pendientes"
                value={quotations?.filter((q) => q.isConcrete)?.length?.toString() || "0"}
                description={`${quotations?.length} totales`}
                icon={<ClipboardCheck className="size-8 shrink-0 text-emerald-400 bg-emerald-500/20 p-2 rounded-md" />}
                isLoading={isQuotationsLoading}
                className="bg-emerald-500/10 hover:border-emerald-200 transition-colors duration-300"
              />
              <MetricCard
                title="Ingresos Totales"
                value={`S/. ${financialStats.total.toLocaleString("es-PE")}`}
                description={`S/. ${financialStats.pending.toLocaleString("es-PE")} pendientes`}
                icon={<CircleDollarSign className="size-8 shrink-0 text-orange-400 bg-orange-500/20 p-2 rounded-md" />}
                isLoading={isPaymentsLoading}
                className="bg-orange-500/10 hover:border-orange-200 transition-colors duration-300"
              />
              <MetricCard
                title="Certificados Emitidos"
                value={certifications?.length?.toString() || "0"}
                description={`Último certificado emitido: ${certifications?.length ? new Date(certifications[0].dateEmision || "").toLocaleDateString("es-PE") : "N/A"}`}
                icon={<FileText className="size-8 shrink-0 text-purple-400 bg-purple-500/20 p-2 rounded-md" />}
                isLoading={isCertificationsLoading}
                className="bg-purple-500/10 hover:border-purple-200 transition-colors duration-300"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="lg:col-span-4">
                <CardHeader className="flex flex-row items-center">
                  <div className="grid gap-1">
                    <CardTitle>Distribución de Proyectos por Estado</CardTitle>
                    <CardDescription>Estado actual de los proyectos</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  {isProjectsLoading ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <Skeleton className="h-[250px] w-full" />
                    </div>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      {projects?.length ? (
                        <div className="w-full h-full">
                          {/* Aquí se añadiría un componente de gráfico real */}
                          <div className="grid grid-cols-2 gap-4">
                            {Object.entries(projectsByStatus).map(([status, count]) => (
                              <div key={status} className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span>{status}</span>
                                  <span className="font-medium">{count}</span>
                                </div>
                                <Progress value={(count / projects.length) * 100} />
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <BarChart3 className="h-16 w-16 opacity-50" />
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Distribución de Ingresos</CardTitle>
                  <CardDescription>Por tipo de servicio</CardDescription>
                </CardHeader>
                <CardContent>
                  {isQuotationsLoading || isServicesLoading ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <Skeleton className="h-[250px] w-full" />
                    </div>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground"></div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Tendencia de Ingresos</CardTitle>
                  <CardDescription>Ingresos mensuales</CardDescription>
                </CardHeader>
                <CardContent>
                  {isPaymentsLoading ? (
                    <div className="h-[250px] flex items-center justify-center">
                      <Skeleton className="h-[200px] w-full" />
                    </div>
                  ) : (
                    <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                      {payments?.length ? (
                        <div className="w-full h-full">
                          {/* Aquí se añadiría un componente de gráfico de línea temporal */}
                          <LineChart className="h-full w-full opacity-50" />
                        </div>
                      ) : (
                        <LineChart className="h-16 w-16 opacity-50" />
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Próximas Actividades</CardTitle>
                  <CardDescription>Programadas para hoy</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isProjectsLoading
                      ? Array(3)
                          .fill(0)
                          .map((_, i) => (
                            <div key={i} className="flex items-center gap-4">
                              <Skeleton className="h-10 w-10 rounded-full" />
                              <div className="flex-1 space-y-1">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-3 w-24" />
                              </div>
                            </div>
                          ))
                      : projects?.slice(0, 3).map((project, i) => (
                          <div key={i} className="flex items-center gap-4">
                            <Avatar>
                              <AvatarFallback>{project.typeContract?.[0] || "P"}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                              <p className="text-sm font-medium">{project.typeContract || "Proyecto sin nombre"}</p>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Clock className="mr-1 h-3 w-3" />
                                {new Date(project.startDate || "").toLocaleDateString("es-PE")}
                              </div>
                            </div>
                            <Badge variant={i === 0 ? "default" : "outline"}>{project.status || "Pendiente"}</Badge>
                          </div>
                        ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Estado de Proyectos</CardTitle>
                  <CardDescription>Resumen general</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "En Progreso", count: 12, percent: 50 },
                      { name: "Completados", count: 8, percent: 33 },
                      { name: "Retrasados", count: 3, percent: 12 },
                      { name: "No Iniciados", count: 1, percent: 5 },
                    ].map((item, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>{item.name}</span>
                          <span className="font-medium">{item.count}</span>
                        </div>
                        <Progress value={item.percent} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Actividad Reciente</CardTitle>
                  <CardDescription>Últimas acciones en el sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { action: "Proyecto actualizado", module: "Proyectos", time: "Hace 10 min" },
                      { action: "Certificado emitido", module: "Salud", time: "Hace 25 min" },
                      { action: "Pago procesado", module: "Finanzas", time: "Hace 45 min" },
                      { action: "Evaluación completada", module: "Salud", time: "Hace 1 hora" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-4 text-sm">
                        <Activity className="mt-0.5 h-4 w-4 text-muted-foreground" />
                        <div className="flex-1 space-y-1">
                          <p className="font-medium">{item.action}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{item.module}</span>
                            <span>{item.time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="proyectos" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Proyectos Activos"
                value="24"
                description="8 requieren atención"
                icon={<Briefcase className="h-4 w-4 text-blue-500" />}
              />
              <MetricCard
                title="Tareas Pendientes"
                value="86"
                description="12 de alta prioridad"
                icon={<ClipboardList className="h-4 w-4 text-red-500" />}
              />
              <MetricCard
                title="Hitos Completados"
                value="18"
                description="3 esta semana"
                icon={<CheckCircle2 className="h-4 w-4 text-green-500" />}
              />
              <MetricCard
                title="Tiempo Promedio"
                value="42 días"
                description="Por proyecto"
                icon={<Timer className="h-4 w-4 text-orange-500" />}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Seguimiento de Proyectos</CardTitle>
                <CardDescription>Estado de los proyectos activos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="h-12 px-4 text-left font-medium">Proyecto</th>
                        <th className="h-12 px-4 text-left font-medium">Cliente</th>
                        <th className="h-12 px-4 text-left font-medium">Estado</th>
                        <th className="h-12 px-4 text-left font-medium">Progreso</th>
                        <th className="h-12 px-4 text-left font-medium">Fecha Límite</th>
                        <th className="h-12 px-4 text-left font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          name: "Implementación ERP",
                          client: "Empresa ABC",
                          status: "En progreso",
                          progress: 65,
                          deadline: "15/06/2025",
                        },
                        {
                          name: "Migración de Datos",
                          client: "Corporación XYZ",
                          status: "Retrasado",
                          progress: 40,
                          deadline: "30/05/2025",
                        },
                        {
                          name: "Desarrollo Web",
                          client: "Industrias 123",
                          status: "En progreso",
                          progress: 80,
                          deadline: "22/06/2025",
                        },
                        {
                          name: "Consultoría IT",
                          client: "Global Services",
                          status: "No iniciado",
                          progress: 0,
                          deadline: "01/07/2025",
                        },
                      ].map((project, i) => (
                        <tr key={i} className="border-b">
                          <td className="p-4 align-middle font-medium">{project.name}</td>
                          <td className="p-4 align-middle">{project.client}</td>
                          <td className="p-4 align-middle">
                            <Badge
                              variant={
                                project.status === "En progreso"
                                  ? "default"
                                  : project.status === "Completado"
                                    ? "secondary"
                                    : project.status === "Retrasado"
                                      ? "destructive"
                                      : "outline"
                              }
                            >
                              {project.status}
                            </Badge>
                          </td>
                          <td className="p-4 align-middle">
                            <div className="flex items-center gap-2">
                              <Progress value={project.progress} className="w-full" />
                              <span className="text-xs">{project.progress}%</span>
                            </div>
                          </td>
                          <td className="p-4 align-middle">{project.deadline}</td>
                          <td className="p-4 align-middle">
                            <Button variant="ghost" size="icon">
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Próximos Hitos</CardTitle>
                  <CardDescription>Hitos programados para los próximos 30 días</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        milestone: "Entrega de Prototipo",
                        project: "Desarrollo Web",
                        date: "18/05/2025",
                        status: "En progreso",
                      },
                      {
                        milestone: "Migración Fase 1",
                        project: "Migración de Datos",
                        date: "22/05/2025",
                        status: "En riesgo",
                      },
                      {
                        milestone: "Capacitación Usuarios",
                        project: "Implementación ERP",
                        date: "28/05/2025",
                        status: "Programado",
                      },
                    ].map((milestone, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="font-medium">{milestone.milestone}</p>
                          <p className="text-sm text-muted-foreground">{milestone.project}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{milestone.date}</p>
                          <Badge
                            variant={
                              milestone.status === "En progreso"
                                ? "default"
                                : milestone.status === "En riesgo"
                                  ? "destructive"
                                  : "outline"
                            }
                            className="mt-1"
                          >
                            {milestone.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Distribución de Recursos</CardTitle>
                  <CardDescription>Asignación actual por proyecto</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                    <PieChart className="h-16 w-16 opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="salud" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Certificados Emitidos"
                value={certifications?.length?.toString() || "0"}
                description={`Este mes: ${
                  certifications?.filter((c) => {
                    const date = new Date(c.dateEmision || "");
                    const now = new Date();
                    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                  }).length
                }`}
                icon={<FileText className="h-4 w-4 text-green-500" />}
                isLoading={isCertificationsLoading}
              />
              <MetricCard
                title="Certificados por Tipo"
                value={certifications?.filter((c) => c.type === "PRE_OCUPACIONAL").length?.toString() || "0"}
                description="Pre-ocupacionales"
                icon={<ClipboardCheck className="h-4 w-4 text-blue-500" />}
                isLoading={isCertificationsLoading}
              />
              <MetricCard
                title="Certificados Periódicos"
                value={certifications?.filter((c) => c.type === "PERIODICO").length?.toString() || "0"}
                description="Evaluaciones periódicas"
                icon={<Activity className="h-4 w-4 text-purple-500" />}
                isLoading={isCertificationsLoading}
              />
              <MetricCard
                title="Certificados Retiro"
                value={certifications?.filter((c) => c.type === "RETIRO").length?.toString() || "0"}
                description="Evaluaciones de retiro"
                icon={<FileBarChart className="h-4 w-4 text-orange-500" />}
                isLoading={isCertificationsLoading}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Distribución por Tipo de Certificado</CardTitle>
                  <CardDescription>Porcentaje según tipo</CardDescription>
                </CardHeader>
                <CardContent>
                  {isCertificationsLoading ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <Skeleton className="h-[250px] w-full" />
                    </div>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      {certifications?.length ? (
                        <div className="space-y-4 w-full"></div>
                      ) : (
                        <PieChart className="h-16 w-16 opacity-50" />
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Certificados por Mes</CardTitle>
                  <CardDescription>Tendencia de los últimos 6 meses</CardDescription>
                </CardHeader>
                <CardContent>
                  {isCertificationsLoading ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <Skeleton className="h-[250px] w-full" />
                    </div>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      {certifications?.length ? (
                        <div className="w-full h-full">
                          {/* Aquí iría un gráfico de línea mostrando la tendencia */}
                          <LineChart className="h-full w-full opacity-50" />
                        </div>
                      ) : (
                        <BarChart3 className="h-16 w-16 opacity-50" />
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Últimos Certificados Emitidos</CardTitle>
                <CardDescription>Certificados médicos más recientes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="h-10 px-4 text-left font-medium">Código</th>
                        <th className="h-10 px-4 text-left font-medium">Paciente</th>
                        <th className="h-10 px-4 text-left font-medium">Tipo</th>
                        <th className="h-10 px-4 text-left font-medium">Empresa</th>
                        <th className="h-10 px-4 text-left font-medium">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isCertificationsLoading
                        ? Array(4)
                            .fill(0)
                            .map((_, i) => (
                              <tr key={i} className="border-b">
                                <td className="p-2 align-middle">
                                  <Skeleton className="h-4 w-20" />
                                </td>
                                <td className="p-2 align-middle">
                                  <Skeleton className="h-4 w-32" />
                                </td>
                                <td className="p-2 align-middle">
                                  <Skeleton className="h-4 w-24" />
                                </td>
                                <td className="p-2 align-middle">
                                  <Skeleton className="h-4 w-28" />
                                </td>
                                <td className="p-2 align-middle">
                                  <Skeleton className="h-4 w-24" />
                                </td>
                              </tr>
                            ))
                        : certifications?.slice(0, 5).map((cert, i) => {
                            return (
                              <tr key={i} className="border-b">
                                <td className="p-2 align-middle font-medium">{cert.code}</td>
                                <td className="p-2 align-middle">{cert.nameUser || "N/A"}</td>
                                <td className="p-2 align-middle">
                                  <Badge
                                    variant={
                                      cert.type === "PRE_OCUPACIONAL"
                                        ? "default"
                                        : cert.type === "PERIODICO"
                                          ? "secondary"
                                          : cert.type === "RETIRO"
                                            ? "destructive"
                                            : "outline"
                                    }
                                  ></Badge>
                                </td>
                                <td className="p-2 align-middle">{cert.businessName || "N/A"}</td>
                                <td className="p-2 align-middle">
                                  {new Date(cert.dateEmision || "").toLocaleDateString("es-PE")}
                                </td>
                              </tr>
                            );
                          })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminDashboardLayout>
  );
}
