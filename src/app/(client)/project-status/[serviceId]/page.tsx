"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { EnumAction, EnumResource } from "@/app/(admin)/roles/_utils/groupedPermission";
import { useServiceById } from "@/app/(admin)/tracking/_hooks/useServicesProject";
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
import { ListObjectives } from "./_components/ListObjectives";
import ProjectObjectivesDialogs from "./_components/ProjectObjectivesDialogs";

export default function ServiceDetailPage() {
  const { serviceId } = useParams();
  const router = useRouter();
  const { isLoading, error } = useServiceById(serviceId as string);

  useEffect(() => {
    if (error) {
      toast.error(error.message);
      setTimeout(() => {
        router.push("/clinic");
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
              <Link href="/project-status">Proyectos</Link>
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
      </ShellHeader>
      <ListObjectives serviceId={serviceId as string} />
      <ProjectObjectivesDialogs serviceId={serviceId as string} />
    </ProtectedComponent>
  );
}
