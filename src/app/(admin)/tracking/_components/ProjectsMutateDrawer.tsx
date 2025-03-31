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
} from "@/shared/components/ui/sheet";
import { useCreateProject, useUpdateProject } from "../_hooks/useProject";
import { CreateProject, ProjectResponse } from "../_types/tracking.types";
import { searchClients } from "../../clients/_actions/clients.actions";
import { useServices } from "../../services/_hooks/useServices";
import TreeServices from "./TreeServices";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow?: ProjectResponse;
}

// Ampliar el tipo ProjectResponse para incluir servicios
interface ExtendedProjectResponse extends ProjectResponse {
  name?: string;
  services?: Array<{ id: string; name?: string }>;
}

const formSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  typeContract: z.string().min(1, "El tipo de contrato es requerido."),
  startDate: z.string().optional(),
  clientId: z.string().min(1, "El cliente es requerido."),
  services: z.array(z.string()).min(1, "Debe seleccionar al menos un servicio."),
}) satisfies z.ZodType<CreateProject>;

type ProjectsForm = z.infer<typeof formSchema>;

// Tipo para el estado de selección en TreeServices
interface SelectionState {
  services: Set<string>;
  objectives: Set<string>;
  activities: Set<string>;
}

// Tipo para la estructura de datos del TreeServices
interface TreeServiceData {
  id: string;
  name: string;
  objectives?: Array<{
    id: string;
    name: string;
    activities: Array<{
      id: string;
      name: string;
    }>;
  }>;
}

export default function ProjectsMutateDrawer({ open, onOpenChange, currentRow }: Props) {
  const { mutate: createProject, isPending: isCreating } = useCreateProject();
  const { mutate: updateProject, isPending: isUpdating } = useUpdateProject();
  const { data: services, isLoading, error } = useServices();
  const [selectedClient, setSelectedClient] = useState<AutocompleteItem | null>(null);

  // Estado para manejar las selecciones del árbol de servicios
  const [selectionState, setSelectionState] = useState<SelectionState>({
    services: new Set<string>(),
    objectives: new Set<string>(),
    activities: new Set<string>(),
  });

  const isUpdate = !!currentRow?.id;
  const isPending = isCreating || isUpdating;

  // Cast currentRow a ExtendedProjectResponse para acceder a services
  const extendedCurrentRow = currentRow as ExtendedProjectResponse | undefined;

  const form = useForm<ProjectsForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      typeContract: "",
      startDate: "",
      clientId: "",
      services: [],
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

  // Procesador para convertir la estructura anidada del TreeServices a un array de IDs
  const processTreeSelection = useCallback((treeData: TreeServiceData[]) => {
    // Extraer solo los IDs de los servicios seleccionados
    const serviceIds = treeData.map((service) => service.id);
    return serviceIds;
  }, []);

  // Manejador de cambios del TreeServices
  const handleServicesChange = useCallback(
    (treeData: TreeServiceData[]) => {
      // Procesar la estructura del árbol para obtener solo los IDs
      const serviceIds = processTreeSelection(treeData);

      // Actualizar el formulario con los IDs de servicios
      form.setValue("services", serviceIds, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });

      // También almacenar el estado completo de selección si es necesario
      if (treeData && treeData.length > 0) {
        // Extraer los conjuntos de IDs de servicios, objetivos y actividades
        const servicesSet = new Set<string>(serviceIds);
        const objectivesSet = new Set<string>();
        const activitiesSet = new Set<string>();

        // Recorrer la estructura para extraer objetivos y actividades
        treeData.forEach((service) => {
          (service.objectives || []).forEach((objective) => {
            objectivesSet.add(objective.id);

            (objective.activities || []).forEach((activity) => {
              activitiesSet.add(activity.id);
            });
          });
        });

        setSelectionState({
          services: servicesSet,
          objectives: objectivesSet,
          activities: activitiesSet,
        });
      } else {
        // Resetear el estado si no hay selecciones
        setSelectionState({
          services: new Set<string>(),
          objectives: new Set<string>(),
          activities: new Set<string>(),
        });
      }
    },
    [form, processTreeSelection]
  );

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

  // Inicializar el estado de selección desde los servicios actuales del proyecto
  useEffect(() => {
    if (isUpdate && extendedCurrentRow?.id && extendedCurrentRow.services && services) {
      // Mapear los IDs de los servicios del proyecto actual
      const projectServiceIds = extendedCurrentRow.services.map((service) => service.id);

      // Actualizar el formulario con los IDs
      form.setValue("services", projectServiceIds, { shouldValidate: true });

      // También actualizar el estado de selección para el TreeServices
      const servicesSet = new Set<string>(projectServiceIds);

      // Aquí deberías reconstruir también los sets de objetivos y actividades
      // basándote en los servicios seleccionados, pero necesitarías
      // más información de la estructura completa

      setSelectionState({
        services: servicesSet,
        objectives: new Set<string>(),
        activities: new Set<string>(),
      });
    }
  }, [isUpdate, extendedCurrentRow, services, form]);

  const onSubmit = (data: ProjectsForm) => {
    if (isUpdate && currentRow?.id) {
      updateProject(
        { id: currentRow.id, data },
        {
          onSuccess: () => {
            onOpenChange(false);
            form.reset();
          },
        }
      );
    } else {
      createProject(data, {
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
        name: extendedCurrentRow.name || "",
        typeContract: extendedCurrentRow.typeContract || "",
        startDate: extendedCurrentRow.startDate || "",
        clientId: extendedCurrentRow.client?.id || "",
        services: extendedCurrentRow.services?.map((s) => s.id) || [],
      });
    } else {
      form.reset({
        name: "",
        typeContract: "",
        startDate: "",
        clientId: "",
        services: [],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUpdate, extendedCurrentRow?.id]);

  useEffect(() => {
    if (!open) {
      form.reset({
        name: "",
        typeContract: "",
        startDate: "",
        clientId: "",
        services: [],
      });

      // Resetear también el estado de selección
      setSelectionState({
        services: new Set<string>(),
        objectives: new Set<string>(),
        activities: new Set<string>(),
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
        <ScrollArea className="h-[calc(100vh-250px)]">
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
                    <FormDescription>
                      El tipo de contrato es el tipo de contrato que se le otorga al proyecto.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ingrese un nombre" disabled={isPending} />
                    </FormControl>
                    <FormDescription>El nombre es el nombre del proyecto.</FormDescription>
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
                  render={({}) => (
                    <FormItem className={`${hasServiceErrors ? "border-red-500 rounded-lg" : ""}`}>
                      <FormControl>
                        <TreeServices
                          services={services}
                          onChange={handleServicesChange}
                          initialSelection={selectionState}
                        />
                      </FormControl>
                      <FormMessage className="mt-2" />
                    </FormItem>
                  )}
                />
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
      </SheetContent>
    </Sheet>
  );
}
