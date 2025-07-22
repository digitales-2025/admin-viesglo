import React from "react";
import { Check, ChevronDown, ChevronRight, Expand, File, Folder, FolderOpen, Minimize, Trash } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";
import { ActivityResponse, ObjectiveResponse, ServiceResponse } from "../../services/_types/services.types";

interface SelectedData {
  serviceId: string;
  objectives: {
    objectiveId: string;
    activities: {
      activityId: string;
    }[];
  }[];
}

interface ServiceTreeSelectProps {
  services: ServiceResponse[];
  value?: SelectedData[];
  onChange?: (value: SelectedData[]) => void;
  className?: string;
}

export default function TreeServices({ services, value = [], onChange, className }: ServiceTreeSelectProps) {
  const [expandedServices, setExpandedServices] = React.useState<Set<string>>(new Set());
  const [expandedObjectives, setExpandedObjectives] = React.useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = React.useState("");

  // Helper functions to check if an item is selected
  const isServiceSelected = (serviceId: string) => {
    return value.some((s) => s.serviceId === serviceId);
  };

  const isObjectiveSelected = (serviceId: string, objectiveId: string) => {
    return value.some((s) => s.serviceId === serviceId && s.objectives.some((o) => o.objectiveId === objectiveId));
  };

  const isActivitySelected = (serviceId: string, objectiveId: string, activityId: string) => {
    return value.some(
      (s) =>
        s.serviceId === serviceId &&
        s.objectives.some((o) => o.objectiveId === objectiveId && o.activities.some((a) => a.activityId === activityId))
    );
  };

  // Toggle functions
  const toggleService = (service: ServiceResponse) => {
    const newValue = [...value];
    const serviceIndex = newValue.findIndex((s) => s.serviceId === service.id);

    if (serviceIndex === -1) {
      newValue.push({ serviceId: service.id, objectives: [] });
    } else {
      newValue.splice(serviceIndex, 1);
    }

    onChange?.(newValue);
  };

  const toggleObjective = (service: ServiceResponse, objective: ObjectiveResponse) => {
    const newValue = [...value];
    const serviceIndex = newValue.findIndex((s) => s.serviceId === service.id);

    if (serviceIndex === -1) {
      // If service doesn't exist, add it with the objective
      newValue.push({
        serviceId: service.id,
        objectives: [{ objectiveId: objective.id, activities: [] }],
      });
    } else {
      const objectiveIndex = newValue[serviceIndex].objectives.findIndex((o) => o.objectiveId === objective.id);

      if (objectiveIndex === -1) {
        // Add objective
        newValue[serviceIndex].objectives.push({ objectiveId: objective.id, activities: [] });
      } else {
        // Remove objective
        newValue[serviceIndex].objectives.splice(objectiveIndex, 1);
        // If no objectives left, remove service
        if (newValue[serviceIndex].objectives.length === 0) {
          newValue.splice(serviceIndex, 1);
        }
      }
    }

    onChange?.(newValue);
  };

  const toggleActivity = (service: ServiceResponse, objective: ObjectiveResponse, activity: ActivityResponse) => {
    const newValue = [...value];
    const serviceIndex = newValue.findIndex((s) => s.serviceId === service.id);

    if (serviceIndex === -1) {
      // Add service, objective, and activity
      newValue.push({
        serviceId: service.id,
        objectives: [
          {
            objectiveId: objective.id,
            activities: [{ activityId: activity.id }],
          },
        ],
      });
    } else {
      const objectiveIndex = newValue[serviceIndex].objectives.findIndex((o) => o.objectiveId === objective.id);

      if (objectiveIndex === -1) {
        // Add objective and activity
        newValue[serviceIndex].objectives.push({
          objectiveId: objective.id,
          activities: [{ activityId: activity.id }],
        });
      } else {
        const activities = newValue[serviceIndex].objectives[objectiveIndex].activities;
        const activityIndex = activities.findIndex((a) => a.activityId === activity.id);

        if (activityIndex === -1) {
          // Add activity
          activities.push({ activityId: activity.id });
        } else {
          // Remove activity
          activities.splice(activityIndex, 1);
          // If no activities left, remove objective
          if (activities.length === 0) {
            newValue[serviceIndex].objectives.splice(objectiveIndex, 1);
            // If no objectives left, remove service
            if (newValue[serviceIndex].objectives.length === 0) {
              newValue.splice(serviceIndex, 1);
            }
          }
        }
      }
    }

    onChange?.(newValue);
  };

  // Expansion toggle functions
  const toggleServiceExpansion = (serviceId: string) => {
    const newExpanded = new Set(expandedServices);
    if (newExpanded.has(serviceId)) {
      newExpanded.delete(serviceId);
    } else {
      newExpanded.add(serviceId);
    }
    setExpandedServices(newExpanded);
  };

  const toggleObjectiveExpansion = (objectiveId: string) => {
    const newExpanded = new Set(expandedObjectives);
    if (newExpanded.has(objectiveId)) {
      newExpanded.delete(objectiveId);
    } else {
      newExpanded.add(objectiveId);
    }
    setExpandedObjectives(newExpanded);
  };

  // Filter function based on search term
  const filteredServices = services.filter((service) => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (matchesSearch) return true;

    return (service.objectives ?? []).some((objective) => {
      const objectiveMatches = objective.name.toLowerCase().includes(searchTerm.toLowerCase());
      if (objectiveMatches) return true;

      return objective.activities.some((activity: ActivityResponse) =>
        activity.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  });

  // Utility functions
  const expandAll = () => {
    const allServices = new Set(services.map((s) => s.id));
    const allObjectives = new Set(services.flatMap((s) => s.objectives ?? []).map((o) => o.id));
    setExpandedServices(allServices);
    setExpandedObjectives(allObjectives);
  };

  const collapseAll = () => {
    setExpandedServices(new Set());
    setExpandedObjectives(new Set());
  };

  const clearAll = () => {
    onChange?.([]);
  };

  return (
    <div className={cn("w-full space-y-4", className)}>
      <div className="flex items-center gap-2">
        <Input
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Button type="button" variant="outline" size="sm" onClick={expandAll}>
          <Expand className="size-4 mr-2" />
          Expandir
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={collapseAll}>
          <Minimize className="size-4 mr-2" />
          Contraer
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={clearAll}>
          <Trash className="size-4 mr-2" />
          Limpiar
        </Button>
      </div>

      <div className="rounded-md border">
        {filteredServices.map((service) => (
          <div key={service.id} className="border-b last:border-b-0">
            <div
              className="flex items-center px-4 py-2 hover:bg-muted/50 cursor-pointer"
              onClick={() => toggleServiceExpansion(service.id)}
            >
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-6 hover:bg-transparent"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleService(service);
                }}
              >
                <Check className={cn("h-4 w-4", isServiceSelected(service.id) ? "opacity-100" : "opacity-0")} />
              </Button>
              {expandedServices.has(service.id) ? (
                <ChevronDown className="h-4 w-4 mx-2" />
              ) : (
                <ChevronRight className="h-4 w-4 mx-2" />
              )}
              <span className="flex-1 inline-flex items-center">
                <Folder className="size-4 mr-2 text-blue-500" />
                <span className="first-letter:uppercase">{service.name}</span>
              </span>
            </div>

            {expandedServices.has(service.id) && (
              <div className="pl-8">
                {(service.objectives ?? []).map((objective) => (
                  <div key={objective.id} className="border-t">
                    <div
                      className="flex items-center px-4 py-2 hover:bg-muted/50 cursor-pointer"
                      onClick={() => toggleObjectiveExpansion(objective.id)}
                    >
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-6 hover:bg-transparent"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleObjective(service, objective);
                        }}
                      >
                        <Check
                          className={cn(
                            "h-4 w-4",
                            isObjectiveSelected(service.id, objective.id) ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </Button>
                      {expandedObjectives.has(objective.id) ? (
                        <ChevronDown className="h-4 w-4 mx-2" />
                      ) : (
                        <ChevronRight className="h-4 w-4 mx-2" />
                      )}
                      <span className="flex-1 inline-flex items-center">
                        <FolderOpen className="size-4 mr-2 text-green-500" />
                        <span className="first-letter:uppercase">{objective.name}</span>
                      </span>
                    </div>

                    {expandedObjectives.has(objective.id) && (
                      <div className="pl-8">
                        {objective.activities.map((activity: ActivityResponse) => (
                          <div key={activity.id} className="flex items-center px-4 py-2 border-t hover:bg-muted/50">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="size-6 hover:bg-transparent"
                              onClick={() => toggleActivity(service, objective, activity)}
                            >
                              <Check
                                className={cn(
                                  "h-4 w-4",
                                  isActivitySelected(service.id, objective.id, activity.id)
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                            </Button>
                            <span className="ml-6 inline-flex items-center">
                              <File className="size-4 mr-2 text-teal-500" />
                              <span className="first-letter:uppercase">{activity.name}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
