"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

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
import { ListObjectives } from "./_components/ListObjectives";
import ProjectObjectivesDialogs from "./_components/ProjectObjectivesDialogs";
import ProjectObjectivesPrimaryButtons from "./_components/ProjectObjectivesPrimaryButtons";

export default function AdminServiceDetailPage() {
  const { serviceId } = useParams();
  const router = useRouter();
  const { isLoading, error } = useServiceById(serviceId as string);

  useEffect(() => {
    if (error) {
      toast.error(error.message);
      setTimeout(() => {
        router.push("/dashboard/admin/tracking");
      }, 2000);
    }
  }, [error]);

  if (isLoading) {
    return <LoadingOverlay isLoading={isLoading} className="size-full min-h-screen" />;
  }
  return (
    <>
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard/admin/tracking">Proyectos</Link>
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
    </>
  );
}
