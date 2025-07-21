export type CustomPaginationTableParams = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

//In tanstack table pageIndex is used instead of page
export type ServerPaginationChangeEventCallback = (pageIndex: number, pageSize: number) => void;

/**
   * Si la API retorna una paginación que comienza con 1 debemos procesar el index de la paginación para Tanstack Table
   * @example
   * {
        pageIndex: pagination.page - 1, // TanStack Table usa 0-indexed, nuestro API usa 1-indexed
        pageSize: pagination.pageSize,
        pageCount: pagination.totalPages,
        total: pagination.total,
        onPaginationChange: (pageIndex, pageSize) => {
          // Convertir de 0-indexed a 1-indexed para el API
          onPaginationChange(pageIndex + 1, pageSize);
        },
      }
   */
export type ServerPaginationTanstackTableConfig = {
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  total: number;
  onPaginationChange: ServerPaginationChangeEventCallback;
};
