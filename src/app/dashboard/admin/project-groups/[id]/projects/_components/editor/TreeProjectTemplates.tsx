import { useCallback, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Expand, File, Folder, FolderOpen, Minimize, Trash } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import {
  DeliverableTemplateResponseDto,
  MilestoneTemplateResponseDto,
  PhaseTemplateResponseDto,
  ProjectTemplateDetailedResponseDto,
  ProjectTemplateResponseDto,
} from "@/app/dashboard/admin/templates/_types/templates.types";
import { BaseErrorResponse } from "@/lib/api/types/common";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { SmartCheckbox } from "@/shared/components/ui/smart-checkbox";
import { ProjectsForm } from "../../_schemas/projects.schemas";
import { SelectedProjectData } from "../../_types";
import SelectionProjectTemplatesBadge from "./SelectionProjectTemplatesBadge";

interface TreeProjectTemplatesProps {
  form: UseFormReturn<ProjectsForm>;
  selectedTemplate: ProjectTemplateResponseDto | null;
  isLoading: boolean;
  error: BaseErrorResponse;
  templateData: ProjectTemplateDetailedResponseDto | null;
}

export default function TreeProjectTemplates({
  form,
  selectedTemplate,
  isLoading,
  error,
  templateData,
}: TreeProjectTemplatesProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedMilestones, setExpandedMilestones] = useState<Set<string>>(new Set());
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());
  // Obtener valores del formulario
  const selectedMilestones = form.watch("selectedMilestones") || [];

  // Filtrado optimizado con memoization
  const filteredMilestones = useMemo(() => {
    if (!searchTerm.trim() || !templateData?.milestoneTemplates) return templateData?.milestoneTemplates || [];

    const term = searchTerm.toLowerCase();
    return templateData.milestoneTemplates.filter((milestone: MilestoneTemplateResponseDto) => {
      // Buscar en nombre del milestone
      if (milestone.name.toLowerCase().includes(term)) return true;

      // Buscar en fases y deliverables
      return (milestone.phases || []).some((phase: PhaseTemplateResponseDto) => {
        if (phase.name.toLowerCase().includes(term)) return true;
        return (phase.deliverables || []).some((deliverable: DeliverableTemplateResponseDto) =>
          deliverable.name.toLowerCase().includes(term)
        );
      });
    });
  }, [templateData?.milestoneTemplates, searchTerm]);

  // Memoized helper functions para mejor rendimiento
  const selectionHelpers = useMemo(() => {
    const isMilestoneSelected = (milestoneTemplateId: string): boolean => {
      return selectedMilestones.some((s) => s.milestoneTemplateId === milestoneTemplateId);
    };

    const isMilestoneFullySelected = (milestoneTemplateId: string): boolean => {
      const milestone = selectedMilestones.find((s) => s.milestoneTemplateId === milestoneTemplateId);
      if (!milestone) return false;

      const milestoneData = templateData?.milestoneTemplates?.find(
        (m: MilestoneTemplateResponseDto) => m.id === milestoneTemplateId
      );
      if (!milestoneData?.phases?.length) return true; // Si no tiene fases, está completamente seleccionado

      // Un milestone está completamente seleccionado si todas sus fases están seleccionadas
      return milestoneData.phases.every((phase: PhaseTemplateResponseDto) =>
        milestone.selectedPhases.some((selPhase) => selPhase.phaseTemplateId === phase.id)
      );
    };

    const isMilestoneEmpty = (milestoneTemplateId: string): boolean => {
      const milestone = selectedMilestones.find((s) => s.milestoneTemplateId === milestoneTemplateId);
      return milestone ? milestone.selectedPhases.length === 0 : false;
    };

    const isPhaseSelected = (milestoneTemplateId: string, phaseTemplateId: string): boolean => {
      const milestone = selectedMilestones.find((s) => s.milestoneTemplateId === milestoneTemplateId);
      return milestone ? milestone.selectedPhases.some((p) => p.phaseTemplateId === phaseTemplateId) : false;
    };

    const isPhaseFullySelected = (milestoneTemplateId: string, phaseTemplateId: string): boolean => {
      const milestone = selectedMilestones.find((s) => s.milestoneTemplateId === milestoneTemplateId);
      if (!milestone) return false;

      const phase = milestone.selectedPhases.find((p) => p.phaseTemplateId === phaseTemplateId);
      if (!phase) return false;

      const phaseData = templateData?.milestoneTemplates
        ?.find((m: MilestoneTemplateResponseDto) => m.id === milestoneTemplateId)
        ?.phases?.find((p: PhaseTemplateResponseDto) => p.id === phaseTemplateId);

      if (!phaseData?.deliverables?.length) return true; // Si no tiene deliverables, está completamente seleccionado

      // Una fase está completamente seleccionada si todos sus deliverables están seleccionados
      return phaseData.deliverables.every((deliverable: DeliverableTemplateResponseDto) =>
        phase.selectedDeliverables.includes(deliverable.id)
      );
    };

    const isPhaseEmpty = (milestoneTemplateId: string, phaseTemplateId: string): boolean => {
      const milestone = selectedMilestones.find((s) => s.milestoneTemplateId === milestoneTemplateId);
      if (!milestone) return false;

      const phase = milestone.selectedPhases.find((p) => p.phaseTemplateId === phaseTemplateId);
      return phase ? phase.selectedDeliverables.length === 0 : false;
    };

    const isDeliverableSelected = (
      milestoneTemplateId: string,
      phaseTemplateId: string,
      deliverableId: string
    ): boolean => {
      const milestone = selectedMilestones.find((s) => s.milestoneTemplateId === milestoneTemplateId);
      if (!milestone) return false;

      const phase = milestone.selectedPhases.find((p) => p.phaseTemplateId === phaseTemplateId);
      return phase ? phase.selectedDeliverables.includes(deliverableId) : false;
    };

    const getMilestoneSelectionState = (milestoneTemplateId: string): "none" | "empty" | "partial" | "full" => {
      if (!isMilestoneSelected(milestoneTemplateId)) return "none";
      if (isMilestoneEmpty(milestoneTemplateId)) return "empty";
      if (isMilestoneFullySelected(milestoneTemplateId)) return "full";
      return "partial";
    };

    const getPhaseSelectionState = (
      milestoneTemplateId: string,
      phaseTemplateId: string
    ): "none" | "empty" | "partial" | "full" => {
      if (!isPhaseSelected(milestoneTemplateId, phaseTemplateId)) return "none";
      if (isPhaseEmpty(milestoneTemplateId, phaseTemplateId)) return "empty";
      if (isPhaseFullySelected(milestoneTemplateId, phaseTemplateId)) return "full";
      return "partial";
    };

    return {
      isMilestoneSelected,
      isMilestoneFullySelected,
      isMilestoneEmpty,
      isPhaseSelected,
      isPhaseFullySelected,
      isPhaseEmpty,
      isDeliverableSelected,
      getMilestoneSelectionState,
      getPhaseSelectionState,
    };
  }, [selectedMilestones, templateData]);

  // Funciones utilitarias optimizadas
  const expandAll = useCallback(() => {
    const allMilestoneIds = new Set<string>(filteredMilestones.map((m: MilestoneTemplateResponseDto) => m.id));
    const allPhaseIds = new Set<string>(
      filteredMilestones
        .flatMap((m: MilestoneTemplateResponseDto) => m.phases || [])
        .map((p: PhaseTemplateResponseDto) => p.id)
    );

    setExpandedMilestones(allMilestoneIds);
    setExpandedPhases(allPhaseIds);
  }, [filteredMilestones]);

  const collapseAll = useCallback(() => {
    setExpandedMilestones(new Set());
    setExpandedPhases(new Set());
  }, []);

  const clearAll = useCallback(() => {
    form.setValue("selectedMilestones", []);
  }, [form]);

  // Toggle functions mejoradas para permitir selecciones vacías
  const toggleMilestone = useCallback(
    (milestone: MilestoneTemplateResponseDto) => {
      const newValue = [...selectedMilestones];
      const milestoneIndex = newValue.findIndex((s) => s.milestoneTemplateId === milestone.id);
      const selectionState = selectionHelpers.getMilestoneSelectionState(milestone.id);
      const hasPhases = (milestone.phases || []).length > 0;

      if (selectionState === "none") {
        // Seleccionar milestone
        if (hasPhases) {
          // Si tiene fases, seleccionar completamente
          const fullMilestone: SelectedProjectData = {
            milestoneTemplateId: milestone.id,
            selectedPhases: (milestone.phases || []).map((phase: PhaseTemplateResponseDto) => ({
              phaseTemplateId: phase.id,
              selectedDeliverables: (phase.deliverables || []).map(
                (deliverable: DeliverableTemplateResponseDto) => deliverable.id
              ),
            })),
          };
          newValue.push(fullMilestone);
        } else {
          // Si no tiene fases, seleccionar como milestone vacío
          newValue.push({
            milestoneTemplateId: milestone.id,
            selectedPhases: [],
          });
        }
      } else if (selectionState === "empty") {
        if (hasPhases) {
          // Cambiar de vacío a selección completa
          const fullMilestone: SelectedProjectData = {
            milestoneTemplateId: milestone.id,
            selectedPhases: (milestone.phases || []).map((phase: PhaseTemplateResponseDto) => ({
              phaseTemplateId: phase.id,
              selectedDeliverables: (phase.deliverables || []).map(
                (deliverable: DeliverableTemplateResponseDto) => deliverable.id
              ),
            })),
          };
          newValue[milestoneIndex] = fullMilestone;
        } else {
          // Milestone sin fases: deseleccionar
          newValue.splice(milestoneIndex, 1);
        }
      } else {
        // Deseleccionar completamente (full o partial)
        newValue.splice(milestoneIndex, 1);
      }

      form.setValue("selectedMilestones", newValue);
    },
    [selectedMilestones, form, selectionHelpers]
  );

  const togglePhase = useCallback(
    (milestone: MilestoneTemplateResponseDto, phase: PhaseTemplateResponseDto) => {
      const newValue = [...selectedMilestones];
      const milestoneIndex = newValue.findIndex((s) => s.milestoneTemplateId === milestone.id);
      const selectionState = selectionHelpers.getPhaseSelectionState(milestone.id, phase.id);

      if (milestoneIndex === -1) {
        // Crear milestone con fase vacía
        newValue.push({
          milestoneTemplateId: milestone.id,
          selectedPhases: [
            {
              phaseTemplateId: phase.id,
              selectedDeliverables: [],
            },
          ],
        });
      } else {
        const phaseIndex = newValue[milestoneIndex].selectedPhases.findIndex((p) => p.phaseTemplateId === phase.id);

        if (selectionState === "none") {
          // Agregar fase vacía
          newValue[milestoneIndex].selectedPhases.push({
            phaseTemplateId: phase.id,
            selectedDeliverables: [],
          });
        } else if (selectionState === "empty") {
          const sourceHasDeliverables = (phase.deliverables || []).length > 0;
          if (sourceHasDeliverables) {
            // Cambiar a selección completa cuando existen deliverables
            const fullPhase = {
              phaseTemplateId: phase.id,
              selectedDeliverables: (phase.deliverables || []).map(
                (deliverable: DeliverableTemplateResponseDto) => deliverable.id
              ),
            };
            newValue[milestoneIndex].selectedPhases[phaseIndex] = fullPhase;
          } else {
            // Fase contenedor (sin deliverables): permitir deseleccionar
            newValue[milestoneIndex].selectedPhases.splice(phaseIndex, 1);
            // Limpiar milestone si no quedan fases
            if (newValue[milestoneIndex].selectedPhases.length === 0) {
              newValue.splice(milestoneIndex, 1);
            }
          }
        } else {
          // Deseleccionar fase
          newValue[milestoneIndex].selectedPhases.splice(phaseIndex, 1);
          // Limpiar milestone si no quedan fases
          if (newValue[milestoneIndex].selectedPhases.length === 0) {
            newValue.splice(milestoneIndex, 1);
          }
        }
      }

      form.setValue("selectedMilestones", newValue);
    },
    [selectedMilestones, form, selectionHelpers]
  );

  const toggleDeliverable = useCallback(
    (
      milestone: MilestoneTemplateResponseDto,
      phase: PhaseTemplateResponseDto,
      deliverable: DeliverableTemplateResponseDto
    ) => {
      const newValue = [...selectedMilestones];
      const milestoneIndex = newValue.findIndex((s) => s.milestoneTemplateId === milestone.id);

      if (milestoneIndex === -1) {
        // Crear estructura completa
        newValue.push({
          milestoneTemplateId: milestone.id,
          selectedPhases: [
            {
              phaseTemplateId: phase.id,
              selectedDeliverables: [deliverable.id],
            },
          ],
        });
      } else {
        const phaseIndex = newValue[milestoneIndex].selectedPhases.findIndex((p) => p.phaseTemplateId === phase.id);

        if (phaseIndex === -1) {
          // Agregar fase con deliverable
          newValue[milestoneIndex].selectedPhases.push({
            phaseTemplateId: phase.id,
            selectedDeliverables: [deliverable.id],
          });
        } else {
          const deliverables = newValue[milestoneIndex].selectedPhases[phaseIndex].selectedDeliverables;
          const deliverableIndex = deliverables.findIndex((d) => d === deliverable.id);

          if (deliverableIndex === -1) {
            // Agregar deliverable
            deliverables.push(deliverable.id);
          } else {
            // Remover deliverable
            deliverables.splice(deliverableIndex, 1);
          }
        }
      }

      form.setValue("selectedMilestones", newValue);
    },
    [selectedMilestones, form]
  );

  // Funciones de expansión optimizadas
  const toggleMilestoneExpansion = useCallback((milestoneId: string) => {
    setExpandedMilestones((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(milestoneId)) {
        newSet.delete(milestoneId);
      } else {
        newSet.add(milestoneId);
      }
      return newSet;
    });
  }, []);

  const togglePhaseExpansion = useCallback((phaseId: string) => {
    setExpandedPhases((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(phaseId)) {
        newSet.delete(phaseId);
      } else {
        newSet.add(phaseId);
      }
      return newSet;
    });
  }, []);

  return (
    <>
      {/* Árbol de milestones (solo si hay plantilla seleccionada) */}
      {selectedTemplate && (
        <>
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">Cargando plantilla...</div>
            </div>
          )}

          {error && (
            <div className="text-red-500 text-sm py-4">Error al cargar la plantilla: {error.error.userMessage}</div>
          )}

          {templateData && (
            <>
              {/* Leyenda de estados */}
              <div className="flex items-center gap-6 text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <SmartCheckbox state="full" size="sm" disabled />
                  <span>Completo</span>
                </div>
                <div className="flex items-center gap-2">
                  <SmartCheckbox state="partial" size="sm" disabled />
                  <span>Parcial</span>
                </div>
                <div className="flex items-center gap-2">
                  <SmartCheckbox state="empty" size="sm" disabled />
                  <span>Solo contenedor</span>
                </div>
                <div className="flex items-center gap-2">
                  <SmartCheckbox state="none" size="sm" disabled />
                  <span>No seleccionado</span>
                </div>
              </div>

              {/* Barra de herramientas */}
              <div className="flex items-center gap-2 flex-wrap">
                <Input
                  placeholder="Buscar milestones, fases o deliverables..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 min-w-[200px]"
                />
                <div className="flex gap-1">
                  <Button type="button" variant="outline" size="sm" onClick={expandAll}>
                    <Expand className="size-4 mr-1" />
                    Expandir
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={collapseAll}>
                    <Minimize className="size-4 mr-1" />
                    Contraer
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={clearAll}>
                    <Trash className="size-4 mr-1" />
                    Limpiar
                  </Button>
                </div>
              </div>

              {/* Árbol de milestones */}
              <div className="rounded-md border bg-background">
                {filteredMilestones.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    {searchTerm ? "No se encontraron resultados" : "No hay milestones disponibles"}
                  </div>
                ) : (
                  filteredMilestones.map((milestone: MilestoneTemplateResponseDto) => {
                    const milestoneState = selectionHelpers.getMilestoneSelectionState(milestone.id);
                    const isExpanded = expandedMilestones.has(milestone.id);
                    const selectedPhases =
                      selectedMilestones.find((s) => s.milestoneTemplateId === milestone.id)?.selectedPhases.length ||
                      0;
                    const totalPhases = milestone.phases?.length || 0;

                    return (
                      <div
                        key={milestone.id}
                        className={cn("border-b last:border-b-0 transition-colors", {
                          "bg-blue-50/50 dark:bg-blue-950/30": milestoneState === "full",
                          "bg-blue-25/25 dark:bg-blue-950/20": milestoneState === "partial",
                          "bg-orange-50/50 dark:bg-orange-950/30": milestoneState === "empty",
                        })}
                      >
                        {/* Milestone */}
                        <div className="flex items-center px-4 py-3 hover:bg-muted/50 group">
                          <SmartCheckbox
                            state={milestoneState}
                            size="sm"
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              toggleMilestone(milestone);
                            }}
                          />

                          <button
                            type="button"
                            className="flex items-center flex-1 ml-3 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded-sm"
                            onClick={() => toggleMilestoneExpansion(milestone.id)}
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 mr-2 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 mr-2 text-muted-foreground" />
                            )}
                            <Folder
                              className={cn("size-4 mr-3", {
                                "text-blue-600 dark:text-blue-400": milestoneState === "full",
                                "text-blue-500 dark:text-blue-300": milestoneState === "partial",
                                "text-orange-500 dark:text-orange-400": milestoneState === "empty",
                                "text-gray-400 dark:text-gray-500": milestoneState === "none",
                              })}
                            />
                            <span
                              className={cn("font-medium first-letter:uppercase", {
                                "text-blue-900 dark:text-blue-100": milestoneState === "full",
                                "text-blue-700 dark:text-blue-200": milestoneState === "partial",
                                "text-orange-700 dark:text-orange-200": milestoneState === "empty",
                              })}
                            >
                              {milestone.name}
                            </span>

                            <SelectionProjectTemplatesBadge count={selectedPhases} total={totalPhases} type="fases" />
                          </button>
                        </div>

                        {/* Fases */}
                        {isExpanded && (
                          <div className="bg-muted/10 border-t">
                            {(milestone.phases || []).map((phase: PhaseTemplateResponseDto) => {
                              const phaseState = selectionHelpers.getPhaseSelectionState(milestone.id, phase.id);
                              const isPhaseExpanded = expandedPhases.has(phase.id);
                              const selectedDeliverables =
                                selectedMilestones
                                  .find((s) => s.milestoneTemplateId === milestone.id)
                                  ?.selectedPhases.find((p) => p.phaseTemplateId === phase.id)?.selectedDeliverables
                                  .length || 0;
                              const totalDeliverables = phase.deliverables?.length || 0;

                              return (
                                <div
                                  key={phase.id}
                                  className={cn("border-b last:border-b-0", {
                                    "bg-blue-50/70 dark:bg-blue-950/40": phaseState === "full",
                                    "bg-blue-25/50 dark:bg-blue-950/30": phaseState === "partial",
                                    "bg-orange-50/70 dark:bg-orange-950/40": phaseState === "empty",
                                  })}
                                >
                                  {/* Fase */}
                                  <div className="flex items-center px-6 py-2.5 hover:bg-muted/50 group">
                                    <SmartCheckbox
                                      state={phaseState}
                                      size="sm"
                                      onClick={(e: React.MouseEvent) => {
                                        e.stopPropagation();
                                        togglePhase(milestone, phase);
                                      }}
                                    />

                                    <button
                                      type="button"
                                      className="flex items-center flex-1 ml-3 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded-sm"
                                      onClick={() => togglePhaseExpansion(phase.id)}
                                    >
                                      {isPhaseExpanded ? (
                                        <ChevronDown className="h-4 w-4 mr-2 text-muted-foreground" />
                                      ) : (
                                        <ChevronRight className="h-4 w-4 mr-2 text-muted-foreground" />
                                      )}
                                      <FolderOpen
                                        className={cn("size-4 mr-3", {
                                          "text-green-600 dark:text-green-400": phaseState === "full",
                                          "text-green-500 dark:text-green-300": phaseState === "partial",
                                          "text-orange-500 dark:text-orange-400": phaseState === "empty",
                                          "text-gray-400 dark:text-gray-500": phaseState === "none",
                                        })}
                                      />
                                      <span
                                        className={cn("first-letter:uppercase text-sm", {
                                          "text-green-900 dark:text-green-100 font-medium": phaseState === "full",
                                          "text-green-700 dark:text-green-200": phaseState === "partial",
                                          "text-orange-700 dark:text-orange-200": phaseState === "empty",
                                        })}
                                      >
                                        {phase.name}
                                      </span>

                                      <SelectionProjectTemplatesBadge
                                        count={selectedDeliverables}
                                        total={totalDeliverables}
                                        type="entregables"
                                      />
                                    </button>
                                  </div>

                                  {/* Deliverables */}
                                  {isPhaseExpanded && (
                                    <div className="bg-muted/5">
                                      {(phase.deliverables || []).map((deliverable: DeliverableTemplateResponseDto) => {
                                        const isDeliverableSel = selectionHelpers.isDeliverableSelected(
                                          milestone.id,
                                          phase.id,
                                          deliverable.id
                                        );

                                        return (
                                          <div
                                            key={deliverable.id}
                                            className={cn(
                                              "flex items-center px-8 py-2 border-t hover:bg-muted/50 group transition-colors",
                                              {
                                                "bg-teal-50/70 dark:bg-teal-950/40": isDeliverableSel,
                                              }
                                            )}
                                          >
                                            <SmartCheckbox
                                              state={isDeliverableSel ? "full" : "none"}
                                              size="sm"
                                              onClick={() => toggleDeliverable(milestone, phase, deliverable)}
                                            />
                                            <div className="ml-8 flex items-center">
                                              <File
                                                className={cn(
                                                  "size-4 mr-3",
                                                  isDeliverableSel
                                                    ? "text-teal-600 dark:text-teal-400"
                                                    : "text-gray-400 dark:text-gray-500"
                                                )}
                                              />
                                              <span
                                                className={cn(
                                                  "first-letter:uppercase text-sm",
                                                  isDeliverableSel
                                                    ? "text-teal-900 dark:text-teal-100 font-medium"
                                                    : "text-gray-700 dark:text-gray-300"
                                                )}
                                              >
                                                {deliverable.name}
                                              </span>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}
