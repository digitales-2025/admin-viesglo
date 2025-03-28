"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Check, CheckSquare, ChevronDown, ChevronDownSquare, ChevronRight, Folder, Search, X } from "lucide-react";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";

// Define the data structure types
type Activity = {
  id: string;
  name: string;
};

type Objective = {
  id: string;
  name: string;
  activities: Activity[];
};

type Service = {
  id: string;
  name: string;
  objectives: Objective[];
};

// Sample data
const initialServices: Service[] = [
  {
    id: "s1",
    name: "Consultoría",
    objectives: [
      {
        id: "o1",
        name: "Mejorar procesos",
        activities: [
          { id: "a1", name: "Análisis de procesos actuales" },
          { id: "a2", name: "Propuesta de mejoras" },
        ],
      },
      {
        id: "o2",
        name: "Reducir costos",
        activities: [
          { id: "a3", name: "Auditoría de gastos" },
          { id: "a4", name: "Plan de optimización" },
        ],
      },
    ],
  },
  {
    id: "s2",
    name: "Desarrollo",
    objectives: [
      {
        id: "o3",
        name: "Crear aplicaciones",
        activities: [
          { id: "a5", name: "Diseño de UI/UX" },
          { id: "a6", name: "Programación" },
        ],
      },
      {
        id: "o4",
        name: "Mantenimiento",
        activities: [
          { id: "a7", name: "Corrección de errores" },
          { id: "a8", name: "Actualizaciones" },
        ],
      },
    ],
  },
  {
    id: "s3",
    name: "Capacitación",
    objectives: [
      {
        id: "o5",
        name: "Formar personal",
        activities: [
          { id: "a9", name: "Talleres presenciales" },
          { id: "a10", name: "Cursos online" },
        ],
      },
    ],
  },
];

export default function FolderTree() {
  const [services] = useState<Service[]>(initialServices);
  const [expandedServices, setExpandedServices] = useState<Set<string>>(new Set());
  const [expandedObjectives, setExpandedObjectives] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredServices, setFilteredServices] = useState<Service[]>(services);

  // Track selected items
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [selectedObjectives, setSelectedObjectives] = useState<Set<string>>(new Set());
  const [selectedActivities, setSelectedActivities] = useState<Set<string>>(new Set());

  // Count selected items
  const selectedServicesCount = selectedServices.size;
  const selectedObjectivesCount = selectedObjectives.size;
  const selectedActivitiesCount = selectedActivities.size;
  const totalSelectedCount = selectedServicesCount + selectedObjectivesCount + selectedActivitiesCount;

  // Filter services based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredServices(services);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase();

    const filtered = services
      .map((service) => {
        // Check if service name matches
        const serviceMatches = service.name.toLowerCase().includes(searchTermLower);

        // Filter objectives
        const filteredObjectives = service.objectives.filter((objective) => {
          // Check if objective name matches
          const objectiveMatches = objective.name.toLowerCase().includes(searchTermLower);

          // Filter activities
          const filteredActivities = objective.activities.filter((activity) =>
            activity.name.toLowerCase().includes(searchTermLower)
          );

          // If any activities match, expand this objective
          if (filteredActivities.length > 0 && !expandedObjectives.has(objective.id)) {
            setExpandedObjectives((prev) => new Set(prev).add(objective.id));
          }

          // Include this objective if it matches or has matching activities
          return objectiveMatches || filteredActivities.length > 0;
        });

        // If any objectives match, expand this service
        if (filteredObjectives.length > 0 && !expandedServices.has(service.id)) {
          setExpandedServices((prev) => new Set(prev).add(service.id));
        }

        // Include this service if it matches or has matching objectives
        if (serviceMatches || filteredObjectives.length > 0) {
          return {
            ...service,
            objectives: filteredObjectives,
          };
        }

        return null;
      })
      .filter(Boolean) as Service[];

    setFilteredServices(filtered);
  }, [searchTerm, services]);

  // Toggle service expansion
  const toggleService = (serviceId: string) => {
    const newExpanded = new Set(expandedServices);
    if (newExpanded.has(serviceId)) {
      newExpanded.delete(serviceId);
    } else {
      newExpanded.add(serviceId);
    }
    setExpandedServices(newExpanded);
  };

  // Toggle objective expansion
  const toggleObjective = (objectiveId: string) => {
    const newExpanded = new Set(expandedObjectives);
    if (newExpanded.has(objectiveId)) {
      newExpanded.delete(objectiveId);
    } else {
      newExpanded.add(objectiveId);
    }
    setExpandedObjectives(newExpanded);
  };

  // Expand all folders
  const expandAll = () => {
    const allServices = new Set<string>();
    const allObjectives = new Set<string>();

    services.forEach((service) => {
      allServices.add(service.id);
      service.objectives.forEach((objective) => {
        allObjectives.add(objective.id);
      });
    });

    setExpandedServices(allServices);
    setExpandedObjectives(allObjectives);
  };

  // Collapse all folders
  const collapseAll = () => {
    setExpandedServices(new Set());
    setExpandedObjectives(new Set());
  };

  // Clear all selections
  const clearSelections = () => {
    setSelectedServices(new Set());
    setSelectedObjectives(new Set());
    setSelectedActivities(new Set());
  };

  // Toggle activity selection
  const toggleActivitySelection = (
    serviceId: string,
    objectiveId: string,
    activityId: string,
    e?: React.MouseEvent
  ) => {
    if (e) e.stopPropagation();

    const newSelected = new Set(selectedActivities);

    if (newSelected.has(activityId)) {
      newSelected.delete(activityId);
    } else {
      newSelected.add(activityId);

      // Cuando seleccionamos una actividad, seleccionamos automáticamente sus padres
      setSelectedServices((prev) => new Set(prev).add(serviceId));
      setSelectedObjectives((prev) => new Set(prev).add(objectiveId));
    }

    setSelectedActivities(newSelected);
  };

  // Toggle objective selection
  const toggleObjectiveSelection = (serviceId: string, objectiveId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const newSelected = new Set(selectedObjectives);

    if (newSelected.has(objectiveId)) {
      newSelected.delete(objectiveId);

      // Si deseleccionamos un objetivo, deseleccionamos sus actividades
      const newActivities = new Set(selectedActivities);
      services.forEach((service) => {
        if (service.id === serviceId) {
          service.objectives.forEach((objective) => {
            if (objective.id === objectiveId) {
              objective.activities.forEach((activity) => {
                newActivities.delete(activity.id);
              });
            }
          });
        }
      });
      setSelectedActivities(newActivities);
    } else {
      newSelected.add(objectiveId);

      // Cuando seleccionamos un objetivo, seleccionamos automáticamente su servicio padre
      setSelectedServices((prev) => new Set(prev).add(serviceId));
    }

    setSelectedObjectives(newSelected);

    // Auto-expand when selecting an objective
    if (!expandedObjectives.has(objectiveId) && !newSelected.has(objectiveId)) {
      const newExpanded = new Set(expandedObjectives);
      newExpanded.add(objectiveId);
      setExpandedObjectives(newExpanded);
    }
  };

  // Toggle service selection
  const toggleServiceSelection = (serviceId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const newSelected = new Set(selectedServices);

    if (newSelected.has(serviceId)) {
      newSelected.delete(serviceId);

      // Si deseleccionamos un servicio, deseleccionamos sus objetivos y actividades
      const newObjectives = new Set(selectedObjectives);
      const newActivities = new Set(selectedActivities);

      services.forEach((service) => {
        if (service.id === serviceId) {
          service.objectives.forEach((objective) => {
            newObjectives.delete(objective.id);
            objective.activities.forEach((activity) => {
              newActivities.delete(activity.id);
            });
          });
        }
      });

      setSelectedObjectives(newObjectives);
      setSelectedActivities(newActivities);
    } else {
      newSelected.add(serviceId);
    }

    setSelectedServices(newSelected);

    // Auto-expand when selecting a service
    if (!expandedServices.has(serviceId) && !newSelected.has(serviceId)) {
      const newExpanded = new Set(expandedServices);
      newExpanded.add(serviceId);
      setExpandedServices(newExpanded);
    }
  };

  // Get the current selection structure
  const getSelectionStructure = () => {
    const result: any[] = [];

    services.forEach((service) => {
      if (selectedServices.has(service.id)) {
        const serviceObj = {
          id: service.id,
          name: service.name,
          objectives: [] as any[],
        };

        // Add objectives if any are selected
        service.objectives.forEach((objective) => {
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
  };

  return (
    <fieldset className="flex flex-col border rounded-lg p-4">
      <legend className="text-sm font-medium text-muted-foreground">Seleccionar Servicios</legend>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {totalSelectedCount > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Servicios: {selectedServicesCount}</Badge>
                  <Badge variant="outline">Objetivos: {selectedObjectivesCount}</Badge>
                  <Badge variant="outline">Actividades: {selectedActivitiesCount}</Badge>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
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
          </div>

          <div className="flex flex-wrap gap-2 justify-end">
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
          </div>

          <div className="space-y-2 overflow-auto pr-2">
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
                    {service.objectives.some((obj) => selectedObjectives.has(obj.id)) && (
                      <Badge variant="outline" className="ml-auto">
                        {service.objectives.filter((obj) => selectedObjectives.has(obj.id)).length}/
                        {service.objectives.length}
                      </Badge>
                    )}
                  </div>

                  {expandedServices.has(service.id) && (
                    <div className="ml-6 pl-2 border-l-2 border-muted">
                      {service.objectives.map((objective) => (
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
                              {expandedObjectives.has(objective.id) ? (
                                <ChevronDown size={16} />
                              ) : (
                                <ChevronRight size={16} />
                              )}
                            </button>
                            <button
                              type="button"
                              className={cn(
                                "flex items-center justify-center w-5 h-5 border rounded transition-colors",
                                selectedObjectives.has(objective.id) && "bg-primary border-primary"
                              )}
                              onClick={(e) => toggleObjectiveSelection(service.id, objective.id, e)}
                            >
                              {selectedObjectives.has(objective.id) ? (
                                <Check size={14} className="text-primary-foreground" />
                              ) : null}
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
                              {objective.activities.map((activity) => (
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
                                    {selectedActivities.has(activity.id) ? (
                                      <Check size={14} className="text-primary-foreground" />
                                    ) : null}
                                  </button>
                                  <Folder size={18} className="text-green-500" />
                                  <span className="flex-1">{activity.name}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <pre className="whitespace-pre-wrap overflow-auto max-h-[500px]">
          {JSON.stringify(getSelectionStructure(), null, 2)}
        </pre>
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
    </fieldset>
  );
}
