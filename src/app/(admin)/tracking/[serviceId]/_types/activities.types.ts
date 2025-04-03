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
  [StatusProjectActivity.PENDING]: "bg-yellow-100 text-yellow-600",
  [StatusProjectActivity.IN_PROGRESS]: "bg-blue-100 text-blue-600",
  [StatusProjectActivity.COMPLETED]: "bg-green-100 text-green-600",
  [StatusProjectActivity.CANCELLED]: "bg-red-100 text-red-600",
};
