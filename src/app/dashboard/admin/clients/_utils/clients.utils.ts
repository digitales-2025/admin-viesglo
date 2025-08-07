import {
  AlertTriangle,
  Ban,
  CheckCircle,
  Circle,
  Clock,
  HelpCircle,
  PauseCircle,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserMinus,
  UserX,
} from "lucide-react";

import { ClientCondition, ClientState } from "../_types/clients.types";

// Configuración para ClientState
export const clientStateConfig = {
  [ClientState.ACTIVO]: {
    label: "Activo",
    description: "Cliente activo y habilitado",
    className: "bg-emerald-200 dark:bg-emerald-800/40",
    textClass: "text-emerald-900 dark:text-emerald-200",
    borderColor: "border-emerald-400 dark:border-emerald-700",
    hoverClass: "hover:bg-emerald-300 dark:hover:bg-emerald-700/60",
    icon: CheckCircle,
    badge: "success",
    iconClass: "text-emerald-600 dark:text-emerald-300",
  },
  [ClientState.BAJA_PROVISIONAL]: {
    label: "Baja Provisional",
    description: "Cliente dado de baja temporalmente",
    className: "bg-yellow-200 dark:bg-yellow-800/40",
    textClass: "text-yellow-900 dark:text-yellow-200",
    borderColor: "border-yellow-400 dark:border-yellow-700",
    hoverClass: "hover:bg-yellow-300 dark:hover:bg-yellow-700/60",
    icon: PauseCircle,
    badge: "warning",
    iconClass: "text-yellow-600 dark:text-yellow-300",
  },
  [ClientState.BAJA_DEFINITIVA]: {
    label: "Baja Definitiva",
    description: "Cliente dado de baja permanente",
    className: "bg-rose-200 dark:bg-rose-800/40",
    textClass: "text-rose-900 dark:text-rose-200",
    borderColor: "border-rose-400 dark:border-rose-700",
    hoverClass: "hover:bg-rose-300 dark:hover:bg-rose-700/60",
    icon: Ban,
    badge: "danger",
    iconClass: "text-rose-600 dark:text-rose-300",
  },
  [ClientState.SUSPENSION_TEMPORAL]: {
    label: "Suspensión Temporal",
    description: "Cliente suspendido temporalmente",
    className: "bg-orange-200 dark:bg-orange-800/40",
    textClass: "text-orange-900 dark:text-orange-200",
    borderColor: "border-orange-400 dark:border-orange-700",
    hoverClass: "hover:bg-orange-300 dark:hover:bg-orange-700/60",
    icon: AlertTriangle,
    badge: "info",
    iconClass: "text-orange-600 dark:text-orange-300",
  },
  [ClientState.BAJA_PROV_POR_OFICIO]: {
    label: "Baja Provisional de Oficio",
    description: "Baja provisional por disposición oficial",
    className: "bg-yellow-100 dark:bg-yellow-900/30",
    textClass: "text-yellow-800 dark:text-yellow-200",
    borderColor: "border-yellow-300 dark:border-yellow-700",
    hoverClass: "hover:bg-yellow-200 dark:hover:bg-yellow-800/60",
    icon: ShieldAlert,
    badge: "warning",
    iconClass: "text-yellow-700 dark:text-yellow-300",
  },
  [ClientState.BAJA_DEFI_POR_OFICIO]: {
    label: "Baja Definitiva de Oficio",
    description: "Baja definitiva por disposición oficial",
    className: "bg-rose-100 dark:bg-rose-900/30",
    textClass: "text-rose-800 dark:text-rose-200",
    borderColor: "border-rose-300 dark:border-rose-700",
    hoverClass: "hover:bg-rose-200 dark:hover:bg-rose-800/60",
    icon: ShieldCheck,
    badge: "danger",
    iconClass: "text-rose-700 dark:text-rose-300",
  },
  [ClientState.OTRO]: {
    label: "Otro",
    description: "Otro estado no especificado",
    className: "bg-gray-200 dark:bg-gray-800/40",
    textClass: "text-gray-900 dark:text-gray-200",
    borderColor: "border-gray-400 dark:border-gray-600",
    hoverClass: "hover:bg-gray-300 dark:hover:bg-gray-700/60",
    icon: HelpCircle,
    badge: "neutral",
    iconClass: "text-gray-600 dark:text-gray-300",
  },
};

// Configuración para ClientCondition
export const clientConditionConfig = {
  [ClientCondition.HABIDO]: {
    label: "Habido",
    description: "Cliente habido según SUNAT",
    className: "bg-green-200 dark:bg-green-800/40",
    textClass: "text-green-900 dark:text-green-200",
    borderColor: "border-green-400 dark:border-green-700",
    hoverClass: "hover:bg-green-300 dark:hover:bg-green-700/60",
    icon: UserCheck,
    badge: "success",
    iconClass: "text-green-600 dark:text-green-300",
    extra: "Verificado",
  },
  [ClientCondition.NO_HABIDO]: {
    label: "No Habido",
    description: "Cliente no habido según SUNAT",
    className: "bg-yellow-200 dark:bg-yellow-800/40",
    textClass: "text-yellow-900 dark:text-yellow-200",
    borderColor: "border-yellow-400 dark:border-yellow-700",
    hoverClass: "hover:bg-yellow-300 dark:hover:bg-yellow-700/60",
    icon: UserMinus,
    badge: "warning",
    iconClass: "text-yellow-600 dark:text-yellow-300",
    extra: "Pendiente de verificación",
  },
  [ClientCondition.NO_HALLADO]: {
    label: "No Hallado",
    description: "Cliente no hallado en domicilio fiscal",
    className: "bg-rose-200 dark:bg-rose-800/40",
    textClass: "text-rose-900 dark:text-rose-200",
    borderColor: "border-rose-400 dark:border-rose-700",
    hoverClass: "hover:bg-rose-300 dark:hover:bg-rose-700/60",
    icon: UserX,
    badge: "danger",
    iconClass: "text-rose-600 dark:text-rose-300",
    extra: "No localizado",
  },
  [ClientCondition.PENDIENTE]: {
    label: "Pendiente",
    description: "Condición pendiente de verificación",
    className: "bg-blue-200 dark:bg-blue-800/40",
    textClass: "text-blue-900 dark:text-blue-200",
    borderColor: "border-blue-400 dark:border-blue-700",
    hoverClass: "hover:bg-blue-300 dark:hover:bg-blue-700/60",
    icon: Clock,
    badge: "info",
    iconClass: "text-blue-600 dark:text-blue-300",
    extra: "En proceso",
  },
  [ClientCondition.OTRO]: {
    label: "Otro",
    description: "Otra condición no especificada",
    className: "bg-gray-200 dark:bg-gray-800/40",
    textClass: "text-gray-900 dark:text-gray-200",
    borderColor: "border-gray-400 dark:border-gray-600",
    hoverClass: "hover:bg-gray-300 dark:hover:bg-gray-700/60",
    icon: Circle,
    badge: "neutral",
    iconClass: "text-gray-600 dark:text-gray-300",
    extra: "Sin información",
  },
};

export const getInitials = (name: string) => {
  // Palabras a ignorar
  const ignore = ["DE", "LA", "LOS", "DEL", "Y", "S.A.C.", "S.A.", "S.R.L.", "E.I.R.L.", "SAC", "SRL", "EIRL"];
  // Limpia comillas y puntos
  const clean = name.replace(/[".]/g, "");
  // Separa palabras y filtra las irrelevantes
  const words = clean
    .split(" ")
    .map((w) => w.trim().toUpperCase())
    .filter((w) => w && !ignore.includes(w));
  if (words.length === 1) return words[0][0];
  return words[0][0] + words[words.length - 1][0];
};
