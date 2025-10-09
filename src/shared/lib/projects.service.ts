import { http } from "@/lib/http/clientFetch";

/**
 * Resumen general del dashboard de proyectos con métricas completas
 */
export type ProjectsDashboardSummary = {
  summary: {
    totalProjects: number;
    projectsByStatus: Array<{ status: string; count: number }>;
    projectsByType: Array<{ type: string; count: number }>;
    averageProgress: number;
    overdueProjects: number;
    completedProjects: number;
    activeProjects: number;
  };
  milestones: {
    totalMilestones: number;
    completedMilestones: number;
    pendingMilestones: number;
    inProgressMilestones: number;
    completionRate: number;
  };
  deliverables: {
    totalDeliverables: number;
    completedDeliverables: number;
    inProcessDeliverables: number;
    registeredDeliverables: number;
    completionRate: number;
  };
  assignments: {
    byUser: Array<{ userId: string; userName: string; count: number }>;
    byRole: Array<{ role: string; count: number }>;
  };
  performance: {
    projectsCompletedOnTime: number;
    projectsOverdue: number;
    averageCompletionTime: number;
    productivityScore: number;
  };
  meta: {
    source: string;
    at: string;
    lastUpdated: string;
  };
};

export type ProjectsStatusDistribution = {
  distribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  meta: { source: string; at: string; lastUpdated: string };
};

export type ProjectsTypeDistribution = {
  distribution: Array<{
    type: string;
    count: number;
    percentage: number;
    averageProgress: number;
  }>;
  meta: { source: string; at: string; lastUpdated: string };
};

export type ProjectsProgress = {
  overallProgress: {
    averageProgress: number;
    progressDistribution: Array<{ range: string; count: number; percentage: number }>;
  };
  trends: {
    weeklyProgress: Array<{ week: string; averageProgress: number }>;
    monthlyProgress: Array<{ month: string; averageProgress: number }>;
  };
  meta: { source: string; at: string; lastUpdated: string };
};

export type ProjectsPerformance = {
  performance: {
    completionRate: number;
    onTimeDelivery: number;
    averageProjectDuration: number;
    productivityIndex: number;
  };
  quality: {
    projectsWithoutIssues: number;
    projectsWithIssues: number;
    issueResolutionRate: number;
  };
  resourceUtilization: {
    teamUtilization: number;
    resourceEfficiency: number;
  };
  meta: { source: string; at: string; lastUpdated: string };
};

/**
 * Resumen general del dashboard de proyectos
 */
export async function fetchProjectsDashboardSummary(): Promise<ProjectsDashboardSummary> {
  const res = await http.get("/v1/dashboards/projects/summary");
  const payload = (res?.data as any)?.["application/json"] ?? res?.data;
  return payload as ProjectsDashboardSummary;
}

/**
 * Distribución de proyectos por estado
 */
export async function fetchProjectsStatusDistribution(): Promise<ProjectsStatusDistribution> {
  const res = await http.get("/v1/dashboards/projects/status");
  const payload = (res?.data as any)?.["application/json"] ?? res?.data;
  return payload as ProjectsStatusDistribution;
}

/**
 * Distribución de proyectos por tipo
 */
export async function fetchProjectsTypeDistribution(): Promise<ProjectsTypeDistribution> {
  const res = await http.get("/v1/dashboards/projects/type");
  const payload = (res?.data as any)?.["application/json"] ?? res?.data;
  return payload as ProjectsTypeDistribution;
}

/**
 * Progreso general y tendencias temporales
 */
export async function fetchProjectsProgress(): Promise<ProjectsProgress> {
  const res = await http.get("/v1/dashboards/projects/progress");
  const payload = (res?.data as any)?.["application/json"] ?? res?.data;
  return payload as ProjectsProgress;
}

/**
 * Métricas de rendimiento y calidad
 */
export async function fetchProjectsPerformance(): Promise<ProjectsPerformance> {
  const res = await http.get("/v1/dashboards/projects/performance");
  const payload = (res?.data as any)?.["application/json"] ?? res?.data;
  return payload as ProjectsPerformance;
}
