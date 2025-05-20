"use client";

import Link from "next/link";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import { ActivitySquare, Building2, ClipboardList, Mail, MapPin, Phone, User } from "lucide-react";

import { useClient } from "@/app/(admin)/clients/_hooks/useClients";
import { useMedicalRecords } from "@/app/(admin)/medical-records/_hooks/useMedicalRecords";
import { useProjectsPaginated } from "@/app/(admin)/tracking/_hooks/useProject";
import { useCurrentUser } from "@/app/(auth)/sign-in/_hooks/useAuth";
import ClientDashboardLayout from "@/app/(client)/layout";
import { cn } from "@/lib/utils";
import { Shell, ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";
import { Loading } from "../loading";
import { Badge } from "../ui/badge";
import { buttonVariants } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

export default function ClientDashboard() {
  const { data: user, isLoading } = useCurrentUser();
  const { data: client, isLoading: isLoadingClient } = useClient(user?.id ?? "");

  // Obtenemos los registros médicos del cliente
  const { data: medicalRecords, isLoading: isLoadingRecords } = useMedicalRecords({
    clientId: user?.id,
    limit: 100, // Suficientes para mostrar estadísticas
  });

  // Obtenemos los proyectos del cliente
  const { data: projectsData, isLoading: isLoadingProjects } = useProjectsPaginated({
    clientId: user?.id,
  });

  if (isLoading || isLoadingClient) {
    return <Loading text="Cargando cliente..." />;
  }

  // Registros recientes (últimos 5)
  const recentRecords = medicalRecords?.slice(0, 5) || [];

  // Estadísticas de registros médicos
  const totalRecords = medicalRecords?.length || 0;

  // Proyectos del cliente
  const projects = projectsData?.pages.flatMap((page) => page.data) || [];

  return (
    <ClientDashboardLayout>
      <Shell>
        <ShellHeader>
          <div>
            <ShellTitle title={`Bienvenido, ${client?.name}`} />
            <p className="text-muted-foreground mt-1">Panel de control de su empresa</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/project-status" className={cn(buttonVariants({ variant: "default" }))}>
              <ActivitySquare className="mr-2 h-4 w-4" />
              Ver Proyecto Completo
            </Link>
          </div>
        </ShellHeader>

        <div className="mt-6">
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:w-fit">
              <TabsTrigger value="dashboard">Resumen</TabsTrigger>
              <TabsTrigger value="medical-records">Registros Médicos</TabsTrigger>
              <TabsTrigger value="profile">Perfil</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6 mt-6">
              {/* Estado del Proyecto */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ActivitySquare className="mr-2 h-5 w-5" />
                    Proyectos
                  </CardTitle>
                  <CardDescription>Información sobre sus proyectos</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingProjects ? (
                    <div className="space-y-4">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ) : projects.length > 0 ? (
                    <div className="space-y-4">
                      {projects.map((project) => (
                        <div key={project.id} className="border rounded-lg p-4 hover:bg-muted/40 transition-colors">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">{project.description}</h3>
                              <p className="text-sm text-muted-foreground">
                                Inicio:{" "}
                                {project.startDate
                                  ? new Date(project.startDate).toLocaleDateString("es-ES")
                                  : "No definida"}
                              </p>
                            </div>
                            <Badge
                              variant={
                                project.status === "ACTIVE"
                                  ? "success"
                                  : project.status === "COMPLETED"
                                    ? "default"
                                    : "outline"
                              }
                            >
                              {project.status === "ACTIVE"
                                ? "Activo"
                                : project.status === "COMPLETED"
                                  ? "Completado"
                                  : project.status === "INACTIVE"
                                    ? "Inactivo"
                                    : project.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">No hay proyectos disponibles</div>
                  )}
                </CardContent>
                <CardFooter>
                  <Link href="/project-status" className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
                    Ver todos los proyectos
                  </Link>
                </CardFooter>
              </Card>

              {/* Resumen de registros médicos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ClipboardList className="mr-2 h-5 w-5" />
                    Registros Médicos
                  </CardTitle>
                  <CardDescription>Resumen de registros médicos de su empresa</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingRecords ? (
                    <Skeleton className="h-16 w-full" />
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-3xl font-bold">{totalRecords}</p>
                      <p className="text-muted-foreground">Total de registros médicos</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Link href="/client-medical-records" className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
                    Ver todos los registros médicos
                  </Link>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="medical-records" className="space-y-6 mt-6">
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
                              {record.createdAt ? new Date(record.createdAt).toLocaleDateString("es-ES") : ""}
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
                  <Link href="/client-medical-records" className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
                    Ver todos los registros
                  </Link>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="profile" className="space-y-6 mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg bg-primary/10 text-primary">
                      {client?.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">{client?.name}</CardTitle>
                      <Badge variant="success" className="ml-2">
                        {client?.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                    <CardDescription className="mt-1">RUC: {client?.ruc}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">RUC</p>
                          <p className="text-muted-foreground">{client?.ruc}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Nombre</p>
                          <p className="text-muted-foreground">{client?.name}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Dirección</p>
                          <p className="text-muted-foreground">{client?.address}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Teléfono</p>
                          <p className="text-muted-foreground">{client?.phone}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Email</p>
                          <p className="text-muted-foreground">{client?.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href="/client-settings" className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
                    Editar información
                  </Link>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </Shell>
    </ClientDashboardLayout>
  );
}
