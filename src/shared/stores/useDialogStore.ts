import { create } from "zustand";

export type DialogType =
  | "create"
  | "edit"
  | "edit-fields"
  | "progress"
  | "delete"
  | "view"
  | "import"
  | "export"
  | "details"
  | "concrete"
  | "update"
  | "togleActive"
  | "create-resource"
  | "create-incident"
  | null;

interface DialogState<T = any> {
  // Estado
  isOpen: boolean;
  type: DialogType;
  data: T | null;
  module: string | null;

  // Acciones
  open: (module: string, type: DialogType, data?: T | null) => void;
  close: () => void;
  isOpenForModule: (module: string, type?: DialogType) => boolean;
}

export const useDialogStore = create<DialogState>((set, get) => ({
  // Estado inicial
  isOpen: false,
  type: null,
  data: null,
  module: null,

  // Acciones
  open: (module, type, data = null) =>
    set({
      isOpen: true,
      type,
      data,
      module,
    }),

  close: () =>
    set({
      isOpen: false,
      type: null,
      data: null,
      module: null,
    }),

  isOpenForModule: (module, type) => {
    const state = get();
    if (type) {
      return state.isOpen && state.module === module && state.type === type;
    }
    return state.isOpen && state.module === module;
  },
}));
