"use client";

import * as React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { DateRange, DayContentProps } from "react-day-picker";

import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { useCurrentYearHolidays } from "@/shared/hooks/use-holidays";
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
  ...props
}: DatePickerWithRangeProps) {
  // Estado principal para almacenar el valor final seleccionado
  const [date, setDate] = React.useState<DateRange | undefined>(initialValue || undefined);
  // Estado para el valor temporal durante la selección
  const [tempDate, setTempDate] = React.useState<DateRange | undefined>(date);
  // Estado para controlar la apertura del popover
  const [open, setOpen] = React.useState(false);

  // Hook para obtener feriados del año actual
  const { data: currentYearHolidays } = useCurrentYearHolidays();

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
      const title = holidayInfo ? `${holidayInfo.name} (${holidayInfo.scope})` : undefined;

      return (
        <span title={title} className="relative">
          {props.date.getDate()}
        </span>
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
            className={cn("w-[300px] justify-start text-left font-normal", !date && "text-muted-foreground")}
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
              defaultMonth={tempDate?.from || new Date()}
              selected={tempDate}
              onSelect={handleSelect}
              numberOfMonths={2}
              locale={es}
              modifiers={showHolidays ? { holiday: isHoliday } : undefined}
              modifiersClassNames={
                showHolidays
                  ? {
                      holiday:
                        "relative after:content-[''] after:absolute after:top-0.5 after:right-0.5 after:w-1.5 after:h-1.5 after:bg-orange-400 after:rounded-full",
                    }
                  : undefined
              }
              components={
                showHolidays
                  ? {
                      DayContent: DayContentComponent,
                    }
                  : undefined
              }
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
