"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Calendar,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  FileText,
  LineChart as LineChartIcon,
  PieChart,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Line,
  LineChart,
  Pie,
  PieChart as ReChartPie,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useCertificates } from "@/app/(admin)/certificates/_hooks/useCertificates";
import AdminDashboardLayout from "@/app/(admin)/layout";
import { usePaymentsForStats } from "@/app/(admin)/payment/_hooks/usePayments";
import { useQuotationsForStats } from "@/app/(admin)/quotation/_hooks/useQuotations";
import { LabelPaymentPlan, PaymentPlan } from "@/app/(admin)/quotation/_types/quotation.types";
import { useProjects } from "@/app/(admin)/tracking/_hooks/useProject";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "../ui/chart";
import MetricCard from "./MetricCard";

const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

export default function AdminDashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { data: projects, isLoading: isProjectsLoading } = useProjects();
  const { data: quotations, isLoading: isQuotationsLoading } = useQuotationsForStats();
  const { data: payments, isLoading: isPaymentsLoading } = usePaymentsForStats();
  const { data: certifications, isLoading: isCertificationsLoading } = useCertificates();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Configuración de temas para gráficos
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
    proyeccion: {
      theme: {
        light: "var(--chart-5)",
        dark: "var(--chart-5)",
      },
      label: "Proyección",
    },
  };

  // Estadísticas de proyectos
  const projectStats = useMemo(() => {
    if (!projects) return { active: 0, completed: 0, delayed: 0, total: 0, byStatus: [] };

    const active = projects.filter((p) => p.status === "ACTIVE").length;
    const completed = projects.filter((p) => p.status === "COMPLETED").length;
    const delayed = projects.filter((p) => {
      // Consideramos retrasados aquellos con fecha límite pasada y status != COMPLETED
      const deadline = p.endDate ? new Date(p.endDate) : null;
      return deadline && deadline < new Date() && p.status !== "COMPLETED";
    }).length;

    // Agrupar por estado para gráfico
    const statusCounts = projects.reduce(
      (acc, project) => {
        const status = project.status || "SIN_ESTADO";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const byStatus = Object.entries(statusCounts).map(([name, value]) => {
      let label = name;
      switch (name) {
        case "ACTIVE":
          label = "Activos";
          break;
        case "COMPLETED":
          label = "Completados";
          break;
        case "PENDING":
          label = "Pendientes";
          break;
        default:
          label = name;
      }
      return { name: label, value };
    });

    return {
      active,
      completed,
      delayed,
      total: projects.length,
      byStatus,
    };
  }, [projects]);

  // Agrupar proyectos por progreso con {tipoContrato: "nombre", progress: 0}
  const getProjectsByProgress = useMemo(() => {
    if (!projects) return [];

    // Agrupar por tipo de contrato y calcular progreso promedio
    const contractTypes = projects.reduce(
      (acc, project) => {
        const typeContract = project.typeContract || "No especificado";

        if (!acc[typeContract]) {
          acc[typeContract] = { count: 0, totalProgress: 0 };
        }

        const progress = project.services.length
          ? project.services.reduce((sum, service) => sum + (service?.progress || 0), 0) / project.services.length
          : 0;

        acc[typeContract].count += 1;
        acc[typeContract].totalProgress += progress;

        return acc;
      },
      {} as Record<string, { count: number; totalProgress: number }>
    );

    return Object.entries(contractTypes)
      .map(([tipoContrato, data]) => ({
        tipoContrato,
        progress: (data.totalProgress / data.count).toFixed(2),
        count: data.count,
      }))
      .sort((a, b) => parseInt(b.progress) - parseInt(a.progress));
  }, [projects]);

  // Calcular ingresos totales, pendientes y cobrados
  const financialStats = useMemo(() => {
    if (!payments) return { total: 0, pending: 0, paid: 0, monthlyData: [] };

    const total = payments.reduce((acc, payment) => acc + payment.amount, 0);
    const paid = payments.filter((p) => p.isPaid).reduce((acc, payment) => acc + payment.amount, 0);

    // Agrupar pagos por mes para tendencia
    const monthlyPayments = payments.reduce(
      (acc, payment) => {
        const date = new Date(payment.billingDate || payment.paymentDate || new Date());
        const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;

        if (!acc[monthYear]) {
          acc[monthYear] = {
            month: date.toLocaleString("es-ES", { month: "short" }),
            year: date.getFullYear(),
            total: 0,
            paid: 0,
            pending: 0,
            count: 0,
          };
        }

        acc[monthYear].total += payment.amount;
        acc[monthYear].count += 1;

        if (payment.isPaid) {
          acc[monthYear].paid += payment.amount;
        } else {
          acc[monthYear].pending += payment.amount;
        }

        return acc;
      },
      {} as Record<string, { month: string; year: number; total: number; paid: number; pending: number; count: number }>
    );

    // Convertir a array y ordenar por fecha
    const monthlyData = Object.values(monthlyPayments)
      .sort((a, b) => (a.year === b.year ? 0 : a.year < b.year ? -1 : 1))
      .slice(-6); // Últimos 6 meses

    return {
      total,
      paid,
      pending: total - paid,
      monthlyData,
    };
  }, [payments]);

  // Procesar datos para gráfico de tipos de pago en cotizaciones
  const getPaymentPlanData = useMemo(() => {
    if (!quotations) return [];

    const paymentPlanCount: { [key: string]: number } = {
      [PaymentPlan.INSTALLMENTS]: 0,
      [PaymentPlan.SINGLE]: 0,
    };

    quotations.forEach((quotation: any) => {
      const paymentPlan = quotation.paymentPlan || PaymentPlan.SINGLE;
      paymentPlanCount[paymentPlan] += 1;
    });

    return Object.entries(paymentPlanCount).map(([name, value]) => ({
      name: LabelPaymentPlan[name as PaymentPlan],
      value,
    }));
  }, [quotations]);

  // Calcular tasa de conversión de cotizaciones
  const quotationConversionRate = useMemo(() => {
    if (!quotations) return { rate: 0, concrete: 0, total: 0 };

    const concrete = quotations.filter((q) => q.isConcrete).length;

    return {
      rate: quotations.length ? (concrete / quotations.length) * 100 : 0,
      concrete,
      total: quotations.length,
    };
  }, [quotations]);

  // Procesar certificados por mes para mostrar tendencia
  const certificatesTrend = useMemo(() => {
    if (!certifications) return [];

    const certByMonth = certifications.reduce(
      (acc, cert) => {
        const date = new Date(cert.dateEmision || new Date());
        const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;

        if (!acc[monthYear]) {
          acc[monthYear] = {
            month: date.toLocaleString("es-ES", { month: "short" }),
            year: date.getFullYear(),
            count: 0,
          };
        }

        acc[monthYear].count += 1;
        return acc;
      },
      {} as Record<string, { month: string; year: number; count: number }>
    );

    return Object.values(certByMonth)
      .sort((a, b) => (a.year === b.year ? 0 : a.year < b.year ? -1 : 1))
      .slice(-6); // Últimos 6 meses
  }, [certifications]);

  return (
    <AdminDashboardLayout>
      {mounted ? (
        <div className="space-y-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Panel Ejecutivo - MS&M Consulting</h2>
            <p className="text-muted-foreground mt-1">Vista general del rendimiento empresarial en tiempo real</p>
          </div>

          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Proyectos Activos"
                value={projectStats.active.toString()}
                description={`${projectStats.total} totales, ${projectStats.completed} completados`}
                icon={<Briefcase className="size-8 shrink-0 text-sky-400 bg-sky-500/20 p-2 rounded-md" />}
                isLoading={isProjectsLoading}
              />
              <MetricCard
                title="Tasa de Conversión"
                value={`${quotationConversionRate.rate.toFixed(1)}%`}
                description={`${quotationConversionRate.concrete} de ${quotationConversionRate.total} cotizaciones`}
                icon={<ClipboardCheck className="size-8 shrink-0 text-emerald-400 bg-emerald-500/20 p-2 rounded-md" />}
                isLoading={isQuotationsLoading}
              />
              <MetricCard
                title="Ingresos Totales"
                value={`S/. ${financialStats.total.toLocaleString("es-PE")}`}
                description={`S/. ${financialStats.pending.toLocaleString("es-PE")} pendientes de cobro`}
                icon={<CircleDollarSign className="size-8 shrink-0 text-orange-400 bg-orange-500/20 p-2 rounded-md" />}
                isLoading={isPaymentsLoading}
              />
              <MetricCard
                title="Certificados Emitidos"
                value={certifications?.length?.toString() || "0"}
                description={
                  certifications?.length
                    ? `Último: ${new Date(certifications[0].dateEmision || "").toLocaleDateString("es-PE")}`
                    : "Sin certificados"
                }
                icon={<FileText className="size-8 shrink-0 text-purple-400 bg-purple-500/20 p-2 rounded-md" />}
                isLoading={isCertificationsLoading}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              {/* Progreso de proyectos por tipo de contrato */}
              <Card className="lg:col-span-4">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="grid gap-1">
                    <CardTitle>Avance Promedio por Tipo de Contrato</CardTitle>
                    <CardDescription>Eficiencia operativa por línea de servicio</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig}>
                    <BarChart
                      accessibilityLayer
                      data={getProjectsByProgress}
                      layout="vertical"
                      margin={{
                        right: 16,
                        left: 16,
                        bottom: 20,
                      }}
                      barSize={30}
                    >
                      <CartesianGrid horizontal strokeDasharray="3 3" />
                      <YAxis dataKey="tipoContrato" type="category" tickLine={false} tickMargin={10} axisLine={false} />
                      <XAxis
                        dataKey="progress"
                        type="number"
                        domain={[0, 100]}
                        tickFormatter={(value: string | number) => `${value}%`}
                      />
                      <ChartTooltip
                        cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-md">
                                <div className="grid gap-1">
                                  <div className="font-medium">{data.tipoContrato}</div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col">
                                      <span className="text-muted-foreground text-xs">Avance</span>
                                      <span>{data.progress}%</span>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-muted-foreground text-xs">Cantidad</span>
                                      <span>{data.count} proyectos</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="progress" fill="var(--chart-1)" radius={4} animationDuration={1500}>
                        <LabelList
                          dataKey="progress"
                          position="right"
                          formatter={(value: string | number) => `${value}%`}
                          className="fill-foreground text-xs font-medium"
                        />
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button variant="link" className="gap-1 text-sm" onClick={() => router.push("/tracking")}>
                    Ver todos los proyectos
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>

              {/* Distribución de proyectos por estado */}
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-primary" />
                    Estado Global de Proyectos
                  </CardTitle>
                  <CardDescription>Distribución actual por estado</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4">
                  <div className="flex flex-col">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-2xl font-bold">{projectStats.total}</div>
                        <div className="text-sm text-muted-foreground">Proyectos totales</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-yellow-500">{projectStats.delayed}</div>
                        <div className="text-xs text-muted-foreground">Retrasados</div>
                      </div>
                    </div>

                    <div className="mt-6 space-y-2">
                      {projectStats.byStatus.map((status, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                          ></div>
                          <div className="flex justify-between w-full">
                            <span>{status.name}</span>
                            <span className="font-medium">{status.value}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="h-64">
                    <ChartContainer config={chartConfig} className="mx-auto max-h-[250px] px-0">
                      <ReChartPie>
                        <Pie
                          data={projectStats.byStatus}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="var(--chart-5)"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {projectStats.byStatus.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                        <ChartLegend
                          content={({ payload }) => <ChartLegendContent payload={payload} nameKey="name" />}
                        />
                      </ReChartPie>
                    </ChartContainer>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button variant="link" className="gap-1 text-sm" onClick={() => router.push("/tracking")}>
                    Gestionar proyectos
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-8">
              {/* Tendencia de Ingresos */}
              <Card className="lg:col-span-5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChartIcon className="h-5 w-5 text-primary" />
                    Tendencia de Ingresos Mensuales
                  </CardTitle>
                  <CardDescription>Evolución financiera de los últimos 6 meses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={financialStats.monthlyData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} />
                        <YAxis
                          tickFormatter={(value) =>
                            `S/ ${value.toLocaleString("es-PE", {
                              notation: "compact",
                              compactDisplay: "short",
                            })}`
                          }
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="rounded-lg border bg-background p-2 shadow-md">
                                  <div className="grid gap-1">
                                    <div className="font-medium">
                                      {data.month} {data.year}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="flex flex-col">
                                        <span className="text-muted-foreground text-xs">Facturado</span>
                                        <span className="font-medium">S/ {data.total.toLocaleString("es-PE")}</span>
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-muted-foreground text-xs">Cobrado</span>
                                        <span className="font-medium">S/ {data.paid.toLocaleString("es-PE")}</span>
                                      </div>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-muted-foreground text-xs">Facturas</span>
                                      <span className="font-medium">{data.count} documentos</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="total"
                          name="Facturado"
                          stroke="var(--chart-3)"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="paid"
                          name="Cobrado"
                          stroke="var(--chart-1)"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <div className="h-3 w-3 rounded-full bg-chart-3"></div>
                      <span className="text-xs">Facturado</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-3 w-3 rounded-full bg-chart-1"></div>
                      <span className="text-xs">Cobrado</span>
                    </div>
                  </div>
                  <Button variant="link" className="gap-1 text-sm" onClick={() => router.push("/payment")}>
                    Ver detalles financieros
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>

              {/* Tendencia de certificaciones */}
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Certificaciones Emitidas
                  </CardTitle>
                  <CardDescription>Histórico mensual de certificados</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={certificatesTrend} margin={{ top: 20, right: 0, left: 0, bottom: 30 }}>
                        <defs>
                          <linearGradient id="certGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.5} />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} />
                        <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="rounded-lg border bg-background p-2 shadow-md">
                                  <div className="grid gap-1">
                                    <div className="font-medium">
                                      {data.month} {data.year}
                                    </div>
                                    <div className="flex justify-between gap-4">
                                      <span className="text-muted-foreground text-xs">Certificados:</span>
                                      <span className="font-medium">{data.count}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="count"
                          name="Certificados"
                          stroke="var(--chart-2)"
                          fillOpacity={1}
                          fill="url(#certGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button variant="link" className="gap-1 text-sm" onClick={() => router.push("/certificates")}>
                    Ver todos los certificados
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Cotizaciones por Tipo de Pago */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Forma de Pago Preferida
                  </CardTitle>
                  <CardDescription>Distribución por modalidad de pago</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col justify-center">
                      <div className="text-xl font-bold">{quotations?.length || 0}</div>
                      <div className="text-sm text-muted-foreground">Cotizaciones totales</div>

                      <div className="mt-6 space-y-2">
                        {getPaymentPlanData.map((payPlan, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                            ></div>
                            <div className="flex justify-between w-full">
                              <span>{payPlan.name}</span>
                              <span className="font-medium">{payPlan.value}</span>
                            </div>
                          </div>
                        ))}

                        <div className="border-t pt-2 mt-2">
                          <div className="flex justify-between text-sm font-medium">
                            <span>Proporción mensual/puntual:</span>
                            <span>
                              {getPaymentPlanData.length === 2
                                ? `${((getPaymentPlanData[0].value / (getPaymentPlanData[0].value + getPaymentPlanData[1].value)) * 100).toFixed(1)}%`
                                : "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="h-64">
                      <ChartContainer config={chartConfig} className="mx-auto max-h-[250px] overflow-auto px-0">
                        <ReChartPie>
                          <Pie
                            data={getPaymentPlanData}
                            cx="50%"
                            cy="50%"
                            outerRadius={70}
                            fill="var(--chart-5)"
                            dataKey="value"
                            nameKey="name"
                            label={({ _, percent }) => `${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {getPaymentPlanData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                        </ReChartPie>
                      </ChartContainer>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button variant="link" className="gap-1 text-sm" onClick={() => router.push("/quotation")}>
                    Gestionar cotizaciones
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>

              {/* Indicadores financieros clave */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CircleDollarSign className="h-5 w-5 text-primary" />
                    Desempeño Financiero
                  </CardTitle>
                  <CardDescription>Indicadores clave de rendimiento</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Facturación Total</span>
                      <span className="font-medium">S/. {financialStats.total.toLocaleString("es-PE")}</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-sky-500 rounded-full" style={{ width: "100%" }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Cobrado</span>
                      <span className="font-medium">S/. {financialStats.paid.toLocaleString("es-PE")}</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${(financialStats.paid / financialStats.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Pendiente</span>
                      <span className="font-medium">S/. {financialStats.pending.toLocaleString("es-PE")}</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${(financialStats.pending / financialStats.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="pt-4 grid grid-cols-2 gap-4">
                    <div className="text-center px-2 py-3 rounded-lg border bg-muted/10">
                      <div className="text-sm text-muted-foreground mb-1">Tasa de Cobro</div>
                      <div className="text-xl font-bold">
                        {financialStats.total ? ((financialStats.paid / financialStats.total) * 100).toFixed(1) : 0}%
                      </div>
                    </div>

                    <div className="text-center px-2 py-3 rounded-lg border bg-muted/10">
                      <div className="text-sm text-muted-foreground mb-1">Facturas Pendientes</div>
                      <div className="text-xl font-bold">{payments ? payments.filter((p) => !p.isPaid).length : 0}</div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button variant="link" className="gap-1 text-sm" onClick={() => router.push("/payment")}>
                    Ver estados de pago
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="flex justify-end mt-8">
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => router.push("/tracking")} className="gap-2">
                  <Briefcase className="h-4 w-4" />
                  Proyectos
                </Button>
                <Button variant="outline" onClick={() => router.push("/quotation")} className="gap-2">
                  <ClipboardCheck className="h-4 w-4" />
                  Cotizaciones
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </AdminDashboardLayout>
  );
}
