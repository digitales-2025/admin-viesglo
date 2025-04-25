import { components } from "@/lib/api/types/api";
import { ClinicResponse } from "../../clinics/_types/clinics.types";

export type ClientResponse = components["schemas"]["ClientResponseDto"];

export type ClientWithClinicResponse = Omit<components["schemas"]["ClientWithClinicResponseDto"], "clinics"> & {
  clinics: ClinicResponse[];
};
export type ClientCreate = components["schemas"]["CreateClientDto"];

export type ClientUpdate = components["schemas"]["UpdateClientDto"];
