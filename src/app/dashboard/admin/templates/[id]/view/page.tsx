"use client";

import { useParams } from "next/navigation";

import AlertMessage from "@/shared/components/alerts/Alert";
import { ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";
import { Loading } from "@/shared/components/loading";
import { useTemplateDetailedById } from "../../_hooks";
import { ProjectTemplateViewer } from "./_components/ProjectTemplateViewer";

export default function ViewTemplatesPage() {
  const params = useParams();
  const id = params.id as string;

  // Obtener datos de la plantilla por ID con milestone templates completos
  const { data: templateData, isLoading, error } = useTemplateDetailedById(id, true);

  // Mostrar loading mientras se cargan los datos
  if (isLoading) {
    return (
      <>
        <ShellHeader>
          <ShellTitle title="Ver plantilla..." description="Cargando datos de la plantilla." />
        </ShellHeader>
        <Loading text="Cargando datos de la plantilla..." variant="spinner" />
      </>
    );
  }

  // Mostrar error si no se pudo cargar la plantilla
  if (error || !templateData) {
    return (
      <>
        <ShellHeader>
          <ShellTitle title="Error" description="No se pudo cargar la plantilla." />
        </ShellHeader>
        <AlertMessage
          variant="destructive"
          title="Error al cargar plantillas"
          description={error?.error?.message ?? "Ocurrió un error desconocido al cargar la plantilla."}
        />
      </>
    );
  }

  return (
    <>
      <ShellHeader>
        <ShellTitle title="Ver plantilla" description={`Datos de la: ${templateData.name}`} />
      </ShellHeader>

      <ProjectTemplateViewer template={templateData} />
    </>
  );
}
