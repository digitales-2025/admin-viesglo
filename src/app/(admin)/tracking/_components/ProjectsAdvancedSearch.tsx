import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { DatePicker } from "@/shared/components/ui/date-picker";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { useIsMobile } from "@/shared/hooks/use-mobile";
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
  const isMobile = useIsMobile();

  // Referencia para almacenar el último estado de filtros y evitar renderizados innecesarios
  const lastAppliedFiltersRef = useRef<string>("");

  // Ref para controlar el debounce
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const defaultFormValues = useMemo(
    () => ({
      search: "",
      status: "all",
      typeProject: "",
      typeContract: "",
      startDateFrom: "",
      startDateTo: "",
      endDateFrom: "",
      endDateTo: "",
      clientId: "",
      isActive: "true",
      ...defaultValues,
    }),
    [defaultValues]
  );

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

      if (values.status && values.status !== "all") {
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

    // Si el status es "all", lo eliminamos para no enviarlo al backend
    if (apiFilters.status === "all") {
      apiFilters.status = "";
    }

    // Enviamos los filtros al componente padre
    onSearch(apiFilters);
    setIsOpen(false);
  };

  const handleSimpleSearch = () => {
    const values = form.getValues();

    // Si el status es "all", lo eliminamos para no enviarlo al backend
    if (values.status === "all") {
      values.status = "";
    }

    onSearch(values);
  };

  const removeFilter = (filter: string) => {
    const filterType = filter.split(":")[0].trim();

    switch (filterType) {
      case "Búsqueda":
        form.setValue("search", "", { shouldDirty: true });
        break;
      case "Estado":
        form.setValue("status", "all", { shouldDirty: true });
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
      const formValues = form.getValues();
      onSearch(formValues);
    }, 0);
  };

  const clearAllFilters = () => {
    form.reset(defaultFormValues);
    onSearch({
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
    });
  };

  // Función para manejar fechas de forma segura
  const safeDate = (dateStr: string | undefined) => {
    if (!dateStr) return undefined;
    try {
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? undefined : date;
    } catch {
      return undefined;
    }
  };

  return (
    <div className={cn("space-y-2 w-full", className)}>
      <Form {...form}>
        <div className="flex flex-col gap-2 w-full">
          <div className="w-full">
            <FormField
              control={form.control}
              name="search"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <div className="grid grid-cols-[1fr_auto_auto] gap-2 w-full">
                      <div className="relative w-full">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="search"
                          placeholder={isMobile ? "Buscar..." : "Buscar proyectos..."}
                          className={cn("w-full pl-8", appliedFilters.length > 0 && "rounded-b-none")}
                          {...field}
                        />
                      </div>
                      <div className="flex gap-2 w-full">
                        <Button
                          type="button"
                          variant="outline"
                          size={isMobile ? "icon" : "default"}
                          onClick={handleSimpleSearch}
                        >
                          <Search className="h-4 w-4 lg:hidden block" />
                          <span className="hidden lg:block">Buscar</span>
                        </Button>
                        <Popover open={isOpen} onOpenChange={setIsOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              size={isMobile ? "icon" : "default"}
                              className={cn(isOpen && "border-primary")}
                            >
                              <SlidersHorizontal className="h-4 w-4" />
                              {!isMobile && <span className="ml-2 lg:block hidden">Filtros</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent align="end" className="w-[calc(100vw-2rem)] sm:w-[400px] p-4">
                            <form onSubmit={form.handleSubmit(handleSearch)} className="grid gap-4">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                      <FormItem className="flex flex-col">
                                        <FormLabel>Estado</FormLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                          <FormControl>
                                            <SelectTrigger className="h-8 sm:h-9">
                                              <SelectValue placeholder="Selecciona un estado" />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            <SelectItem value="all">Todos</SelectItem>
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
                                  <FormField
                                    control={form.control}
                                    name="isActive"
                                    render={({ field }) => (
                                      <FormItem className="flex flex-col">
                                        <FormLabel>Estado activo</FormLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                          <FormControl>
                                            <SelectTrigger className="h-8 sm:h-9">
                                              <SelectValue placeholder="Selecciona un estado" />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            <SelectItem value="true">Activos</SelectItem>
                                            <SelectItem value="false">Inactivos</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <FormLabel>Fecha de inicio</FormLabel>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <FormField
                                    control={form.control}
                                    name="startDateFrom"
                                    render={({ field }) => (
                                      <FormItem className="flex flex-col">
                                        <DatePicker
                                          placeholder="Desde"
                                          selected={safeDate(field.value)}
                                          onSelect={(date) => {
                                            field.onChange(date ? date.toISOString() : "");
                                          }}
                                          className="h-8 sm:h-9"
                                        />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name="startDateTo"
                                    render={({ field }) => (
                                      <FormItem className="flex flex-col">
                                        <DatePicker
                                          placeholder="Hasta"
                                          selected={safeDate(field.value)}
                                          onSelect={(date) => {
                                            field.onChange(date ? date.toISOString() : "");
                                          }}
                                          className="h-8 sm:h-9"
                                        />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <FormLabel>Fecha de finalización</FormLabel>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <FormField
                                    control={form.control}
                                    name="endDateFrom"
                                    render={({ field }) => (
                                      <FormItem className="flex flex-col">
                                        <DatePicker
                                          placeholder="Desde"
                                          selected={safeDate(field.value)}
                                          onSelect={(date) => {
                                            field.onChange(date ? date.toISOString() : "");
                                          }}
                                          className="h-8 sm:h-9"
                                        />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name="endDateTo"
                                    render={({ field }) => (
                                      <FormItem className="flex flex-col">
                                        <DatePicker
                                          placeholder="Hasta"
                                          selected={safeDate(field.value)}
                                          onSelect={(date) => {
                                            field.onChange(date ? date.toISOString() : "");
                                          }}
                                          className="h-8 sm:h-9"
                                        />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={clearAllFilters}
                                  className="h-7 sm:h-8 text-xs"
                                >
                                  Limpiar filtros
                                </Button>
                                <Button type="submit" size="sm" className="h-7 sm:h-8 text-xs">
                                  Aplicar filtros
                                </Button>
                              </div>
                            </form>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
      </Form>

      {appliedFilters.length > 0 && (
        <div className="flex flex-wrap gap-1.5 rounded-b-md border-b border-l border-r p-1.5 shadow-sm">
          {appliedFilters.map((filter, index) => (
            <Badge
              key={`${filter}-${index}`}
              variant="secondary"
              className="flex items-center gap-1 text-xs h-6 max-w-full overflow-hidden"
            >
              <span className="truncate">{filter}</span>
              <Button
                type="button"
                variant="ghost"
                onClick={() => removeFilter(filter)}
                className="h-4 w-4 p-0 hover:bg-transparent flex-shrink-0"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Eliminar {filter}</span>
              </Button>
            </Badge>
          ))}
          {appliedFilters.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="ml-auto h-6 text-xs whitespace-nowrap"
            >
              Limpiar todos
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
