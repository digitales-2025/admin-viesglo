import { useCallback, useState } from "react";
import { toast } from "sonner";

import { backend } from "@/lib/api/types/backend";

/**
 * Hook para obtener feriados por año
 * Sigue el patrón establecido en use-clients.ts
 */
export const useHolidaysByYear = (year: number, enabled = true) => {
  const isValidYear = typeof year === "number" && year >= 1900 && year <= 2100;
  const shouldExecute = isValidYear && enabled;

  const query = backend.useQuery(
    "get",
    "/v1/holidays/year",
    {
      params: {
        query: { year: isValidYear ? year : 2025 },
      },
    },
    {
      enabled: shouldExecute,
    }
  );

  return {
    ...query,
    isSuccess: query.isSuccess,
    refetch: query.refetch,
  };
};

/**
 * Hook para obtener feriados por rango de fechas
 * Sigue el patrón establecido en use-clients.ts
 */
export const useHolidaysByRange = (startDate: string, endDate: string, enabled = true) => {
  const isValidStartDate = typeof startDate === "string" && startDate.length > 0;
  const isValidEndDate = typeof endDate === "string" && endDate.length > 0;
  const shouldExecute = isValidStartDate && isValidEndDate && enabled;

  const query = backend.useQuery(
    "get",
    "/v1/holidays/range",
    {
      params: {
        query: {
          startDate: isValidStartDate ? startDate : "2025-01-01",
          endDate: isValidEndDate ? endDate : "2025-12-31",
        },
      },
    },
    {
      enabled: shouldExecute,
    }
  );

  return {
    ...query,
    isSuccess: query.isSuccess,
    refetch: query.refetch,
  };
};

/**
 * Hook para obtener feriados del año actual
 */
export const useCurrentYearHolidays = () => {
  const currentYear = new Date().getFullYear();
  return useHolidaysByYear(currentYear);
};

/**
 * Hook para obtener feriados del año siguiente
 */
export const useNextYearHolidays = () => {
  const nextYear = new Date().getFullYear() + 1;
  return useHolidaysByYear(nextYear);
};

/**
 * Hook para obtener feriados del mes actual
 */
export const useCurrentMonthHolidays = () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const startDate = startOfMonth.toISOString().split("T")[0];
  const endDate = endOfMonth.toISOString().split("T")[0];

  return useHolidaysByRange(startDate, endDate);
};

/**
 * Hook para obtener feriados del próximo mes
 */
export const useNextMonthHolidays = () => {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const endOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);

  const startDate = nextMonth.toISOString().split("T")[0];
  const endDate = endOfNextMonth.toISOString().split("T")[0];

  return useHolidaysByRange(startDate, endDate);
};

/**
 * Hook para verificar si una fecha específica es feriado
 */
export const useIsHoliday = (date: string) => {
  const query = useHolidaysByRange(date, date, !!date);

  const isHoliday = query.data && query.data.length > 0;
  const holidayInfo = query.data?.[0] || null;

  return {
    ...query,
    isHoliday,
    holidayInfo,
  };
};

/**
 * Hook para obtener feriados de los próximos N días
 */
export const useUpcomingHolidays = (days: number = 30) => {
  const now = new Date();
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const startDate = now.toISOString().split("T")[0];
  const endDate = futureDate.toISOString().split("T")[0];

  return useHolidaysByRange(startDate, endDate);
};

/**
 * Hook para obtener feriados de los últimos N días
 */
export const useRecentHolidays = (days: number = 30) => {
  const now = new Date();
  const pastDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  const startDate = pastDate.toISOString().split("T")[0];
  const endDate = now.toISOString().split("T")[0];

  return useHolidaysByRange(startDate, endDate);
};

/**
 * Hook para obtener feriados de un rango de años (útil para calendarios)
 * Usa múltiples queries para obtener feriados de varios años
 */
export const useHolidaysForYearRange = (startYear: number, endYear: number) => {
  const [allHolidays, setAllHolidays] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const fetchHolidaysForRange = useCallback(async () => {
    if (startYear > endYear) {
      setError(new Error("El año de inicio no puede ser mayor al año de fin"));
      return;
    }

    setIsLoading(true);
    setError(null);
    setAllHolidays([]);

    try {
      const holidays = [];
      for (let year = startYear; year <= endYear; year++) {
        try {
          const yearQuery = backend.useQuery("get", "/v1/holidays/year", {
            params: { query: { year } },
          });

          if (yearQuery.data) {
            holidays.push(...yearQuery.data);
          }
        } catch (err) {
          console.warn(`Error fetching holidays for year ${year}:`, err);
        }
      }

      setAllHolidays(holidays);
    } catch (err) {
      setError(err);
      toast.error("Error al obtener feriados del rango de años");
    } finally {
      setIsLoading(false);
    }
  }, [startYear, endYear]);

  return {
    allHolidays,
    isLoading,
    error,
    fetchHolidaysForRange,
    refetch: fetchHolidaysForRange,
  };
};
