export enum StatusProjectActivity {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export const StatusProjectActivityOptions = [
  { value: StatusProjectActivity.PENDING, label: "Pendiente" },
  { value: StatusProjectActivity.IN_PROGRESS, label: "En progreso" },
  { value: StatusProjectActivity.COMPLETED, label: "Completado" },
  { value: StatusProjectActivity.CANCELLED, label: "Cancelado" },
];

export const StatusProjectActivityLabel = {
  [StatusProjectActivity.PENDING]: "Pendiente",
  [StatusProjectActivity.IN_PROGRESS]: "En progreso",
  [StatusProjectActivity.COMPLETED]: "Completado",
  [StatusProjectActivity.CANCELLED]: "Cancelado",
};

export const StatusProjectActivityColor = {
  [StatusProjectActivity.PENDING]: "text-yellow-500 bg-yellow-100 [&>svg]:stroke-yellow-500",
  [StatusProjectActivity.IN_PROGRESS]: "text-blue-500 bg-blue-100 [&>svg]:stroke-blue-500",
  [StatusProjectActivity.COMPLETED]: "text-green-500 bg-green-100 [&>svg]:stroke-green-500",
  [StatusProjectActivity.CANCELLED]: "text-red-500 bg-red-100 [&>svg]:stroke-red-500",
};
