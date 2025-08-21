import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import { Button } from "@/shared/components/ui/button";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import TemplatesOverlays from "../../_components/templates-overlays/TemplatesOverlays";
import { CreateProjectTemplate, DeliverableFormData, PhaseFormData } from "../../_schemas/projectTemplates.schemas";
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
  handleCancel: () => void;
  isPending: boolean;
  isFormValid?: boolean;
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
}

export default function CreateProjectTemplateForm({
  form,
  handleSave,
  handleCancel,
  isPending,
  isFormValid = true,
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
}: CreateProjectTemplateFormProps) {
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

    setMilestones(extractedMilestones);
    setPhases(extractedPhases);
    setDeliverables(extractedDeliverables);
  }, [selectedMilestoneObjects]);

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

  // Sincronizar milestones seleccionados con el formulario
  useEffect(() => {
    const milestoneRefs: MilestoneTemplateRefRequestDto[] = selectedMilestoneObjects.map((milestone) => ({
      milestoneTemplateId: milestone.id,
      isRequired: false, // Por defecto
      customName: undefined,
      customizations: undefined,
    }));

    updateMilestones(milestoneRefs);
  }, [selectedMilestoneObjects, updateMilestones]);

  const addPhase = (data: PhaseFormData) => {
    const newPhase: PhaseTemplateResponseDto & { milestoneId: string } = {
      id: `phase-${Date.now()}`,
      name: data.name,
      description: data.description,
      milestoneId: selectedMilestone ?? "",
    };
    setPhases([...phases, newPhase]);
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
        // Mantener el milestoneId original de la fase
        milestoneId: currentMilestoneId,
      };
      setPhases(phases.map((p) => (p.id === phaseToEdit.id ? updatedPhase : p)));
      setPhaseToEdit(null);
    }
  };

  const addDeliverable = (data: DeliverableFormData) => {
    const newDeliverable: DeliverableTemplateResponseDto & { phaseId: string } = {
      id: `deliverable-${Date.now()}`,
      name: data.name,
      description: data.description,
      priority: data.priority,
      precedence: data.precedence,
      phaseId: selectedPhase ?? "",
    };
    setDeliverables([...deliverables, newDeliverable]);
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
      setDeliverableToEdit(null);
    }
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
        setPhases={setPhases}
        deliverables={deliverables}
        setDeliverables={setDeliverables}
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
        <Button variant="outline" onClick={handleCancel}>
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          className="gap-2 bg-primary hover:bg-primary/90"
          disabled={isPending || !isFormValid}
        >
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
        onAddPhase={addPhase}
        onUpdatePhase={updatePhase}
        onAddDeliverable={addDeliverable}
        onUpdateDeliverable={updateDeliverable}
        onSuccess={clearEditStates}
      />
    </div>
  );
}
