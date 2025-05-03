"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Save } from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import {
  useAddMultipleDiagnostics,
  useMedicalRecord,
  useUpdateMedicalRecord,
} from "@/app/(admin)/medical-records/_hooks/useMedicalRecords";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { MedicalRecordUpdate } from "../../_types/medical-record.types";
import { AptitudSection } from "./sections/aptitud-section";
import { DatosFiliacionSection } from "./sections/datos-filiacion-section";
import { DiagnosticosSection } from "./sections/diagnosticos-section";

// Schema para la validación del formulario
const formSchema = z.object({
  datosFiliacion: z.object({
    dni: z.string().min(1, "DNI es requerido"),
    nombres: z.string().min(1, "Nombres es requerido"),
    segundoNombre: z.string().optional(),
    apellidoPaterno: z.string().min(1, "Apellido paterno es requerido"),
    apellidoMaterno: z.string().optional(),
    genero: z.string().optional(),
    fechaNacimiento: z.date().optional(),
    emodate: z.date().optional(),
    edad: z.number().optional(),
  }),
  aptitud: z.object({
    aptitud: z.string().min(1, "Aptitud es requerida"),
    restricciones: z.string().optional(),
    personalHistory: z.string().optional(),
  }),
  diagnosticos: z.object({
    diagnosticoOftalmologia: z.array(z.string()).default([]),
    diagnosticoMusculoesqueletico: z.array(z.string()).default([]),
    alteracionDiagnosticoPsicologia: z.array(z.string()).default([]),
    diagnosticoAudiometria: z.array(z.string()).default([]),
    diagnosticoEspirometria: z.array(z.string()).default([]),
    diagnosticoEkg: z.array(z.string()).default([]),
    resultadoTestSomnolencia: z.array(z.string()).default([]),
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface MedicalRecordDetailsProps {
  recordId: string;
  mode: "view" | "edit";
}

export function MedicalRecordDetails({ recordId, mode }: MedicalRecordDetailsProps) {
  const router = useRouter();
  const { data, isLoading } = useMedicalRecord(recordId);
  const updateMedicalRecord = useUpdateMedicalRecord();
  const addMultipleDiagnostics = useAddMultipleDiagnostics();

  const [activeTab, setActiveTab] = useState("datos-filiacion");
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = mode === "edit";

  // Procesamiento simplificado de diagnósticos
  const diagnosticsValues = (data?.diagnosticValues?.map((value) => ({
    ...value,
    diagnosticName: value.diagnosticName || "",
    value: Array.isArray(value.value) ? value.value : value.value ? [value.value] : [],
  })) || []) as any;

  // Inicializar react-hook-form
  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      datosFiliacion: {
        dni: "",
        nombres: "",
        segundoNombre: "",
        apellidoPaterno: "",
        apellidoMaterno: "",
        genero: "",
        fechaNacimiento: new Date(),
        emodate: new Date(),
        edad: 0,
      },
      aptitud: {
        aptitud: "",
        restricciones: "",
        personalHistory: "",
      },
      diagnosticos: {
        diagnosticoOftalmologia: [],
        diagnosticoMusculoesqueletico: [],
        alteracionDiagnosticoPsicologia: [],
        diagnosticoAudiometria: [],
        diagnosticoEspirometria: [],
        diagnosticoEkg: [],
        resultadoTestSomnolencia: [],
      },
    },
    mode: "onSubmit",
  });

  const {
    reset,
    handleSubmit,
    formState: { isDirty, isSubmitting },
  } = methods;

  // Effect para detectar cambios y emitir eventos
  useEffect(() => {
    if (!isEditing) {
      window.dispatchEvent(new CustomEvent("unsavedChanges", { detail: { hasUnsavedChanges: false } }));
      return;
    }

    if (isDirty) {
      window.dispatchEvent(new CustomEvent("unsavedChanges", { detail: { hasUnsavedChanges: true } }));
    }

    return () => {
      window.dispatchEvent(new CustomEvent("unsavedChanges", { detail: { hasUnsavedChanges: false } }));
    };
  }, [isDirty, isEditing]);

  // Inicializar datos del formulario cuando se cargan los datos de la API
  useEffect(() => {
    if (data && !isLoading) {
      // Extract values from the details object which contains our custom fields
      // If the field is in the main API response, prefer using that
      const datosFiliacion = data.details?.datosFiliacion || {};

      // Mapear gender de la API a valores del formulario
      let generoValue = "";
      if (data.gender === "MALE") {
        generoValue = "Masculino";
      } else if (data.gender === "FEMALE") {
        generoValue = "Femenino";
      } else if (data.gender === "OTHER") {
        generoValue = "Otro";
      }

      // Inicializar defaultValues para el formulario
      const defaultValues: FormValues = {
        datosFiliacion: {
          dni: data.dni || "",
          nombres: data.firstName || "",
          segundoNombre: data.secondName || "",
          apellidoPaterno: data.firstLastName || "",
          apellidoMaterno: data.secondLastName || "",
          genero: generoValue,
          fechaNacimiento: data.birthDate ? new Date(data.birthDate) : undefined,
          emodate: data.lastEmoDate ? new Date(data.lastEmoDate) : undefined,
          edad: datosFiliacion.edad ? Number(datosFiliacion.edad) : undefined,
        },
        aptitud: {
          aptitud: data.aptitude || "",
          restricciones: data.restrictions || "",
          personalHistory: data.personalHistory || "",
        },
        diagnosticos: {
          diagnosticoOftalmologia: [],
          diagnosticoMusculoesqueletico: [],
          alteracionDiagnosticoPsicologia: [],
          diagnosticoAudiometria: [],
          diagnosticoEspirometria: [],
          diagnosticoEkg: [],
          resultadoTestSomnolencia: [],
        },
      };

      reset(defaultValues);
    }
  }, [data, isLoading, reset]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Si no hay datos cargados, mostramos un mensaje informativo
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-center p-4">
        <div className="mb-4 text-muted-foreground">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium">No se pudo cargar la información médica</p>
          <p className="text-sm">Intente nuevamente más tarde</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/medical-records")} className="mt-4">
          Volver a registros médicos
        </Button>
      </div>
    );
  }

  // Si estamos en modo de vista y no hay datos de diagnósticos, mostramos un mensaje
  if (!isEditing && (!data.diagnosticValues || data.diagnosticValues.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-center p-4">
        <div className="mb-4 text-muted-foreground">
          <p className="text-lg font-medium">No hay información médica detallada</p>
          <p className="text-sm">Este registro aún no tiene detalles médicos</p>
        </div>
        <Button onClick={() => router.push(`/medical-records/${recordId}/edit`)} className="mt-4">
          <Pencil className="mr-2 h-4 w-4" /> Editar Detalles Médicos
        </Button>
      </div>
    );
  }

  const cancelNavigation = () => {
    setShowUnsavedChangesDialog(false);
  };

  // Función para confirmar la navegación y descartar cambios
  const confirmNavigation = () => {
    setShowUnsavedChangesDialog(false);
    if (pendingNavigation) {
      router.push(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  // Función para guardar los cambios
  const onSubmit = async (values: FormValues) => {
    if (!isEditing) return;

    try {
      setIsSaving(true);

      // Mapear los valores de género a los valores aceptados por la API
      let genderValue: "MALE" | "FEMALE" | "OTHER" | undefined;

      if (values.datosFiliacion.genero) {
        if (values.datosFiliacion.genero === "Masculino") {
          genderValue = "MALE";
        } else if (values.datosFiliacion.genero === "Femenino") {
          genderValue = "FEMALE";
        } else {
          genderValue = "OTHER";
        }
      }

      // 1. Guardar información básica de identificación y aptitud
      const basicInfo: MedicalRecordUpdate = {
        dni: values.datosFiliacion.dni,
        firstName: values.datosFiliacion.nombres,
        secondName: values.datosFiliacion.segundoNombre || "",
        firstLastName: values.datosFiliacion.apellidoPaterno,
        secondLastName: values.datosFiliacion.apellidoMaterno || "",
        gender: genderValue,
        aptitude: values.aptitud.aptitud as any,
        restrictions: values.aptitud.restricciones || "",
        personalHistory: values.aptitud.personalHistory || "",
        birthDate: values.datosFiliacion.fechaNacimiento
          ? values.datosFiliacion.fechaNacimiento.toISOString().split("T")[0]
          : undefined,
        lastEmoDate: values.datosFiliacion.emodate
          ? values.datosFiliacion.emodate.toISOString().split("T")[0]
          : undefined,
      };

      // Actualizar información básica
      await updateMedicalRecord.mutateAsync({
        id: recordId,
        data: basicInfo,
      });

      // Also update details to store additional data
      const detailsUpdate = {
        datosFiliacion: {
          ...values.datosFiliacion,
          // Convert Date objects to strings for storage in details
          fechaNacimiento: values.datosFiliacion.fechaNacimiento || "",
          emodate: values.datosFiliacion.emodate || "",
        },
      };

      // Update the details through the appropriate API
      await fetch(`/api/v1/medical-records/${recordId}/details`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(detailsUpdate),
      });

      // 2. Preparar y enviar diagnósticos
      const diagnosticsPayload = [] as Array<{
        diagnosticId: string;
        values: string[];
        isReportIncluded?: boolean;
      }>;

      diagnosticsValues.forEach((diagnostic: any) => {
        const diagnosticName = diagnostic.diagnosticName;
        const diagnosticId = diagnostic.diagnosticId;

        if (!diagnosticName || !diagnosticId) return;

        // Obtener los valores del formulario para este diagnóstico
        const formValues = (values.diagnosticos as any)[diagnosticName] || [];

        // Normalizar y filtrar valores vacíos
        const formValuesStr = Array.isArray(formValues)
          ? formValues.map((v: any) => String(v).trim()).filter(Boolean)
          : [String(formValues)].filter(Boolean);

        diagnosticsPayload.push({
          diagnosticId: diagnosticId,
          values: formValuesStr,
          isReportIncluded: true,
        });
      });

      // Enviar diagnósticos si hay alguno
      if (diagnosticsPayload.length > 0) {
        await addMultipleDiagnostics.mutateAsync({
          id: recordId,
          diagnostics: diagnosticsPayload,
        });
      }

      toast.success("Registro médico actualizado exitosamente");

      // Redirección después de guardar
      setTimeout(() => {
        window.location.href = `/medical-records/${recordId}/details`;
      }, 1000);
    } catch (_error) {
      toast.error("Error al guardar los cambios. Intente nuevamente.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full flex-col justify-start py-1 sm:flex-row h-auto">
            <TabsTrigger
              title="Datos de Filiación"
              value="datos-filiacion"
              className="truncate text-sm md:text-base w-full data-[state=active]:shadow-none"
            >
              Datos de Filiación
            </TabsTrigger>
            <TabsTrigger
              title="Aptitud"
              value="aptitud"
              className="truncate text-sm md:text-base w-full data-[state=active]:shadow-none"
            >
              Aptitud
            </TabsTrigger>
            <TabsTrigger
              title="Diagnósticos"
              value="diagnosticos"
              className="truncate text-sm md:text-base w-full data-[state=active]:shadow-none"
            >
              Diagnósticos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="datos-filiacion" className="mt-4 md:mt-6">
            <DatosFiliacionSection isEditing={isEditing} />
          </TabsContent>

          <TabsContent value="aptitud" className="mt-4 md:mt-6">
            <AptitudSection isEditing={isEditing} />
          </TabsContent>

          <TabsContent value="diagnosticos" className="mt-4 md:mt-6">
            <DiagnosticosSection isEditing={isEditing} diagnosticsValues={diagnosticsValues} />
          </TabsContent>
        </Tabs>

        {isEditing && (
          <div className="mt-6 flex items-center justify-end">
            <Button
              type="submit"
              disabled={isSaving || isSubmitting || updateMedicalRecord.isPending || addMultipleDiagnostics.isPending}
            >
              {isSaving || isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        )}

        {!isEditing && (
          <div className="mt-6 flex justify-end">
            <Button onClick={() => router.push(`/medical-records/${recordId}/edit`)}>
              <Pencil className="mr-2 h-4 w-4" /> Editar
            </Button>
          </div>
        )}

        {/* Diálogo de confirmación para cambios sin guardar */}
        <AlertDialog open={showUnsavedChangesDialog} onOpenChange={setShowUnsavedChangesDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cambios sin guardar</AlertDialogTitle>
              <AlertDialogDescription>
                Tienes cambios sin guardar en el formulario. Si sales ahora, perderás todos los cambios realizados.
                <p className="mt-2 font-medium">¿Qué deseas hacer?</p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex items-center gap-2">
              <AlertDialogCancel onClick={cancelNavigation}>Continuar editando</AlertDialogCancel>
              <AlertDialogAction onClick={confirmNavigation} className="bg-red-600 text-white hover:bg-red-700">
                Salir sin guardar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </form>
    </FormProvider>
  );
}
