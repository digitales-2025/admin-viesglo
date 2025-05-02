"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { ProtectedComponent } from "@/auth/presentation/components/ProtectedComponent";
import AlertMessage from "@/shared/components/alerts/Alert";
import { ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";
import { LoadingOverlay } from "@/shared/components/loading-overlay";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/components/ui/breadcrumb";
import { useServiceById } from "../_hooks/useServicesProject";
import { EnumAction, EnumResource } from "../../roles/_utils/groupedPermission";
import { ListObjectives } from "./_components/ListObjectives";
import ProjectObjectivesDialogs from "./_components/ProjectObjectivesDialogs";
import ProjectObjectivesPrimaryButtons from "./_components/ProjectObjectivesPrimaryButtons";

export default function ServiceDetailPage() {
  const { serviceId } = useParams();
  const router = useRouter();
  const { isLoading, error } = useServiceById(serviceId as string);

  useEffect(() => {
    if (error) {
      toast.error(error.message);
      setTimeout(() => {
        router.push("/tracking");
      }, 2000);
    }
  }, [error]);

  if (isLoading) {
    return <LoadingOverlay isLoading={isLoading} className="size-full min-h-screen" />;
  }
  return (
    <ProtectedComponent
      requiredPermissions={[{ resource: EnumResource.projects, action: EnumAction.read }]}
      fallback={
        <AlertMessage
          variant="destructive"
          title="No tienes permisos para ver este contenido"
          description="Por favor, contacta al administrador. O intenta iniciar sesión con otro usuario."
        />
      }
    >
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/tracking">Proyectos</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Servicios</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <ShellHeader>
        <ShellTitle title="Servicio" description="Detalles del servicio" />
        <ProjectObjectivesPrimaryButtons />
      </ShellHeader>
      <ListObjectives serviceId={serviceId as string} />
      <ProjectObjectivesDialogs serviceId={serviceId as string} />
    </ProtectedComponent>
  );
}
