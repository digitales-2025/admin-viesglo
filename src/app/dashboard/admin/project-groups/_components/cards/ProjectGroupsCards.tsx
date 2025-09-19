"use client";

import React from "react";
import { Check, ChevronsUpDown, MoreHorizontal, Plus } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { useProjectGroups } from "../../_hooks/use-project-groups";
import { ProjectGroupResponseDto } from "../../_types/project-groups.types";

// Opciones para los filtros
const STATUS_OPTIONS = [
  { value: "all", label: "Todos los estados" },
  { value: "activo", label: "Activo" },
  { value: "inactivo", label: "Inactivo" },
];

// Generar opciones de período dinámicamente (años 2022-2050, meses 01-02)
const generatePeriodOptions = () => {
  const options = [{ value: "all", label: "Todos los períodos" }];
  const startYear = 2022; // Año de inicio 2022
  const endYear = 2050;

  for (let year = startYear; year <= endYear; year++) {
    for (let month = 1; month <= 2; month++) {
      const value = `${year}-${month.toString().padStart(2, "0")}`;
      const label = `${year}-${month.toString().padStart(2, "0")}`;
      options.push({ value, label });
    }
  }

  return options;
};

const PERIOD_OPTIONS = generatePeriodOptions();

interface ProjectGroupsCardsProps {
  onCreateNew?: () => void;
  onEdit?: (projectGroup: ProjectGroupResponseDto) => void;
  onViewProjects?: (projectGroup: ProjectGroupResponseDto) => void;
  onDelete?: (projectGroup: ProjectGroupResponseDto) => void;
}

/**
 * Componente principal para mostrar grupos de proyectos en formato de tarjetas
 *
 * Funcionalidades:
 * - Vista de tarjetas con círculos de progreso
 * - Búsqueda en tiempo real (filtrado local)
 * - Carga progresiva de datos con botón "Cargar más"
 * - Acciones por tarjeta (ver proyectos, editar, eliminar)
 * - Filtros de estado y período con combobox
 */
export function ProjectGroupsCards({ onCreateNew, onEdit, onViewProjects, onDelete }: ProjectGroupsCardsProps) {
  const { query, setPagination, size } = useProjectGroups();
  const { data, isLoading, error } = query as any;

  // Estado local para el término de búsqueda (no dispara consultas al backend)
  const [localSearch, setLocalSearch] = React.useState<string>("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [periodFilter, setPeriodFilter] = React.useState<string>("all");
  const [statusOpen, setStatusOpen] = React.useState(false);
  const [periodOpen, setPeriodOpen] = React.useState(false);

  const handleChangeSearch = (value: string) => {
    setLocalSearch(value);
  };

  React.useEffect(() => {
    // Establecer un tamaño inicial moderado para evitar sobrecarga
    setPagination({ newPage: 1, newSize: 80 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Función para calcular el progreso basado en proyectos completados
  const calculateProgress = (projectGroup: ProjectGroupResponseDto) => {
    // Por ahora retornamos valores de ejemplo para mostrar el diseño
    // En el futuro esto se calculará basado en proyectos reales
    const progressMap: Record<string, number> = {
      "MIPYMES de calidad - 2023": 70,
      "Digitalización Empresarial - 2023": 8,
      "Innovación Abierta - 2024": 33,
      "Mercados Modernos - 2024": 50,
      "MIPYMES de calidad - 2025": 45,
      "Digitalización Empresarial - 2025": 12,
      "Fondo Empleo - 2025": 24,
      "PNIPA - 2025": 70,
      "Digitalización Empresarial - 2024": 14,
    };

    return progressMap[projectGroup.name] || 0;
  };

  // Función para obtener el color del círculo de progreso
  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 70) return "stroke-green-700";
    if (percentage >= 50) return "stroke-cyan-600";
    if (percentage >= 30) return "stroke-orange-500";
    return "stroke-red-600";
  };

  const projectGroups = data?.data || [];
  const normalizedFilter = localSearch.trim().toLowerCase();

  // Filtrado optimizado: solo recalcula cuando cambian los datos o los filtros
  const visibleProjectGroups = React.useMemo(() => {
    let filtered = projectGroups;

    // Filtro por grupos activos (isActive: true)
    const byActive = (pg: ProjectGroupResponseDto) => pg.isActive === true;
    filtered = filtered.filter(byActive);

    // Filtro por búsqueda de nombre
    if (normalizedFilter) {
      const byName = (pg: ProjectGroupResponseDto) => pg.name.toLowerCase().includes(normalizedFilter);
      filtered = filtered.filter(byName);
    }

    // Filtro por estado
    if (statusFilter !== "all") {
      const byStatus = (pg: ProjectGroupResponseDto) => pg.status === statusFilter;
      filtered = filtered.filter(byStatus);
    }

    // Filtro por período
    if (periodFilter !== "all") {
      const byPeriod = (pg: ProjectGroupResponseDto) => pg.period === periodFilter;
      filtered = filtered.filter(byPeriod);
    }

    return filtered;
  }, [projectGroups, normalizedFilter, statusFilter, periodFilter]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-destructive">Error al cargar los grupos de proyectos</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Grupos de Proyectos</h1>
            <p className="text-muted-foreground">Gestiona y organiza tus proyectos por grupos</p>
            <div className="mt-4 flex items-center gap-2">
              <input
                value={localSearch}
                onChange={(e) => handleChangeSearch(e.target.value)}
                placeholder="Buscar grupo de proyectos ..."
                className="h-9 w-full md:w-[360px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              {localSearch && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setLocalSearch("");
                  }}
                >
                  Limpiar
                </Button>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-4">
            <Button onClick={onCreateNew} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden lg:inline">Nuevo Grupo de Proyectos</span>
              <span className="lg:hidden">Nuevo Grupo</span>
            </Button>

            {/* Filtros posicionados debajo del botón a la derecha */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Popover open={statusOpen} onOpenChange={setStatusOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={statusOpen}
                      className="w-full sm:w-[160px] justify-between"
                    >
                      <span className="truncate">
                        {STATUS_OPTIONS.find((option) => option.value === statusFilter)?.label || "Estado"}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[160px] p-0">
                    <Command>
                      <CommandInput placeholder="Buscar estado..." />
                      <CommandList>
                        <CommandEmpty>No se encontraron estados.</CommandEmpty>
                        <CommandGroup>
                          {STATUS_OPTIONS.map((option) => (
                            <CommandItem
                              key={option.value}
                              value={option.value}
                              onSelect={(currentValue) => {
                                setStatusFilter(currentValue === statusFilter ? "all" : currentValue);
                                setStatusOpen(false);
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  statusFilter === option.value ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              {option.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                <Popover open={periodOpen} onOpenChange={setPeriodOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={periodOpen}
                      className="w-full sm:w-[160px] justify-between"
                    >
                      <span className="truncate">
                        {PERIOD_OPTIONS.find((option) => option.value === periodFilter)?.label || "Período"}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[160px] p-0">
                    <Command>
                      <CommandInput placeholder="Buscar período..." />
                      <CommandList>
                        <CommandEmpty>No se encontraron períodos.</CommandEmpty>
                        <CommandGroup>
                          {PERIOD_OPTIONS.map((option) => (
                            <CommandItem
                              key={option.value}
                              value={option.value}
                              onSelect={(currentValue) => {
                                setPeriodFilter(currentValue === periodFilter ? "all" : currentValue);
                                setPeriodOpen(false);
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  periodFilter === option.value ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              {option.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {(statusFilter !== "all" || periodFilter !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStatusFilter("all");
                    setPeriodFilter("all");
                  }}
                  className="w-full sm:w-auto"
                >
                  Limpiar filtros
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        {isLoading && !data ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="animate-pulse bg-card rounded-lg shadow-sm border border-border">
                <CardContent className="px-6">
                  <div className="h-5 bg-muted rounded mb-4"></div>
                  <div className="h-48 bg-muted rounded-full mb-4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {visibleProjectGroups.map((projectGroup: ProjectGroupResponseDto) => {
              const progress = calculateProgress(projectGroup);
              const circumference = 2 * Math.PI * 15.9155; // Radio del círculo
              const strokeDasharray = `${(progress / 100) * circumference} ${circumference}`;

              return (
                <Card
                  key={projectGroup.id}
                  className="bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-border"
                >
                  <CardContent className="px-6">
                    {/* Header con título y menú */}
                    <div className="flex items-start justify-between mb-6">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <h3 className="font-semibold text-md text-card-foreground truncate pr-2 cursor-help">
                            {projectGroup.name}
                          </h3>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs break-words">{projectGroup.name}</p>
                        </TooltipContent>
                      </Tooltip>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel className="font-bold">Acciones</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuGroup>
                            <DropdownMenuItem onClick={() => onViewProjects?.(projectGroup)}>
                              Ver Proyectos
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit?.(projectGroup)}>Editar</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDelete?.(projectGroup)}>Eliminar</DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Círculo de progreso centrado */}
                    <div className="flex justify-center mb-6">
                      <div className="relative w-52 h-52">
                        <svg className="w-52 h-52 transform -rotate-90" viewBox="0 0 36 36">
                          {/* Círculo de fondo */}
                          <path
                            className="stroke-gray-300"
                            strokeWidth="2.5"
                            fill="none"
                            d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          {/* Círculo de progreso */}
                          <path
                            className={getProgressBarColor(progress)}
                            strokeWidth="2.5"
                            fill="none"
                            strokeDasharray={strokeDasharray}
                            strokeLinecap="round"
                            d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        {/* Texto dentro del círculo */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className={`text-4xl font-bold text-foreground`}>{progress}%</span>
                          <span className="text-base text-muted-foreground font-medium">Completado</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Cargar más: aumenta el tamaño de página para traer más datos en una sola consulta */}
        {data && data.meta && data.meta.hasNext && (
          <div className="flex justify-center mt-2">
            <Button variant="secondary" onClick={() => setPagination({ newPage: 1, newSize: size + 40 })}>
              Cargar más
            </Button>
          </div>
        )}

        {/* Empty State */}
        {projectGroups.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Plus className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No hay grupos de proyectos</h3>
            <p className="text-muted-foreground mb-4">Comienza creando tu primer grupo de proyectos</p>
            <Button onClick={onCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Grupo de Proyectos
            </Button>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
