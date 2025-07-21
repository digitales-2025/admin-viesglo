import { CustomPaginationTableParams } from "@/shared/components/data-table/types/CustomPagination";
import { FieldQueryParams } from "./generic-field-query-filter";

export type PaginatedQueryParams<T> = {
  pagination: CustomPaginationTableParams;
  fieldFilters?: FieldQueryParams<T>;
};
