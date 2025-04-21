// Server Component
import { Suspense } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Briefcase, Calendar, Eye, FileText, Stethoscope, User } from "lucide-react";

import { getClient } from "@/app/(admin)/clients/_actions/clients.actions";
import { getMedicalRecord } from "@/app/(admin)/medical-records/_actions/medical-record.action";
import { BackButton } from "@/app/(admin)/medical-records/_components/BackButton";
import { MedicalRecordDetails } from "@/app/(admin)/medical-records/_components/detalle/medical-record-editor";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

interface PageProps {
  params: Promise<{ id: string }>;
}

const aptitudeLabels = {
  APT: "Apto",
  APT_WITH_RESTRICTIONS: "Apto con restricciones",
  TEMPORARY_NOT_APT: "No apto temporal",
  NOT_APT: "No apto",
};

const aptitudeColors = {
  APT: "bg-green-100 text-green-800",
  APT_WITH_RESTRICTIONS: "bg-yellow-100 text-yellow-800",
  TEMPORARY_NOT_APT: "bg-orange-100 text-orange-800",
  NOT_APT: "bg-red-100 text-red-800",
};

const examTypeLabels = {
  PRE_OCCUPATIONAL: "Pre-ocupacional",
  PERIODIC: "Periódico",
  RETIREMENT: "Retiro",
  OTHER: "Otro",
};

export default async function MedicalRecordEditPage({ params }: PageProps) {
  // Correctamente esperar la promesa de params
  const { id } = await params;

  // Obtener datos para tener información previa
  const recordData = await getMedicalRecord(id);
  const record = recordData.success ? recordData.data : null;

  // Obtener la información del cliente si existe clientId
  let client = null;
  if (record?.clientId) {
    const clientData = await getClient(record.clientId);
    if (clientData.success && clientData.data) {
      client = clientData.data;
    }
  }

  return (
    <div className="container py-6 pb-24">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BackButton href={`/medical-records/${id}/details`} />
          <h1 className="text-2xl font-bold">Editar Detalle del Registro Médico</h1>
        </div>
        <Link href={`/medical-records/${id}/details`}>
          <Button variant="outline" size="sm">
            <Eye className="mr-2 h-4 w-4" />
            Ver detalle completo
          </Button>
        </Link>
      </div>

      {record && (
        <div className="mb-6">
          <Card className="bg-muted/40">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <User className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">
                        {record.firstName} {record.secondName ? record.secondName + " " : ""}
                        {record.firstLastName} {record.secondLastName || ""}
                      </p>
                      {record.dni && <p className="text-sm text-muted-foreground">DNI: {record.dni}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <Stethoscope className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Tipo de examen</p>
                      <p className="text-sm text-muted-foreground">
                        {examTypeLabels[record.examType as keyof typeof examTypeLabels] || record.examType}
                      </p>
                    </div>
                  </div>

                  {client && (
                    <div className="flex items-center gap-3">
                      <Briefcase className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Cliente</p>
                        <p className="text-sm text-muted-foreground">{client.name}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Fecha de creación</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(record.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 mb-4">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium mb-1">Aptitud médica</p>
                      <Badge className={aptitudeColors[record.aptitude as keyof typeof aptitudeColors]}>
                        {aptitudeLabels[record.aptitude as keyof typeof aptitudeLabels] || record.aptitude}
                      </Badge>

                      {record.restrictions && (
                        <p className="text-sm text-muted-foreground mt-1">{record.restrictions}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Editar Información Médica</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<FormSkeleton />}>
            <MedicalRecordDetails recordId={id} mode="edit" />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border rounded-lg p-4 space-y-4">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
