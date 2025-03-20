import { useCallback, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { DatePicker } from "@/shared/components/ui/date-picker";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { cn } from "@/shared/lib/utils";

const formSchema = z.object({
  search: z.string().optional(),
  status: z.array(z.string()).optional(),
  types: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  minBudget: z.coerce.number().optional(),
  maxBudget: z.coerce.number().optional(),
  location: z.string().optional(),
  sortBy: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const PROJECT_STATUS = [
  { id: "active", label: "Activo" },
  { id: "completed", label: "Completado" },
  { id: "pending", label: "Pendiente" },
  { id: "cancelled", label: "Cancelado" },
];

const PROJECT_TYPES = [
  { id: "design", label: "Diseño" },
  { id: "development", label: "Desarrollo" },
  { id: "consulting", label: "Consultoría" },
  { id: "maintenance", label: "Mantenimiento" },
];

const PROJECT_CATEGORIES = [
  { id: "web", label: "Web" },
  { id: "mobile", label: "Móvil" },
  { id: "desktop", label: "Escritorio" },
  { id: "infrastructure", label: "Infraestructura" },
];

const SORT_OPTIONS = [
  { id: "newest", label: "Más recientes" },
  { id: "oldest", label: "Más antiguos" },
  { id: "budget_high", label: "Mayor presupuesto" },
  { id: "budget_low", label: "Menor presupuesto" },
  { id: "name_asc", label: "Nombre (A-Z)" },
  { id: "name_desc", label: "Nombre (Z-A)" },
];

export interface ProjectsAdvancedSearchProps {
  onSearch: (filters: FormValues) => void;
  defaultValues?: FormValues;
  className?: string;
}

export function ProjectsAdvancedSearch({ onSearch, defaultValues, className }: ProjectsAdvancedSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<string[]>([]);

  const defaultFormValues = {
    search: "",
    status: [],
    types: [],
    categories: [],
    startDate: undefined,
    endDate: undefined,
    minBudget: undefined,
    maxBudget: undefined,
    location: "",
    sortBy: "newest",
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

    if (watchValues.status && watchValues.status.length > 0) {
      const statusLabels = PROJECT_STATUS.filter((s) => watchValues.status?.includes(s.id)).map((s) => s.label);
      filters.push(`Estado: ${statusLabels.join(", ")}`);
    }

    if (watchValues.types && watchValues.types.length > 0) {
      const typeLabels = PROJECT_TYPES.filter((t) => watchValues.types?.includes(t.id)).map((t) => t.label);
      filters.push(`Tipo: ${typeLabels.join(", ")}`);
    }

    if (watchValues.categories && watchValues.categories.length > 0) {
      const categoryLabels = PROJECT_CATEGORIES.filter((c) => watchValues.categories?.includes(c.id)).map(
        (c) => c.label
      );
      filters.push(`Categoría: ${categoryLabels.join(", ")}`);
    }

    if (watchValues.startDate) {
      filters.push(`Desde: ${new Date(watchValues.startDate).toLocaleDateString()}`);
    }

    if (watchValues.endDate) {
      filters.push(`Hasta: ${new Date(watchValues.endDate).toLocaleDateString()}`);
    }

    if (watchValues.minBudget) {
      filters.push(`Presupuesto mín: ${watchValues.minBudget}`);
    }

    if (watchValues.maxBudget) {
      filters.push(`Presupuesto máx: ${watchValues.maxBudget}`);
    }

    if (watchValues.location) {
      filters.push(`Ubicación: ${watchValues.location}`);
    }

    if (watchValues.sortBy && watchValues.sortBy !== defaultFormValues.sortBy) {
      const sortOption = SORT_OPTIONS.find((o) => o.id === watchValues.sortBy);
      if (sortOption) {
        filters.push(`Ordenar por: ${sortOption.label}`);
      }
    }

    setAppliedFilters(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultFormValues.sortBy]);

  // Usamos el useEffect para actualizar los filtros cuando cambian los valores observados
  useEffect(() => {
    updateFilters();
  }, [updateFilters]);

  const handleSearch = (values: FormValues) => {
    onSearch(values);
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
        form.setValue("status", [], { shouldDirty: true });
        break;
      case "Tipo":
        form.setValue("types", [], { shouldDirty: true });
        break;
      case "Categoría":
        form.setValue("categories", [], { shouldDirty: true });
        break;
      case "Desde":
        form.setValue("startDate", undefined, { shouldDirty: true });
        break;
      case "Hasta":
        form.setValue("endDate", undefined, { shouldDirty: true });
        break;
      case "Presupuesto mín":
        form.setValue("minBudget", undefined, { shouldDirty: true });
        break;
      case "Presupuesto máx":
        form.setValue("maxBudget", undefined, { shouldDirty: true });
        break;
      case "Ubicación":
        form.setValue("location", "", { shouldDirty: true });
        break;
      case "Ordenar por":
        form.setValue("sortBy", "newest", { shouldDirty: true });
        break;
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
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {PROJECT_STATUS.map((status) => (
                        <FormField
                          key={status.id}
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(status.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      field.onChange([...(field.value || []), status.id]);
                                    } else {
                                      field.onChange(field.value?.filter((value) => value !== status.id) || []);
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="cursor-pointer font-normal">{status.label}</FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <FormLabel htmlFor="types">Tipo de proyecto</FormLabel>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {PROJECT_TYPES.map((type) => (
                        <FormField
                          key={type.id}
                          control={form.control}
                          name="types"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(type.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      field.onChange([...(field.value || []), type.id]);
                                    } else {
                                      field.onChange(field.value?.filter((value) => value !== type.id) || []);
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="cursor-pointer font-normal">{type.label}</FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <FormLabel htmlFor="categories">Categoría</FormLabel>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {PROJECT_CATEGORIES.map((category) => (
                        <FormField
                          key={category.id}
                          control={form.control}
                          name="categories"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(category.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      field.onChange([...(field.value || []), category.id]);
                                    } else {
                                      field.onChange(field.value?.filter((value) => value !== category.id) || []);
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="cursor-pointer font-normal">{category.label}</FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <FormLabel>Fecha inicio</FormLabel>
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem className="mt-2">
                            <FormControl>
                              <DatePicker
                                selected={field.value}
                                onSelect={(day) => {
                                  field.onChange(day);
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <div>
                      <FormLabel>Fecha fin</FormLabel>
                      <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem className="mt-2">
                            <FormControl>
                              <DatePicker
                                selected={field.value}
                                onSelect={(day) => {
                                  field.onChange(day);
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <FormLabel htmlFor="minBudget">Presupuesto mín.</FormLabel>
                      <FormField
                        control={form.control}
                        name="minBudget"
                        render={({ field }) => (
                          <FormItem className="mt-2">
                            <FormControl>
                              <Input
                                id="minBudget"
                                type="number"
                                placeholder="Mínimo"
                                {...field}
                                onChange={(e) => {
                                  const value = e.target.value ? parseFloat(e.target.value) : undefined;
                                  field.onChange(value);
                                }}
                                value={field.value || ""}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <div>
                      <FormLabel htmlFor="maxBudget">Presupuesto máx.</FormLabel>
                      <FormField
                        control={form.control}
                        name="maxBudget"
                        render={({ field }) => (
                          <FormItem className="mt-2">
                            <FormControl>
                              <Input
                                id="maxBudget"
                                type="number"
                                placeholder="Máximo"
                                {...field}
                                onChange={(e) => {
                                  const value = e.target.value ? parseFloat(e.target.value) : undefined;
                                  field.onChange(value);
                                }}
                                value={field.value || ""}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <FormLabel htmlFor="location">Ubicación</FormLabel>
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem className="mt-2">
                          <FormControl>
                            <Input id="location" placeholder="Ubicación" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div>
                    <FormLabel htmlFor="sortBy">Ordenar por</FormLabel>
                    <FormField
                      control={form.control}
                      name="sortBy"
                      render={({ field }) => (
                        <FormItem className="mt-2">
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar orden" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {SORT_OPTIONS.map((option) => (
                                <SelectItem key={option.id} value={option.id}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
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
