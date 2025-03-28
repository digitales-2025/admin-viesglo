"use client";

import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, CheckSquare, ChevronDown, ChevronDownSquare, ChevronRight, Folder, Search, X } from "lucide-react";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";
import { ActivityResponse, ObjectiveResponse, ServiceResponse } from "../../services/_types/services.types";

const initialServices: ServiceResponse[] = [];

// Tipos para las selecciones
type SelectionState = {
  services: Set<string>;
  objectives: Set<string>;
  activities: Set<string>;
};

// Props para el componente
interface TreeServicesProps {
  services: ServiceResponse[];
  onChange: (selection: any) => void;
  initialSelection?: SelectionState;
}

export default function TreeServices({ services: externalServices, onChange, initialSelection }: TreeServicesProps) {
  // Usar datos externos si están disponibles, o usar los de muestra si no
  const [services] = useState<ServiceResponse[]>(externalServices || initialServices);
  const [expandedServices, setExpandedServices] = useState<Set<string>>(new Set());
  const [expandedObjectives, setExpandedObjectives] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");

  // Track selected items
  const [selectedServices, setSelectedServices] = useState<Set<string>>(initialSelection?.services || new Set());
  const [selectedObjectives, setSelectedObjectives] = useState<Set<string>>(initialSelection?.objectives || new Set());
  const [selectedActivities, setSelectedActivities] = useState<Set<string>>(initialSelection?.activities || new Set());

  // Helpers
  const setsAreEqual = useCallback((a: Set<string>, b: Set<string>) => {
    if (a.size !== b.size) return false;
    for (const item of a) {
      if (!b.has(item)) return false;
    }
    return true;
  }, []);

  // Memoized counts
  const stats = useMemo(() => {
    return {
      selectedServicesCount: selectedServices.size,
      selectedObjectivesCount: selectedObjectives.size,
      selectedActivitiesCount: selectedActivities.size,
      totalSelectedCount: selectedServices.size + selectedObjectives.size + selectedActivities.size,
    };
  }, [selectedServices, selectedObjectives, selectedActivities]);

  // Filtrado de servicios memoizado
  const filteredServices = useMemo(() => {
    if (!searchTerm.trim()) {
      return services;
    }

    const searchTermLower = searchTerm.toLowerCase();

    const filtered = services
      .map((service) => {
        // Check if service name matches
        const serviceMatches = service.name.toLowerCase().includes(searchTermLower);

        // Filter objectives
        const filteredObjectives = (service.objectives ?? []).filter((objective) => {
          // Check if objective name matches
          const objectiveMatches = objective.name.toLowerCase().includes(searchTermLower);

          // Filter activities
          const filteredActivities = objective.activities.filter((activity) =>
            activity.name.toLowerCase().includes(searchTermLower)
          );

          // If any activities match, include this objective
          return objectiveMatches || filteredActivities.length > 0;
        });

        // Include this service if it matches or has matching objectives
        if (serviceMatches || filteredObjectives.length > 0) {
          return {
            ...service,
            objectives: filteredObjectives,
          };
        }

        return null;
      })
      .filter(Boolean) as ServiceResponse[];

    // Auto-expand matched items
    if (searchTerm.trim()) {
      const newExpandedServices = new Set(expandedServices);
      const newExpandedObjectives = new Set(expandedObjectives);

      filtered.forEach((service) => {
        newExpandedServices.add(service.id);
        (service.objectives ?? []).forEach((objective) => {
          newExpandedObjectives.add(objective.id);
        });
      });

      // Solo actualizar si hay cambios para evitar re-renders innecesarios
      if (!setsAreEqual(newExpandedServices, expandedServices)) {
        setExpandedServices(newExpandedServices);
      }

      if (!setsAreEqual(newExpandedObjectives, expandedObjectives)) {
        setExpandedObjectives(newExpandedObjectives);
      }
    }

    return filtered;
  }, [searchTerm, services, expandedServices, expandedObjectives, setsAreEqual]);

  // Toggle service expansion
  const toggleService = useCallback((serviceId: string) => {
    setExpandedServices((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(serviceId)) {
        newExpanded.delete(serviceId);
      } else {
        newExpanded.add(serviceId);
      }
      return newExpanded;
    });
  }, []);

  // Toggle objective expansion
  const toggleObjective = useCallback((objectiveId: string) => {
    setExpandedObjectives((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(objectiveId)) {
        newExpanded.delete(objectiveId);
      } else {
        newExpanded.add(objectiveId);
      }
      return newExpanded;
    });
  }, []);

  // Expand all folders
  const expandAll = useCallback(() => {
    const allServices = new Set<string>();
    const allObjectives = new Set<string>();

    services.forEach((service) => {
      allServices.add(service.id);
      (service.objectives ?? []).forEach((objective) => {
        allObjectives.add(objective.id);
      });
    });

    setExpandedServices(allServices);
    setExpandedObjectives(allObjectives);
  }, [services]);

  // Collapse all folders
  const collapseAll = useCallback(() => {
    setExpandedServices(new Set());
    setExpandedObjectives(new Set());
  }, []);

  // Clear all selections
  const clearSelections = useCallback(() => {
    setSelectedServices(new Set());
    setSelectedObjectives(new Set());
    setSelectedActivities(new Set());

    // Notificar cambio si hay un callback
    if (onChange) {
      onChange([]);
    }
  }, [onChange]);

  // Toggle activity selection
  const toggleActivitySelection = useCallback(
    (serviceId: string, objectiveId: string, activityId: string, e?: React.MouseEvent) => {
      if (e) e.stopPropagation();

      setSelectedActivities((prev) => {
        const newSelected = new Set(prev);
        if (newSelected.has(activityId)) {
          newSelected.delete(activityId);
        } else {
          newSelected.add(activityId);

          // Cuando seleccionamos una actividad, seleccionamos automáticamente sus padres
          setSelectedServices((prev) => new Set(prev).add(serviceId));
          setSelectedObjectives((prev) => new Set(prev).add(objectiveId));
        }
        return newSelected;
      });

      // Notificar el cambio después de que se actualice el estado
      setTimeout(() => {
        if (onChange) {
          onChange(getSelectionStructure());
        }
      }, 0);
    },
    []
  );

  // Toggle objective selection
  const toggleObjectiveSelection = useCallback(
    (serviceId: string, objectiveId: string, e?: React.MouseEvent) => {
      if (e) e.stopPropagation();

      let shouldUpdateActivities = false;
      let newActivities = new Set<string>();

      setSelectedObjectives((prev) => {
        const newSelected = new Set(prev);
        if (newSelected.has(objectiveId)) {
          newSelected.delete(objectiveId);

          // Si deseleccionamos un objetivo, deseleccionamos sus actividades
          shouldUpdateActivities = true;
          newActivities = new Set(selectedActivities);
          services.forEach((service) => {
            if (service.id === serviceId) {
              (service.objectives ?? []).forEach((objective) => {
                if (objective.id === objectiveId) {
                  objective.activities.forEach((activity) => {
                    newActivities.delete(activity.id);
                  });
                }
              });
            }
          });
        } else {
          newSelected.add(objectiveId);

          // Cuando seleccionamos un objetivo, seleccionamos automáticamente su servicio padre
          setSelectedServices((prev) => new Set(prev).add(serviceId));
        }
        return newSelected;
      });

      // Actualizar actividades si es necesario
      if (shouldUpdateActivities) {
        setSelectedActivities(newActivities);
      }

      // Auto-expand when selecting an objective
      if (!expandedObjectives.has(objectiveId)) {
        setExpandedObjectives((prev) => new Set(prev).add(objectiveId));
      }

      // Notificar el cambio después de que se actualice el estado
      setTimeout(() => {
        if (onChange) {
          onChange(getSelectionStructure());
        }
      }, 0);
    },
    [expandedObjectives, selectedActivities, services]
  );

  // Toggle service selection
  const toggleServiceSelection = useCallback(
    (serviceId: string, e?: React.MouseEvent) => {
      if (e) e.stopPropagation();

      let shouldUpdateChildren = false;
      let newObjectives = new Set<string>();
      let newActivities = new Set<string>();

      setSelectedServices((prev) => {
        const newSelected = new Set(prev);
        if (newSelected.has(serviceId)) {
          newSelected.delete(serviceId);

          // Si deseleccionamos un servicio, deseleccionamos sus objetivos y actividades
          shouldUpdateChildren = true;
          newObjectives = new Set(selectedObjectives);
          newActivities = new Set(selectedActivities);

          services.forEach((service) => {
            if (service.id === serviceId) {
              (service.objectives ?? []).forEach((objective) => {
                newObjectives.delete(objective.id);
                objective.activities.forEach((activity) => {
                  newActivities.delete(activity.id);
                });
              });
            }
          });
        } else {
          newSelected.add(serviceId);
        }
        return newSelected;
      });

      // Actualizar hijos si es necesario
      if (shouldUpdateChildren) {
        setSelectedObjectives(newObjectives);
        setSelectedActivities(newActivities);
      }

      // Auto-expand when selecting a service
      if (!expandedServices.has(serviceId)) {
        setExpandedServices((prev) => new Set(prev).add(serviceId));
      }

      // Notificar el cambio después de que se actualice el estado
      setTimeout(() => {
        if (onChange) {
          onChange(getSelectionStructure());
        }
      }, 0);
    },
    [expandedServices, selectedObjectives, selectedActivities, services, onChange]
  );

  // Get the current selection structure
  const getSelectionStructure = useCallback(() => {
    const result: any[] = [];

    services.forEach((service) => {
      if (selectedServices.has(service.id)) {
        const serviceObj = {
          id: service.id,
          name: service.name,
          objectives: [] as any[],
        };

        // Add objectives if any are selected
        (service.objectives ?? []).forEach((objective) => {
          if (selectedObjectives.has(objective.id)) {
            const objectiveObj = {
              id: objective.id,
              name: objective.name,
              activities: [] as any[],
            };

            // Add activities if any are selected
            objective.activities.forEach((activity) => {
              if (selectedActivities.has(activity.id)) {
                objectiveObj.activities.push({
                  id: activity.id,
                  name: activity.name,
                });
              }
            });

            serviceObj.objectives.push(objectiveObj);
          }
        });

        result.push(serviceObj);
      }
    });

    return result;
  }, [services, selectedServices, selectedObjectives, selectedActivities]);

  // Componentes memoizados para evitar re-renders
  const SearchBar = useMemo(
    () => (
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm("")} className="absolute right-2 top-2.5">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>
    ),
    [searchTerm]
  );

  const ToolbarButtons = useMemo(
    () => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" variant="outline" size="sm" onClick={expandAll}>
              <ChevronDownSquare className="h-4 w-4 mr-1" />
              Expandir
            </Button>
          </TooltipTrigger>
          <TooltipContent>Expandir todos los niveles</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" variant="outline" size="sm" onClick={collapseAll}>
              <ChevronRight className="h-4 w-4 mr-1" />
              Contraer
            </Button>
          </TooltipTrigger>
          <TooltipContent>Contraer todos los niveles</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" variant="outline" size="sm" onClick={clearSelections}>
              <X className="h-4 w-4 mr-1" />
              Limpiar
            </Button>
          </TooltipTrigger>
          <TooltipContent>Limpiar todas las selecciones</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
    [expandAll, collapseAll, clearSelections]
  );

  // Renderizado optimizado de actividades
  const renderActivity = useCallback(
    (service: ServiceResponse, objective: ObjectiveResponse, activity: ActivityResponse) => (
      <div
        key={activity.id}
        className={cn(
          "flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent transition-colors ml-4",
          selectedActivities.has(activity.id) && "bg-accent/40"
        )}
        onClick={(e) => toggleActivitySelection(service.id, objective.id, activity.id, e)}
      >
        <button
          type="button"
          className={cn(
            "flex items-center justify-center w-5 h-5 border rounded transition-colors",
            selectedActivities.has(activity.id) && "bg-primary border-primary"
          )}
          onClick={(e) => toggleActivitySelection(service.id, objective.id, activity.id, e)}
        >
          {selectedActivities.has(activity.id) ? <Check size={14} className="text-primary-foreground" /> : null}
        </button>
        <Folder size={18} className="text-green-500" />
        <span className="flex-1">{activity.name}</span>
      </div>
    ),
    [selectedActivities, toggleActivitySelection]
  );

  // Renderizado optimizado de objetivos
  const renderObjective = useCallback(
    (service: ServiceResponse, objective: ObjectiveResponse) => (
      <div key={objective.id} className="space-y-1 mt-1">
        <div
          className={cn(
            "flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent transition-colors",
            selectedObjectives.has(objective.id) && "bg-accent/40"
          )}
          onClick={() => toggleObjective(objective.id)}
        >
          <button
            type="button"
            className="p-1 rounded-full hover:bg-muted"
            onClick={(e) => {
              e.stopPropagation();
              toggleObjective(objective.id);
            }}
          >
            {expandedObjectives.has(objective.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          <button
            type="button"
            className={cn(
              "flex items-center justify-center w-5 h-5 border rounded transition-colors",
              selectedObjectives.has(objective.id) && "bg-primary border-primary"
            )}
            onClick={(e) => toggleObjectiveSelection(service.id, objective.id, e)}
          >
            {selectedObjectives.has(objective.id) ? <Check size={14} className="text-primary-foreground" /> : null}
          </button>
          <Folder size={18} className="text-yellow-500" />
          <span
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              toggleObjectiveSelection(service.id, objective.id);
            }}
          >
            {objective.name}
          </span>

          {/* Show count of selected activities */}
          {objective.activities.some((act) => selectedActivities.has(act.id)) && (
            <Badge variant="outline" className="ml-auto">
              {objective.activities.filter((act) => selectedActivities.has(act.id)).length}/
              {objective.activities.length}
            </Badge>
          )}
        </div>

        {expandedObjectives.has(objective.id) && (
          <div className="ml-6 pl-2 border-l-2 border-muted">
            {objective.activities.map((activity) => renderActivity(service, objective, activity))}
          </div>
        )}
      </div>
    ),
    [
      selectedObjectives,
      expandedObjectives,
      toggleObjective,
      toggleObjectiveSelection,
      selectedActivities,
      renderActivity,
    ]
  );

  // Efecto para actualizar las selecciones si cambian desde fuera
  useEffect(() => {
    if (initialSelection) {
      setSelectedServices(new Set(initialSelection.services));
      setSelectedObjectives(new Set(initialSelection.objectives));
      setSelectedActivities(new Set(initialSelection.activities));
    }
  }, [initialSelection]);

  // Efecto para actualizar si cambian los datos externos
  useEffect(() => {
    if (externalServices) {
      // Resetear expansiones al cambiar los datos
      setExpandedServices(new Set());
      setExpandedObjectives(new Set());
    }
  }, [externalServices]);

  return (
    <fieldset className="flex flex-col border rounded-lg p-4">
      <legend className="text-sm font-medium text-muted-foreground">Seleccionar Servicios</legend>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {stats.totalSelectedCount > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Servicios: {stats.selectedServicesCount}</Badge>
                  <Badge variant="outline">Objetivos: {stats.selectedObjectivesCount}</Badge>
                  <Badge variant="outline">Actividades: {stats.selectedActivitiesCount}</Badge>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">{SearchBar}</div>

          <div className="flex flex-wrap gap-2 justify-end">{ToolbarButtons}</div>

          <div className="space-y-2 overflow-auto pr-2 max-h-[600px]">
            {filteredServices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No se encontraron resultados</div>
            ) : (
              filteredServices.map((service) => (
                <div key={service.id} className="space-y-1">
                  <div
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent transition-colors",
                      selectedServices.has(service.id) && "bg-accent/40"
                    )}
                    onClick={() => toggleService(service.id)}
                  >
                    <button
                      type="button"
                      className="p-1 rounded-full hover:bg-muted"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleService(service.id);
                      }}
                    >
                      {expandedServices.has(service.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                    <button
                      type="button"
                      className={cn(
                        "flex items-center justify-center w-5 h-5 border rounded transition-colors",
                        selectedServices.has(service.id) && "bg-primary border-primary"
                      )}
                      onClick={(e) => toggleServiceSelection(service.id, e)}
                    >
                      {selectedServices.has(service.id) ? (
                        <Check size={14} className="text-primary-foreground" />
                      ) : null}
                    </button>
                    <Folder size={18} className="text-blue-500" />
                    <span
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleServiceSelection(service.id);
                      }}
                    >
                      {service.name}
                    </span>

                    {/* Show count of selected objectives */}
                    {(service.objectives ?? []).some((obj) => selectedObjectives.has(obj.id)) && (
                      <Badge variant="outline" className="ml-auto">
                        {(service.objectives ?? []).filter((obj) => selectedObjectives.has(obj.id)).length}/
                        {(service.objectives ?? []).length}
                      </Badge>
                    )}
                  </div>

                  {expandedServices.has(service.id) && (
                    <div className="ml-6 pl-2 border-l-2 border-muted">
                      {(service.objectives ?? []).map((objective) => renderObjective(service, objective))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-muted p-4 text-muted-foreground text-xs space-y-2">
          <p className="text-sm font-bold">Guía de Uso</p>
          <div className="flex items-center gap-2">
            <CheckSquare className="size-3 text-primary" />
            <span>Haz clic en el checkbox para seleccionar un elemento</span>
          </div>
          <div className="flex items-center gap-2">
            <ChevronDown className="size-3 text-primary" />
            <span>Haz clic en las flechas para expandir/contraer carpetas</span>
          </div>
          <div className="flex items-center gap-2">
            <ChevronDownSquare className="size-3 text-primary" />
            <span>Usa "Expandir" para abrir todas las carpetas</span>
          </div>
          <div className="flex items-center gap-2">
            <ChevronRight className="size-3 text-primary" />
            <span>Usa "Contraer" para cerrar todas las carpetas</span>
          </div>
          <div className="flex items-center gap-2">
            <X className="size-3 text-primary" />
            <span>Usa "Limpiar" para deseleccionar todo</span>
          </div>
          <div className="flex items-center gap-2">
            <Search className="size-3 text-primary" />
            <span>Usa la búsqueda para encontrar elementos rápidamente</span>
          </div>
        </div>
      </div>
    </fieldset>
  );
}
