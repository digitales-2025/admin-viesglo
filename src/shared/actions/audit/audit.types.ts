import { components } from "@/lib/api/types/api";

export type AuditResponse = components["schemas"]["AuditResponseDto"];

export enum AuditType {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
}

export const ColorAudit = {
  [AuditType.CREATE]: "text-emerald-500",
  [AuditType.UPDATE]: "text-amber-500",
  [AuditType.DELETE]: "text-rose-500",
};
