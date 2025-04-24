"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { VisibilityState } from "@tanstack/react-table";
import { Check, FileDown, PlusCircle } from "lucide-react";

import { DataTable } from "@/shared/components/data-table/DataTable";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/shared/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Separator } from "@/shared/components/ui/separator";
import { cn } from "@/shared/lib/utils";
import {
  useDownloadAptitudeCertificate,
  useDownloadMedicalReport,
  useMedicalCategories,
  useMedicalRecords,
} from "../_hooks/useMedicalRecords";
import { MedicalRecordsFilter } from "../_types/medical-record.types";
import { useClinics } from "../../clinics/_hooks/useClinics";
import { columnsMedicalRecord } from "./medical-record.column";

// Componente de filtro simple
const SimpleFilterMenu = ({
  title,
  options,
  onSelect,
}: {
  title: string;
  options: { label: string; value: string }[];
  onSelect: (value: string | null) => void;
}) => {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircle className="mr-2 h-4 w-4" />
          {title}
          {selected && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <div className="hidden space-x-1 lg:flex">
                {options.find((option) => option.value === selected) && (
                  <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                    {options.find((option) => option.value === selected)?.label}
                  </Badge>
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={`Buscar ${title.toLowerCase()}...`} />
          <CommandList>
            <CommandEmpty>No se encontraron resultados.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selected === option.value;
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      const newValue = isSelected ? null : option.value;
                      setSelected(newValue);
                      onSelect(newValue);
                    }}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <Check className={cn("h-4 w-4")} />
                    </div>
                    <span>{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selected && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      setSelected(null);
                      onSelect(null);
                    }}
                    className="justify-center text-center"
                  >
                    Limpiar filtro
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default function MedicalRecordTable() {
  const router = useRouter();
  // Estado para almacenar los filtros seleccionados
  const [filters, setFilters] = useState<MedicalRecordsFilter>({});
  // Estado adicional para rastrear la categoría seleccionada (para filtrar condiciones)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const { data: medicalRecords, isLoading: isLoadingRecords, error: recordsError } = useMedicalRecords(filters);
  const { data: clinics, isLoading: isLoadingClinics, error: clinicsError } = useClinics();
  const { data: categories, isLoading: isLoadingCategories, error: categoriesError } = useMedicalCategories();

  // Estado para controlar la visibilidad de columnas
  // Las columnas 'category' y 'condition' deben estar presentes para el filtrado
  // pero no deben mostrarse en la tabla
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    category: false,
    condition: false,
  });

  // Debug logging
  useEffect(() => {
    // Log para verificar si hay cambios en los filtros
    console.log("🏷️ Filtros actuales:", JSON.stringify(filters, null, 2));

    if (filters.categoryId) {
      console.log(`🔍 Filtrando por categoría: ${filters.categoryId}`);
      // Buscar el nombre de la categoría si está disponible
      if (categories?.categories) {
        const category = categories.categories.find((c) => c.category.id === filters.categoryId);
        if (category) {
          console.log(`🔍 Nombre de la categoría: ${category.category.name}`);
        }
      }
    }

    if (filters.conditionId) {
      console.log(`🔍 Filtrando por condición: ${filters.conditionId}`);
      // Buscar el nombre de la condición si está disponible
      if (categories?.categories) {
        let conditionName = "";
        categories.categories.forEach((cat) => {
          const condition = cat.conditions.find((c) => c.id === filters.conditionId);
          if (condition) {
            conditionName = `${condition.name} (${cat.category.name})`;
          }
        });
        if (conditionName) {
          console.log(`🔍 Nombre de la condición: ${conditionName}`);
        }
      }
    }

    if (medicalRecords) {
      console.log(`📊 Registros médicos cargados: ${medicalRecords.length}`);

      // Check if any record has diagnostics
      const hasDiagnostics = medicalRecords.some(
        (record) => record.diagnostics && Array.isArray(record.diagnostics) && record.diagnostics.length > 0
      );

      if (hasDiagnostics) {
        console.log("📋 Algunos registros tienen diagnósticos");
        if (filters.categoryId || filters.conditionId) {
          console.log("🔍 Verificando filtrado de diagnósticos...");
        }
      } else {
        console.warn("⚠️ Ningún registro tiene diagnósticos");
      }
    }
  }, [medicalRecords, categories, filters]);

  // Mover los hooks de descarga al componente principal
  const { mutateAsync: downloadCertificate, isPending: isDownloadingCertificate } = useDownloadAptitudeCertificate();
  const { mutateAsync: downloadReport, isPending: isDownloadingReport } = useDownloadMedicalReport();

  const columns = useMemo(
    () =>
      columnsMedicalRecord({
        clinics: clinics || [],
        router,
        downloadCertificate,
        downloadReport,
        isDownloadingCertificate,
        isDownloadingReport,
      }),
    [clinics, router, downloadCertificate, downloadReport, isDownloadingCertificate, isDownloadingReport]
  );

  // Preparar opciones de filtro para categorías
  const filterCategoryOptions = useMemo(() => {
    if (!categories?.categories) return [];
    const options = categories.categories.map((cat) => ({
      label: cat.category.name,
      value: cat.category.id,
    }));
    console.log(`📋 Opciones de categorías disponibles: ${options.length}`);
    return options;
  }, [categories]);

  // Preparar opciones de filtro para condiciones médicas, filtradas por la categoría seleccionada
  const filterConditionOptions = useMemo(() => {
    if (!categories?.categories) return [];

    // Si hay una categoría seleccionada, solo mostrar condiciones de esa categoría
    if (selectedCategoryId) {
      const selectedCategory = categories.categories.find((cat) => cat.category.id === selectedCategoryId);

      if (selectedCategory) {
        console.log(
          `📋 Mostrando ${selectedCategory.conditions.length} condiciones para la categoría: ${selectedCategory.category.name}`
        );

        return selectedCategory.conditions.map((condition) => ({
          label: condition.name,
          value: condition.id,
        }));
      }
    }

    // Si no hay categoría seleccionada, mostrar todas las condiciones con su categoría
    const allConditions = categories.categories.flatMap((cat) =>
      cat.conditions.map((condition) => ({
        label: `${condition.name} (${cat.category.name})`,
        value: condition.id,
      }))
    );
    console.log(`📋 Opciones de condiciones disponibles: ${allConditions.length}`);
    return allConditions;
  }, [categories, selectedCategoryId]);

  // Manejar cambios en la visibilidad de columnas para asegurar que
  // las columnas de filtrado siempre estén disponibles (aunque ocultas)
  const handleColumnVisibilityChange = (value: VisibilityState | ((prev: VisibilityState) => VisibilityState)) => {
    setColumnVisibility((prevState) => {
      // Determinar el nuevo estado basado en el tipo de value
      const newState = typeof value === "function" ? value(prevState) : value;

      // Asegurarse de que category y condition siempre estén ocultos
      return {
        ...newState,
        category: false,
        condition: false,
      };
    });
  };

  // Manejar cambios en los filtros seleccionados
  const handleFilterChange = (filterKey: string, value: string | null) => {
    console.log(`🔄 Cambio de filtro simple: ${filterKey}`, value);

    if (filterKey === "category") {
      // Actualizar el estado de categoría seleccionada
      setSelectedCategoryId(value);

      // Si teníamos una condición seleccionada y cambiamos de categoría, limpiar la condición
      if (filters.conditionId && value !== filters.categoryId) {
        console.log(`🔄 Cambiando categoría, limpiando condición seleccionada: ${filters.conditionId}`);
        setFilters((prev) => {
          const newFilters = { ...prev };
          delete newFilters.conditionId;

          if (value) {
            // Actualizar la categoría
            console.log(`✅ Estableciendo filtro simple de categoría: ${value}`);
            newFilters.categoryId = value;
          } else {
            // Limpiar la categoría
            console.log(`❌ Eliminando filtro simple de categoría`);
            delete newFilters.categoryId;
          }

          return newFilters;
        });
      } else {
        // No teníamos condición, solo actualizar la categoría
        if (value) {
          console.log(`✅ Estableciendo filtro simple de categoría: ${value}`);
          setFilters((prev) => ({ ...prev, categoryId: value }));
        } else {
          console.log(`❌ Eliminando filtro simple de categoría`);
          setFilters((prev) => {
            const newFilters = { ...prev };
            delete newFilters.categoryId;
            return newFilters;
          });
        }
      }
    } else if (filterKey === "condition") {
      if (value) {
        console.log(`✅ Estableciendo filtro simple de condición: ${value}`);
        setFilters((prev) => ({ ...prev, conditionId: value }));
      } else {
        console.log(`❌ Eliminando filtro simple de condición`);
        setFilters((prev) => {
          const newFilters = { ...prev };
          delete newFilters.conditionId;
          return newFilters;
        });
      }
    }
  };

  if (recordsError || clinicsError || categoriesError)
    return <div className="text-center py-4">Error al cargar datos</div>;

  return (
    <div className="space-y-4">
      {/* Filtros personalizados */}
      <div className="flex items-center justify-between">
        <div className="flex gap-x-2">
          <SimpleFilterMenu
            title="Categoría Médica"
            options={filterCategoryOptions}
            onSelect={(value) => handleFilterChange("category", value)}
          />
          <SimpleFilterMenu
            title="Condición Médica"
            options={filterConditionOptions}
            onSelect={(value) => handleFilterChange("condition", value)}
          />
        </div>
        {/* Acciones existentes */}
        <Button variant="outline" size="sm" className="ml-auto h-8 lg:flex">
          <FileDown className="mr-2 h-4 w-4" /> Descargar
        </Button>
      </div>

      {/* La tabla sin los filtros integrados pero manteniendo la visibilidad de columnas */}
      <DataTable
        columns={columns}
        data={medicalRecords || []}
        isLoading={isLoadingRecords || isLoadingClinics || isLoadingCategories}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={handleColumnVisibilityChange}
      />
    </div>
  );
}
