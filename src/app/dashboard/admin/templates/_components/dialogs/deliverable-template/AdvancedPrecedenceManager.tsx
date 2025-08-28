"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock, Filter, GitBranch, Search, X } from "lucide-react";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import {
  DeliverablePrecedenceResponseDto,
  DeliverablePriority,
  DeliverableTemplateResponseDto,
  MilestoneTemplateResponseDto,
  PhaseTemplateResponseDto,
} from "../../../_types/templates.types";
import { calculateDeliverableVisualOrder } from "../../../_utils/create-template.utils";
import { deliverablePriorityConfig } from "../../../_utils/templates.utils";

interface AdvancedPrecedenceManagerProps {
  currentDeliverable: DeliverableTemplateResponseDto & { phaseId?: string };
  allDeliverables: (DeliverableTemplateResponseDto & { phaseId: string; phaseName?: string })[];
  selectedPrecedences: DeliverablePrecedenceResponseDto[];
  onPrecedencesChange: (precedences: DeliverablePrecedenceResponseDto[]) => void;
  deliverables: (DeliverableTemplateResponseDto & { phaseId: string })[];
  phases: (PhaseTemplateResponseDto & { milestoneId: string })[];
  milestoneTemplates: MilestoneTemplateResponseDto[];
}

export function AdvancedPrecedenceManager({
  currentDeliverable,
  allDeliverables,
  selectedPrecedences,
  onPrecedencesChange,
  deliverables,
  phases,
  milestoneTemplates,
}: AdvancedPrecedenceManagerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState<string>("all");

  // Filter available deliverables (exclude current and logically invalid ones)
  const availableDeliverables = useMemo(() => {
    // Eliminar duplicados primero
    const uniqueDeliverables = allDeliverables.filter(
      (deliverable, index, self) => index === self.findIndex((d) => d.id === deliverable.id)
    );

    return uniqueDeliverables.filter((deliverable) => {
      // Exclude current deliverable
      if (deliverable.id === currentDeliverable.id) return false;

      // Allow cross-phase dependencies
      return true;
    });
  }, [allDeliverables, currentDeliverable.id]) as (DeliverableTemplateResponseDto & {
    phaseId: string;
    phaseName?: string;
  })[];

  // Filter deliverables based on search and phase
  const filteredDeliverables = useMemo(() => {
    return availableDeliverables.filter((deliverable) => {
      const matchesSearch =
        deliverable.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        calculateDeliverableVisualOrder(deliverable, deliverables, phases, milestoneTemplates).includes(searchTerm);
      const matchesPhase = selectedPhaseFilter === "all" || deliverable.phaseId === selectedPhaseFilter;
      return matchesSearch && matchesPhase;
    });
  }, [availableDeliverables, searchTerm, selectedPhaseFilter]);

  // Group deliverables by phase
  const deliverablesByPhase = useMemo(() => {
    const grouped = filteredDeliverables.reduce(
      (acc, deliverable) => {
        // Usar phaseId para agrupar correctamente
        const phaseId = deliverable.phaseId || deliverable.id;
        if (!acc[phaseId]) {
          // Buscar el nombre de la fase
          const phase = phases.find((p) => p.id === phaseId);
          acc[phaseId] = {
            phaseName: phase?.name || "Fase desconocida",
            deliverables: [],
          };
        }
        acc[phaseId].deliverables.push(deliverable);
        return acc;
      },
      {} as Record<string, { phaseName: string; deliverables: DeliverableTemplateResponseDto[] }>
    );

    // Sort deliverables within each phase by order
    Object.values(grouped).forEach((phase) => {
      phase.deliverables.sort((a, b) =>
        calculateDeliverableVisualOrder(a, deliverables, phases, milestoneTemplates).localeCompare(
          calculateDeliverableVisualOrder(b, deliverables, phases, milestoneTemplates)
        )
      );
    });

    return grouped;
  }, [filteredDeliverables, phases]);

  const uniquePhases = useMemo(() => {
    const phaseMap = availableDeliverables.reduce(
      (acc, deliverable) => {
        const phaseId = deliverable.phaseId || deliverable.id;
        const phase = phases.find((p) => p.id === phaseId);
        if (phase && !acc[phaseId]) {
          acc[phaseId] = phase.name;
        }
        return acc;
      },
      {} as Record<string, string>
    );
    return Object.entries(phaseMap);
  }, [availableDeliverables, phases]);

  const isSelected = (deliverableId: string) => {
    return selectedPrecedences.some((p) => p.deliverableId === deliverableId);
  };

  const togglePrecedence = (deliverableId: string) => {
    if (isSelected(deliverableId)) {
      onPrecedencesChange(selectedPrecedences.filter((p) => p.deliverableId !== deliverableId));
    } else {
      onPrecedencesChange([...selectedPrecedences, { deliverableId }]);
    }
  };

  const removePrecedence = (deliverableId: string) => {
    onPrecedencesChange(selectedPrecedences.filter((p) => p.deliverableId !== deliverableId));
  };

  const selectedDeliverables = useMemo(() => {
    return selectedPrecedences
      .map((p) => availableDeliverables.find((d) => d.id === p.deliverableId))
      .filter(Boolean) as DeliverableTemplateResponseDto[];
  }, [selectedPrecedences, availableDeliverables]);

  return (
    <div className="max-w-6xl max-h-[90vh] p-0 border rounded-lg shadow-sm bg-card overflow-hidden">
      {/* Header (antes DialogHeader/DialogTitle) */}
      <div className="px-4 sm:px-6 py-4 border-b bg-card">
        <div className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
          <GitBranch className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
          <div className="font-semibold">Gestión Avanzada de Precedencias</div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Configurando dependencias para:{" "}
          <span className="font-semibold text-foreground">{currentDeliverable.name}</span>
        </p>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Left Panel - Deliverable Selection */}
        <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r">
          {/* Search and Filters */}
          <div className="p-3 sm:p-4 border-b bg-muted/30">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar entregables..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedPhaseFilter} onValueChange={setSelectedPhaseFilter}>
                <SelectTrigger className="w-full sm:w-auto">
                  <SelectValue placeholder="Todas las fases" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las fases</SelectItem>
                  {uniquePhases.map(([id, name]) => (
                    <SelectItem key={id} value={id}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {filteredDeliverables.length} entregables disponibles
                </span>
              </div>
            </div>
          </div>

          {/* Deliverables List */}
          <ScrollArea className="flex-1">
            <div className="p-3 sm:p-4">
              <div className="space-y-4">
                {Object.entries(deliverablesByPhase).map(([phaseId, phase]) => (
                  <div key={phaseId} className="space-y-2">
                    <div className="flex items-center gap-2 py-2">
                      <div className="h-px bg-border flex-1" />
                      <Badge variant="outline" className="text-xs font-medium">
                        {phase.phaseName}
                      </Badge>
                      <div className="h-px bg-border flex-1" />
                    </div>

                    <div className="grid gap-2">
                      {phase.deliverables.map((deliverable) => (
                        <div
                          key={deliverable.id}
                          className={`p-2 sm:p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                            isSelected(deliverable.id)
                              ? "border-accent bg-accent/5 shadow-sm"
                              : "border-border hover:border-accent/50"
                          }`}
                          onClick={() => togglePrecedence(deliverable.id)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                              <div
                                className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                  isSelected(deliverable.id) ? "border-accent bg-accent" : "border-muted-foreground"
                                }`}
                              >
                                {isSelected(deliverable.id) && <CheckCircle2 className="h-3 w-3 text-white" />}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-medium text-sm truncate">{deliverable.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  Orden:{" "}
                                  {calculateDeliverableVisualOrder(
                                    deliverable,
                                    deliverables,
                                    phases,
                                    milestoneTemplates
                                  )}
                                </div>
                              </div>
                            </div>
                            {deliverable.priority && (
                              <Badge
                                className={`text-xs flex-shrink-0 ${
                                  deliverablePriorityConfig[deliverable.priority as DeliverablePriority]?.borderColor
                                }`}
                                variant={"outline"}
                              >
                                <span
                                  className={`w-3.5 h-3.5 rounded-full inline-block mr-2 ${
                                    deliverablePriorityConfig[deliverable.priority as DeliverablePriority]?.dotClass ??
                                    "bg-gray-400"
                                  }`}
                                />
                                {deliverablePriorityConfig[deliverable.priority as DeliverablePriority]?.label ??
                                  deliverable.priority}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Right Panel - Selected Precedences */}
        <div className="w-full lg:w-80 flex flex-col bg-muted/20">
          <div className="p-3 sm:p-4 border-b">
            <h3 className="font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-accent" />
              Precedencias Seleccionadas
            </h3>
            <p className="text-xs text-muted-foreground mt-1">{selectedPrecedences.length} dependencias configuradas</p>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-3 sm:p-4">
              {selectedDeliverables.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No hay precedencias seleccionadas</p>
                  <p className="text-xs text-muted-foreground mt-1">Selecciona entregables de la lista</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDeliverables.map((deliverable, index) => (
                    <div key={deliverable.id} className="relative">
                      <div className="p-2 sm:p-3 bg-background rounded-lg border border-accent/20 shadow-sm">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{deliverable.name}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {calculateDeliverableVisualOrder(deliverable, deliverables, phases, milestoneTemplates)}
                            </div>
                            {deliverable.priority && (
                              <Badge
                                className={`text-xs mt-2 ${
                                  deliverablePriorityConfig[deliverable.priority as DeliverablePriority]?.borderColor
                                }`}
                                variant={"outline"}
                              >
                                <span
                                  className={`w-3.5 h-3.5 rounded-full inline-block mr-2 ${
                                    deliverablePriorityConfig[deliverable.priority as DeliverablePriority]?.dotClass ??
                                    "bg-gray-400"
                                  }`}
                                />
                                {deliverablePriorityConfig[deliverable.priority as DeliverablePriority]?.label ??
                                  deliverable.priority}
                              </Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removePrecedence(deliverable.id)}
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive flex-shrink-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {index < selectedDeliverables.length - 1 && (
                        <div className="flex justify-center py-2">
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="mt-4 p-3 bg-accent/5 rounded-lg border border-accent/20">
                    <div className="flex items-center gap-2 text-sm font-medium text-accent">
                      <CheckCircle2 className="h-4 w-4" />
                      Entregable Actual
                    </div>
                    <div className="text-sm mt-1">{currentDeliverable.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {calculateDeliverableVisualOrder(currentDeliverable, deliverables, phases, milestoneTemplates)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
