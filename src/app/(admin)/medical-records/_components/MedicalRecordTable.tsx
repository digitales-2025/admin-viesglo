"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, FileDown, PlusCircle, X } from "lucide-react";

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
  selected,
  onSelected,
}: {
  title: string;
  options: { label: string; value: string }[];
  selected: string | null;
  onSelected: (value: string | null) => void;
}) => {
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
                      onSelected(newValue);
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
                      onSelected(null);
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
  const [selectedConditionId, setSelectedConditionId] = useState<string | null>(null);
  const { data: medicalRecords, isLoading: isLoadingRecords, error: recordsError } = useMedicalRecords(filters);
  const { data: clinics, isLoading: isLoadingClinics, error: clinicsError } = useClinics();
  const { data: categories, isLoading: isLoadingCategories, error: categoriesError } = useMedicalCategories();

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
        setSelectedConditionId(value);
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
    <DataTable
      columns={columns}
      data={medicalRecords || []}
      isLoading={isLoadingRecords || isLoadingClinics || isLoadingCategories}
      actions={
        <div className="flex items-center gap-x-2">
          <SimpleFilterMenu
            title="Categoría Médica"
            options={filterCategoryOptions}
            selected={selectedCategoryId}
            onSelected={(value) => handleFilterChange("category", value)}
          />
          <SimpleFilterMenu
            title="Condición Médica"
            options={filterConditionOptions}
            selected={selectedConditionId}
            onSelected={(value) => handleFilterChange("condition", value)}
          />
          {filters.categoryId || filters.conditionId ? (
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => {
                // Limpiar todos los filtros
                setFilters({});
                setSelectedCategoryId(null);
                setSelectedConditionId(null);
              }}
            >
              <X className="mr-2 h-4 w-4" /> Limpiar filtros
            </Button>
          ) : null}
          <Button variant="outline" size="sm" className="ml-auto h-8 lg:flex">
            <FileDown className="mr-2 h-4 w-4" /> Descargar
          </Button>
        </div>
      }
    />
  );
}
