"use client";

import { create } from "zustand";

interface AuthLoadingStore {
  isLoading: boolean;
  message: string;
  setLoading: (isLoading: boolean, message?: string) => void;
}

export const useAuthLoadingStore = create<AuthLoadingStore>((set) => ({
  isLoading: false,
  message: "Cargando, por favor espere...",
  setLoading: (isLoading, message = "Cargando, por favor espere...") => set({ isLoading, message }),
}));

export const useAuthLoading = () => {
  const { isLoading, message, setLoading } = useAuthLoadingStore();

  const showLogin = () => setLoading(true, "Iniciando sesión, por favor espere...");
  const showLogout = () => setLoading(true, "Cerrando sesión, por favor espere...");
  const hide = () => setLoading(false);

  return {
    isLoading,
    message,
    showLogin,
    showLogout,
    hide,
  };
};
