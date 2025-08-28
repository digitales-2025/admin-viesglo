import { DeliverablePriority } from "../_types/templates.types";

/**
 * Configuración para prioridades de entregable (mapeada con DeliverablePriority)
 */
export const deliverablePriorityConfig = {
  [DeliverablePriority.HIGH]: {
    label: "Alta",
    description: "Entregable con prioridad alta",
    className: "bg-rose-200 dark:bg-rose-800/40",
    textClass: "text-rose-900 dark:text-rose-200",
    borderColor: "border-rose-400 dark:border-rose-700",
    hoverClass: "hover:bg-rose-300 dark:hover:bg-rose-700/60",
    dotClass: "bg-rose-400 dark:bg-rose-700",
    badge: "danger",
  },
  [DeliverablePriority.MEDIUM]: {
    label: "Media",
    description: "Entregable con prioridad media",
    className: "bg-yellow-100 dark:bg-amber-700/40",
    textClass: "text-amber-900 dark:text-amber-200",
    borderColor: "border-amber-400 dark:border-amber-700",
    hoverClass: "hover:bg-amber-200 dark:hover:bg-amber-700/60",
    dotClass: "bg-amber-400 dark:bg-amber-700",
    badge: "warning",
  },
  [DeliverablePriority.LOW]: {
    label: "Baja",
    description: "Entregable con prioridad baja",
    className: "bg-green-200 dark:bg-green-800/40",
    textClass: "text-green-900 dark:text-green-200",
    borderColor: "border-green-400 dark:border-green-700",
    hoverClass: "hover:bg-green-300 dark:hover:bg-green-700/60",
    dotClass: "bg-green-400 dark:bg-green-700",
    badge: "success",
  },
};
