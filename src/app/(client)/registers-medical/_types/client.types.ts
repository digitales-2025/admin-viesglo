import { components } from "@/lib/api/types/api";

export type ClientResponse = components["schemas"]["ClientResponseDto"];

// Solo contiene los campos necesarios para mostrar y descargar documentos
export type ClientWithResponse = {
  id: string;
  name: string;
  surnames: string;
  type: string;
  date: string;
  clinic: string;
  province: string;
  status: string;
  medical: string; // URL del certificado de aptitud médica
  report: string; // URL del informe médico
};
