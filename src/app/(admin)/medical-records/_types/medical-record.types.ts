import { components } from "@/lib/api/types/api";

export type MedicalRecordResponse = components["schemas"]["MedicalRecordResponseDto"] & {
  customData?: string | Record<string, any>;
  details?: any;
};

export type MedicalRecordCreate = {
  ruc: string;
  dni?: string;
  firstName: string;
  secondName?: string;
  firstLastName: string;
  secondLastName?: string;
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

export type UpdateMedicalRecordDetails = {
  datosFiliacion?: {
    dni?: string;
    nombres?: string;
    segundoNombre?: string;
    apellidoPaterno?: string;
    apellidoMaterno?: string;
    edad?: string;
    genero?: string;
    customFields?: Array<{ name: string; value: string }>;
  };
  aptitud?: {
    aptitud?: string;
    restricciones?: string;
    antecedentesPersonales?: string;
    customFields?: Array<{ name: string; value: string }>;
  };
  diagnosticos?: {
    hallazgosLaboratorio?: string[];
    diagnosticoOftalmologia?: string;
    diagnosticoMusculoesqueletico?: string;
    alteracionDiagnosticoPsicologia?: string;
    diagnosticoAudiometria?: string;
    diagnosticoEspirometria?: string;
    diagnosticoEkg?: string;
    resultadoTestSomnolencia?: string;
    customFields?: Array<{ name: string; value: string }>;
  };
  customSections?: CustomSection[];
  customData?: string;
};

export type CustomSectionField = {
  name?: string;
  value?: string;
};

export type CustomSection = {
  name?: string;
  fields?: CustomSectionField[];
};

export type UpdateCustomSections = {
  customSections?: CustomSection[];
};
