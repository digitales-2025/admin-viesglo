import { ProjectResponse, ProjectServiceResponse } from "../_types/tracking.types";

function calculatePercentageProject(project: ProjectResponse) {
  // Si no hay servicios o es undefined, devolver 0%
  if (!project.services || project.services.length === 0) {
    return 0;
  }

  const totalActivities = project.services.reduce((acc, service) => {
    return (
      acc +
      (service.objectives ?? []).reduce((objAcc, objective) => {
        return objAcc + (objective.activities ?? []).length;
      }, 0)
    );
  }, 0);

  const completedActivities = project.services.reduce((acc, service) => {
    return (
      acc +
      (service.objectives ?? []).reduce((objAcc, objective) => {
        return objAcc + (objective.activities ?? []).filter((activity) => activity.status === "COMPLETED").length;
      }, 0)
    );
  }, 0);

  if (totalActivities === 0) return 0;
  return Math.round((completedActivities / totalActivities) * 100);
}

function calculatePercentageService(service: ProjectServiceResponse) {
  const totalActivities = service.objectives.reduce((acc, objective) => acc + (objective.activities ?? []).length, 0);
  const completedActivities = service.objectives.reduce(
    (acc, objective) => acc + (objective.activities ?? []).filter((activity) => activity.status === "COMPLETED").length,
    0
  );
  return (completedActivities / totalActivities) * 100;
}

function calculateTotalActivitiesCompleted(service: ProjectServiceResponse) {
  return service.objectives.reduce(
    (acc, objective) => acc + (objective.activities ?? []).filter((activity) => activity.status === "COMPLETED").length,
    0
  );
}

export { calculatePercentageProject, calculatePercentageService, calculateTotalActivitiesCompleted };
