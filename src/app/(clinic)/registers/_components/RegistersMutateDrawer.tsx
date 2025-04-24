import { useCallback, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import Autocomplete, { AutocompleteItem } from "@/shared/components/ui/autocomplete";
import { Button } from "@/shared/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet-responsive";
import { searchClients } from "../../../(admin)/clients/_actions/clients.actions";
import {
  useAptitudeCertificateInfo,
  useCreateMedicalRecord,
  useDownloadAptitudeCertificate,
  useDownloadMedicalReport,
  useMedicalReportInfo,
  useUpdateMedicalRecord,
  useUploadAptitudeCertificate,
  useUploadMedicalReport,
} from "../../../(admin)/medical-records/_hooks/useMedicalRecords";
import {
  MedicalRecordCreate,
  MedicalRecordResponse,
  MedicalRecordUpdate,
} from "../../../(admin)/medical-records/_types/medical-record.types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: MedicalRecordResponse;
}

// Use the exam types from the MedicalRecordCreate type
type ExamType = MedicalRecordCreate["examType"];
const EXAM_TYPES: { id: ExamType; label: string }[] = [
  { id: "PRE_OCCUPATIONAL", label: "Pre-ocupacional" },
  { id: "PERIODIC", label: "Periódico" },
  { id: "RETIREMENT", label: "Retiro" },
  { id: "OTHER", label: "Otro" },
];

// Use the aptitude types from the MedicalRecordCreate type
type AptitudeType = MedicalRecordCreate["aptitude"];
const APTITUDE_TYPES: { id: AptitudeType; label: string }[] = [
  { id: "APT", label: "Apto" },
  { id: "APT_WITH_RESTRICTIONS", label: "Apto con restricciones" },
  { id: "NOT_APT", label: "No apto" },
];

// Constante para el tamaño máximo de archivo (5MB en bytes)
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Función auxiliar para validar el tamaño del archivo
const validateFileSize = (file: File | undefined) => {
  if (!file) return true;
  if (file.size > MAX_FILE_SIZE) {
    return false;
  }
  return true;
};

// Helper to truncate filenames
const truncateFilename = (filename: string, maxLength: number = 25) => {
  if (!filename || filename.length <= maxLength) return filename;

  const extension = filename.split(".").pop() || "";
  const nameWithoutExt = filename.substring(0, filename.length - extension.length - 1);

  if (nameWithoutExt.length <= maxLength - 5) return filename;

  return `${nameWithoutExt.substring(0, maxLength - 6)}...${extension ? "." + extension : ""}`;
};

// Define the form schema based on the MedicalRecordCreate type
const formSchema = z.object({
  ruc: z.string().min(1, "El RUC es requerido"),
  dni: z.string().optional(),
  firstName: z.string().min(1, "El primer nombre es requerido"),
  secondName: z.string().optional(),
  firstLastName: z.string().min(1, "El apellido paterno es requerido"),
  secondLastName: z.string().optional(),
  examType: z.enum(["PRE_OCCUPATIONAL", "PERIODIC", "RETIREMENT", "OTHER"], {
    required_error: "El tipo de examen es requerido",
  }),
  aptitude: z.enum(["APT", "APT_WITH_RESTRICTIONS", "NOT_APT"], {
    required_error: "La aptitud es requerida",
  }),
  restrictions: z.string().optional(),
  aptitudeCertificate: z
    .any()
    .optional()
    .refine((file) => !file || validateFileSize(file), {
      message: "El archivo no debe exceder los 5MB",
    }),
  medicalReport: z
    .any()
    .optional()
    .refine((file) => !file || validateFileSize(file), {
      message: "El archivo no debe exceder los 5MB",
    }),
});

type FormValues = z.infer<typeof formSchema>;

// Añadir este componente personalizado para la carga de archivos
interface FileUploadProps {
  onChange: (file: File | undefined) => void;
  accept?: string;
  className?: string;
}

const FileUpload = ({ onChange, accept, className }: FileUploadProps) => {
  const [fileName, setFileName] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileName(file?.name || "");
    onChange(file);
  };

  return (
    <div className="relative">
      <div
        className={`flex items-center gap-2 p-2 border rounded-md bg-background hover:bg-accent/50 transition-colors cursor-pointer ${className}`}
      >
        <Upload className="h-4 w-4 text-muted-foreground" />
        <label className="flex-1 cursor-pointer">
          <span className="text-sm text-muted-foreground">{fileName || "Seleccionar archivo"}</span>
          <input type="file" className="hidden" onChange={handleFileChange} accept={accept} />
        </label>
      </div>
    </div>
  );
};

export default function RegistersMutateDrawer({ open, onOpenChange, currentRow }: Props) {
  // Estado para el cliente seleccionado en el autocomplete
  const [selectedClient, setSelectedClient] = useState<AutocompleteItem | null>(null);

  // Hook para crear registros médicos
  const { mutate: createMedicalRecord, isPending: isCreating } = useCreateMedicalRecord();
  const { mutate: updateMedicalRecord, isPending: isUpdating } = useUpdateMedicalRecord();

  // New hooks for file management
  const { mutate: uploadAptitudeCertificate, isPending: isUploadingAptCertificate } = useUploadAptitudeCertificate();
  const { mutate: uploadMedicalReport, isPending: isUploadingMedReport } = useUploadMedicalReport();
  const { data: aptitudeCertificateInfo } = useAptitudeCertificateInfo(currentRow?.id || "");
  const { data: medicalReportInfo } = useMedicalReportInfo(currentRow?.id || "");
  const { mutateAsync: downloadCertificate } = useDownloadAptitudeCertificate();
  const { mutateAsync: downloadReport } = useDownloadMedicalReport();

  const isUpdate = !!currentRow?.id;

  // Determine if files exist (for showing file info in edit mode)
  const hasCertificate = isUpdate && aptitudeCertificateInfo?.fileInfo;
  const hasReport = isUpdate && medicalReportInfo?.fileInfo;

  const isUploadingFiles = isUploadingAptCertificate || isUploadingMedReport;
  const isPending = isCreating || isUpdating || isUploadingFiles;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ruc: "",
      dni: "",
      firstName: "",
      secondName: "",
      firstLastName: "",
      secondLastName: "",
      examType: "PRE_OCCUPATIONAL",
      aptitude: "APT",
      restrictions: "",
      aptitudeCertificate: undefined,
      medicalReport: undefined,
    },
    mode: "onChange",
  });

  const onSubmit = (data: FormValues) => {
    if (isUpdate && currentRow?.id) {
      // Preparar los datos para actualizar
      const updateData: MedicalRecordUpdate = {
        ruc: data.ruc,
        firstName: data.firstName,
        firstLastName: data.firstLastName,
        examType: data.examType,
        aptitude: data.aptitude,
      };

      // Agregar campos opcionales si existen
      if (data.dni) updateData.dni = data.dni;
      if (data.secondName) updateData.secondName = data.secondName;
      if (data.secondLastName) updateData.secondLastName = data.secondLastName;
      if (data.restrictions) updateData.restrictions = data.restrictions;

      updateMedicalRecord(
        { id: currentRow.id, data: updateData },
        {
          onSuccess: () => {
            toast.success("Registro médico actualizado exitosamente");
            onOpenChange(false);
            form.reset();
            setSelectedClient(null);
          },
          onError: (error) => {
            toast.error(error.message || "Error al actualizar el registro médico");
          },
        }
      );
    } else {
      // Crear un FormData para enviar los datos y archivos
      const formData = new FormData();

      // Agregar los campos básicos
      formData.append("ruc", data.ruc);
      formData.append("firstName", data.firstName);
      formData.append("firstLastName", data.firstLastName);
      formData.append("examType", data.examType);
      formData.append("aptitude", data.aptitude);

      // Agregar campos opcionales si existen
      if (data.dni) {
        formData.append("dni", data.dni);
      }
      if (data.secondName) {
        formData.append("secondName", data.secondName);
      }
      if (data.secondLastName) {
        formData.append("secondLastName", data.secondLastName);
      }
      if (data.restrictions) {
        formData.append("restrictions", data.restrictions);
      }

      // Agregar archivos si existen
      if (data.aptitudeCertificate) {
        formData.append("aptitudeCertificate", data.aptitudeCertificate);
      }
      if (data.medicalReport) {
        formData.append("medicalReport", data.medicalReport);
      }

      createMedicalRecord(formData as any, {
        onSuccess: () => {
          toast.success("Registro médico creado exitosamente");
          onOpenChange(false);
          form.reset();
          setSelectedClient(null);
        },
        onError: (error) => {
          toast.error(error.message || "Error al crear el registro médico");
        },
      });
    }
  };

  useEffect(() => {
    if (isUpdate && currentRow?.id) {
      // Extraer los datos del registro actual para llenar el formulario
      const { ruc, dni, firstName, secondName, firstLastName, secondLastName, examType, aptitude, restrictions } =
        currentRow as unknown as FormValues;

      form.reset({
        ruc: ruc || "",
        dni: dni || "",
        firstName: firstName || "",
        secondName: secondName || "",
        firstLastName: firstLastName || "",
        secondLastName: secondLastName || "",
        examType: examType || "PRE_OCCUPATIONAL",
        aptitude: aptitude || "APT",
        restrictions: restrictions || "",
      });
    } else {
      form.reset({
        ruc: "",
        dni: "",
        firstName: "",
        secondName: "",
        firstLastName: "",
        secondLastName: "",
        examType: "PRE_OCCUPATIONAL",
        aptitude: "APT",
        restrictions: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUpdate, currentRow?.id]);

  useEffect(() => {
    if (!open) {
      form.reset({
        ruc: "",
        dni: "",
        firstName: "",
        secondName: "",
        firstLastName: "",
        secondLastName: "",
        examType: "PRE_OCCUPATIONAL",
        aptitude: "APT",
        restrictions: "",
        aptitudeCertificate: undefined,
        medicalReport: undefined,
      });
      setSelectedClient(null);
    }
  }, [open, form]);

  // Efecto para manejar el cliente seleccionado cuando se edita
  useEffect(() => {
    if (isUpdate && currentRow?.id) {
      // Aquí deberías obtener el cliente asociado al registro médico si existe
      // Por ahora usamos un placeholder
      if (currentRow.ruc) {
        setSelectedClient({
          id: "", // No tenemos un ID de cliente, es solo para el autocomplete
          name: currentRow.ruc,
          ruc: currentRow.ruc,
        });
      }
    }
  }, [isUpdate, currentRow]);

  // Función para manejar el required cuando aptitude es APT_WITH_RESTRICTIONS
  const aptitudeValue = form.watch("aptitude");
  const isRestrictionsRequired = aptitudeValue === "APT_WITH_RESTRICTIONS";

  // Función para buscar clientes
  const fetchClients = useCallback(async (query: string): Promise<AutocompleteItem[]> => {
    if (!query || query.length < 2) return [];

    try {
      const response = await searchClients(query);
      if (!response.success) {
        throw new Error(response.error || "Error al buscar clientes");
      }

      return response.data.map((client) => ({
        id: client.id,
        name: client.name,
        ruc: client.ruc,
        email: client.email,
      }));
    } catch (error) {
      console.error("Error al buscar clientes:", error);
      return [];
    }
  }, []);

  // Function to handle file uploads in edit mode
  const handleFileUpload = (type: "certificate" | "report", file: File) => {
    if (!currentRow?.id) return;

    if (type === "certificate") {
      uploadAptitudeCertificate(
        { id: currentRow.id, file },
        {
          onSuccess: () => {
            toast.success("Certificado de aptitud subido correctamente");
          },
          onError: (error) => {
            toast.error(error.message || "Error al subir el certificado");
          },
        }
      );
    } else {
      uploadMedicalReport(
        { id: currentRow.id, file },
        {
          onSuccess: () => {
            toast.success("Informe médico subido correctamente");
          },
          onError: (error) => {
            toast.error(error.message || "Error al subir el informe");
          },
        }
      );
    }
  };

  // Function to handle file downloads
  const handleDownloadFile = async (type: "certificate" | "report") => {
    if (!currentRow?.id) return;

    try {
      if (type === "certificate") {
        await downloadCertificate(currentRow.id);
      } else {
        await downloadReport(currentRow.id);
      }
    } catch (_error) {
      toast.error("Error al descargar el archivo");
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        if (!isPending) {
          onOpenChange(v);
          if (!v) form.reset();
        }
      }}
    >
      <SheetContent className="flex flex-col">
        <SheetHeader className="text-left">
          <SheetTitle className="text-2xl font-bold capitalize">
            {isUpdate ? "Actualizar" : "Crear"} registro médico
          </SheetTitle>
          <SheetDescription>
            {isUpdate ? "Actualiza los datos del registro médico" : "Crea un nuevo registro médico"}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-500px)] sm:h-[calc(100vh-250px)]">
          <Form {...form}>
            <form id="registers-form" onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-5 p-4">
              <FormField
                control={form.control}
                name="ruc"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>RUC del cliente</FormLabel>
                    <FormControl>
                      <Autocomplete
                        value={selectedClient}
                        onChange={(client) => {
                          setSelectedClient(client);
                          field.onChange(client ? client.ruc : "");
                        }}
                        onSearch={fetchClients}
                        placeholder="Buscar cliente por nombre, RUC o email"
                        minChars={2}
                        debounceTime={300}
                        noResultsText="No se encontraron clientes"
                        loadingText="Buscando clientes..."
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="dni"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DNI del paciente</FormLabel>
                      <FormControl>
                        <Input placeholder="Introduce el DNI del paciente" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primer nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Introduce el primer nombre" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="secondName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Segundo nombre (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Introduce el segundo nombre" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="firstLastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apellido paterno</FormLabel>
                      <FormControl>
                        <Input placeholder="Introduce el apellido paterno" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="secondLastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apellido materno (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Introduce el apellido materno" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="examType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de examen</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecciona el tipo de examen" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {EXAM_TYPES.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="aptitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aptitud</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecciona la aptitud" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {APTITUDE_TYPES.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {aptitudeValue === "APT_WITH_RESTRICTIONS" && (
                <FormField
                  control={form.control}
                  name="restrictions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Restricciones {isRestrictionsRequired && <span className="text-red-500">*</span>}
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Introduce las restricciones" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* File uploads section - For both create and update */}
              <div className="my-4">
                <h3 className="font-medium text-sm mb-3">Documentos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {!isUpdate ? (
                    <>
                      {/* File uploads for new records */}
                      <FormField
                        control={form.control}
                        name="aptitudeCertificate"
                        render={({ field: { value: _value, onChange, ...field } }) => (
                          <FormItem>
                            <FormLabel>Certificado de Aptitud</FormLabel>
                            <FormControl>
                              <FileUpload
                                accept=".pdf,.doc,.docx"
                                onChange={(file) => {
                                  if (file && !validateFileSize(file)) {
                                    toast.error("El archivo excede el límite de 5MB");
                                    return;
                                  }
                                  onChange(file);
                                }}
                                {...field}
                              />
                            </FormControl>
                            <p className="text-xs text-muted-foreground mt-1">
                              Formatos aceptados: PDF, DOC, DOCX (máx. 5MB)
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="medicalReport"
                        render={({ field: { value: _value, onChange, ...field } }) => (
                          <FormItem>
                            <FormLabel>Informe Médico</FormLabel>
                            <FormControl>
                              <FileUpload
                                accept=".pdf,.doc,.docx"
                                onChange={(file) => {
                                  if (file && !validateFileSize(file)) {
                                    toast.error("El archivo excede el límite de 5MB");
                                    return;
                                  }
                                  onChange(file);
                                }}
                                {...field}
                              />
                            </FormControl>
                            <p className="text-xs text-muted-foreground mt-1">
                              Formatos aceptados: PDF, DOC, DOCX (máx. 5MB)
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  ) : (
                    <>
                      {/* File upload/download section for existing records */}
                      <div className="space-y-2">
                        <FormLabel>Certificado de Aptitud</FormLabel>
                        <div className="flex flex-col gap-2">
                          {hasCertificate ? (
                            <div className="flex items-center p-2 border rounded-md bg-accent/30">
                              <div className="flex-1 min-w-0 overflow-hidden">
                                <span
                                  className="text-sm block truncate"
                                  title={aptitudeCertificateInfo?.fileInfo?.originalName || ""}
                                >
                                  {truncateFilename(aptitudeCertificateInfo?.fileInfo?.originalName || "Certificado")}
                                </span>
                              </div>
                              <Button
                                size="sm"
                                variant="secondary"
                                type="button"
                                onClick={() => handleDownloadFile("certificate")}
                                className="ml-2 whitespace-nowrap"
                              >
                                Descargar
                              </Button>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">No hay certificado cargado</p>
                          )}

                          <FormItem>
                            <FormLabel className="text-sm">
                              {hasCertificate ? "Reemplazar certificado" : "Subir certificado"}
                            </FormLabel>
                            <FileUpload
                              accept=".pdf,.doc,.docx"
                              onChange={(file) => {
                                if (!file) return;
                                if (!validateFileSize(file)) {
                                  toast.error("El archivo excede el límite de 5MB");
                                  return;
                                }
                                handleFileUpload("certificate", file);
                              }}
                              className="mt-1"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Formatos aceptados: PDF, DOC, DOCX (máx. 5MB)
                            </p>
                          </FormItem>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <FormLabel>Informe Médico</FormLabel>
                        <div className="flex flex-col gap-2">
                          {hasReport ? (
                            <div className="flex items-center p-2 border rounded-md bg-accent/30">
                              <div className="flex-1 min-w-0 overflow-hidden">
                                <span
                                  className="text-sm block truncate"
                                  title={medicalReportInfo?.fileInfo?.originalName || ""}
                                >
                                  {truncateFilename(medicalReportInfo?.fileInfo?.originalName || "Informe")}
                                </span>
                              </div>
                              <Button
                                size="sm"
                                variant="secondary"
                                type="button"
                                onClick={() => handleDownloadFile("report")}
                                className="ml-2 whitespace-nowrap"
                              >
                                Descargar
                              </Button>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">No hay informe cargado</p>
                          )}

                          <FormItem>
                            <FormLabel className="text-sm">
                              {hasReport ? "Reemplazar informe" : "Subir informe"}
                            </FormLabel>
                            <FileUpload
                              accept=".pdf,.doc,.docx"
                              onChange={(file) => {
                                if (!file) return;
                                if (!validateFileSize(file)) {
                                  toast.error("El archivo excede el límite de 5MB");
                                  return;
                                }
                                handleFileUpload("report", file);
                              }}
                              className="mt-1"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Formatos aceptados: PDF, DOC, DOCX (máx. 5MB)
                            </p>
                          </FormItem>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </form>
          </Form>
        </ScrollArea>
        <SheetFooter className="gap-2">
          <Button form="registers-form" type="submit" disabled={isPending}>
            {isPending ? "Guardando..." : isUpdate ? "Actualizar" : "Crear"}
          </Button>
          <SheetClose asChild>
            <Button variant="outline" disabled={isPending}>
              Cancelar
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
