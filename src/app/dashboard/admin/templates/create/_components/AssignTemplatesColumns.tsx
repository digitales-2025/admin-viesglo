import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { Edit, GitBranch, MoreVertical, Package, Plus, Target, Trash2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { DialogType } from "@/shared/stores/useDialogStore";
import { MilestoneDialog } from "../../_components/dialogs/MilestoneDialog";
import { CreateProjectTemplate } from "../../_schemas/projectTemplates.schemas";
import {
  DeliverablePriority,
  DeliverableTemplateResponseDto,
  MilestoneTemplateResponseDto,
  PhaseTemplateResponseDto,
} from "../../_types/templates.types";
import {
  calculateDeliverableVisualOrder,
  calculatePhaseVisualOrder,
  calculateVisualOrder,
} from "../../_utils/create-template.utils";
import {
  useHandleDeliverableDragEnd,
  useHandleEditDeliverable,
} from "../../_utils/handlers/deliverable-template.handlers.utils";
import { handleEditMilestoneRefConfig } from "../../_utils/handlers/milestone-ref-template.handlers.utils";
import { handleMilestoneDragEnd } from "../../_utils/handlers/milestone-template.handlers.utils";
import { useHandleEditPhase, useHandlePhaseDragEnd } from "../../_utils/handlers/phase-template.handlers.utils";
import { deliverablePriorityConfig } from "../../_utils/templates.utils";

interface AssignTemplatesColumnsProps {
  form: UseFormReturn<CreateProjectTemplate>;
  selectedMilestones: string[];
  setSelectedMilestones: React.Dispatch<React.SetStateAction<string[]>>;
  selectedMilestoneObjects: MilestoneTemplateResponseDto[];
  setSelectedMilestoneObjects: React.Dispatch<React.SetStateAction<MilestoneTemplateResponseDto[]>>;
  milestones: MilestoneTemplateResponseDto[];
  setMilestones: React.Dispatch<React.SetStateAction<MilestoneTemplateResponseDto[]>>;
  phases: (PhaseTemplateResponseDto & { milestoneId: string })[];
  deliverables: (DeliverableTemplateResponseDto & { phaseId: string })[];
  selectedMilestone: string | null;
  setSelectedMilestone: React.Dispatch<React.SetStateAction<string | null>>;
  selectedPhase: string | null;
  setSelectedPhase: React.Dispatch<React.SetStateAction<string | null>>;
  open: (module: string, type: DialogType, data?: any) => void;
  setPhaseToEdit: React.Dispatch<React.SetStateAction<(PhaseTemplateResponseDto & { milestoneId: string }) | null>>;
  setDeliverableToEdit: React.Dispatch<
    React.SetStateAction<(DeliverableTemplateResponseDto & { phaseId: string }) | null>
  >;
}

export default function AssignTemplatesColumns({
  form,
  selectedMilestones,
  setSelectedMilestones,
  selectedMilestoneObjects,
  setSelectedMilestoneObjects,
  milestones,
  setMilestones,
  phases,
  deliverables,
  selectedMilestone,
  setSelectedMilestone,
  selectedPhase,
  setSelectedPhase,
  open,
  setPhaseToEdit,
  setDeliverableToEdit,
}: AssignTemplatesColumnsProps) {
  const visiblePhases = selectedMilestone ? phases.filter((p) => p.milestoneId === selectedMilestone) : [];
  const visibleDeliverables = selectedPhase ? deliverables.filter((d) => d.phaseId === selectedPhase) : [];
  // Hooks para manejar operaciones de fases
  const handleEditPhase = useHandleEditPhase();
  const handlePhaseDragEnd = useHandlePhaseDragEnd();

  // Hooks para manejar operaciones de entregables
  const handleEditDeliverable = useHandleEditDeliverable();
  const handleDeliverableDragEnd = useHandleDeliverableDragEnd();
  // Funciones para toggle de filtros
  const toggleMilestoneSelection = (milestoneId: string) => {
    if (selectedMilestone === milestoneId) {
      setSelectedMilestone(null);
      setSelectedPhase(null);
    } else {
      setSelectedMilestone(milestoneId);
      setSelectedPhase(null);
    }
  };
  const togglePhaseSelection = (phaseId: string) => {
    if (selectedPhase === phaseId) {
      setSelectedPhase(null);
    } else {
      setSelectedPhase(phaseId);
    }
  };
  // Función para actualizar milestones seleccionados
  const updateSelectedMilestoneObjects = (newMilestoneObjects: MilestoneTemplateResponseDto[]) => {
    setSelectedMilestoneObjects(newMilestoneObjects);
  };

  const getPrecedenceDisplay = (deliverable: DeliverableTemplateResponseDto) => {
    if (!deliverable.precedence || deliverable.precedence.length === 0) return null;

    const precedenceNames = deliverable.precedence
      .map((p) => {
        const dep = deliverables.find((d) => d.id === p.deliverableId);
        return dep ? calculateDeliverableVisualOrder(dep, deliverables, phases, milestones) : null;
      })
      .filter(Boolean)
      .join(", ");

    return precedenceNames || null;
  };

  return (
    <div>
      <div className="grid xl:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6">
        {/* Hitos Column */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2 lg:flex-row flex-col">
              <CardTitle className="text-lg">Hitos</CardTitle>
              <MilestoneDialog
                selectedMilestones={selectedMilestones}
                onMilestonesChange={setSelectedMilestones}
                selectedMilestoneObjects={selectedMilestoneObjects}
                onMilestoneObjectsChange={setSelectedMilestoneObjects}
                milestones={milestones}
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            <DragDropContext onDragEnd={(result) => handleMilestoneDragEnd(result, milestones, setMilestones)}>
              <Droppable droppableId="milestones">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                    {milestones.length === 0 ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                          <Target className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">No hay hitos creados</p>
                          <p className="text-xs text-muted-foreground/70">Haz clic en "Agregar hito" para comenzar</p>
                        </div>
                      </div>
                    ) : (
                      milestones.map((milestone, index) => (
                        <Draggable key={milestone.id} draggableId={milestone.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                selectedMilestone === milestone.id
                                  ? "bg-primary/10 border-primary"
                                  : "bg-card hover:bg-muted"
                              } ${snapshot.isDragging ? "shadow-lg" : ""}`}
                              onClick={() => toggleMilestoneSelection(milestone.id)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="secondary" className="text-xs">
                                      {calculateVisualOrder(milestones.findIndex((m) => m.id === milestone.id))}
                                    </Badge>
                                    <span className="text-sm font-medium">{milestone.name}</span>
                                  </div>
                                  {milestone.description && (
                                    <p className="text-xs text-muted-foreground">{milestone.description}</p>
                                  )}
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                      <MoreVertical className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditMilestoneRefConfig(milestone, form, open);
                                      }}
                                    >
                                      Editar
                                      <DropdownMenuShortcut>
                                        <Edit className="size-4 mr-2" />
                                      </DropdownMenuShortcut>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // Remover el milestone de la lista de seleccionados (sin mutación)
                                        const updatedMilestones = milestones.filter((m) => m.id !== milestone.id);
                                        setMilestones(updatedMilestones);

                                        // También remover de selectedMilestoneObjects
                                        const updatedSelectedMilestoneObjects = selectedMilestoneObjects.filter(
                                          (m) => m.id !== milestone.id
                                        );
                                        setSelectedMilestoneObjects(updatedSelectedMilestoneObjects);

                                        // También remover de selectedMilestones
                                        const updatedSelectedMilestones = selectedMilestones.filter(
                                          (id) => id !== milestone.id
                                        );
                                        setSelectedMilestones(updatedSelectedMilestones);

                                        // Si el milestone eliminado era el seleccionado, deseleccionarlo
                                        if (selectedMilestone === milestone.id) {
                                          setSelectedMilestone(null);
                                          setSelectedPhase(null);
                                        }
                                      }}
                                    >
                                      Eliminar
                                      <DropdownMenuShortcut>
                                        <Trash2 className="size-4 mr-2 text-destructive" />
                                      </DropdownMenuShortcut>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </CardContent>
        </Card>

        {/* Fases Column */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2 lg:flex-row flex-col">
              <div>
                <CardTitle className="text-lg">Fases</CardTitle>
                {selectedMilestone && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Hito {calculateVisualOrder(milestones.findIndex((m) => m.id === selectedMilestone))} -{" "}
                    {milestones.find((m) => m.id === selectedMilestone)?.name}
                  </p>
                )}
              </div>
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => open("phase-templates", "create")}
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar fase
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            <DragDropContext
              onDragEnd={(result) =>
                handlePhaseDragEnd(
                  result,
                  selectedMilestone,
                  phases,
                  selectedMilestoneObjects,
                  updateSelectedMilestoneObjects
                )
              }
            >
              <Droppable droppableId="phases">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                    {!selectedMilestone ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                          <Target className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">No hay hito seleccionado</p>
                          <p className="text-xs text-muted-foreground/70">Selecciona un hito para ver sus fases</p>
                        </div>
                      </div>
                    ) : visiblePhases.length === 0 ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                          <GitBranch className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">No hay fases creadas</p>
                          <p className="text-xs text-muted-foreground/70">Haz clic en "Agregar fase" para comenzar</p>
                        </div>
                      </div>
                    ) : (
                      visiblePhases.map((phase, index) => (
                        <Draggable key={phase.id} draggableId={phase.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                selectedPhase === phase.id ? "bg-primary/10 border-primary" : "bg-card hover:bg-muted"
                              } ${snapshot.isDragging ? "shadow-lg" : ""}`}
                              onClick={() => togglePhaseSelection(phase.id)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="secondary" className="text-xs">
                                      {phase ? calculatePhaseVisualOrder(phase, milestones, phases) : ""}
                                    </Badge>
                                    <span className="text-sm font-medium">{phase?.name || ""}</span>
                                  </div>
                                  {phase.description && (
                                    <p className="text-xs text-muted-foreground">{phase.description}</p>
                                  )}
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                      <MoreVertical className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditPhase(phase, open, phases, setPhaseToEdit);
                                      }}
                                    >
                                      Editar
                                      <DropdownMenuShortcut>
                                        <Edit className="size-4 mr-2" />
                                      </DropdownMenuShortcut>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // Buscar el milestone template que contiene esta fase
                                        const milestoneTemplate = selectedMilestoneObjects.find((mt) =>
                                          mt.phases?.some((p) => p.id === phase.id)
                                        );
                                        if (milestoneTemplate) {
                                          open("phase-delete", "delete", {
                                            milestoneTemplateId: milestoneTemplate.id,
                                            phaseId: phase.id,
                                            phaseName: phase.name,
                                          });
                                        }
                                      }}
                                    >
                                      Eliminar
                                      <DropdownMenuShortcut>
                                        <Trash2 className="size-4 mr-2 text-destructive" />
                                      </DropdownMenuShortcut>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </CardContent>
        </Card>

        {/* Entregables Column */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2 lg:flex-row flex-col">
              <div>
                <CardTitle className="text-lg">Entregables</CardTitle>
                {selectedPhase && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {(() => {
                      const phase = phases.find((p) => p.id === selectedPhase);
                      if (!phase) return "";
                      return `${calculatePhaseVisualOrder(phase, milestones, phases)} - ${phase.name}`;
                    })()}
                  </p>
                )}
              </div>
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => open("deliverable-templates", "create")}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo entregable
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            <DragDropContext
              onDragEnd={(result) =>
                handleDeliverableDragEnd(
                  result,
                  selectedPhase,
                  deliverables,
                  selectedMilestoneObjects,
                  updateSelectedMilestoneObjects
                )
              }
            >
              <Droppable droppableId="deliverables">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                    {!selectedPhase ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                          <GitBranch className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">No hay fase seleccionada</p>
                          <p className="text-xs text-muted-foreground/70">
                            Selecciona una fase para ver sus entregables
                          </p>
                        </div>
                      </div>
                    ) : visibleDeliverables.length === 0 ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                          <Package className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">No hay entregables creados</p>
                          <p className="text-xs text-muted-foreground/70">
                            Haz clic en "Nuevo entregable" para comenzar
                          </p>
                        </div>
                      </div>
                    ) : (
                      visibleDeliverables.map((deliverable, index) => (
                        <Draggable key={deliverable.id} draggableId={deliverable.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-3 border rounded-lg cursor-pointer ${
                                snapshot.isDragging ? "shadow-lg" : ""
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="secondary" className="text-xs">
                                      {deliverable
                                        ? calculateDeliverableVisualOrder(deliverable, deliverables, phases, milestones)
                                        : ""}
                                    </Badge>
                                    <Badge
                                      className={`text-xs mt-2 ${
                                        deliverablePriorityConfig[deliverable.priority as DeliverablePriority]
                                          ?.borderColor
                                      }`}
                                      variant={"outline"}
                                    >
                                      <span
                                        className={`w-3.5 h-3.5 rounded-full inline-block mr-2 ${
                                          deliverablePriorityConfig[deliverable.priority as DeliverablePriority]
                                            ?.dotClass ?? "bg-gray-400"
                                        }`}
                                      />
                                      {deliverablePriorityConfig[deliverable.priority as DeliverablePriority]?.label ??
                                        deliverable.priority}
                                    </Badge>
                                  </div>
                                  <span className="text-sm font-medium block mb-1">{deliverable?.name || ""}</span>
                                  {getPrecedenceDisplay(deliverable) && (
                                    <div className="text-xs text-muted-foreground">
                                      Depende de: {getPrecedenceDisplay(deliverable)}
                                    </div>
                                  )}
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                      <MoreVertical className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditDeliverable(deliverable, deliverables, setDeliverableToEdit, open);
                                      }}
                                    >
                                      Editar
                                      <DropdownMenuShortcut>
                                        <Edit className="size-4 mr-2" />
                                      </DropdownMenuShortcut>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // Buscar el milestone template y fase que contiene este entregable
                                        const milestoneTemplate = selectedMilestoneObjects.find((mt) =>
                                          mt.phases?.some((p) => p.deliverables?.some((d) => d.id === deliverable.id))
                                        );
                                        const phase = milestoneTemplate?.phases?.find((p) =>
                                          p.deliverables?.some((d) => d.id === deliverable.id)
                                        );
                                        if (milestoneTemplate && phase) {
                                          open("deliverable-delete", "delete", {
                                            milestoneTemplateId: milestoneTemplate.id,
                                            phaseId: phase.id,
                                            deliverableId: deliverable.id,
                                            deliverableName: deliverable.name,
                                          });
                                        }
                                      }}
                                    >
                                      Eliminar
                                      <DropdownMenuShortcut>
                                        <Trash2 className="size-4 mr-2 text-destructive" />
                                      </DropdownMenuShortcut>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
