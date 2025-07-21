import { components } from "@/lib/api/types/api";
import { MetaPaginated } from "@/types/query-filters/meta-paginated.types";

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
export type PaginatedClientResponseDto = components["schemas"]["PaginatedClientResponseDto"];
export type BaseErrorResponse = components["schemas"]["BaseErrorResponse"];

// Respuesta paginada para tabla de clientes
export type ResponseCustomerPaginatedDto = {
  data: ClientProfileResponseDto[];
  meta: MetaPaginated;
};
