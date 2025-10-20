/**
 * 📊 REPORTS CONFIGURATION
 *
 * Configuration for all available reports
 */

import { CheckCircle, DollarSign, Heart, Shield, Target, TrendingUp, type LucideIcon } from "lucide-react";

// Type definition
export interface ReportConfig {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
  hasAdvancedFilters?: boolean;
}

export const REPORTS_CONFIG: ReportConfig[] = [
  {
    id: "project-efficiency",
    title: "Eficiencia de Proyectos",
    description: "Análisis completo de rendimiento, progreso y cumplimiento de proyectos",
    icon: TrendingUp,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    borderColor: "border-blue-200 dark:border-blue-800",
    hasAdvancedFilters: true,
  },
  {
    id: "milestone-analysis",
    title: "Análisis de Milestones",
    description: "Estado, progreso y métricas detalladas de hitos del proyecto",
    icon: Target,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/20",
    borderColor: "border-purple-200 dark:border-purple-800",
    hasAdvancedFilters: true,
  },
  {
    id: "deliverable-approval",
    title: "Entregables y Aprobaciones",
    description: "Seguimiento de entregables, aprobaciones y procesos de validación",
    icon: CheckCircle,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950/20",
    borderColor: "border-green-200 dark:border-green-800",
    hasAdvancedFilters: true,
  },
  {
    id: "client-satisfaction",
    title: "Satisfacción del Cliente",
    description: "Métricas de calidad, feedback y nivel de satisfacción",
    icon: Heart,
    color: "text-pink-600 dark:text-pink-400",
    bgColor: "bg-pink-50 dark:bg-pink-950/20",
    borderColor: "border-pink-200 dark:border-pink-800",
  },
  {
    id: "resource-cost",
    title: "Recursos y Costos",
    description: "Análisis financiero, ROI y utilización de recursos",
    icon: DollarSign,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/20",
    borderColor: "border-amber-200 dark:border-amber-800",
  },
  {
    id: "audit-traceability",
    title: "Auditoría y Trazabilidad",
    description: "Registro de acciones, cumplimiento y trazabilidad completa",
    icon: Shield,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950/20",
    borderColor: "border-red-200 dark:border-red-800",
    hasAdvancedFilters: true,
  },
];
