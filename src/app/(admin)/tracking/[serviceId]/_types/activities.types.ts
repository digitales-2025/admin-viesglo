export enum StatusProjectActivity {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export const StatusProjectActivityLabel = {
  [StatusProjectActivity.PENDING]: "Pendiente",
  [StatusProjectActivity.IN_PROGRESS]: "En progreso",
  [StatusProjectActivity.COMPLETED]: "Completado",
  [StatusProjectActivity.CANCELLED]: "Cancelado",
};

export const StatusProjectActivityColor = {
  [StatusProjectActivity.PENDING]: "warning",
  [StatusProjectActivity.IN_PROGRESS]: "info",
  [StatusProjectActivity.COMPLETED]: "success",
  [StatusProjectActivity.CANCELLED]: "error",
};
