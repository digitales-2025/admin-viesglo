import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import { Button } from "@/shared/components/ui/button";
import { useMediaQuery } from "@/shared/hooks/use-media-query";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { RecoveryDialog } from "../../_components/dialogs/RecoveryDialog";
import TemplatesOverlays from "../../_components/templates-overlays/TemplatesOverlays";
import { CreateProjectTemplate, DeliverableFormData, PhaseFormData } from "../../_schemas/projectTemplates.schemas";
import { TemplateDraftData } from "../../_stores/template-draft.store";
import {
  DeliverableTemplateResponseDto,
  MilestoneTemplateRefRequestDto,
  MilestoneTemplateResponseDto,
  PhaseTemplateResponseDto,
  TagResponseDto,
} from "../../_types/templates.types";
import { extractDataFromSelectedMilestones } from "../../_utils/create-template.utils";
import AssignTemplatesColumns from "./AssignTemplatesColumns";
import CreateHeaderProjectTemplateForm from "./CreateHeaderProjectTemplateForm";

interface CreateProjectTemplateFormProps {
  form: UseFormReturn<CreateProjectTemplate>;
  handleSave: () => void;
  isPending: boolean;
  selectedMilestones: string[];
  setSelectedMilestones: React.Dispatch<React.SetStateAction<string[]>>;
  selectedMilestoneObjects: MilestoneTemplateResponseDto[];
  setSelectedMilestoneObjects: React.Dispatch<React.SetStateAction<MilestoneTemplateResponseDto[]>>;
  updateMilestones: (milestones: MilestoneTemplateRefRequestDto[]) => void;
  updateTags: (tags: string[]) => void;
  selectedTags: string[];
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>;
  selectedTagObjects: TagResponseDto[];
  setSelectedTagObjects: React.Dispatch<React.SetStateAction<TagResponseDto[]>>;
  showRecoveryDialog: boolean;
  draftData: TemplateDraftData | null;
  recoverDraft: (data: CreateProjectTemplate) => void;
  dismissDraft: () => void;
  handleNavigationWithWarning?: (url: string) => void; // Prop para manejar navegación con advertencia
  onNavigationWarningConfirm?: (targetUrl: string) => void; // Prop para confirmar navegación
  onNavigationWarningCancel?: () => void; // Prop para cancelar navegación
}

export default function CreateProjectTemplateForm({
  form,
  handleSave,
  isPending,
  selectedMilestones,
  selectedMilestoneObjects,
  setSelectedMilestones,
  setSelectedMilestoneObjects,
  updateMilestones,
  updateTags,
  selectedTags,
  setSelectedTags,
  selectedTagObjects,
  setSelectedTagObjects,
  showRecoveryDialog,
  draftData,
  recoverDraft,
  dismissDraft,
  handleNavigationWithWarning,
  onNavigationWarningConfirm,
  onNavigationWarningCancel,
}: CreateProjectTemplateFormProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { open } = useDialogStore();

  // Estados para manejar edición
  const [_, setMilestoneToEdit] = useState<MilestoneTemplateResponseDto | null>(null);
  const [phaseToEdit, setPhaseToEdit] = useState<(PhaseTemplateResponseDto & { milestoneId: string }) | null>(null);
  const [deliverableToEdit, setDeliverableToEdit] = useState<
    (DeliverableTemplateResponseDto & { phaseId: string }) | null
  >(null);
  const [milestones, setMilestones] = useState<MilestoneTemplateResponseDto[]>([]);
  const [phases, setPhases] = useState<(PhaseTemplateResponseDto & { milestoneId: string })[]>([]);
  const [deliverables, setDeliverables] = useState<(DeliverableTemplateResponseDto & { phaseId: string })[]>([]);

  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);

  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Actualizar estados cuando los milestones seleccionados cambien
  useEffect(() => {
    const {
      milestones: extractedMilestones,
      phases: extractedPhases,
      deliverables: extractedDeliverables,
    } = extractDataFromSelectedMilestones(selectedMilestoneObjects);

    // Preservar el orden actual de milestones si ya existen
    if (milestones.length > 0) {
      // Reordenar los milestones extraídos según el orden actual
      const reorderedMilestones = extractedMilestones.sort((a, b) => {
        const aIndex = milestones.findIndex((m) => m.id === a.id);
        const bIndex = milestones.findIndex((m) => m.id === b.id);
        if (aIndex === -1) return 1; // Si no existe en el orden actual, ponerlo al final
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });
      setMilestones(reorderedMilestones);
    } else {
      setMilestones(extractedMilestones);
    }

    // Combinar fases extraídas con fases locales existentes
    const existingLocalPhases = phases.filter((p) => p.id.startsWith("phase-"));
    const combinedPhases = [...extractedPhases];

    existingLocalPhases.forEach((localPhase) => {
      const exists = combinedPhases.some((extractedPhase) => extractedPhase.id === localPhase.id);
      if (!exists) {
        combinedPhases.push(localPhase);
      }
    });

    // Verificar duplicados antes de setear
    const phaseIds = combinedPhases.map((p) => p.id);
    const duplicates = phaseIds.filter((id, index) => phaseIds.indexOf(id) !== index);
    if (duplicates.length > 0) {
      // Eliminar duplicados antes de setear
      const uniquePhases = combinedPhases.filter(
        (phase, index, self) => index === self.findIndex((p) => p.id === phase.id)
      );
      setPhases(uniquePhases);
    } else {
      setPhases(combinedPhases);
    }

    // Combinar deliverables extraídos con deliverables locales existentes
    const existingLocalDeliverables = deliverables.filter((d) => d.id.startsWith("deliverable-"));
    const combinedDeliverables = [...extractedDeliverables];

    existingLocalDeliverables.forEach((localDeliverable) => {
      const exists = combinedDeliverables.some(
        (extractedDeliverable) => extractedDeliverable.id === localDeliverable.id
      );
      if (!exists) {
        combinedDeliverables.push(localDeliverable);
      }
    });

    // Verificar duplicados antes de setear deliverables
    const deliverableIds = combinedDeliverables.map((d) => d.id);
    const deliverableDuplicates = deliverableIds.filter((id, index) => deliverableIds.indexOf(id) !== index);
    if (deliverableDuplicates.length > 0) {
      // Eliminar duplicados antes de setear
      const uniqueDeliverables = combinedDeliverables.filter(
        (deliverable, index, self) => index === self.findIndex((d) => d.id === deliverable.id)
      );
      setDeliverables(uniqueDeliverables);
    } else {
      setDeliverables(combinedDeliverables);
    }
  }, [selectedMilestoneObjects, milestones.length]);

  // ===== GESTIÓN DE SELECCIÓN AUTOMÁTICA =====
  // Solo seleccionar automáticamente en la primera carga
  useEffect(() => {
    if (isFirstLoad && milestones.length > 0 && !selectedMilestone) {
      setSelectedMilestone(milestones[0].id);
    }
  }, [milestones, isFirstLoad]); // Removido selectedMilestone de las dependencias

  // Solo seleccionar automáticamente la primera fase en la primera carga
  useEffect(() => {
    if (isFirstLoad && selectedMilestone && phases.length > 0 && !selectedPhase) {
      const phasesInMilestone = phases.filter((p) => p.milestoneId === selectedMilestone);
      if (phasesInMilestone.length > 0) {
        setSelectedPhase(phasesInMilestone[0].id);
      }
    }
  }, [selectedMilestone, phases, isFirstLoad]); // Removido selectedPhase de las dependencias

  // Marcar que ya no es la primera carga después de la selección inicial
  useEffect(() => {
    if (isFirstLoad && selectedMilestone && selectedPhase) {
      setIsFirstLoad(false);
    }
  }, [selectedMilestone, selectedPhase, isFirstLoad]);

  // Sincronizar tags seleccionados con el formulario
  useEffect(() => {
    updateTags(selectedTags);
  }, [selectedTags, updateTags]);

  // Sincronizar milestones seleccionados con el formulario (solo cuando se agregan nuevos)
  useEffect(() => {
    // Obtener las configuraciones actuales del formulario
    const currentMilestones = form.getValues().milestones || [];

    // Solo agregar milestones que no existen en el formulario
    const newMilestones = selectedMilestoneObjects.filter(
      (milestone) => !currentMilestones.some((ref) => ref.milestoneTemplateId === milestone.id)
    );

    if (newMilestones.length > 0) {
      const newMilestoneRefs = newMilestones.map((milestone) => ({
        milestoneTemplateId: milestone.id,
        isRequired: false,
        customName: undefined,
        customizations: undefined,
      }));

      const updatedMilestones = [...currentMilestones, ...newMilestoneRefs] as any;
      updateMilestones(updatedMilestones);
    }
  }, [selectedMilestoneObjects.map((m) => m.id).join(","), updateMilestones, form]);

  // Reordenar milestones cuando cambia el orden visual (solo después de drag and drop)
  useEffect(() => {
    // Si el estado visual de milestones está vacío, no hacer nada
    // (esto evita interferir durante la carga inicial)
    if (milestones.length === 0) {
      return;
    }

    // Obtener las configuraciones actuales del formulario
    const currentMilestones = form.getValues().milestones || [];

    // Si el formulario no tiene milestones, no hacer nada
    if (currentMilestones.length === 0) {
      return;
    }

    // Verificar si ya tenemos configuraciones personalizadas cargadas desde la API
    const hasCustomConfigs = currentMilestones.some(
      (ref) => ref.customName !== undefined || ref.customizations !== undefined || ref.isRequired !== false
    );

    // Si no hay configuraciones personalizadas, no hacer nada
    if (!hasCustomConfigs) {
      return;
    }

    // Solo reordenar si el orden de milestones es diferente al orden en el formulario
    const currentOrder = currentMilestones.map((ref) => ref.milestoneTemplateId);
    const newOrder = milestones.map((m) => m.id);

    const orderChanged = JSON.stringify(currentOrder) !== JSON.stringify(newOrder);

    if (!orderChanged) {
      return;
    }

    // Reordenar las configuraciones existentes según el orden actual de milestones
    const reorderedMilestoneRefs = milestones.map((milestone) => {
      const existingConfig = currentMilestones.find((ref) => ref.milestoneTemplateId === milestone.id);

      if (existingConfig) {
        return existingConfig;
      } else {
        return {
          milestoneTemplateId: milestone.id,
          isRequired: false,
          customName: undefined,
          customizations: undefined,
        };
      }
    });

    updateMilestones(reorderedMilestoneRefs as any);
  }, [milestones.map((m) => m.id).join(","), updateMilestones, form]);

  // Nueva función que recibe la respuesta del backend con el ID real
  const addPhaseWithResponse = (response: MilestoneTemplateResponseDto) => {
    // Extraer la nueva fase de la respuesta del backend
    const newPhaseFromBackend = response.phases?.[response.phases.length - 1];

    if (newPhaseFromBackend) {
      const phaseWithMilestoneId: PhaseTemplateResponseDto & { milestoneId: string } = {
        ...newPhaseFromBackend,
        milestoneId: response.id,
      };

      setPhases([...phases, phaseWithMilestoneId]);

      // ACTUALIZAR selectedMilestoneObjects con la respuesta completa del backend
      const updatedMilestoneObjects = selectedMilestoneObjects.map((milestone) => {
        if (milestone.id === response.id) {
          return response; // Usar la respuesta completa del backend
        }
        return milestone;
      });
      setSelectedMilestoneObjects(updatedMilestoneObjects);
    }
  };

  const updatePhase = (data: PhaseFormData) => {
    if (phaseToEdit) {
      // Buscar la fase actual en el array para obtener su milestoneId
      const currentPhase = phases.find((p) => p.id === phaseToEdit.id);
      const currentMilestoneId = currentPhase?.milestoneId || "";

      const updatedPhase: PhaseTemplateResponseDto & { milestoneId: string } = {
        ...phaseToEdit,
        name: data.name,
        description: data.description,
        milestoneId: currentMilestoneId,
      };

      setPhases(phases.map((p) => (p.id === phaseToEdit.id ? updatedPhase : p)));

      // ACTUALIZAR selectedMilestoneObjects para reflejar los cambios
      const updatedMilestoneObjects = selectedMilestoneObjects.map((milestone) => {
        if (milestone.id === currentMilestoneId) {
          return {
            ...milestone,
            phases: milestone.phases?.map((phase) => (phase.id === phaseToEdit.id ? updatedPhase : phase)) || [],
          };
        }
        return milestone;
      });
      setSelectedMilestoneObjects(updatedMilestoneObjects);

      setPhaseToEdit(null);
    }
  };

  // Nueva función que recibe la respuesta del backend con el ID real
  const addDeliverableWithResponse = (response: MilestoneTemplateResponseDto) => {
    // Extraer el nuevo entregable de la respuesta del backend
    // Buscar en todas las fases del milestone para encontrar el entregable más reciente
    let newDeliverableFromBackend: DeliverableTemplateResponseDto | undefined;
    let phaseId: string | undefined;

    for (const phase of response.phases || []) {
      if (phase.deliverables && phase.deliverables.length > 0) {
        // Tomar el último entregable de la fase (el más reciente)
        const lastDeliverable = phase.deliverables[phase.deliverables.length - 1];
        if (lastDeliverable) {
          newDeliverableFromBackend = lastDeliverable;
          phaseId = phase.id;
          break;
        }
      }
    }

    if (newDeliverableFromBackend && phaseId) {
      const deliverableWithPhaseId: DeliverableTemplateResponseDto & { phaseId: string } = {
        ...newDeliverableFromBackend,
        phaseId: phaseId,
      };

      setDeliverables([...deliverables, deliverableWithPhaseId]);

      // ACTUALIZAR selectedMilestoneObjects con la respuesta completa del backend
      const updatedMilestoneObjects = selectedMilestoneObjects.map((milestone) => {
        if (milestone.id === response.id) {
          return response; // Usar la respuesta completa del backend
        }
        return milestone;
      });
      setSelectedMilestoneObjects(updatedMilestoneObjects);
    }
  };

  const updateDeliverable = (data: DeliverableFormData) => {
    if (deliverableToEdit) {
      const updatedDeliverable: DeliverableTemplateResponseDto & { phaseId: string } = {
        ...deliverableToEdit,
        name: data.name,
        description: data.description,
        priority: data.priority,
        precedence: data.precedence,
        phaseId: selectedPhase ?? "",
      };
      setDeliverables(deliverables.map((d) => (d.id === deliverableToEdit.id ? updatedDeliverable : d)));

      // ACTUALIZAR selectedMilestoneObjects para reflejar los cambios
      const updatedMilestoneObjects = selectedMilestoneObjects.map((milestone) => {
        return {
          ...milestone,
          phases:
            milestone.phases?.map((phase) => {
              if (phase.id === selectedPhase) {
                return {
                  ...phase,
                  deliverables:
                    phase.deliverables?.map((deliverable) =>
                      deliverable.id === deliverableToEdit.id ? updatedDeliverable : deliverable
                    ) || [],
                };
              }
              return phase;
            }) || [],
        };
      });
      setSelectedMilestoneObjects(updatedMilestoneObjects);

      setDeliverableToEdit(null);
    }
  };

  // Funciones para eliminar elementos
  const deletePhase = (phaseId: string) => {
    // Eliminar la fase del estado local
    setPhases(phases.filter((p) => p.id !== phaseId));

    // Si la fase eliminada era la seleccionada, deseleccionarla
    if (selectedPhase === phaseId) {
      setSelectedPhase(null);
    }

    // Eliminar todos los entregables asociados a esta fase
    setDeliverables(deliverables.filter((d) => d.phaseId !== phaseId));

    // ACTUALIZAR selectedMilestoneObjects para reflejar la eliminación
    const updatedMilestoneObjects = selectedMilestoneObjects.map((milestone) => {
      if (milestone.phases?.some((phase) => phase.id === phaseId)) {
        return {
          ...milestone,
          phases: milestone.phases?.filter((phase) => phase.id !== phaseId) || [],
        };
      }
      return milestone;
    });
    setSelectedMilestoneObjects(updatedMilestoneObjects);
  };

  const deleteDeliverable = (deliverableId: string) => {
    // Eliminar el entregable del estado local
    setDeliverables(deliverables.filter((d) => d.id !== deliverableId));

    // ACTUALIZAR selectedMilestoneObjects para reflejar la eliminación
    const updatedMilestoneObjects = selectedMilestoneObjects.map((milestone) => {
      return {
        ...milestone,
        phases:
          milestone.phases?.map((phase) => {
            return {
              ...phase,
              deliverables: phase.deliverables?.filter((deliverable) => deliverable.id !== deliverableId) || [],
            };
          }) || [],
      };
    });
    setSelectedMilestoneObjects(updatedMilestoneObjects);
  };

  // Funciones para limpiar estados de edición
  const clearEditStates = () => {
    setMilestoneToEdit(null);
    setPhaseToEdit(null);
    setDeliverableToEdit(null);
  };

  return (
    <div className="px-2">
      {/* Template Name and Tags */}
      <CreateHeaderProjectTemplateForm
        form={form}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        selectedTagObjects={selectedTagObjects}
        setSelectedTagObjects={setSelectedTagObjects}
      />

      {/* Main Content - 3 Columns */}
      <AssignTemplatesColumns
        form={form}
        selectedMilestones={selectedMilestones}
        setSelectedMilestones={setSelectedMilestones}
        selectedMilestoneObjects={selectedMilestoneObjects}
        setSelectedMilestoneObjects={setSelectedMilestoneObjects}
        milestones={milestones}
        setMilestones={setMilestones}
        phases={phases}
        deliverables={deliverables}
        selectedMilestone={selectedMilestone}
        setSelectedMilestone={setSelectedMilestone}
        selectedPhase={selectedPhase}
        setSelectedPhase={setSelectedPhase}
        open={open}
        setPhaseToEdit={setPhaseToEdit}
        setDeliverableToEdit={setDeliverableToEdit}
      />
      {/* Save Button */}
      <div className="flex justify-end mt-6 gap-2">
        <Button variant="outline" onClick={() => handleNavigationWithWarning?.("/dashboard/admin/templates")}>
          Cancelar
        </Button>
        <Button onClick={handleSave} className="gap-2 bg-primary hover:bg-primary/90" disabled={isPending}>
          {isPending ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Guardar Plantilla
            </>
          )}
        </Button>
      </div>

      {/* Templates Overlays */}
      <TemplatesOverlays
        form={form}
        updateMilestones={updateMilestones}
        milestones={milestones}
        phases={phases}
        deliverables={deliverables}
        onUpdatePhase={updatePhase}
        onUpdateDeliverable={updateDeliverable}
        onDeletePhase={deletePhase}
        onDeleteDeliverable={deleteDeliverable}
        onSuccess={clearEditStates}
        onAddPhaseWithResponse={addPhaseWithResponse}
        onAddDeliverableWithResponse={addDeliverableWithResponse}
        onNavigationWarningConfirm={onNavigationWarningConfirm}
        onNavigationWarningCancel={onNavigationWarningCancel}
      />

      {/* Recovery Dialog */}
      {draftData && (
        <RecoveryDialog
          isOpen={showRecoveryDialog}
          onConfirm={recoverDraft}
          onDismiss={dismissDraft}
          draftData={draftData}
          isDesktop={isDesktop}
        />
      )}
    </div>
  );
}
