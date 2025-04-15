import { components } from "@/lib/api/types/api";

export type MedicalRecordResponse = components["schemas"]["MedicalRecordResponseDto"];

export type MedicalRecordCreate = {
  ruc: string;
  firstName: string;
  lastName: string;
  examType: "PRE_OCCUPATIONAL" | "PERIODIC" | "RETIREMENT" | "OTHER";
  aptitude: "APT" | "APT_WITH_RESTRICTIONS" | "TEMPORARY_NOT_APT" | "NOT_APT";
  restrictions?: string | null;
  aptitudeCertificate?: File | null;
  medicalReport?: File | null;
};

export type MedicalRecordFileInfo = {
  status?: string;
  message?: string;
  fileInfo?: components["schemas"]["FileMetadataResponseDto"];
};
