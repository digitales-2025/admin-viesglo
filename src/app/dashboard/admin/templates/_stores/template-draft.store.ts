import { create } from "zustand";
import { persist } from "zustand/middleware";

import { CreateProjectTemplate } from "../_schemas/projectTemplates.schemas";

export interface TemplateDraftData extends CreateProjectTemplate {
  timestamp: number;
  templateId?: string;
  isUpdate?: boolean;
}

interface TemplateDraftStore {
  // Estado
  createDraft: TemplateDraftData | null;
  updateDrafts: Record<string, TemplateDraftData>;
  isAutoSaving: boolean;
  lastSavedTimestamp: number | undefined;

  // Acciones principales
  saveDraft: (data: CreateProjectTemplate, templateId?: string, isUpdate?: boolean) => void;
  loadDraft: (templateId?: string, isUpdate?: boolean) => TemplateDraftData | null;
  clearDraft: (templateId?: string, isUpdate?: boolean) => void;

  // Acciones de limpieza robusta
  clearCreateDraft: () => void;
  clearUpdateDraft: (templateId: string) => void;
  clearAllDrafts: () => void;
  clearOtherDrafts: (currentTemplateId?: string, currentIsUpdate?: boolean) => void;

  // Utilidades
  setAutoSaving: (saving: boolean) => void;
  hasValidDraft: (templateId?: string, isUpdate?: boolean) => boolean;
  getDraftInfo: (
    templateId?: string,
    isUpdate?: boolean
  ) => { templateId?: string; isUpdate?: boolean; timestamp?: number } | null;
  getLastSaved: () => Date | undefined;

  // Migración
  migrateOldDraft: () => void;
}

const MAX_AGE_HOURS = 24;

// Función para migrar el draft antiguo
const migrateOldDraft = () => {
  try {
    const oldDraft = localStorage.getItem("project_template_draft");
    if (oldDraft) {
      const parsedDraft = JSON.parse(oldDraft);

      // Verificar si el draft antiguo ha expirado
      const isExpired = Date.now() - parsedDraft.timestamp > MAX_AGE_HOURS * 60 * 60 * 1000;

      if (!isExpired) {
        // Migrar el draft antiguo al nuevo formato
        const { updateDrafts } = JSON.parse(localStorage.getItem("project_template_drafts") || "{}");

        const newState = { createDraft: null, updateDrafts: {} };

        if (parsedDraft.isUpdate && parsedDraft.templateId) {
          // Es un draft de actualización
          newState.updateDrafts = {
            ...updateDrafts,
            [parsedDraft.templateId]: parsedDraft,
          };
        } else {
          // Es un draft de creación
          newState.createDraft = parsedDraft;
        }

        // Guardar en el nuevo formato
        localStorage.setItem("project_template_drafts", JSON.stringify(newState));
      }

      // Eliminar el draft antiguo
      localStorage.removeItem("project_template_draft");
    }
  } catch (error) {
    console.error("❌ Error al migrar draft antiguo:", error);
    // En caso de error, eliminar el draft antiguo de todas formas
    localStorage.removeItem("project_template_draft");
  }
};

export const useTemplateDraftStore = create<TemplateDraftStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      createDraft: null,
      updateDrafts: {},
      isAutoSaving: false,
      lastSavedTimestamp: undefined,

      // Migrar draft antiguo
      migrateOldDraft: () => {
        migrateOldDraft();
      },

      // Guardar borrador (método principal)
      saveDraft: (data: CreateProjectTemplate, templateId?: string, isUpdate = false) => {
        const draft: TemplateDraftData = {
          ...data,
          timestamp: Date.now(),
          templateId,
          isUpdate,
        };

        set((state) => {
          if (isUpdate && templateId) {
            // Guardar en updateDrafts para actualizar
            return {
              updateDrafts: {
                ...state.updateDrafts,
                [templateId]: draft,
              },
              isAutoSaving: true,
            };
          } else {
            // Guardar en createDraft para crear
            return {
              createDraft: draft,
              isAutoSaving: true,
            };
          }
        });

        // Simular indicador de guardado
        setTimeout(() => {
          set({ isAutoSaving: false, lastSavedTimestamp: Date.now() });
        }, 500);
      },

      // Cargar borrador
      loadDraft: (templateId?: string, isUpdate = false) => {
        const { createDraft, updateDrafts } = get();

        let draft: TemplateDraftData | null = null;

        if (isUpdate && templateId) {
          // Cargar desde updateDrafts
          draft = updateDrafts[templateId] || null;
        } else {
          // Cargar desde createDraft
          draft = createDraft;
        }

        if (!draft) return null;

        // Verificar si el borrador ha expirado
        const isExpired = Date.now() - draft.timestamp > MAX_AGE_HOURS * 60 * 60 * 1000;
        if (isExpired) {
          get().clearDraft(templateId, isUpdate);
          return null;
        }

        return draft;
      },

      // Limpiar borrador específico
      clearDraft: (templateId?: string, isUpdate = false) => {
        set((state) => {
          if (isUpdate && templateId) {
            // Limpiar updateDraft específico
            const { [templateId]: _, ...remainingUpdateDrafts } = state.updateDrafts;
            return {
              updateDrafts: remainingUpdateDrafts,
              isAutoSaving: false,
              lastSavedTimestamp: undefined,
            };
          } else {
            // Limpiar createDraft
            return {
              createDraft: null,
              isAutoSaving: false,
              lastSavedTimestamp: undefined,
            };
          }
        });
      },

      // Limpiar createDraft específicamente
      clearCreateDraft: () => {
        set({
          createDraft: null,
          isAutoSaving: false,
          lastSavedTimestamp: undefined,
        });
      },

      // Limpiar updateDraft específico
      clearUpdateDraft: (templateId: string) => {
        set((state) => {
          const { [templateId]: _, ...remainingUpdateDrafts } = state.updateDrafts;
          return {
            updateDrafts: remainingUpdateDrafts,
            isAutoSaving: false,
            lastSavedTimestamp: undefined,
          };
        });
      },

      // Limpiar todos los drafts
      clearAllDrafts: () => {
        set({
          createDraft: null,
          updateDrafts: {},
          isAutoSaving: false,
          lastSavedTimestamp: undefined,
        });
      },

      // Limpiar otros drafts (para evitar conflictos)
      clearOtherDrafts: (currentTemplateId?: string, currentIsUpdate?: boolean) => {
        set((state) => {
          if (currentIsUpdate && currentTemplateId) {
            // Si estamos en modo actualizar, limpiar createDraft y otros updateDrafts
            const { [currentTemplateId]: currentDraft } = state.updateDrafts;
            return {
              createDraft: null,
              updateDrafts: currentDraft ? { [currentTemplateId]: currentDraft } : {},
              isAutoSaving: false,
              lastSavedTimestamp: undefined,
            };
          } else {
            // Si estamos en modo crear, limpiar todos los updateDrafts
            return {
              createDraft: state.createDraft,
              updateDrafts: {},
              isAutoSaving: false,
              lastSavedTimestamp: undefined,
            };
          }
        });
      },

      // Establecer estado de auto-save
      setAutoSaving: (saving: boolean) => {
        set({ isAutoSaving: saving });
      },

      // Verificar si hay un borrador válido
      hasValidDraft: (templateId?: string, isUpdate?: boolean) => {
        const draft = get().loadDraft(templateId, isUpdate);
        return draft !== null;
      },

      // Obtener información del borrador
      getDraftInfo: (templateId?: string, isUpdate?: boolean) => {
        const draft = get().loadDraft(templateId, isUpdate);
        if (!draft) return null;

        return {
          templateId: draft.templateId,
          isUpdate: draft.isUpdate,
          timestamp: draft.timestamp,
        };
      },

      // Obtener lastSaved como Date
      getLastSaved: () => {
        const { lastSavedTimestamp } = get();
        return lastSavedTimestamp ? new Date(lastSavedTimestamp) : undefined;
      },
    }),
    {
      name: "project_template_drafts",
      partialize: (state) => ({
        createDraft: state.createDraft,
        updateDrafts: state.updateDrafts,
        lastSavedTimestamp: state.lastSavedTimestamp,
      }),
      onRehydrateStorage: () => (state) => {
        // Migrar draft antiguo al cargar el store
        if (state) {
          state.migrateOldDraft();
        }
      },
    }
  )
);
