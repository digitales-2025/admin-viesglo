"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { UseFormReturn } from "react-hook-form";

import { CreateProjectTemplate } from "../_schemas/projectTemplates.schemas";
import { TemplateDraftData, useTemplateDraftStore } from "../_stores/template-draft.store";

interface UseTemplateDraftZustandProps {
  form: UseFormReturn<CreateProjectTemplate>;
  templateId?: string;
  isUpdate?: boolean;
  onRecoverDraft?: (data: CreateProjectTemplate) => void;
  selectedTags?: string[];
}

export const useTemplateDraftZustand = ({
  form,
  templateId,
  isUpdate = false,
  onRecoverDraft,
  selectedTags = [],
}: UseTemplateDraftZustandProps) => {
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [draftData, setDraftData] = useState<TemplateDraftData | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isFormPopulated, setIsFormPopulated] = useState(false);
  const [hasUserMadeChanges, setHasUserMadeChanges] = useState(false);

  // Zustand store
  const {
    isAutoSaving,
    getLastSaved,
    saveDraft,
    loadDraft,
    clearDraft,
    hasValidDraft,
    clearOtherDrafts,
    migrateOldDraft,
  } = useTemplateDraftStore();

  // Obtener lastSaved como Date
  const lastSaved = getLastSaved();

  // Refs para almacenar el último estado guardado y el timeout
  const lastSavedStateRef = useRef<string>("");
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const createModeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Migrar draft antiguo al inicializar
  useEffect(() => {
    migrateOldDraft();
  }, [migrateOldDraft]);

  // Función para crear el estado actual como string para comparar
  const getCurrentStateString = useCallback(() => {
    const formData = form.getValues();
    const currentState = {
      ...formData,
      tagIds: selectedTags,
      // Usar milestones del formulario en lugar de selectedMilestones para incluir configuraciones
      milestones: formData.milestones || [],
    };
    return JSON.stringify(currentState);
  }, [form, selectedTags]);

  // Función para guardar borrador con datos completos
  const saveDraftWithStates = useCallback(() => {
    // No guardar durante la carga inicial o población del formulario
    if (isInitialLoad || !isFormPopulated) {
      return;
    }

    const formData = form.getValues();

    // Crear datos completos incluyendo estados locales
    const completeData = {
      ...formData,
      tagIds: selectedTags,
      // Usar milestones del formulario para preservar configuraciones de milestone ref
      milestones: formData.milestones || [],
    };

    // Solo guardar si hay datos significativos
    if (
      completeData.name ||
      completeData.description ||
      (completeData.milestones && completeData.milestones.length > 0) ||
      (completeData.tagIds && completeData.tagIds.length > 0)
    ) {
      saveDraft(completeData, templateId, isUpdate);
      // Actualizar el último estado guardado
      lastSavedStateRef.current = getCurrentStateString();
    }
  }, [form, templateId, isUpdate, selectedTags, saveDraft, getCurrentStateString, isInitialLoad, isFormPopulated]);

  // Función debounced para guardar (Opción 1: useCallback + useRef)
  const debouncedSave = useCallback(() => {
    // No guardar durante la carga inicial o población del formulario
    if (isInitialLoad || !isFormPopulated) {
      return;
    }

    // Limpiar timeout anterior
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Nuevo timeout
    debounceTimeoutRef.current = setTimeout(() => {
      const currentState = getCurrentStateString();

      // Solo guardar si el estado actual es diferente al último guardado
      if (currentState !== lastSavedStateRef.current) {
        const formData = form.getValues();
        const hasSignificantData =
          formData.name ||
          formData.description ||
          (formData.milestones && formData.milestones.length > 0) ||
          (selectedTags && selectedTags.length > 0);

        if (hasSignificantData) {
          // Marcar que el usuario ha hecho cambios
          setHasUserMadeChanges(true);
          saveDraftWithStates();
        }
      }
    }, 2000); // 2 segundos después de la última tecla
  }, [getCurrentStateString, form, selectedTags, saveDraftWithStates, isInitialLoad, isFormPopulated]);

  // Función para recuperar borrador
  const recoverDraft = useCallback(
    (data: CreateProjectTemplate) => {
      form.reset(data);

      // Llamar al callback para sincronizar estados locales
      if (onRecoverDraft) {
        onRecoverDraft(data);
      }

      setShowRecoveryDialog(false);
      setDraftData(null);
      setHasUserMadeChanges(false); // Resetear cambios del usuario

      // Limpiar el borrador después de recuperarlo
      clearDraft(templateId, isUpdate);
    },
    [form, onRecoverDraft, clearDraft, templateId, isUpdate]
  );

  // Función para descartar borrador
  const dismissDraft = useCallback(() => {
    clearDraft(templateId, isUpdate);
    setShowRecoveryDialog(false);
    setDraftData(null);
    setHasUserMadeChanges(false); // Resetear cambios del usuario
  }, [clearDraft, templateId, isUpdate]);

  // Verificar borrador al cargar
  useEffect(() => {
    const loadedDraft = loadDraft(templateId, isUpdate);

    if (loadedDraft) {
      // Verificar si el borrador corresponde al template actual
      if (isUpdate && loadedDraft.templateId && loadedDraft.templateId !== templateId) {
        return;
      }

      setDraftData(loadedDraft);
      setShowRecoveryDialog(true);
    }
  }, [templateId, isUpdate, loadDraft]);

  // Limpiar otros drafts al cambiar de modo o templateId
  useEffect(() => {
    // Solo limpiar si hay un templateId específico (modo editar)
    // En modo crear, no limpiar otros drafts para preservar datos de editar
    if (templateId) {
      clearOtherDrafts(templateId, isUpdate);
    }
  }, [templateId, isUpdate, clearOtherDrafts]);

  // Habilitar auto-save después de la carga inicial y población del formulario
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 1000); // 1 segundo después de montar

    return () => clearTimeout(timer);
  }, []);

  // Marcar formulario como poblado cuando se complete la carga inicial
  useEffect(() => {
    const formData = form.getValues();
    const hasFormData =
      formData.name ||
      formData.description ||
      selectedTags.length > 0 ||
      (formData.milestones && formData.milestones.length > 0);

    // En modo crear, habilitar auto-save después de un tiempo aunque el formulario esté vacío
    if (hasFormData && !isFormPopulated) {
      setIsFormPopulated(true);
    }
  }, [form, selectedTags, isFormPopulated, isUpdate]);

  // Timer separado para modo crear (evita bucle infinito)
  useEffect(() => {
    if (!isUpdate && !isFormPopulated) {
      // Limpiar timer anterior si existe
      if (createModeTimerRef.current) {
        clearTimeout(createModeTimerRef.current);
      }

      // En modo crear, habilitar auto-save después de 2 segundos aunque esté vacío
      createModeTimerRef.current = setTimeout(() => {
        setIsFormPopulated(true);
      }, 2000);
    }

    // Cleanup al desmontar
    return () => {
      if (createModeTimerRef.current) {
        clearTimeout(createModeTimerRef.current);
      }
    };
  }, [isUpdate]); // Solo depende de isUpdate, no de isFormPopulated

  // Auto-save cuando cambia el formulario
  useEffect(() => {
    if (isInitialLoad || !isFormPopulated) return;

    const subscription = form.watch(debouncedSave);

    return () => {
      subscription.unsubscribe();
      // Limpiar timeout al desmontar
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [debouncedSave, isInitialLoad, isFormPopulated]);

  // Auto-save cuando cambian selectedTags o el formulario
  useEffect(() => {
    if (isInitialLoad || !isFormPopulated) return;

    // Usar un debounce más corto para cambios de selección
    const timeoutId = setTimeout(() => {
      const currentState = getCurrentStateString();
      if (currentState !== lastSavedStateRef.current) {
        // Marcar que el usuario ha hecho cambios
        setHasUserMadeChanges(true);
        saveDraftWithStates();
      }
    }, 1000); // 1 segundo para cambios de selección

    return () => clearTimeout(timeoutId);
  }, [selectedTags, isInitialLoad, isFormPopulated, getCurrentStateString, saveDraftWithStates]);

  // Auto-save antes de cerrar la página
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveDraftWithStates();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saveDraftWithStates]);

  // Función para verificar si hay cambios sin guardar (incluyendo drafts)
  const hasUnsavedChanges = useCallback((): boolean => {
    // Primero verificar si hay un draft válido (esto es lo más confiable)
    const hasDraft = hasValidDraft(templateId, isUpdate);
    if (hasDraft) {
      return true;
    }

    // Si no hay draft, verificar si hay cambios reales en el formulario
    // Solo considerar cambios si el formulario está poblado (no en carga inicial)
    if (!isFormPopulated) {
      return false;
    }

    const formData = form.getValues();

    // En modo update, solo considerar cambios si hay diferencias con los datos originales
    if (isUpdate) {
      // Si no hay datos en el formulario, no hay cambios
      if (
        !formData.name &&
        !formData.description &&
        (!formData.milestones || formData.milestones.length === 0) &&
        selectedTags.length === 0
      ) {
        return false;
      }

      // Si hay datos pero no hay draft, verificar si el usuario ha hecho cambios explícitos
      return hasUserMadeChanges;
    }

    // En modo crear, verificar si hay datos significativos
    const hasFormChanges = !!(
      formData.name ||
      formData.description ||
      (formData.milestones && formData.milestones.length > 0) ||
      (selectedTags && selectedTags.length > 0)
    );

    return hasFormChanges;
  }, [form, selectedTags, hasValidDraft, templateId, isUpdate, isFormPopulated, hasUserMadeChanges]);

  return {
    showRecoveryDialog,
    draftData,
    isAutoSaving,
    lastSaved,
    recoverDraft,
    dismissDraft,
    clearDraft: () => clearDraft(templateId, isUpdate),
    saveDraft: saveDraftWithStates,
    hasValidDraft: (checkTemplateId?: string, checkIsUpdate?: boolean) =>
      hasValidDraft(checkTemplateId || templateId, checkIsUpdate !== undefined ? checkIsUpdate : isUpdate),
    hasUnsavedChanges,
  };
};
