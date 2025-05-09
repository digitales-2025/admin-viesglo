"use client";

// Server Component
import { Suspense } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Briefcase, Building, Calendar, Mail, MapPin, Phone, Stethoscope, User } from "lucide-react";

import { BackButton } from "@/app/(admin)/medical-records/_components/BackButton";
import { MedicalRecordDetails } from "@/app/(admin)/medical-records/_components/detalle/medical-record-editor";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useMedicalRecord } from "../../_hooks/useMedicalRecords";

// interface PageProps {
//   params: Promise<{ id: string }>;
// }

const examTypeLabels = {
  PRE_OCCUPATIONAL: "Pre-ocupacional",
  PERIODIC: "Periódico",
  RETIREMENT: "Retiro",
  OTHER: "Otro",
};

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

export default function MedicalRecordDetailsPage() {
  // Get ID from params
  const { id } = useParams();

  // Use hooks for data fetching - solo necesitamos el registro médico
  const { data: record, isLoading: isRecordLoading } = useMedicalRecord(id as string);

  // Display loading state when fetching record data
  if (isRecordLoading) {
    return (
      <div className="container py-6 pb-24">
        <div className="mb-6 flex items-center gap-4">
          <BackButton href="/medical-records" />
          <h1 className="text-2xl font-bold">Cargando registro médico...</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-[500px] w-full" />
          <Skeleton className="h-[500px] w-full md:col-span-2" />
        </div>
      </div>
    );
  }

  // Handle case when record doesn't exist
  if (!record) {
    return (
      <div className="container py-6 pb-24">
        <div className="mb-6 flex items-center gap-4">
          <BackButton href="/medical-records" />
          <h1 className="text-2xl font-bold">Registro médico no encontrado</h1>
        </div>
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              El registro médico solicitado no existe o ha sido eliminado.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Obtener cliente y clínica directamente del registro médico
  const client = record.client;
  const clinic = record.clinic;

  return (
    <div className="container py-6 pb-24">
      <div className="mb-6 flex items-center gap-4">
        <BackButton href="/medical-records" />
        <h1 className="text-2xl font-bold">Detalle del registro médico</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Columna izquierda con información del paciente, cliente y clínica */}
        <div className="space-y-6">
          {/* Tarjeta con información básica del paciente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="size-5" />
                Información del paciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium text-lg">
                      {record.firstName} {record.secondName ? record.secondName + " " : ""}
                      {record.firstLastName} {record.secondLastName || ""}
                    </p>
                    {record.dni && <p className="text-sm text-muted-foreground">DNI: {record.dni}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Stethoscope className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Tipo de examen</p>
                    <p className="text-sm text-muted-foreground">
                      {examTypeLabels[record.examType as keyof typeof examTypeLabels] || record.examType}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Fecha de creación</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(record.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-sm font-medium mb-2">Aptitud médica</p>
                  <Badge className={aptitudeColors[record.aptitude as keyof typeof aptitudeColors]}>
                    {aptitudeLabels[record.aptitude as keyof typeof aptitudeLabels] || record.aptitude}
                  </Badge>

                  {record.restrictions && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Restricciones:</p>
                      <p className="text-sm text-muted-foreground">{record.restrictions}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tarjeta con información del cliente (empresa) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="size-5" />
                Información del cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!client ? (
                <div className="flex items-center justify-center py-4 text-muted-foreground">
                  <p>No hay información de cliente disponible</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium text-lg">{client.name}</p>
                      {client.ruc && <p className="text-sm text-muted-foreground">RUC: {client.ruc}</p>}
                    </div>
                  </div>

                  {client.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Dirección</p>
                        <p className="text-sm text-muted-foreground">{client.address}</p>
                      </div>
                    </div>
                  )}

                  {client.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Teléfono</p>
                        <p className="text-sm text-muted-foreground">{client.phone}</p>
                      </div>
                    </div>
                  )}

                  {client.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">{client.email}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tarjeta con información de la clínica */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="size-5" />
                Información de la clínica
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!clinic ? (
                <div className="flex items-center justify-center py-4 text-muted-foreground">
                  <p>No hay información de clínica disponible</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium text-lg capitalize">{clinic.name}</p>
                      {clinic.ruc && <p className="text-sm text-muted-foreground">RUC: {clinic.ruc}</p>}
                    </div>
                  </div>

                  {clinic.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Dirección</p>
                        <p className="text-sm text-muted-foreground">{clinic.address}</p>
                      </div>
                    </div>
                  )}

                  {clinic.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Teléfono</p>
                        <p className="text-sm text-muted-foreground">{clinic.phone}</p>
                      </div>
                    </div>
                  )}

                  {clinic.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">{clinic.email}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Columna derecha con diagnósticos y otros detalles */}
        <div className="md:col-span-2">
          <Suspense fallback={<FormSkeleton />}>
            <MedicalRecordDetails recordId={id as string} mode="view" />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-[200px]" />
      <Skeleton className="h-[500px] w-full" />
    </div>
  );
}
