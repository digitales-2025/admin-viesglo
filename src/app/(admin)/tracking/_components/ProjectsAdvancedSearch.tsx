import { useCallback, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { cn } from "@/shared/lib/utils";

// Interfaz que coincide con ProjectFilters
export interface ProjectFilterValues {
  search?: string;
  status?: string;
  typeProject?: string;
  typeContract?: string;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  clientId?: string;
  isActive?: string;
}

const formSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  typeProject: z.string().optional(),
  typeContract: z.string().optional(),
  startDateFrom: z.string().optional(),
  startDateTo: z.string().optional(),
  endDateFrom: z.string().optional(),
  endDateTo: z.string().optional(),
  clientId: z.string().optional(),
  isActive: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const PROJECT_STATUS = [
  { id: "active", label: "Activo" },
  { id: "completed", label: "Completado" },
  { id: "pending", label: "Pendiente" },
  { id: "cancelled", label: "Cancelado" },
];

export interface ProjectsAdvancedSearchProps {
  onSearch: (filters: ProjectFilterValues) => void;
  defaultValues?: ProjectFilterValues;
  className?: string;
}

export function ProjectsAdvancedSearch({ onSearch, defaultValues, className }: ProjectsAdvancedSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<string[]>([]);

  const defaultFormValues: FormValues = {
    search: "",
    status: "",
    typeProject: "",
    typeContract: "",
    startDateFrom: "",
    startDateTo: "",
    endDateFrom: "",
    endDateTo: "",
    clientId: "",
    isActive: "true",
    ...defaultValues,
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultFormValues,
  });

  const watchValues = form.watch();

  // Memoizamos la función updateFilters para evitar recrearla en cada renderizado
  const updateFilters = useCallback(() => {
    const filters: string[] = [];

    if (watchValues.search) {
      filters.push(`Búsqueda: ${watchValues.search}`);
    }

    if (watchValues.status) {
      const statusLabel = PROJECT_STATUS.find((s) => s.id === watchValues.status)?.label;
      if (statusLabel) {
        filters.push(`Estado: ${statusLabel}`);
      }
    }

    if (watchValues.startDateFrom) {
      filters.push(`Desde: ${new Date(watchValues.startDateFrom).toLocaleDateString()}`);
    }

    if (watchValues.startDateTo) {
      filters.push(`Hasta: ${new Date(watchValues.startDateTo).toLocaleDateString()}`);
    }

    if (watchValues.endDateFrom) {
      filters.push(`Fin desde: ${new Date(watchValues.endDateFrom).toLocaleDateString()}`);
    }

    if (watchValues.endDateTo) {
      filters.push(`Fin hasta: ${new Date(watchValues.endDateTo).toLocaleDateString()}`);
    }

    if (watchValues.isActive === "false") {
      filters.push("Inactivos");
    }

    if (watchValues.clientId) {
      filters.push(`Cliente: ${watchValues.clientId}`);
    }

    setAppliedFilters(filters);
  }, []);

  // Usamos el useEffect para actualizar los filtros cuando cambian los valores observados
  useEffect(() => {
    updateFilters();
  }, [updateFilters]);

  const handleSearch = (values: FormValues) => {
    // Convertimos los valores a los filtros esperados por la API
    const apiFilters: ProjectFilterValues = { ...values };

    // Enviamos los filtros al componente padre
    onSearch(apiFilters);
    setIsOpen(false);
  };

  const handleSimpleSearch = () => {
    onSearch(form.getValues());
  };

  const removeFilter = (filter: string) => {
    const filterType = filter.split(":")[0].trim();

    switch (filterType) {
      case "Búsqueda":
        form.setValue("search", "", { shouldDirty: true });
        break;
      case "Estado":
        form.setValue("status", "", { shouldDirty: true });
        break;
      case "Tipo":
        form.setValue("typeProject", "", { shouldDirty: true });
        break;
      case "Contrato":
        form.setValue("typeContract", "", { shouldDirty: true });
        break;
      case "Desde":
        form.setValue("startDateFrom", "", { shouldDirty: true });
        break;
      case "Hasta":
        form.setValue("startDateTo", "", { shouldDirty: true });
        break;
      case "Fin desde":
        form.setValue("endDateFrom", "", { shouldDirty: true });
        break;
      case "Fin hasta":
        form.setValue("endDateTo", "", { shouldDirty: true });
        break;
      case "Cliente":
        form.setValue("clientId", "", { shouldDirty: true });
        break;
    }

    if (filter === "Inactivos") {
      form.setValue("isActive", "true", { shouldDirty: true });
    }

    // Después de actualizar el form, ejecutamos la búsqueda con los nuevos valores
    setTimeout(() => {
      onSearch(form.getValues());
    }, 0);
  };

  const clearAllFilters = () => {
    // Resetear el formulario a los valores predeterminados
    form.reset(defaultFormValues);

    // Limpiar los filtros aplicados
    setAppliedFilters([]);

    // Ejecutar la búsqueda con los valores predeterminados
    setTimeout(() => {
      onSearch(defaultFormValues);
    }, 0);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Form {...form}>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <FormField
              control={form.control}
              name="search"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar proyectos..."
                        className="pl-8"
                        {...field}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleSimpleSearch();
                          }
                        }}
                      />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2" aria-label="Filtros avanzados">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Filtros</span>
                {appliedFilters.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1">
                    {appliedFilters.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[340px] sm:w-[400px] p-4">
              <div className="space-y-4">
                <h3 className="font-medium">Filtros avanzados</h3>

                <div className="space-y-4">
                  <div>
                    <FormLabel htmlFor="status">Estado</FormLabel>
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem className="mt-2">
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar estado" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="hola">Todos</SelectItem>
                              {PROJECT_STATUS.map((status) => (
                                <SelectItem key={status.id} value={status.id}>
                                  {status.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div>
                    <FormLabel htmlFor="isActive">Estado activo</FormLabel>
                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0 mt-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value === "true"}
                              onCheckedChange={(checked) => {
                                field.onChange(checked ? "true" : "false");
                              }}
                            />
                          </FormControl>
                          <FormLabel className="cursor-pointer font-normal">Mostrar solo proyectos activos</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <FormLabel>Fecha inicio (desde)</FormLabel>
                      <FormField
                        control={form.control}
                        name="startDateFrom"
                        render={({ field }) => (
                          <FormItem className="mt-2">
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <div>
                      <FormLabel>Fecha inicio (hasta)</FormLabel>
                      <FormField
                        control={form.control}
                        name="startDateTo"
                        render={({ field }) => (
                          <FormItem className="mt-2">
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <FormLabel>Fecha fin (desde)</FormLabel>
                      <FormField
                        control={form.control}
                        name="endDateFrom"
                        render={({ field }) => (
                          <FormItem className="mt-2">
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <div>
                      <FormLabel>Fecha fin (hasta)</FormLabel>
                      <FormField
                        control={form.control}
                        name="endDateTo"
                        render={({ field }) => (
                          <FormItem className="mt-2">
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <Button variant="outline" type="button" onClick={clearAllFilters} size="sm">
                      Limpiar filtros
                    </Button>
                    <Button type="button" onClick={() => handleSearch(form.getValues())} size="sm">
                      Aplicar filtros
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button type="button" onClick={handleSimpleSearch}>
            Buscar
          </Button>
        </div>
      </Form>

      {appliedFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {appliedFilters.map((filter) => (
            <Badge key={filter} variant="secondary" className="flex items-center gap-1 px-3 py-1">
              {filter}
              <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter(filter)} />
            </Badge>
          ))}
          {appliedFilters.length > 1 && (
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={clearAllFilters}>
              Limpiar todos
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
