import { useCallback, useEffect, useState } from "react";

export const usePagination = () => {
  const defaultSize = 10; // Default page size
  const [resetSize, setResetSize] = useState(defaultSize); //MODIFICACION MECANICA DE EL TAMAÑO DE LA PAGINACION SI QUEREMOS UN NUMERO MENOR DE 10
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(defaultSize);

  const setPagination = ({ newPage, newSize }: { newPage: number; newSize: number }) => {
    setPage(newPage);
    setSize(newSize);
  };
  const resetPagination = useCallback(() => {
    setPage(1);
    setSize(resetSize);
  }, [resetSize]);

  useEffect(() => {
    // Reset pagination when size changes
    setSize(resetSize);
  }, [resetSize]);

  return {
    page,
    size,
    setPagination,
    resetPagination,
    setResetSize,
  };
};
