"use client";

import { useMemo } from "react";
import { Briefcase, CircleDollarSign, ClipboardCheck, FileText, PieChart } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, Pie, PieChart as ReChartPie, XAxis, YAxis } from "recharts";

import { useCertificates } from "@/app/(admin)/certificates/_hooks/useCertificates";
import AdminDashboardLayout from "@/app/(admin)/layout";
import { usePaymentsForStats } from "@/app/(admin)/payment/_hooks/usePayments";
import { useQuotationsForStats } from "@/app/(admin)/quotation/_hooks/useQuotations";
import { LabelPaymentPlan, PaymentPlan } from "@/app/(admin)/quotation/_types/quotation.types";
import { useProjects } from "@/app/(admin)/tracking/_hooks/useProject";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "../ui/chart";
import MetricCard from "./MetricCard";

const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

export default function AdminDashboard() {
  const { data: projects, isLoading: isProjectsLoading } = useProjects();
  const { data: quotations, isLoading: isQuotationsLoading } = useQuotationsForStats();
  const { data: payments, isLoading: isPaymentsLoading } = usePaymentsForStats();
  const { data: certifications, isLoading: isCertificationsLoading } = useCertificates();

  // Obtener servicios para mostrar distribución por tipo
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
  // Agrupar proyectos por progreso con {tipoContrato: "nombre", progress: 0}
  const getProjectsByProgress = useMemo(() => {
    if (!projects) return [];

    return projects.map((project) => ({
      tipoContrato: project.typeContract,
      progress: (
        project.services.reduce((acc, service) => acc + (service?.progress || 0), 0) / project.services.length
      ).toFixed(2),
    }));
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

  // Procesar datos para el gráfico de la forma de pago
  const getPaymentPlanData = () => {
    const paymentPlanCount: { [key: string]: number } = {
      [PaymentPlan.INSTALLMENTS]: 0,
      [PaymentPlan.SINGLE]: 0,
    };

    quotations?.forEach((quotation: any) => {
      const paymentPlan = quotation.paymentPlan || PaymentPlan.SINGLE;
      paymentPlanCount[paymentPlan] += 1;
    });

    return Object.entries(paymentPlanCount).map(([name, value]) => ({
      name: LabelPaymentPlan[name as PaymentPlan],
      value,
    }));
  };

  const paymentPlanData = getPaymentPlanData();

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Bienvenido al Sistema de Gestión de Ms&M Consulting</h2>
        </div>

        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Proyectos Activos"
              value={projects?.filter((p) => p.status === "ACTIVE").length?.toString() || "0"}
              description={`${projects?.length} totales`}
              icon={<Briefcase className="size-8 shrink-0 text-sky-400 bg-sky-500/20 p-2 rounded-md" />}
              isLoading={isProjectsLoading}
              className="bg-sky-500/10 hover:border-sky-500/20 transition-colors duration-300"
            />
            <MetricCard
              title="Cotizaciones Pendientes"
              value={quotations?.filter((q) => q.isConcrete)?.length?.toString() || "0"}
              description={`${quotations?.length} totales`}
              icon={<ClipboardCheck className="size-8 shrink-0 text-emerald-400 bg-emerald-500/20 p-2 rounded-md" />}
              isLoading={isQuotationsLoading}
              className="bg-emerald-500/10 hover:border-emerald-500/20 transition-colors duration-300"
            />
            <MetricCard
              title="Ingresos Totales"
              value={`S/. ${financialStats.total.toLocaleString("es-PE")}`}
              description={`S/. ${financialStats.pending.toLocaleString("es-PE")} pendientes`}
              icon={<CircleDollarSign className="size-8 shrink-0 text-orange-400 bg-orange-500/20 p-2 rounded-md" />}
              isLoading={isPaymentsLoading}
              className="bg-orange-500/10 hover:border-orange-500/20 transition-colors duration-300"
            />
            <MetricCard
              title="Certificados Emitidos"
              value={certifications?.length?.toString() || "0"}
              description={`Último certificado emitido: ${certifications?.length ? new Date(certifications[0].dateEmision || "").toLocaleDateString("es-PE") : "N/A"}`}
              icon={<FileText className="size-8 shrink-0 text-purple-400 bg-purple-500/20 p-2 rounded-md" />}
              isLoading={isCertificationsLoading}
              className="bg-purple-500/10 hover:border-purple-500/20 transition-colors duration-300"
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
                <ChartContainer config={chartConfig}>
                  <BarChart
                    accessibilityLayer
                    data={getProjectsByProgress}
                    layout="vertical"
                    margin={{
                      right: 16,
                    }}
                  >
                    <CartesianGrid horizontal={false} />
                    <YAxis
                      dataKey="tipoContrato"
                      type="category"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tickFormatter={(value) => value.slice(0, 3)}
                      hide
                    />
                    <XAxis dataKey="progress" type="number" hide />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                    <Bar dataKey="progress" layout="vertical" fill="var(--chart-1)" radius={4}>
                      <LabelList
                        dataKey="tipoContrato"
                        position="insideLeft"
                        offset={8}
                        className="fill-[var(--chart-1)]"
                        fontSize={12}
                      />
                      <LabelList
                        dataKey="progress"
                        position="right"
                        offset={8}
                        className="fill-yellow-400"
                        fontSize={12}
                      />
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  Distribución de cotizaciones por tipo de pago
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col justify-center">
                  {/* Leyenda personalizada */}
                  <div className="text-2xl font-bold">{quotations?.length}</div>
                  <div className="text-sm text-muted-foreground">Cotizaciones totales</div>

                  <div className="mt-6 space-y-2">
                    {paymentPlanData.map((payPlan, index) => (
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
                          {paymentPlanData.length === 2
                            ? `${((paymentPlanData[0].value / (paymentPlanData[0].value + paymentPlanData[1].value)) * 100).toFixed(1)}%`
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 h-64">
                  <ChartContainer config={chartConfig} className="mx-auto max-h-[250px] px-0">
                    <ReChartPie>
                      <Pie
                        data={paymentPlanData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="var(--chart-5)"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {paymentPlanData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                      <ChartLegend content={({ payload }) => <ChartLegendContent payload={payload} nameKey="name" />} />
                    </ReChartPie>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
