export type FieldQueryParams<T> = {
  [key in keyof T]?: string | number | boolean;
};
