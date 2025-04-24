"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { Controller, FormProvider, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { useMedicalRecordDetails } from "@/app/(admin)/medical-records/_hooks/useMedicalRecords";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Separator } from "@/shared/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Textarea } from "@/shared/components/ui/textarea";

// Schema for form validation
const formSchema = z.object({
  datosFiliacion: z.object({
    dni: z.string().min(1, "DNI es requerido"),
    nombres: z.string().min(1, "Nombres es requerido"),
    apellidoPaterno: z.string().min(1, "Apellido paterno es requerido"),
    apellidoMaterno: z.string().optional(),
    fechaIngreso: z.date().optional(),
    edad: z.string().min(1, "Edad es requerida"),
    genero: z.string().min(1, "Género es requerido"),
    fechaUltimoEmo: z.date().optional(),
    customFields: z
      .array(
        z.object({
          name: z.string(),
          value: z.string(),
        })
      )
      .optional(),
  }),
  aptitud: z.object({
    aptitud: z.string().min(1, "Aptitud es requerida"),
    restricciones: z.string().optional(),
    antecedentesPersonales: z.string().optional(),
    customFields: z
      .array(
        z.object({
          name: z.string(),
          value: z.string(),
        })
      )
      .optional(),
  }),
  diagnosticos: z.object({
    hallazgosLaboratorio: z.array(z.string()).optional(),
    diagnosticoOftalmologia: z.string().optional(),
    diagnosticoMusculoesqueletico: z.string().optional(),
    alteracionDiagnosticoPsicologia: z.string().optional(),
    diagnosticoAudiometria: z.string().optional(),
    diagnosticoEspirometria: z.string().optional(),
    diagnosticoEkg: z.string().optional(),
    resultadoTestSomnolencia: z.string().optional(),
    customFields: z
      .array(
        z.object({
          name: z.string(),
          value: z.string(),
        })
      )
      .optional(),
  }),
  customSections: z
    .array(
      z.object({
        name: z.string(),
        fields: z.array(
          z.object({
            name: z.string(),
            value: z.string(),
          })
        ),
      })
    )
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function MedicalRecordDetailsForm({ recordId }: { recordId: string }) {
  const { data, isLoading, updateMedicalRecord } = useMedicalRecordDetails(recordId);
  const [activeTab, setActiveTab] = useState("datosFiliacion");
  const [isAddFieldDialogOpen, setIsAddFieldDialogOpen] = useState(false);
  const [isAddSectionDialogOpen, setIsAddSectionDialogOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState("");
  const [newFieldName, setNewFieldName] = useState("");
  const [newSectionName, setNewSectionName] = useState("");

  // Initialize form with React Hook Form
  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      datosFiliacion: {
        dni: "",
        nombres: "",
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
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = methods;

  // Field arrays for dynamic fields
  const {
    fields: datosFiliacionCustomFields,
    append: appendDatosFiliacionField,
    remove: removeDatosFiliacionField,
  } = useFieldArray({ control, name: "datosFiliacion.customFields" });

  const {
    fields: aptitudCustomFields,
    append: appendAptitudField,
    remove: removeAptitudField,
  } = useFieldArray({ control, name: "aptitud.customFields" });

  const {
    fields: diagnosticosCustomFields,
    append: appendDiagnosticosField,
    remove: removeDiagnosticosField,
  } = useFieldArray({ control, name: "diagnosticos.customFields" });

  // For hallazgosLaboratorio, we'll use direct array manipulation
  // since useFieldArray has restrictions on path patterns
  const hallazgosLaboratorio = watch("diagnosticos.hallazgosLaboratorio") || [];
  const appendHallazgo = (value: string = "") => {
    const current = hallazgosLaboratorio.slice();
    setValue("diagnosticos.hallazgosLaboratorio", [...current, value]);
  };
  const removeHallazgo = (index: number) => {
    const current = hallazgosLaboratorio.slice();
    current.splice(index, 1);
    setValue("diagnosticos.hallazgosLaboratorio", current);
  };

  const {
    fields: customSections,
    append: appendCustomSection,
    remove: removeCustomSection,
  } = useFieldArray({
    control,
    name: "customSections",
  });

  const handleAddField = () => {
    if (!newFieldName.trim()) {
      toast.error("El nombre del campo no puede estar vacío");
      return;
    }

    switch (currentSection) {
      case "datosFiliacion":
        appendDatosFiliacionField({ name: newFieldName, value: "" });
        break;
      case "aptitud":
        appendAptitudField({ name: newFieldName, value: "" });
        break;
      case "diagnosticos":
        appendDiagnosticosField({ name: newFieldName, value: "" });
        break;
      default:
        const sectionIndex = customSections.findIndex((section) => section.name === currentSection);
        if (sectionIndex !== -1) {
          const currentFields = watch(`customSections.${sectionIndex}.fields`) || [];
          setValue(`customSections.${sectionIndex}.fields`, [...currentFields, { name: newFieldName, value: "" }]);
        }
    }

    setNewFieldName("");
    setIsAddFieldDialogOpen(false);
  };

  const handleAddSection = () => {
    if (!newSectionName.trim()) {
      toast.error("El nombre de la sección no puede estar vacío");
      return;
    }

    appendCustomSection({
      name: newSectionName,
      fields: [],
    });

    setNewSectionName("");
    setIsAddSectionDialogOpen(false);
  };

  const aptitudValue = watch("aptitud.aptitud");

  // Initialize form data once data is loaded
  if (data && !isDirty) {
    // Create default empty structure
    const formattedData: FormValues = {
      datosFiliacion: {
        dni: "",
        nombres: "",
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
    if (data.secondName)
      formattedData.datosFiliacion.nombres = formattedData.datosFiliacion.nombres + " " + data.secondName;
    if (data.firstLastName) formattedData.datosFiliacion.apellidoPaterno = data.firstLastName;
    if (data.secondLastName) formattedData.datosFiliacion.apellidoMaterno = data.secondLastName;
    if (data.aptitude) formattedData.aptitud.aptitud = data.aptitude;

    // Try to parse and assign customData if available
    if (data.customData) {
      try {
        // Parse customData if it's a string
        const customData = typeof data.customData === "string" ? JSON.parse(data.customData) : data.customData;

        // Assign properties if they exist in the customData
        if (customData.datosFiliacion)
          formattedData.datosFiliacion = {
            ...formattedData.datosFiliacion,
            ...customData.datosFiliacion,
          };

        if (customData.aptitud)
          formattedData.aptitud = {
            ...formattedData.aptitud,
            ...customData.aptitud,
          };

        if (customData.diagnosticos)
          formattedData.diagnosticos = {
            ...formattedData.diagnosticos,
            ...customData.diagnosticos,
          };

        if (customData.customSections) formattedData.customSections = customData.customSections;
      } catch (error) {
        console.error("Error parsing customData:", error);
      }
    }

    reset(formattedData);
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const onSubmit = async (values: FormValues) => {
    try {
      // Convert the values to a custom data structure expected by the API
      await updateMedicalRecord.mutateAsync({
        id: recordId,
        details: { customData: JSON.stringify(values) },
      });

      toast.success("Registro médico actualizado correctamente");
    } catch (error) {
      console.error("Error al guardar los datos:", error);
      toast.error("No se pudieron guardar los cambios. Intente nuevamente.");
    }
  };

  const handleCancel = () => {
    if (data) {
      // Create default empty structure
      const formattedData: FormValues = {
        datosFiliacion: {
          dni: "",
          nombres: "",
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
      if (data.secondName)
        formattedData.datosFiliacion.nombres = formattedData.datosFiliacion.nombres + " " + data.secondName;
      if (data.firstLastName) formattedData.datosFiliacion.apellidoPaterno = data.firstLastName;
      if (data.secondLastName) formattedData.datosFiliacion.apellidoMaterno = data.secondLastName;
      if (data.aptitude) formattedData.aptitud.aptitud = data.aptitude;

      // Try to parse and assign customData if available
      if (data.customData) {
        try {
          // Parse customData if it's a string
          const customData = typeof data.customData === "string" ? JSON.parse(data.customData) : data.customData;

          // Assign properties if they exist in the customData
          if (customData.datosFiliacion)
            formattedData.datosFiliacion = {
              ...formattedData.datosFiliacion,
              ...customData.datosFiliacion,
            };

          if (customData.aptitud)
            formattedData.aptitud = {
              ...formattedData.aptitud,
              ...customData.aptitud,
            };

          if (customData.diagnosticos)
            formattedData.diagnosticos = {
              ...formattedData.diagnosticos,
              ...customData.diagnosticos,
            };

          if (customData.customSections) formattedData.customSections = customData.customSections;
        } catch (error) {
          console.error("Error parsing customData:", error);
        }
      }

      reset(formattedData);

      toast.info("Cambios descartados");
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="datosFiliacion">Datos de Filiación</TabsTrigger>
            <TabsTrigger value="aptitud">Aptitud</TabsTrigger>
            <TabsTrigger value="diagnosticos">Diagnósticos</TabsTrigger>
          </TabsList>

          {/* DATOS DE FILIACIÓN */}
          <TabsContent value="datosFiliacion" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>DATOS DE FILIACIÓN</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCurrentSection("datosFiliacion");
                      setIsAddFieldDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar campo
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="dni" className={cn(errors.datosFiliacion?.dni && "text-destructive")}>
                      DNI <span className="text-destructive">*</span>
                    </Label>
                    <Controller
                      name="datosFiliacion.dni"
                      control={control}
                      render={({ field }) => (
                        <Input id="dni" {...field} className={cn(errors.datosFiliacion?.dni && "border-destructive")} />
                      )}
                    />
                    {errors.datosFiliacion?.dni && (
                      <p className="text-sm text-destructive">{errors.datosFiliacion.dni.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nombres" className={cn(errors.datosFiliacion?.nombres && "text-destructive")}>
                      NOMBRES <span className="text-destructive">*</span>
                    </Label>
                    <Controller
                      name="datosFiliacion.nombres"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="nombres"
                          {...field}
                          className={cn(errors.datosFiliacion?.nombres && "border-destructive")}
                        />
                      )}
                    />
                    {errors.datosFiliacion?.nombres && (
                      <p className="text-sm text-destructive">{errors.datosFiliacion.nombres.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="apellidoPaterno"
                      className={cn(errors.datosFiliacion?.apellidoPaterno && "text-destructive")}
                    >
                      APELLIDO PATERNO <span className="text-destructive">*</span>
                    </Label>
                    <Controller
                      name="datosFiliacion.apellidoPaterno"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="apellidoPaterno"
                          {...field}
                          className={cn(errors.datosFiliacion?.apellidoPaterno && "border-destructive")}
                        />
                      )}
                    />
                    {errors.datosFiliacion?.apellidoPaterno && (
                      <p className="text-sm text-destructive">{errors.datosFiliacion.apellidoPaterno.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apellidoMaterno">APELLIDO MATERNO</Label>
                    <Controller
                      name="datosFiliacion.apellidoMaterno"
                      control={control}
                      render={({ field }) => <Input id="apellidoMaterno" {...field} />}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fechaIngreso">FECHA DE INGRESO</Label>
                    <Controller
                      name="datosFiliacion.fechaIngreso"
                      control={control}
                      render={({ field }) => (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? format(field.value, "PPP", { locale: es }) : "Seleccionar fecha"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                              locale={es}
                            />
                          </PopoverContent>
                        </Popover>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edad" className={cn(errors.datosFiliacion?.edad && "text-destructive")}>
                      EDAD <span className="text-destructive">*</span>
                    </Label>
                    <Controller
                      name="datosFiliacion.edad"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="edad"
                          type="number"
                          {...field}
                          className={cn(errors.datosFiliacion?.edad && "border-destructive")}
                        />
                      )}
                    />
                    {errors.datosFiliacion?.edad && (
                      <p className="text-sm text-destructive">{errors.datosFiliacion.edad.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="genero" className={cn(errors.datosFiliacion?.genero && "text-destructive")}>
                      GENERO <span className="text-destructive">*</span>
                    </Label>
                    <Controller
                      name="datosFiliacion.genero"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger className={cn(errors.datosFiliacion?.genero && "border-destructive")}>
                            <SelectValue placeholder="Seleccionar género" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Masculino">Masculino</SelectItem>
                            <SelectItem value="Femenino">Femenino</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.datosFiliacion?.genero && (
                      <p className="text-sm text-destructive">{errors.datosFiliacion.genero.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fechaUltimoEmo">FECHA ULTIMO EMO EJECUTADO</Label>
                    <Controller
                      name="datosFiliacion.fechaUltimoEmo"
                      control={control}
                      render={({ field }) => (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? format(field.value, "PPP", { locale: es }) : "Seleccionar fecha"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                              locale={es}
                            />
                          </PopoverContent>
                        </Popover>
                      )}
                    />
                  </div>
                </div>

                {/* Custom fields for Datos de Filiación */}
                {datosFiliacionCustomFields.length > 0 && (
                  <>
                    <Separator className="my-6" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {datosFiliacionCustomFields.map((field, index) => (
                        <div key={field.id} className="space-y-2 relative">
                          <Label htmlFor={`datosFiliacion-custom-${index}`}>{field.name}</Label>
                          <div className="flex gap-2">
                            <Controller
                              name={`datosFiliacion.customFields.${index}.value`}
                              control={control}
                              render={({ field: inputField }) => (
                                <Input id={`datosFiliacion-custom-${index}`} {...inputField} className="flex-1" />
                              )}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeDatosFiliacionField(index)}
                              className="h-10 w-10 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* APTITUD */}
          <TabsContent value="aptitud" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>APTITUD</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCurrentSection("aptitud");
                      setIsAddFieldDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar campo
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="aptitud" className={cn(errors.aptitud?.aptitud && "text-destructive")}>
                    APTITUD <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    name="aptitud.aptitud"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger className={cn(errors.aptitud?.aptitud && "border-destructive")}>
                          <SelectValue placeholder="Seleccionar aptitud" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Apto">Apto</SelectItem>
                          <SelectItem value="No Apto">No Apto</SelectItem>
                          <SelectItem value="Apto con Restricciones">Apto con Restricciones</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.aptitud?.aptitud && (
                    <p className="text-sm text-destructive">{errors.aptitud.aptitud.message}</p>
                  )}
                </div>

                {aptitudValue === "Apto con Restricciones" && (
                  <div className="space-y-2">
                    <Label htmlFor="restricciones">RESTRICCIONES</Label>
                    <Controller
                      name="aptitud.restricciones"
                      control={control}
                      render={({ field }) => <Textarea id="restricciones" {...field} rows={4} />}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="antecedentesPersonales">ANTECEDENTES PERSONALES</Label>
                  <Controller
                    name="aptitud.antecedentesPersonales"
                    control={control}
                    render={({ field }) => <Textarea id="antecedentesPersonales" {...field} rows={4} />}
                  />
                </div>

                {/* Custom fields for Aptitud */}
                {aptitudCustomFields.length > 0 && (
                  <>
                    <Separator className="my-6" />
                    <div className="space-y-6">
                      {aptitudCustomFields.map((field, index) => (
                        <div key={field.id} className="space-y-2 relative">
                          <Label htmlFor={`aptitud-custom-${index}`}>{field.name}</Label>
                          <div className="flex gap-2">
                            <Controller
                              name={`aptitud.customFields.${index}.value`}
                              control={control}
                              render={({ field: inputField }) => (
                                <Textarea id={`aptitud-custom-${index}`} {...inputField} className="flex-1" rows={3} />
                              )}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeAptitudField(index)}
                              className="h-10 w-10 text-muted-foreground hover:text-destructive self-start"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* DIAGNÓSTICOS */}
          <TabsContent value="diagnosticos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>DIAGNÓSTICOS O CONCLUSIONES MEDICAS POR EVALUACIÓN</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCurrentSection("diagnosticos");
                      setIsAddFieldDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar campo
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="hallazgosLaboratorio">HALLAZGOS DE LABORATORIO</Label>
                  <div className="space-y-2">
                    {hallazgosLaboratorio.map((value, index) => (
                      <div key={`hallazgo-${index}`} className="flex gap-2">
                        <Input
                          id={`hallazgo-${index}`}
                          value={value}
                          onChange={(e) => {
                            const updated = [...hallazgosLaboratorio];
                            updated[index] = e.target.value;
                            setValue("diagnosticos.hallazgosLaboratorio", updated);
                          }}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeHallazgo(index)}
                          className="h-10 w-10 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => appendHallazgo("")} className="mt-2">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar hallazgo
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="diagnosticoOftalmologia">DIAGNOSTICO OFTALMOLOGIA</Label>
                  <Controller
                    name="diagnosticos.diagnosticoOftalmologia"
                    control={control}
                    render={({ field }) => <Textarea id="diagnosticoOftalmologia" {...field} rows={3} />}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="diagnosticoMusculoesqueletico">DIAGNOSTICO MUSCULOESQUELETICO</Label>
                  <Controller
                    name="diagnosticos.diagnosticoMusculoesqueletico"
                    control={control}
                    render={({ field }) => <Textarea id="diagnosticoMusculoesqueletico" {...field} rows={3} />}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alteracionDiagnosticoPsicologia">ALTERACION / DIAGNOSTICO PSICOLOGIA</Label>
                  <Controller
                    name="diagnosticos.alteracionDiagnosticoPsicologia"
                    control={control}
                    render={({ field }) => <Textarea id="alteracionDiagnosticoPsicologia" {...field} rows={3} />}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="diagnosticoAudiometria">DIAGNOSTICO DE AUDIOMETRIA</Label>
                  <Controller
                    name="diagnosticos.diagnosticoAudiometria"
                    control={control}
                    render={({ field }) => <Textarea id="diagnosticoAudiometria" {...field} rows={3} />}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="diagnosticoEspirometria">DIAGNOSTICO DE ESPIROMETRIA</Label>
                  <Controller
                    name="diagnosticos.diagnosticoEspirometria"
                    control={control}
                    render={({ field }) => <Textarea id="diagnosticoEspirometria" {...field} rows={3} />}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="diagnosticoEkg">DIAGNOSTICO DE EKG</Label>
                  <Controller
                    name="diagnosticos.diagnosticoEkg"
                    control={control}
                    render={({ field }) => <Textarea id="diagnosticoEkg" {...field} rows={3} />}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resultadoTestSomnolencia">RESULTADO TEST DE SOMNOLENCIA</Label>
                  <Controller
                    name="diagnosticos.resultadoTestSomnolencia"
                    control={control}
                    render={({ field }) => <Textarea id="resultadoTestSomnolencia" {...field} rows={3} />}
                  />
                </div>

                {/* Custom fields for Diagnósticos */}
                {diagnosticosCustomFields.length > 0 && (
                  <>
                    <Separator className="my-6" />
                    <div className="space-y-6">
                      {diagnosticosCustomFields.map((field, index) => (
                        <div key={field.id} className="space-y-2 relative">
                          <Label htmlFor={`diagnosticos-custom-${index}`}>{field.name}</Label>
                          <div className="flex gap-2">
                            <Controller
                              name={`diagnosticos.customFields.${index}.value`}
                              control={control}
                              render={({ field: inputField }) => (
                                <Textarea
                                  id={`diagnosticos-custom-${index}`}
                                  {...inputField}
                                  className="flex-1"
                                  rows={3}
                                />
                              )}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeDiagnosticosField(index)}
                              className="h-10 w-10 text-muted-foreground hover:text-destructive self-start"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Custom Sections */}
        {customSections.length > 0 && (
          <div className="mt-6 space-y-6">
            {customSections.map((section, sectionIndex) => {
              const fields = watch(`customSections.${sectionIndex}.fields`) || [];

              return (
                <Card key={section.id}>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>{section.name}</span>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCurrentSection(section.name);
                            setIsAddFieldDialogOpen(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Agregar campo
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive/90"
                          onClick={() => removeCustomSection(sectionIndex)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar sección
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {fields.map((field, fieldIndex) => (
                      <div key={fieldIndex} className="space-y-2 relative">
                        <Label htmlFor={`custom-section-${sectionIndex}-field-${fieldIndex}`}>{field.name}</Label>
                        <div className="flex gap-2">
                          <Controller
                            name={`customSections.${sectionIndex}.fields.${fieldIndex}.value`}
                            control={control}
                            render={({ field: inputField }) => (
                              <Textarea
                                id={`custom-section-${sectionIndex}-field-${fieldIndex}`}
                                {...inputField}
                                className="flex-1"
                                rows={3}
                              />
                            )}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const currentFields = [...fields];
                              currentFields.splice(fieldIndex, 1);
                              setValue(`customSections.${sectionIndex}.fields`, currentFields);
                            }}
                            className="h-10 w-10 text-muted-foreground hover:text-destructive self-start"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Add Section Button */}
        <div className="flex justify-center mt-8">
          <Button type="button" variant="outline" onClick={() => setIsAddSectionDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Añadir Sección
          </Button>
        </div>

        {/* Fixed Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 flex justify-end gap-4 z-10">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={updateMedicalRecord.isPending}>
            {updateMedicalRecord.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar
              </>
            )}
          </Button>
        </div>

        {/* Add Field Dialog */}
        <Dialog open={isAddFieldDialogOpen} onOpenChange={setIsAddFieldDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Añadir Nuevo Campo</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="newFieldName">Nombre del Campo</Label>
                <Input
                  id="newFieldName"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  placeholder="Ej: Presión Arterial"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddFieldDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="button" onClick={handleAddField}>
                Añadir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Section Dialog */}
        <Dialog open={isAddSectionDialogOpen} onOpenChange={setIsAddSectionDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Añadir Nueva Sección</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="newSectionName">Nombre de la Sección</Label>
                <Input
                  id="newSectionName"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  placeholder="Ej: Exámenes Adicionales"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddSectionDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="button" onClick={handleAddSection}>
                Añadir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </form>
    </FormProvider>
  );
}
