import { DataTableFacetedFilterOption } from "@/shared/components/data-table/DataTableFacetedFilter";

/**
 * Función para agrupar filtros por valor
 * @param data - Datos a agrupar
 * @param key - Clave por la que se agrupará
 * @returns Un objeto con los datos agrupados como opciones para DataTableFacetedFilter
 */
export const groupFiltersByValue = (data: any[], key: string): DataTableFacetedFilterOption[] => {
  const acc: Record<string, any[]> = {};
  data.forEach((item) => {
    const value = item[key];
    if (!acc[value]) {
      acc[value] = [];
    }
    acc[value].push(item);
    return acc;
  }, {});
  return Object.entries(acc).map(([value, items]) => ({
    label: items[0][key],
    value,
  }));
};
