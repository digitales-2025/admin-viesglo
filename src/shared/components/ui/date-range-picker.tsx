"use client";

import * as React from "react";
import { endOfDay, format, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, ChevronLeft, ChevronRight, Flag, Globe } from "lucide-react";
import { DateRange, DayContentProps } from "react-day-picker";

import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { useHolidaysByYear } from "@/shared/hooks/use-holidays";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { cn } from "@/shared/lib/utils";
import type { HolidayResponseDto } from "@/shared/types/holidays.types";

interface DatePickerWithRangeProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  onChange?: (date: DateRange | undefined) => void;
  onConfirm?: (date: DateRange | undefined) => void;
  onClear?: (date: DateRange | undefined) => void;
  initialValue?: DateRange;
  placeholder?: string;
  confirmText?: string;
  clearText?: string;
  cancelText?: string;
  size?: "default" | "sm" | "lg" | "icon";
  showHolidays?: boolean;
  classNameButton?: string;
  // Limitadores de fechas
  disabled?: (date: Date) => boolean;
  fromDate?: Date;
  toDate?: Date;
  disabledDates?: Date[];
  // Modo de solo lectura
  readOnly?: boolean;
}

export function DatePickerWithRange({
  className,
  onChange,
  onConfirm,
  onClear,
  initialValue,
  placeholder = "Seleccionar fechas",
  confirmText = "Aceptar",
  cancelText = "Cancelar",
  clearText = "Limpiar",
  size = "default",
  showHolidays = true,
  classNameButton,
  // Limitadores de fechas
  disabled,
  fromDate,
  toDate,
  disabledDates,
  // Modo de solo lectura
  readOnly = false,
  ...props
}: DatePickerWithRangeProps) {
  // Estado principal para almacenar el valor final seleccionado
  const [date, setDate] = React.useState<DateRange | undefined>(initialValue || undefined);
  // Estado para el valor temporal durante la selección
  const [tempDate, setTempDate] = React.useState<DateRange | undefined>(date);
  // Estado para controlar la apertura del popover
  const [open, setOpen] = React.useState(false);

  // Estado para rastrear el mes/año que se está visualizando en el calendario
  const [currentDisplayMonth, setCurrentDisplayMonth] = React.useState<Date>(tempDate?.from || new Date());

  // Hook para detectar si es móvil
  const isMobile = useIsMobile();

  // Hook para obtener feriados del año que se está visualizando
  const currentDisplayYear = currentDisplayMonth.getFullYear();
  const { data: currentYearHolidays } = useHolidaysByYear(currentDisplayYear);

  // Función para verificar si una fecha está deshabilitada
  const isDateDisabled = React.useCallback(
    (date: Date): boolean => {
      // Verificar fecha mínima (fromDate)
      if (fromDate && date < fromDate) {
        return true;
      }

      // Verificar fecha máxima (toDate)
      if (toDate && date > toDate) {
        return true;
      }

      // Verificar fechas específicas deshabilitadas
      if (disabledDates) {
        const dateString = format(date, "yyyy-MM-dd");
        const isDisabled = disabledDates.some((disabledDate) => {
          const disabledDateString = format(disabledDate, "yyyy-MM-dd");
          return dateString === disabledDateString;
        });
        if (isDisabled) {
          return true;
        }
      }

      // Verificar función personalizada de deshabilitación
      if (disabled && disabled(date)) {
        return true;
      }

      return false;
    },
    [fromDate, toDate, disabledDates, disabled]
  );

  // Componentes personalizados para detectar navegación
  const CustomIconLeft = React.useCallback(
    ({ className, ...props }: any) => {
      const handleClick = () => {
        const newDate = new Date(currentDisplayMonth);
        newDate.setMonth(newDate.getMonth() - 1);
        setCurrentDisplayMonth(newDate);
      };

      return (
        <div
          onClick={handleClick}
          className={cn(
            "size-7 bg-transparent p-0 opacity-50 hover:opacity-100 cursor-pointer flex items-center justify-center",
            className
          )}
          {...props}
        >
          <ChevronLeft className="size-4" />
        </div>
      );
    },
    [currentDisplayMonth]
  );

  const CustomIconRight = React.useCallback(
    ({ className, ...props }: any) => {
      const handleClick = () => {
        const newDate = new Date(currentDisplayMonth);
        newDate.setMonth(newDate.getMonth() + 1);
        setCurrentDisplayMonth(newDate);
      };

      return (
        <div
          onClick={handleClick}
          className={cn(
            "size-7 bg-transparent p-0 opacity-50 hover:opacity-100 cursor-pointer flex items-center justify-center",
            className
          )}
          {...props}
        >
          <ChevronRight className="size-4" />
        </div>
      );
    },
    [currentDisplayMonth]
  );

  // Función para comparar solo las fechas (sin horas)
  const compareDatesOnly = React.useCallback((date1: Date, date2: Date): number => {
    const d1 = new Date(date1);
    d1.setHours(0, 0, 0, 0);
    const d2 = new Date(date2);
    d2.setHours(0, 0, 0, 0);
    return d1.getTime() - d2.getTime();
  }, []);

  // Normalizar initialValue al cargar
  const normalizeInitialValue = React.useCallback(
    (value: DateRange | undefined): DateRange | undefined => {
      if (!value) return undefined;

      if (value.from && value.to) {
        // Validar que endDate >= startDate
        const comparison = compareDatesOnly(value.to, value.from);

        if (comparison < 0) {
          // Si la fecha final es menor, usar solo la fecha inicial como rango de un día
          return {
            from: startOfDay(value.from),
            to: endOfDay(value.from),
          };
        }

        // Si son el mismo día, crear rango del día completo
        if (comparison === 0) {
          return {
            from: startOfDay(value.from),
            to: endOfDay(value.from),
          };
        }

        return {
          from: startOfDay(value.from),
          to: endOfDay(value.to),
        };
      } else if (value.from) {
        // Si solo hay fecha inicial, crear rango del día completo automáticamente
        return {
          from: startOfDay(value.from),
          to: endOfDay(value.from),
        };
      }

      return value;
    },
    [compareDatesOnly]
  );

  // Actualizar cuando initialValue cambie (importante para cuando se limpia el filtro)
  React.useEffect(() => {
    const normalized = normalizeInitialValue(initialValue);
    setDate(normalized);
    setTempDate(normalized);
  }, [initialValue, normalizeInitialValue]);

  // Actualizar tempDate cuando date cambia externamente
  React.useEffect(() => {
    if (!open) {
      setTempDate(date);
    }
  }, [date, open]);

  // Cuando se abre, inicializar la fecha temporal con la actual
  React.useEffect(() => {
    if (open) {
      setTempDate(date);
      // Sincronizar el mes de visualización con la fecha actual
      setCurrentDisplayMonth(date?.from || new Date());
    }
  }, [open, date]);

  // Función para verificar si una fecha es feriado
  const isHoliday = React.useCallback(
    (date: Date): boolean => {
      if (!showHolidays || !currentYearHolidays) return false;
      const dateString = format(date, "yyyy-MM-dd");
      return currentYearHolidays.some((holiday) => holiday.date === dateString);
    },
    [showHolidays, currentYearHolidays]
  );

  // Función para obtener información del feriado
  const getHolidayInfo = React.useCallback(
    (date: Date): HolidayResponseDto | null => {
      if (!showHolidays || !currentYearHolidays) return null;
      const dateString = format(date, "yyyy-MM-dd");
      return currentYearHolidays.find((holiday) => holiday.date === dateString) || null;
    },
    [showHolidays, currentYearHolidays]
  );

  // Componente DayContent personalizado para mostrar tooltips en feriados
  const DayContentComponent = React.useCallback(
    (props: DayContentProps) => {
      const holidayInfo = getHolidayInfo(props.date);

      if (!holidayInfo) {
        return <span className="relative">{props.date.getDate()}</span>;
      }

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="relative cursor-help font-bold group">
                {props.date.getDate()}
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </span>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className="max-w-[280px] p-0 bg-card border border-orange-200 dark:border-orange-800 rounded-lg overflow-hidden"
            >
              <div className="bg-orange-50 dark:bg-orange-950/50 px-4 py-3 border-b border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-3">
                  {holidayInfo.scope === "nacional" ? (
                    <Flag className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                  ) : (
                    <Globe className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                  )}
                  <div>
                    <p className="font-bold text-sm text-orange-900 dark:text-orange-100">{holidayInfo.name}</p>
                    <div className="flex items-center gap-1">
                      <p className="text-xs text-orange-600 dark:text-orange-400 capitalize font-medium">
                        {holidayInfo.scope}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-4 py-2 bg-card">
                <p className="text-xs text-muted-foreground">
                  Día festivo - {format(props.date, "dd 'de' MMMM", { locale: es })}
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    [getHolidayInfo]
  );

  const handleSelect = (selectedDate: DateRange | undefined) => {
    if (!selectedDate) {
      setTempDate(undefined);
      onChange?.(undefined);
      return;
    }

    // Validación: asegurar que endDate >= startDate
    if (selectedDate.from && selectedDate.to) {
      // Comparar solo las fechas (sin horas)
      const comparison = compareDatesOnly(selectedDate.to, selectedDate.from);

      if (comparison < 0) {
        // Si la fecha final es menor que la inicial, usar solo la fecha inicial como rango de un día
        const correctedRange: DateRange = {
          from: startOfDay(selectedDate.from),
          to: endOfDay(selectedDate.from),
        };
        setTempDate(correctedRange);
        onChange?.(correctedRange);
        return;
      }

      // Si son el mismo día, crear rango del día completo automáticamente
      if (comparison === 0) {
        const singleDayRange: DateRange = {
          from: startOfDay(selectedDate.from),
          to: endOfDay(selectedDate.from),
        };
        setTempDate(singleDayRange);
        onChange?.(singleDayRange);
        return;
      }

      // Normalizar las fechas con startOfDay y endOfDay
      const normalizedRange: DateRange = {
        from: startOfDay(selectedDate.from),
        to: endOfDay(selectedDate.to),
      };
      setTempDate(normalizedRange);
      onChange?.(normalizedRange);
    } else if (selectedDate.from) {
      // Solo hay fecha inicial - crear rango del día completo automáticamente
      const singleDayRange: DateRange = {
        from: startOfDay(selectedDate.from),
        to: endOfDay(selectedDate.from),
      };
      setTempDate(singleDayRange);
      onChange?.(singleDayRange);
    } else {
      setTempDate(selectedDate);
      onChange?.(selectedDate);
    }
  };

  const handleConfirm = () => {
    if (!tempDate) {
      setDate(undefined);
      onConfirm?.(undefined);
      setOpen(false);
      return;
    }

    // Normalizar fechas antes de confirmar
    let normalizedRange: DateRange | undefined = undefined;

    if (tempDate.from && tempDate.to) {
      // Validar que endDate >= startDate
      const comparison = compareDatesOnly(tempDate.to, tempDate.from);

      if (comparison < 0) {
        // Si la fecha final es menor, usar solo la fecha inicial como rango de un día
        normalizedRange = {
          from: startOfDay(tempDate.from),
          to: endOfDay(tempDate.from),
        };
      } else if (comparison === 0) {
        // Si son el mismo día, crear rango del día completo
        normalizedRange = {
          from: startOfDay(tempDate.from),
          to: endOfDay(tempDate.from),
        };
      } else {
        normalizedRange = {
          from: startOfDay(tempDate.from),
          to: endOfDay(tempDate.to),
        };
      }
    } else if (tempDate.from) {
      // Solo hay fecha inicial - crear rango del día completo automáticamente
      normalizedRange = {
        from: startOfDay(tempDate.from),
        to: endOfDay(tempDate.from),
      };
    }

    // Guardar la selección temporal como definitiva
    setDate(normalizedRange);
    // Notificar confirmación si existe la función
    onConfirm?.(normalizedRange);
    // Cerrar el popover
    setOpen(false);
  };

  const handleClear = () => {
    // Restaurar la fecha temporal a la fecha confirmada previamente
    setDate(undefined);
    setTempDate(undefined);
    // Notificar confirmación si existe la función
    onClear?.(undefined);
    setOpen(false);
  };

  const handleCancel = () => {
    // Restaurar la fecha temporal a la fecha confirmada previamente
    setTempDate(date);
    // Cerrar el popover
    setOpen(false);
  };

  return (
    <div className={cn("grid gap-2", className)} {...props}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            size={size}
            variant={"outline"}
            className={cn(
              "w-full sm:w-[300px] justify-start text-left font-normal min-w-0",
              !date && "text-muted-foreground",
              readOnly && "cursor-pointer opacity-100",
              classNameButton
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
            {date?.from ? (
              date.to ? (
                <span className="capitalize truncate">
                  <span className="hidden sm:inline">
                    {format(date.from, "dd LLL, y", { locale: es })} - {format(date.to, "dd LLL, y", { locale: es })}
                  </span>
                  <span className="sm:hidden">
                    {format(date.from, "dd/MM/yy", { locale: es })} - {format(date.to, "dd/MM/yy", { locale: es })}
                  </span>
                </span>
              ) : (
                <span className="capitalize truncate">
                  <span className="hidden sm:inline">{format(date.from, "dd LLL, y", { locale: es })}</span>
                  <span className="sm:hidden">{format(date.from, "dd/MM/yy", { locale: es })}</span>
                </span>
              )
            ) : (
              <span className="truncate">{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 max-w-[calc(100vw-2rem)] sm:max-w-none" align="start">
          <div className="space-y-4 p-3">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={currentDisplayMonth}
              selected={tempDate}
              onSelect={readOnly ? undefined : handleSelect}
              numberOfMonths={isMobile ? 1 : 2}
              locale={es}
              disabled={readOnly ? () => true : isDateDisabled}
              fromDate={fromDate}
              toDate={toDate}
              modifiers={showHolidays ? { holiday: isHoliday } : undefined}
              modifiersClassNames={
                showHolidays
                  ? {
                      holiday:
                        "!bg-orange-50 dark:!bg-orange-950/30 !text-orange-500 dark:!text-orange-200 !font-bold !border-2 !border-orange-200 dark:!border-orange-800 hover:!bg-orange-100 dark:hover:!bg-orange-900/40 hover:!border-orange-300 dark:hover:!border-orange-700 !transition-colors aria-selected:!bg-orange-50 aria-selected:!text-orange-500 aria-selected:!border-orange-200 aria-selected:hover:!bg-orange-50",
                    }
                  : undefined
              }
              components={{
                IconLeft: CustomIconLeft,
                IconRight: CustomIconRight,
                ...(showHolidays ? { DayContent: DayContentComponent } : {}),
              }}
            />
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              {readOnly ? (
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  Cerrar
                </Button>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    {cancelText}
                  </Button>
                  {date && (
                    <Button size="sm" variant="outline" onClick={handleClear}>
                      {clearText}
                    </Button>
                  )}
                  <Button size="sm" onClick={handleConfirm}>
                    {confirmText}
                  </Button>
                </>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
