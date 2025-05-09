import { useCallback, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import Autocomplete, { AutocompleteItem } from "@/shared/components/ui/autocomplete";
import { Button } from "@/shared/components/ui/button";
import { DatePicker } from "@/shared/components/ui/date-picker";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet-responsive";
import { useCreateProject, useUpdateProject } from "../_hooks/useProject";
import { useUsersProject } from "../_hooks/useProjectTraking";
import { CreateProject, ProjectResponse, UpdateProjectWithoutServices } from "../_types/tracking.types";
import { searchClients } from "../../clients/_actions/clients.actions";
import { useServices } from "../../services/_hooks/useServices";
import TreeServices from "./TreeServices";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: ProjectResponse;
}

const formSchema = z.object({
  typeContract: z.string().min(1, "El tipo de contrato es requerido."),
  description: z.string().optional(),
  startDate: z.string().optional(),
  clientId: z.string().min(1, "El cliente es requerido."),
  services: z
    .array(
      z.object({
        serviceId: z.string(),
        objectives: z.array(
          z.object({
            objectiveId: z.string(),
            activities: z.array(
              z.object({
                activityId: z.string(),
              })
            ),
          })
        ),
      })
    )
    .optional(),
  responsibleUserId: z.string().optional(),
});

type ProjectsForm = z.infer<typeof formSchema>;

export default function ProjectsMutateDrawer({ open, onOpenChange, currentRow }: Props) {
  const { mutate: createProject, isPending: isCreating } = useCreateProject();
  const { mutate: updateProject, isPending: isUpdating } = useUpdateProject();
  const { data: services, isLoading, error } = useServices();
  const { data: users, isPending: isLoadingUsers } = useUsersProject();
  const [selectedClient, setSelectedClient] = useState<AutocompleteItem | null>(null);
  const isUpdate = !!currentRow?.id;
  const isPending = isCreating || isUpdating;

  // Cast currentRow a ExtendedProjectResponse para acceder a services
  const extendedCurrentRow = currentRow as ProjectResponse | undefined;

  const form = useForm<ProjectsForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      typeContract: "",
      description: "",
      startDate: "",
      clientId: "",
      services: [],
      responsibleUserId: "",
    },
  });
  // Función para buscar clientes optimizada con debounce incorporado en el Autocomplete
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

  // Efecto para establecer el cliente seleccionado cuando se edita
  useEffect(() => {
    if (isUpdate && currentRow?.id && currentRow.client) {
      const client: AutocompleteItem = {
        id: currentRow.client.id,
        name: currentRow.client.name,
      };
      setSelectedClient(client);
    } else {
      setSelectedClient(null);
    }
  }, [isUpdate, currentRow]);

  const onSubmit = (data: ProjectsForm) => {
    if (isUpdate && currentRow?.id) {
      // Cuando actualizamos, omitimos los servicios explícitamente
      const { services: _, ...updateData } = data;
      // Utilizamos el tipo específico que no incluye servicios
      const projectToUpdate: UpdateProjectWithoutServices = updateData;

      updateProject(
        {
          id: currentRow.id,
          data: projectToUpdate,
        },
        {
          onSuccess: () => {
            onOpenChange(false);
            form.reset();
          },
        }
      );
    } else {
      createProject(data as CreateProject, {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
        },
      });
    }
  };

  useEffect(() => {
    if (isUpdate && extendedCurrentRow?.id) {
      form.reset({
        typeContract: extendedCurrentRow.typeContract || "",
        description: extendedCurrentRow.description || "",
        startDate: extendedCurrentRow.startDate || "",
        clientId: extendedCurrentRow.client?.id || "",
        services: [],
        responsibleUserId: "",
      });
    } else {
      form.reset({
        typeContract: "",
        description: "",
        startDate: "",
        clientId: "",
        services: [],
        responsibleUserId: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUpdate, extendedCurrentRow?.id]);

  useEffect(() => {
    if (!open) {
      form.reset({
        typeContract: "",
        description: "",
        startDate: "",
        clientId: "",
        services: [],
        responsibleUserId: "",
      });
    }
  }, [open, form]);

  // Determinar si hay errores en el formulario para los servicios
  const hasServiceErrors = form.formState.errors.services !== undefined;

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
      <SheetContent className="flex flex-col" width="sm:max-w-2xl">
        <SheetHeader className="text-left">
          <SheetTitle className="text-2xl font-bold capitalize">
            {isUpdate ? "Actualizar" : "Crear"} proyecto
          </SheetTitle>
          <SheetDescription>
            {isUpdate
              ? "Actualiza el proyecto proporcionando la información necesaria."
              : "Agrega un nuevo proyecto proporcionando la información necesaria."}{" "}
            Haz clic en guardar cuando hayas terminado.
          </SheetDescription>
        </SheetHeader>
        {isLoadingUsers ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
        ) : (
          <>
            <ScrollArea className="h-[calc(100vh-500px)] sm:h-[calc(100vh-250px)]">
              <Form {...form}>
                <form id="projects-form" onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-5 p-4">
                  <FormField
                    control={form.control}
                    name="clientId"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel>Buscar cliente</FormLabel>
                        <FormControl>
                          <Autocomplete
                            value={selectedClient}
                            onChange={(client) => {
                              setSelectedClient(client);
                              field.onChange(client ? client.id : "");
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
                  <FormField
                    control={form.control}
                    name="typeContract"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel>Tipo de contrato</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ingrese un tipo de contrato" disabled={isPending} />
                        </FormControl>
                        <FormDescription>El tipo de contrato es el nombre del proyecto.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="responsibleUserId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Responsable</FormLabel>
                        <FormControl>
                          <Autocomplete
                            value={
                              field.value
                                ? {
                                    id: field.value,
                                    label: users?.find((user) => user.id === field.value)?.fullName || "",
                                    value: field.value,
                                    name: users?.find((user) => user.id === field.value)?.fullName || "",
                                  }
                                : null
                            }
                            onChange={(value) => field.onChange(value?.id)}
                            placeholder="Buscar responsable por nombre, email o teléfono"
                            minChars={2}
                            onSearch={(query) => {
                              return Promise.resolve(
                                users
                                  ?.filter((user) => user.fullName.toLowerCase().includes(query.toLowerCase()))
                                  .map((user) => ({
                                    id: user.id,
                                    label: user.fullName,
                                    value: user.id,
                                    name: user.fullName,
                                  })) || []
                              );
                            }}
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="space-y-1 flex-1">
                        <FormLabel>Fecha de inicio</FormLabel>
                        <FormControl>
                          <DatePicker
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => {
                              const dateString = date ? date.toISOString() : "";
                              field.onChange(dateString);
                            }}
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {!isUpdate ? (
                    <>
                      {isLoading && (
                        <div className="flex items-center justify-center">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      )}
                      {error && <div className="text-red-500 text-sm">Error al cargar servicios: {error.message}</div>}
                      {services && (
                        <FormField
                          control={form.control}
                          name="services"
                          render={({ field }) => (
                            <FormItem className={`${hasServiceErrors ? "border-red-500 rounded-lg" : ""}`}>
                              <FormLabel>Servicios del proyecto</FormLabel>
                              <FormControl>
                                <TreeServices services={services} value={field.value} onChange={field.onChange} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-center">
                      <p className="text-sm text-muted-foreground">
                        Los servicios de un proyecto los puedes ver al seleccionar el proyecto.
                      </p>
                    </div>
                  )}
                </form>
              </Form>
            </ScrollArea>
            <SheetFooter className="gap-2">
              <Button form="projects-form" type="submit" disabled={isPending}>
                {isPending ? "Guardando..." : isUpdate ? "Actualizar" : "Crear"}
              </Button>
              <SheetClose asChild>
                <Button variant="outline" disabled={isPending}>
                  Cancelar
                </Button>
              </SheetClose>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
