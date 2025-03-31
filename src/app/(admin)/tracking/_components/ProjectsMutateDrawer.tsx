import { useCallback, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import Autocomplete, { AutocompleteItem } from "@/shared/components/ui/autocomplete";
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
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/shared/components/ui/sheet";
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

const formSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  description: z.string().optional(),
  typeContract: z.string().min(1, "El tipo de contrato es requerido."),
  typeProject: z.string().min(1, "El tipo de proyecto es requerido."),
  startDate: z.string().min(1, "La fecha de inicio es requerida."),
  endDate: z.string().min(1, "La fecha de fin es requerida."),
  status: z.string().min(1, "El estado es requerido."),
  clientId: z.string().min(1, "El cliente es requerido."),
  services: z.array(z.string()).optional(),
}) satisfies z.ZodType<CreateProject>;

type ProjectsForm = z.infer<typeof formSchema>;

export default function ProjectsMutateDrawer({ open, onOpenChange, currentRow }: Props) {
  const { mutate: createProject, isPending: isCreating } = useCreateProject();
  const { mutate: updateProject, isPending: isUpdating } = useUpdateProject();
  const { data: services, isLoading, error } = useServices();
  const [selectedClient, setSelectedClient] = useState<AutocompleteItem | null>(null);

  const isUpdate = !!currentRow?.id;
  const isPending = isCreating || isUpdating;

  const form = useForm<ProjectsForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      typeContract: "",
      typeProject: "",
      startDate: "",
      endDate: "",
      status: "",
      clientId: "",
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
    if (isUpdate && currentRow?.id) {
      form.reset({
        description: currentRow.description || "",
        typeContract: currentRow.typeContract,
        typeProject: currentRow.typeProject,
        startDate: currentRow.startDate,
        endDate: currentRow.endDate,
        status: currentRow.status,
        clientId: currentRow.client.id,
      });
    } else {
      form.reset({
        name: "",
        description: "",
        typeContract: "",
        typeProject: "",
        startDate: "",
        endDate: "",
        status: "",
        clientId: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUpdate, currentRow?.id]);

  useEffect(() => {
    if (!open) {
      form.reset({
        name: "",
        description: "",
        typeContract: "",
        typeProject: "",
        startDate: "",
      });
    }
  }, [open, form]);

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
                  <FormItem className="space-y-1">
                    <FormLabel>Fecha de inicio</FormLabel>
                    <FormControl>
                      <DatePicker
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={field.onChange}
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
              {error && <div>Error: {error.message}</div>}
              {services && (
                <FormField
                  control={form.control}
                  name="services"
                  render={({ field }) => <TreeServices services={services} onChange={field.onChange} />}
                />
              )}
            </form>
          </Form>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
