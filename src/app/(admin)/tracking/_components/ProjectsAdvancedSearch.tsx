import { useCallback, useEffect, useRef, useState } from "react";
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

  // Referencia para almacenar el último estado de filtros y evitar renderizados innecesarios
  const lastAppliedFiltersRef = useRef<string>("");

  // Ref para controlar el debounce
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  // Función para generar los filtros aplicados basados en los valores actuales del formulario
  const updateFilters = useCallback(() => {
    // Limpiar cualquier timer pendiente
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Crear un nuevo timer con debounce
    debounceTimerRef.current = setTimeout(() => {
      const filters: string[] = [];
      const values = form.getValues();

      // Procesar cada filtro de forma segura
      const addFilter = (condition: boolean, filterText: string) => {
        if (condition) {
          filters.push(filterText);
        }
      };

      // Verificar si una fecha es válida
      const isValidDate = (dateStr?: string): boolean => {
        if (!dateStr) return false;
        try {
          const date = new Date(dateStr);
          return !isNaN(date.getTime());
        } catch {
          return false;
        }
      };

      // Formatear una fecha para mostrar
      const formatDate = (dateStr: string): string => {
        try {
          return new Date(dateStr).toLocaleDateString();
        } catch {
          return dateStr;
        }
      };

      // Agregar cada filtro solo si es válido
      addFilter(!!values.search, `Búsqueda: ${values.search}`);

      if (values.status) {
        const statusLabel = PROJECT_STATUS.find((s) => s.id === values.status)?.label;
        addFilter(!!statusLabel, `Estado: ${statusLabel}`);
      }

      addFilter(isValidDate(values.startDateFrom), `Desde: ${formatDate(values.startDateFrom!)}`);
      addFilter(isValidDate(values.startDateTo), `Hasta: ${formatDate(values.startDateTo!)}`);
      addFilter(isValidDate(values.endDateFrom), `Fin desde: ${formatDate(values.endDateFrom!)}`);
      addFilter(isValidDate(values.endDateTo), `Fin hasta: ${formatDate(values.endDateTo!)}`);

      addFilter(values.isActive === "false", "Inactivos");
      addFilter(!!values.clientId, `Cliente: ${values.clientId}`);

      // Convertir a JSON para comparación
      const newFiltersJSON = JSON.stringify(filters);

      // Solo actualizar si han cambiado los filtros
      if (newFiltersJSON !== lastAppliedFiltersRef.current) {
        lastAppliedFiltersRef.current = newFiltersJSON;
        setAppliedFilters(filters);
      }
    }, 150); // Pequeño debounce para evitar actualizaciones excesivas
  }, [form]);

  // Suscribirse a cambios en el formulario
  useEffect(() => {
    const subscription = form.watch(() => {
      updateFilters();
    });

    // Limpiar suscripción al desmontar
    return () => {
      subscription.unsubscribe();
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [form, updateFilters]);

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

  // Función para establecer la misma fecha en "desde" y "hasta"
  const setExactDateRange = (
    fieldNameFrom: "startDateFrom" | "endDateFrom",
    fieldNameTo: "startDateTo" | "endDateTo",
    date: string
  ) => {
    if (date) {
      form.setValue(fieldNameFrom, date, { shouldDirty: true });
      form.setValue(fieldNameTo, date, { shouldDirty: true });
    }
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
          <div className="flex-1">
            <FormField
              control={form.control}
              name="search"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por nombre o descripción..."
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
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={isOpen}
                className="rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <SlidersHorizontal className="mr-1 h-4 w-4" />
                Filtros avanzados
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-max p-0" align="start">
              <div className="p-4 pt-2">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Filtros avanzados</h4>
                    <p className="text-muted-foreground text-sm">
                      Aplica filtros adicionales para refinar tu búsqueda.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <FormLabel>Estado del proyecto</FormLabel>
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <Select value={field.value} onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar estado" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">Todos</SelectItem>
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

                  <div className="space-y-2">
                    <FormLabel>Mostrar proyectos inactivos</FormLabel>
                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center gap-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value === "false"}
                              onCheckedChange={(checked) => {
                                field.onChange(checked ? "false" : "true");
                              }}
                            />
                          </FormControl>
                          <div className="text-sm leading-none">Incluir proyectos inactivos</div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <FormLabel>Búsqueda por fechas</FormLabel>
                    <div className="text-xs text-muted-foreground mb-2">
                      <p>
                        Si seleccionas la misma fecha en "desde" y "hasta", se mostrarán proyectos que coincidan
                        exactamente con ese día.
                      </p>
                    </div>
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

                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Para búsqueda por día exacto:</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const today = new Date().toISOString().split("T")[0];
                        setExactDateRange("startDateFrom", "startDateTo", today);
                      }}
                    >
                      Usar fecha de hoy
                    </Button>
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

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-muted-foreground">Para búsqueda por día exacto:</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const today = new Date().toISOString().split("T")[0];
                        setExactDateRange("endDateFrom", "endDateTo", today);
                      }}
                    >
                      Usar fecha de hoy
                    </Button>
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

          <Button type="button" variant="outline" onClick={handleSimpleSearch}>
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
