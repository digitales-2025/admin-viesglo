"use client";

import Link from "next/link";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import {
  AlertCircle,
  Building,
  Building2,
  CheckCircle2,
  ClipboardList,
  Mail,
  MapPin,
  Phone,
  PlusCircle,
} from "lucide-react";

import { useClientsByClinic } from "@/app/(admin)/clients/_hooks/useClients";
import { useClinic } from "@/app/(admin)/clinics/_hooks/useClinics";
import { useMedicalRecords } from "@/app/(admin)/medical-records/_hooks/useMedicalRecords";
import { useCurrentUser } from "@/app/(auth)/sign-in/_hooks/useAuth";
import ClinicDashboardLayout from "@/app/(clinic)/layout";
import { cn } from "@/lib/utils";
import { Shell, ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";
import { Loading } from "../loading";
import { Badge } from "../ui/badge";
import { buttonVariants } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

export default function ClinicDashboard() {
  const { data: user, isLoading } = useCurrentUser();
  const { data: clinic, isLoading: isLoadingClinic } = useClinic(user?.id ?? "");

  // Obtenemos los registros médicos de la clínica
  const { data: medicalRecords, isLoading: isLoadingRecords } = useMedicalRecords({
    clinicId: user?.id,
    limit: 100, // Suficientes para mostrar estadísticas
  });

  // Obtenemos los clientes asociados a la clínica
  const { data: clients, isLoading: isLoadingClients } = useClientsByClinic(user?.id ?? "");

  if (isLoading || isLoadingClinic) {
    return <Loading text="Cargando clínica..." />;
  }

  // Estadísticas de registros médicos
  const totalRecords = medicalRecords?.length || 0;

  // Estadísticas de aptitud
  const aptRecords = medicalRecords?.filter((record) => record.aptitude === "APT")?.length || 0;
  const aptWithRestrictionsRecords =
    medicalRecords?.filter((record) => record.aptitude === "APT_WITH_RESTRICTIONS")?.length || 0;

  // Registros recientes (últimos 5)
  const recentRecords = medicalRecords?.slice(0, 5) || [];

  return (
    <ClinicDashboardLayout>
      <Shell>
        <ShellHeader>
          <div>
            <ShellTitle title={`Bienvenido, ${clinic?.name}`} />
            <p className="text-muted-foreground mt-1">Panel de control de su clínica</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/registers" className={cn(buttonVariants({ variant: "default" }))}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nuevo Registro Médico
            </Link>
          </div>
        </ShellHeader>

        <div className="mt-6">
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:w-fit">
              <TabsTrigger value="dashboard">Resumen</TabsTrigger>
              <TabsTrigger value="clinic">Perfil de Clínica</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6 mt-6">
              {/* Tarjetas de estadísticas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-l-4 border-l-sky-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Registros</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingRecords ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">{totalRecords}</div>
                        <ClipboardList className="h-8 w-8 text-sky-500 opacity-20" />
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-emerald-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Aptos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingRecords ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">{aptRecords}</div>
                        <CheckCircle2 className="h-8 w-8 text-emerald-500 opacity-20" />
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-yellow-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Aptos con Restricción</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingRecords ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold">{aptWithRestrictionsRecords}</div>
                        <AlertCircle className="h-8 w-8 text-yellow-500 opacity-20" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Registros médicos recientes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ClipboardList className="mr-2 h-5 w-5" />
                    Registros Médicos Recientes
                  </CardTitle>
                  <CardDescription>Últimos registros médicos realizados</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingRecords ? (
                    <div className="space-y-4">
                      {Array(3)
                        .fill(0)
                        .map((_, i) => (
                          <div key={i} className="flex items-center gap-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-40" />
                              <Skeleton className="h-4 w-24" />
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : recentRecords.length > 0 ? (
                    <div className="space-y-4">
                      {recentRecords.map((record) => (
                        <div
                          key={record.id}
                          className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="rounded-full bg-blue-100 p-2">
                            <ClipboardList className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">
                              {record.firstName} {record.firstLastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {record.examType === "PRE_OCCUPATIONAL"
                                ? "Pre-Ocupacional"
                                : record.examType === "PERIODIC"
                                  ? "Periódico"
                                  : record.examType === "RETIREMENT"
                                    ? "Retiro"
                                    : "Otro"}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge
                              variant={
                                record.aptitude === "APT"
                                  ? "success"
                                  : record.aptitude === "APT_WITH_RESTRICTIONS"
                                    ? "warning"
                                    : "destructive"
                              }
                            >
                              {record.aptitude === "APT"
                                ? "Apto"
                                : record.aptitude === "APT_WITH_RESTRICTIONS"
                                  ? "Apto con restricciones"
                                  : "No apto"}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(record.createdAt).toLocaleDateString("es-ES")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">No hay registros médicos recientes</div>
                  )}
                </CardContent>
                <CardFooter>
                  <Link href="/registers" className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
                    Ver todos los registros
                  </Link>
                </CardFooter>
              </Card>

              {/* Clínicas Asignadas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building2 className="mr-2 h-5 w-5" />
                    Clientes Asignados
                  </CardTitle>
                  <CardDescription>Clientes que han sido asignados a su clínica</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingClients ? (
                    <div className="space-y-4">
                      {Array(3)
                        .fill(0)
                        .map((_, i) => (
                          <div key={i} className="flex items-center gap-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-40" />
                              <Skeleton className="h-4 w-24" />
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : clients && clients.length > 0 ? (
                    <div className="space-y-4">
                      {clients.map((client) => (
                        <div
                          key={client.id}
                          className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="rounded-full bg-indigo-100 p-2">
                            <Building className="h-4 w-4 text-indigo-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{client.name}</p>
                            <p className="text-sm text-muted-foreground">RUC: {client.ruc}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant={client.isActive ? "success" : "secondary"}>
                              {client.isActive ? "Activo" : "Inactivo"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No hay clientes asignados a esta clínica
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="clinic" className="space-y-6 mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg bg-primary/10 text-primary">
                      {clinic?.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">{clinic?.name}</CardTitle>
                      <Badge variant="success" className="ml-2">
                        {clinic?.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                    <CardDescription className="mt-1">RUC: {clinic?.ruc}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">RUC</p>
                          <p className="text-muted-foreground">{clinic?.ruc}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Nombre Comercial</p>
                          <p className="text-muted-foreground">{clinic?.name}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Dirección</p>
                          <p className="text-muted-foreground">{clinic?.address}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Teléfono</p>
                          <p className="text-muted-foreground">{clinic?.phone}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Email</p>
                          <p className="text-muted-foreground">{clinic?.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href="/clinic-settings" className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
                    Editar información
                  </Link>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </Shell>
    </ClinicDashboardLayout>
  );
}
