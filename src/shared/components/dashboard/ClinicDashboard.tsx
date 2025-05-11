"use client";

import Link from "next/link";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import { Building, Building2, Mail, MapPin, Phone, PlusCircle } from "lucide-react";

import { useClinic } from "@/app/(admin)/clinics/_hooks/useClinics";
import { useCurrentUser } from "@/app/(auth)/sign-in/_hooks/useAuth";
import ClinicDashboardLayout from "@/app/(clinic)/layout";
import { cn } from "@/lib/utils";
import { Shell, ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";
import { Loading } from "../loading";
import { Badge } from "../ui/badge";
import { buttonVariants } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

export default function ClinicDashboard() {
  const { data: user, isLoading } = useCurrentUser();

  const { data: client, isLoading: isLoadingClient } = useClinic(user?.id ?? "");

  if (isLoading || isLoadingClient) {
    return <Loading text="Cargando clínica..." />;
  }

  return (
    <ClinicDashboardLayout>
      <Shell>
        <ShellHeader>
          <ShellTitle title="Clínica" />
          <Link href="/registers" className={cn(buttonVariants({ variant: "outline" }))}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Agregar Nuevo Registro
          </Link>
        </ShellHeader>
        <div className="grid grid-cols-1 gap-6">
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">RUC</p>
                    <p className="text-muted-foreground">{client?.ruc}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
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
            </CardContent>
          </Card>
        </div>
      </Shell>
    </ClinicDashboardLayout>
  );
}
