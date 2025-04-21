"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Save } from "lucide-react";
import { toast } from "sonner";

import {
  useMedicalRecordDetails,
  useUpdateCustomSections,
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
import { UpdateCustomSections } from "../../_types/medical-record.types";
import { NewSectionDialog } from "./new-section-dialog";
import { AptitudSection } from "./sections/aptitud-section";
import { CustomSection } from "./sections/custom-section";
import { DatosFiliacionSection } from "./sections/datos-filiacion-section";
import { DiagnosticosSection } from "./sections/diagnosticos-section";

// Definición del tipo FormValues para usar en los formularios
type FormValues = {
  datosFiliacion: {
    dni: string;
    nombres: string;
    segundoNombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    edad: string;
    genero: string;
    customFields: Array<{ name: string; value: string }>;
  };
  aptitud: {
    aptitud: string;
    restricciones: string;
    antecedentesPersonales: string;
    customFields: Array<{ name: string; value: string }>;
  };
  diagnosticos: {
    hallazgosLaboratorio: string[];
    diagnosticoOftalmologia: string;
    diagnosticoMusculoesqueletico: string;
    alteracionDiagnosticoPsicologia: string;
    diagnosticoAudiometria: string;
    diagnosticoEspirometria: string;
    diagnosticoEkg: string;
    resultadoTestSomnolencia: string;
    customFields: Array<{ name: string; value: string }>;
  };
  customSections: Array<{
    name: string;
    fields: Array<{ name: string; value: string }>;
  }>;
};

interface MedicalRecordDetailsProps {
  recordId: string;
  mode: "view" | "edit";
}

export function MedicalRecordDetails({ recordId, mode }: MedicalRecordDetailsProps) {
  const router = useRouter();
  const { data, isLoading, updateMedicalRecord } = useMedicalRecordDetails(recordId);
  const updateCustomSections = useUpdateCustomSections();
  const [activeTab, setActiveTab] = useState("datos-filiacion");
  const [showNewSectionDialog, setShowNewSectionDialog] = useState(false);
  const [formData, setFormData] = useState<FormValues | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = mode === "edit";

  // Añadir log para depurar cuando se reciben datos
  useEffect(() => {
    console.log("MedicalRecordDetails - data recibido:", data);
    console.log("customData disponible:", data?.customData);
    console.log("details disponible:", data?.details ? "Sí" : "No");
    if (data?.details) {
      console.log("Contenido de details:", data.details);
    }
  }, [data]);

  // Effect to detect unsaved changes when form data changes
  useEffect(() => {
    if (!formData || !isEditing) return;

    // Si hay datos en el formulario y estamos en modo edición, consideramos que hay cambios
    setHasUnsavedChanges(true);

    // Emitir evento personalizado para informar a otros componentes sobre cambios sin guardar
    const event = new CustomEvent("unsavedChanges", { detail: { hasUnsavedChanges: true } });
    window.dispatchEvent(event);
  }, [formData, isEditing]);

  // Efecto para manejar montaje/desmontaje del componente
  useEffect(() => {
    // Al montar, si no estamos en modo de edición, aseguramos que no hay cambios sin guardar
    if (!isEditing) {
      setHasUnsavedChanges(false);
      const event = new CustomEvent("unsavedChanges", { detail: { hasUnsavedChanges: false } });
      window.dispatchEvent(event);
    }

    // Al desmontar, limpiamos el estado
    return () => {
      const event = new CustomEvent("unsavedChanges", { detail: { hasUnsavedChanges: false } });
      window.dispatchEvent(event);
    };
  }, [isEditing]);

  if (isLoading) {
    console.log("MedicalRecordDetails - Cargando datos...");
    return (
      <div className="flex justify-center items-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Si no hay datos cargados, mostramos un mensaje informativo
  if (!data) {
    console.log("MedicalRecordDetails - No hay datos disponibles");
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

  // Si estamos en modo de vista y no hay datos de detalles, mostramos un mensaje
  if (!isEditing && !data.details) {
    console.log("MedicalRecordDetails - No hay details en modo vista:", data);
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

  // Initialize form data when data is loaded
  if (data && !formData) {
    console.log("Inicializando datos del formulario con: ", data);
    console.log("Tipo de customData:", typeof data.customData);
    console.log("Contenido de details:", data.details);

    // Primero creamos una estructura base
    const initialFormData: any = {
      datosFiliacion: {
        dni: data?.dni || "",
        nombres: data?.firstName || "",
        segundoNombre: data?.secondName || "",
        apellidoPaterno: data?.firstLastName || "",
        apellidoMaterno: data?.secondLastName || "",
        edad: "",
        genero: "",
        customFields: [],
      },
      aptitud: {
        aptitud: "",
        restricciones: "",
        antecedentesPersonales: "",
        customFields: [],
      },
      diagnosticos: {
        hallazgosLaboratorio: [],
        diagnosticoOftalmologia: "",
        diagnosticoMusculoesqueletico: "",
        alteracionDiagnosticoPsicologia: "",
        diagnosticoAudiometria: "",
        diagnosticoEspirometria: "",
        diagnosticoEkg: "",
        resultadoTestSomnolencia: "",
        customFields: [],
      },
      customSections: [],
    };

    // Intentamos mapear/transformar los datos de la API a nuestra estructura
    if (data) {
      // Asignación de campos básicos
      if (data.dni) initialFormData.datosFiliacion.dni = data.dni;
      if (data.firstName) initialFormData.datosFiliacion.nombres = data.firstName;
      if (data.secondName) initialFormData.datosFiliacion.segundoNombre = data.secondName;
      if (data.firstLastName) initialFormData.datosFiliacion.apellidoPaterno = data.firstLastName;
      if (data.secondLastName) initialFormData.datosFiliacion.apellidoMaterno = data.secondLastName;

      // Si hay un campo aptitude en la API, lo mapeamos a nuestro modelo
      if (data.aptitude) initialFormData.aptitud.aptitud = data.aptitude;

      // Verificamos si hay secciones personalizadas en el nuevo formato
      if ((data as any).customSections && Array.isArray((data as any).customSections)) {
        console.log("Cargando secciones personalizadas desde API:", (data as any).customSections.length);
        initialFormData.customSections = (data as any).customSections.map((section: any) => ({
          name: section.name || "",
          fields: (section.fields || []).map((field: any) => ({
            name: field.name || "",
            value: field.value || "",
          })),
        }));
      }
      // Si hay datos en details, los usamos directamente
      else if (data.details) {
        console.log("Usando datos de details");

        // Tratamos details como un objeto genérico para evitar errores de tipo
        const detailsObj = data.details as Record<string, any>;

        // Copiamos las secciones si existen
        if (detailsObj.datosFiliacion) {
          console.log("Copiando sección datosFiliacion de details");
          initialFormData.datosFiliacion = detailsObj.datosFiliacion;
        }
        if (detailsObj.aptitud) {
          console.log("Copiando sección aptitud de details");
          initialFormData.aptitud = detailsObj.aptitud;
        }
        if (detailsObj.diagnosticos) {
          console.log("Copiando sección diagnosticos de details");
          initialFormData.diagnosticos = detailsObj.diagnosticos;
        }
        if (detailsObj.customSections) {
          console.log(
            "Copiando secciones personalizadas de details:",
            Array.isArray(detailsObj.customSections) ? detailsObj.customSections.length : "no es array"
          );
          initialFormData.customSections = detailsObj.customSections;
        }
      }
      // Si no hay details pero hay customData, procesamos customData como antes
      else if (data.customData) {
        try {
          // Si es una cadena JSON, la convertimos a objeto
          let customData;
          if (typeof data.customData === "string") {
            console.log("customData es string, intentando parsear JSON:", data.customData.substring(0, 100) + "...");
            customData = JSON.parse(data.customData);
          } else {
            console.log("customData ya es un objeto");
            customData = data.customData;
          }

          console.log("Datos personalizados encontrados en customData:", customData);

          // Copiamos las secciones si existen
          if (customData.datosFiliacion) {
            console.log("Copiando sección datosFiliacion de customData");
            initialFormData.datosFiliacion = customData.datosFiliacion;
          }
          if (customData.aptitud) {
            console.log("Copiando sección aptitud de customData");
            initialFormData.aptitud = customData.aptitud;
          }
          if (customData.diagnosticos) {
            console.log("Copiando sección diagnosticos de customData");
            initialFormData.diagnosticos = customData.diagnosticos;
          }
          if (customData.customSections) {
            console.log("Copiando secciones personalizadas de customData:", customData.customSections.length);
            initialFormData.customSections = customData.customSections;
          }
        } catch (error) {
          console.error("Error al procesar customData:", error);
        }
      } else {
        console.log("No se encontraron ni details ni customData en el objeto de datos");
      }
    }

    // Guardamos la referencia a los datos originales
    initialFormData.originalData = data;

    console.log("Formulario inicializado con:", initialFormData);

    // Establecemos los datos del formulario
    setFormData(initialFormData);
  }

  const handleUpdateField = (section: string, field: string, value: any) => {
    if (!isEditing) return;

    setFormData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));

    // Marcar que hay cambios sin guardar
    if (!hasUnsavedChanges) {
      setHasUnsavedChanges(true);
      const event = new CustomEvent("unsavedChanges", { detail: { hasUnsavedChanges: true } });
      window.dispatchEvent(event);
    }
  };

  const handleUpdateCustomField = (section: string, index: number, field: string, value: string) => {
    if (!isEditing) return;

    setFormData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        customFields: prev[section].customFields.map((item: any, i: number) =>
          i === index ? { ...item, [field]: value } : item
        ),
      },
    }));
  };

  const handleAddCustomField = (section: string, name: string, value: string = "") => {
    if (!isEditing) return;

    setFormData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        customFields: [...(prev[section].customFields || []), { name, value }],
      },
    }));
  };

  const handleRemoveCustomField = (section: string, index: number) => {
    if (!isEditing) return;

    setFormData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        customFields: prev[section].customFields.filter((_: any, i: number) => i !== index),
      },
    }));
  };

  const handleAddHallazgo = (value: string = "") => {
    if (!isEditing) return;

    setFormData((prev: any) => ({
      ...prev,
      diagnosticos: {
        ...prev.diagnosticos,
        hallazgosLaboratorio: [...(prev.diagnosticos.hallazgosLaboratorio || []), value],
      },
    }));
  };

  const handleUpdateHallazgo = (index: number, value: string) => {
    if (!isEditing) return;

    setFormData((prev: any) => ({
      ...prev,
      diagnosticos: {
        ...prev.diagnosticos,
        hallazgosLaboratorio: prev.diagnosticos.hallazgosLaboratorio.map((item: string, i: number) =>
          i === index ? value : item
        ),
      },
    }));
  };

  const handleRemoveHallazgo = (index: number) => {
    if (!isEditing) return;

    setFormData((prev: any) => ({
      ...prev,
      diagnosticos: {
        ...prev.diagnosticos,
        hallazgosLaboratorio: prev.diagnosticos.hallazgosLaboratorio.filter((_: string, i: number) => i !== index),
      },
    }));
  };

  const handleAddSection = (name: string) => {
    if (!isEditing) return;

    setFormData((prev: any) => {
      // Verificar si prev es null o undefined
      if (!prev) {
        // Si prev es null, inicializamos un nuevo objeto
        return {
          datosFiliacion: {
            dni: "",
            apellidoPaterno: "",
            edad: "",
            genero: "",
            customFields: [],
          },
          aptitud: {
            aptitud: "",
            restricciones: "",
            antecedentesPersonales: "",
            customFields: [],
          },
          diagnosticos: {
            hallazgosLaboratorio: [],
            diagnosticoOftalmologia: "",
            diagnosticoMusculoesqueletico: "",
            alteracionDiagnosticoPsicologia: "",
            diagnosticoAudiometria: "",
            diagnosticoEspirometria: "",
            diagnosticoEkg: "",
            resultadoTestSomnolencia: "",
            customFields: [],
          },
          customSections: [{ name, fields: [] }],
        };
      }

      // Si prev no es null, procedemos como antes
      return {
        ...prev,
        customSections: [...(prev.customSections || []), { name, fields: [] }],
      };
    });

    // Marcar que hay cambios sin guardar
    if (!hasUnsavedChanges) {
      setHasUnsavedChanges(true);
      const event = new CustomEvent("unsavedChanges", { detail: { hasUnsavedChanges: true } });
      window.dispatchEvent(event);
    }

    setShowNewSectionDialog(false);
  };

  const handleRemoveSection = (index: number) => {
    if (!isEditing) return;

    setFormData((prev: any) => ({
      ...prev,
      customSections: prev.customSections.filter((_: any, i: number) => i !== index),
    }));
  };

  const handleAddSectionField = (sectionIndex: number, name: string, value: string = "") => {
    if (!isEditing) return;

    setFormData((prev: any) => ({
      ...prev,
      customSections: prev.customSections.map((section: any, i: number) =>
        i === sectionIndex
          ? {
              ...section,
              fields: [...section.fields, { name, value }],
            }
          : section
      ),
    }));
  };

  const handleUpdateSectionField = (sectionIndex: number, fieldIndex: number, field: string, value: string) => {
    if (!isEditing) return;

    setFormData((prev: any) => ({
      ...prev,
      customSections: prev.customSections.map((section: any, i: number) =>
        i === sectionIndex
          ? {
              ...section,
              fields: section.fields.map((item: any, j: number) =>
                j === fieldIndex ? { ...item, [field]: value } : item
              ),
            }
          : section
      ),
    }));

    // Marcar que hay cambios sin guardar
    if (!hasUnsavedChanges) {
      setHasUnsavedChanges(true);
      const event = new CustomEvent("unsavedChanges", { detail: { hasUnsavedChanges: true } });
      window.dispatchEvent(event);
    }
  };

  const handleRemoveSectionField = (sectionIndex: number, fieldIndex: number) => {
    if (!isEditing) return;

    setFormData((prev: any) => ({
      ...prev,
      customSections: prev.customSections.map((section: any, i: number) =>
        i === sectionIndex
          ? {
              ...section,
              fields: section.fields.filter((_: any, j: number) => j !== fieldIndex),
            }
          : section
      ),
    }));
  };

  const handleSave = async () => {
    if (isSaving) return; // Evitar múltiples envíos

    try {
      setIsSaving(true); // Marcar como guardando

      if (!formData) {
        toast.error("No hay datos para guardar");
        setIsSaving(false);
        return;
      }

      let mensajeGuardado = ""; // Para almacenar un solo mensaje de éxito

      // Preparamos primero el objeto de datos para las secciones estándar
      const detailsToUpdate = {
        datosFiliacion: formData.datosFiliacion,
        aptitud: formData.aptitud,
        diagnosticos: formData.diagnosticos,
      };

      console.log("Guardando datos estándar:", detailsToUpdate);

      // Actualizamos primero los detalles estándar
      await updateMedicalRecord.mutateAsync({
        id: recordId,
        details: detailsToUpdate,
      });

      // Para las secciones personalizadas, solo actualizamos si hay cambios reales
      const tieneSeccionesPersonalizadas = formData.customSections && formData.customSections.length > 0;

      if (tieneSeccionesPersonalizadas) {
        console.log("Guardando secciones personalizadas:", formData.customSections);

        // Creamos el objeto con el formato esperado por la API
        const customSectionsData: UpdateCustomSections = {
          customSections: formData.customSections.map((section: any) => ({
            name: section.name,
            fields: section.fields.map((field: any) => ({
              name: field.name,
              value: field.value,
            })),
          })),
        };

        // Actualizamos las secciones personalizadas
        await updateCustomSections.mutateAsync({
          id: recordId,
          customSections: customSectionsData,
        });

        mensajeGuardado = "Datos guardados correctamente";
      } else {
        mensajeGuardado = "Información médica actualizada correctamente";
      }

      // Mostramos un solo mensaje de toast según lo que se actualizó
      if (mensajeGuardado) {
        toast.success(mensajeGuardado);
      }

      setHasUnsavedChanges(false);

      // Emitir evento para indicar que ya no hay cambios sin guardar
      const event = new CustomEvent("unsavedChanges", { detail: { hasUnsavedChanges: false } });
      window.dispatchEvent(event);

      router.push(`/medical-records/${recordId}`);
    } catch (error) {
      console.error("Error al guardar los datos:", error);
      toast.error("Error al guardar los datos");
      setIsSaving(false); // Restablecer el estado en caso de error
    }
  };

  // Funciones para editar campos y secciones existentes
  const handleEditSectionName = (sectionIndex: number, newName: string) => {
    if (!isEditing) return;

    setFormData((prev: any) => ({
      ...prev,
      customSections: prev.customSections.map((section: any, i: number) =>
        i === sectionIndex ? { ...section, name: newName } : section
      ),
    }));
  };

  const handleEditSectionField = (sectionIndex: number, fieldIndex: number, newName: string) => {
    if (!isEditing) return;

    setFormData((prev: any) => ({
      ...prev,
      customSections: prev.customSections.map((section: any, i: number) =>
        i === sectionIndex
          ? {
              ...section,
              fields: section.fields.map((field: any, j: number) =>
                j === fieldIndex ? { ...field, name: newName } : field
              ),
            }
          : section
      ),
    }));
  };

  const handleEditCustomField = (section: string, index: number, newName: string) => {
    if (!isEditing) return;

    setFormData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        customFields: prev[section].customFields.map((item: any, i: number) =>
          i === index ? { ...item, name: newName } : item
        ),
      },
    }));
  };

  // Función para manejar la navegación con protección de cambios sin guardar
  const _handleNavigation = (url: string) => {
    if (isEditing && hasUnsavedChanges) {
      console.log("Detectamos cambios sin guardar, mostrando diálogo");
      setPendingNavigation(url);
      setShowUnsavedChangesDialog(true);
    } else {
      console.log("No hay cambios sin guardar, navegando directamente");
      router.push(url);
    }
  };

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

  const _handleCancel = () => {
    if (data) {
      // Create default empty structure
      const formattedData: FormValues = {
        datosFiliacion: {
          dni: "",
          nombres: "",
          segundoNombre: "",
          apellidoPaterno: "",
          apellidoMaterno: "",
          edad: "",
          genero: "",
          customFields: [],
        },
        aptitud: {
          aptitud: "",
          restricciones: "",
          antecedentesPersonales: "",
          customFields: [],
        },
        diagnosticos: {
          hallazgosLaboratorio: [],
          diagnosticoOftalmologia: "",
          diagnosticoMusculoesqueletico: "",
          alteracionDiagnosticoPsicologia: "",
          diagnosticoAudiometria: "",
          diagnosticoEspirometria: "",
          diagnosticoEkg: "",
          resultadoTestSomnolencia: "",
          customFields: [],
        },
        customSections: [],
      };

      // Map basic data from medical record
      if (data.dni) formattedData.datosFiliacion.dni = data.dni;
      if (data.firstName) formattedData.datosFiliacion.nombres = data.firstName;
      if (data.secondName) formattedData.datosFiliacion.segundoNombre = data.secondName;
      if (data.firstLastName) formattedData.datosFiliacion.apellidoPaterno = data.firstLastName;
      if (data.secondLastName) formattedData.datosFiliacion.apellidoMaterno = data.secondLastName;
      if (data.aptitude) formattedData.aptitud.aptitud = data.aptitude;

      // Guardamos los datos en el estado
      setFormData(formattedData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        {isEditing && (
          <Button variant="outline" onClick={() => setShowNewSectionDialog(true)}>
            Agregar Nueva Sección
          </Button>
        )}
      </div>

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
          {formData?.customSections?.map((section: any, index: number) => (
            <TabsTrigger
              key={`section-${index}`}
              title={section.name}
              value={`custom-${index}`}
              className="truncate text-sm md:text-base w-full data-[state=active]:shadow-none"
            >
              {section.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="datos-filiacion" className="mt-4 md:mt-6">
          <DatosFiliacionSection
            data={formData?.datosFiliacion}
            isEditing={isEditing}
            onUpdateField={(field, value) => handleUpdateField("datosFiliacion", field, value)}
            onAddCustomField={(name) => handleAddCustomField("datosFiliacion", name)}
            onUpdateCustomField={(index, field, value) =>
              handleUpdateCustomField("datosFiliacion", index, field, value)
            }
            onRemoveCustomField={(index) => handleRemoveCustomField("datosFiliacion", index)}
            onEditCustomField={(index, newName) => handleEditCustomField("datosFiliacion", index, newName)}
          />
        </TabsContent>

        <TabsContent value="aptitud" className="mt-4 md:mt-6">
          <AptitudSection
            data={formData?.aptitud}
            isEditing={isEditing}
            onUpdateField={(field, value) => handleUpdateField("aptitud", field, value)}
            onAddCustomField={(name) => handleAddCustomField("aptitud", name)}
            onUpdateCustomField={(index, field, value) => handleUpdateCustomField("aptitud", index, field, value)}
            onRemoveCustomField={(index) => handleRemoveCustomField("aptitud", index)}
            onEditCustomField={(index, newName) => handleEditCustomField("aptitud", index, newName)}
          />
        </TabsContent>

        <TabsContent value="diagnosticos" className="mt-4 md:mt-6">
          <DiagnosticosSection
            data={formData?.diagnosticos}
            isEditing={isEditing}
            onUpdateField={(field, value) => handleUpdateField("diagnosticos", field, value)}
            onAddCustomField={(name) => handleAddCustomField("diagnosticos", name)}
            onUpdateCustomField={(index, field, value) => handleUpdateCustomField("diagnosticos", index, field, value)}
            onRemoveCustomField={(index) => handleRemoveCustomField("diagnosticos", index)}
            onAddHallazgo={handleAddHallazgo}
            onUpdateHallazgo={handleUpdateHallazgo}
            onRemoveHallazgo={handleRemoveHallazgo}
            onEditCustomField={(index, newName) => handleEditCustomField("diagnosticos", index, newName)}
          />
        </TabsContent>

        {formData?.customSections?.map((section: any, sectionIndex: number) => (
          <TabsContent
            key={`section-content-${sectionIndex}`}
            value={`custom-${sectionIndex}`}
            className="mt-4 md:mt-6"
          >
            <CustomSection
              section={section}
              sectionIndex={sectionIndex}
              isEditing={isEditing}
              onRemoveSection={() => handleRemoveSection(sectionIndex)}
              onAddField={(name) => handleAddSectionField(sectionIndex, name)}
              onUpdateField={(fieldIndex, field, value) =>
                handleUpdateSectionField(sectionIndex, fieldIndex, field, value)
              }
              onRemoveField={(fieldIndex) => handleRemoveSectionField(sectionIndex, fieldIndex)}
              onEditSectionName={(newName) => handleEditSectionName(sectionIndex, newName)}
              onEditFieldName={(fieldIndex, newName) => handleEditSectionField(sectionIndex, fieldIndex, newName)}
            />
          </TabsContent>
        ))}
      </Tabs>

      {isEditing && (
        <div className="mt-6 flex items-center justify-end">
          <Button onClick={handleSave} disabled={isSaving || updateMedicalRecord.isPending}>
            {isSaving || updateMedicalRecord.isPending ? (
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
          {/* <Button 
            variant="outline" 
            className="mr-4"
            onClick={() => handleNavigation('/medical-records')}
          >
            Volver
          </Button> */}
          <Button onClick={() => router.push(`/medical-records/${recordId}/edit`)}>
            <Pencil className="mr-2 h-4 w-4" /> Editar
          </Button>
        </div>
      )}

      <NewSectionDialog
        open={showNewSectionDialog}
        onOpenChange={setShowNewSectionDialog}
        onAddSection={handleAddSection}
        existingSections={formData?.customSections?.map((s: any) => s.name) || []}
      />

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
    </div>
  );
}
