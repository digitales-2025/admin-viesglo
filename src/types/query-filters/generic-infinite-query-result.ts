import { InfiniteData, UseInfiniteQueryResult } from "@tanstack/react-query";

import { ErrorResponse } from "@/lib/api/types/common";
import { MetaPaginated } from "./meta-paginated.types";

/**
 * Tipo genérico para infinite query results con paginación
 * @template T - Tipo de los datos de la entidad
 */
export type GenericInfiniteQueryResult<T> = UseInfiniteQueryResult<
  InfiniteData<
    {
      data: T[];
      meta: MetaPaginated;
    },
    unknown
  >,
  {
    success: boolean;
    error: ErrorResponse;
  }
>;
