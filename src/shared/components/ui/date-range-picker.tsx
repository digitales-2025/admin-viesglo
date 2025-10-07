"use client";

import * as React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, ChevronLeft, ChevronRight, Flag, Globe } from "lucide-react";
import { DateRange, DayContentProps } from "react-day-picker";

import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { useHolidaysByYear } from "@/shared/hooks/use-holidays";
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

  // Actualizar cuando initialValue cambie (importante para cuando se limpia el filtro)
  React.useEffect(() => {
    setDate(initialValue);
    setTempDate(initialValue);
  }, [initialValue]);

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
    setTempDate(selectedDate);
    // Notificar el cambio para posibles previsualizaciones, pero no confirmar
    onChange?.(selectedDate);
  };

  const handleConfirm = () => {
    // Guardar la selección temporal como definitiva
    setDate(tempDate);
    // Notificar confirmación si existe la función
    onConfirm?.(tempDate);
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
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground",
              classNameButton
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <span className="capitalize">
                  {format(date.from, "dd LLL, y", { locale: es })} - {format(date.to, "dd LLL, y", { locale: es })}
                </span>
              ) : (
                format(date.from, "LLL dd, y", { locale: es })
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="space-y-4 p-3">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={currentDisplayMonth}
              selected={tempDate}
              onSelect={handleSelect}
              numberOfMonths={2}
              locale={es}
              disabled={isDateDisabled}
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
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
