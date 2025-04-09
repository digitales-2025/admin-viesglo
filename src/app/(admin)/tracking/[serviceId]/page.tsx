"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";
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
import ProjectObjectivesPrimaryButtons from "./_components/ProjectObjectivesPrimaryButtons";

export default function ServiceDetailPage() {
  const { serviceId } = useParams();
  return (
    <>
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
    </>
  );
}
