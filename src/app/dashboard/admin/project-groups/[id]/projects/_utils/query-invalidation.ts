import type { useQueryClient } from "@tanstack/react-query";

// Base paths para las diferentes entidades
const PROJECT_BASE = "/v1/projects";
const PROJECT_MILESTONES_BASE = "/v1/project-milestones";
const PROJECT_PHASES_BASE = "/v1/project-phases";
const PROJECT_DELIVERABLES_BASE = "/v1/project-deliverables";
const ADDITIONAL_DELIVERABLES_BASE = "/v1/additional-deliverables";

/**
 * Invalida todas las queries relacionadas con proyectos
 */
export const invalidateProjectQueries = (queryClient: ReturnType<typeof useQueryClient>) =>
  queryClient.invalidateQueries({
    queryKey: ["get"],
    predicate: (query) => {
      const queryKey = query.queryKey;
      return queryKey[0] === "get" && typeof queryKey[1] === "string" && queryKey[1].startsWith(PROJECT_BASE);
    },
  });

/**
 * Invalida todas las queries relacionadas con milestones
 */
export const invalidateMilestoneQueries = (queryClient: ReturnType<typeof useQueryClient>) =>
  queryClient.invalidateQueries({
    queryKey: ["get"],
    predicate: (query) => {
      const queryKey = query.queryKey;
      return (
        queryKey[0] === "get" &&
        typeof queryKey[1] === "string" &&
        (queryKey[1].startsWith(PROJECT_MILESTONES_BASE) || queryKey[1].includes("/milestones"))
      );
    },
  });

/**
 * Invalida todas las queries relacionadas con fases
 */
export const invalidatePhaseQueries = (queryClient: ReturnType<typeof useQueryClient>) =>
  queryClient.invalidateQueries({
    queryKey: ["get"],
    predicate: (query) => {
      const queryKey = query.queryKey;
      return (
        queryKey[0] === "get" &&
        typeof queryKey[1] === "string" &&
        (queryKey[1].startsWith(PROJECT_PHASES_BASE) || queryKey[1].includes("/phases"))
      );
    },
  });

/**
 * Invalida todas las queries relacionadas con entregables
 */
export const invalidateDeliverableQueries = (queryClient: ReturnType<typeof useQueryClient>) =>
  queryClient.invalidateQueries({
    queryKey: ["get"],
    predicate: (query) => {
      const queryKey = query.queryKey;
      return (
        queryKey[0] === "get" &&
        typeof queryKey[1] === "string" &&
        (queryKey[1].startsWith(PROJECT_DELIVERABLES_BASE) || queryKey[1].includes("/deliverables"))
      );
    },
  });

/**
 * Invalida todas las queries relacionadas con entregables adicionales
 */
export const invalidateAdditionalDeliverableQueries = (queryClient: ReturnType<typeof useQueryClient>) =>
  queryClient.invalidateQueries({
    queryKey: ["get"],
    predicate: (query) => {
      const queryKey = query.queryKey;
      return (
        queryKey[0] === "get" &&
        typeof queryKey[1] === "string" &&
        (queryKey[1].startsWith(ADDITIONAL_DELIVERABLES_BASE) || queryKey[1].includes("/additional-deliverables"))
      );
    },
  });

/**
 * Invalida queries de proyectos y milestones (útil para operaciones de milestone)
 */
export const invalidateProjectAndMilestoneQueries = (queryClient: ReturnType<typeof useQueryClient>) => {
  invalidateProjectQueries(queryClient);
  invalidateMilestoneQueries(queryClient);
};

/**
 * Invalida queries de proyectos, milestones y fases (útil para operaciones de fase)
 */
export const invalidateProjectMilestoneAndPhaseQueries = (queryClient: ReturnType<typeof useQueryClient>) => {
  invalidateProjectQueries(queryClient);
  invalidateMilestoneQueries(queryClient);
  invalidatePhaseQueries(queryClient);
};

/**
 * Invalida todas las queries relacionadas con la jerarquía de proyectos
 * (proyectos, milestones, fases, entregables)
 */
export const invalidateAllProjectHierarchyQueries = (queryClient: ReturnType<typeof useQueryClient>) => {
  invalidateProjectQueries(queryClient);
  invalidateMilestoneQueries(queryClient);
  invalidatePhaseQueries(queryClient);
  invalidateDeliverableQueries(queryClient);
  invalidateAdditionalDeliverableQueries(queryClient);
};
