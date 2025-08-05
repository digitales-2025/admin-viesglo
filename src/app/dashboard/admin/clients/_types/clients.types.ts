import { components } from "@/lib/api/types/api";

// Tipos de DTOs usados en el controlador de clientes
export type AddContactRequestDto = components["schemas"]["AddContactRequestDto"];
export type CreateClientRequestDto = components["schemas"]["CreateClientRequestDto"];
export type UpdateClientRequestDto = components["schemas"]["UpdateClientRequestDto"];
export type UpdateContactRequestDto = components["schemas"]["UpdateContactRequestDto"];

export type ClientContactResponseDto = components["schemas"]["ClientContactResponseDto"];
export type ClientSunatInfoResponseDto = components["schemas"]["ClientSunatInfoResponseDto"];
export type ClientProfileResponseDto = components["schemas"]["ClientProfileResponseDto"];
export type ClientSunatFullInfoResponseDto = components["schemas"]["ClientSunatFullInfoResponseDto"];
export type ClientContactOperationResponseDto = components["schemas"]["ClientContactOperationResponseDto"];
export type ClientContactToggleActiveResponseDto = components["schemas"]["ClientContactToggleActiveResponseDto"];
export type ClientOperationResponseDto = components["schemas"]["ClientOperationResponseDto"];
export type ClientAddressResponseDto = components["schemas"]["ClientAddressResponseDto"];
export type PaginatedClientResponseDto = components["schemas"]["PaginatedClientResponseDto"];

// Enums traídos del backend
export enum ClientState {
  ACTIVO = "ACTIVO",
  BAJA_PROVISIONAL = "BAJA_PROVISIONAL",
  BAJA_DEFINITIVA = "BAJA_DEFINITIVA",
  SUSPENSION_TEMPORAL = "SUSPENSION_TEMPORAL",
  BAJA_PROV_POR_OFICIO = "BAJA_PROV_POR_OFICIO",
  BAJA_DEFI_POR_OFICIO = "BAJA_DEFI_POR_OFICIO",
  OTRO = "OTRO",
}

export enum ClientCondition {
  HABIDO = "HABIDO",
  NO_HABIDO = "NO_HABIDO",
  NO_HALLADO = "NO_HALLADO",
  PENDIENTE = "PENDIENTE",
  OTRO = "OTRO",
}
