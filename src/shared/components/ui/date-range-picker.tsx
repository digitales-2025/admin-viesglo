"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { cn } from "@/shared/lib/utils";

interface DatePickerWithRangeProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  onChange?: (date: DateRange | undefined) => void;
  onConfirm?: (date: DateRange | undefined) => void;
  initialValue?: DateRange;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
}

export function DatePickerWithRange({
  className,
  onChange,
  onConfirm,
  initialValue,
  placeholder = "Seleccionar fechas",
  confirmText = "Aceptar",
  cancelText = "Cancelar",
  ...props
}: DatePickerWithRangeProps) {
  // Estado principal para almacenar el valor final seleccionado
  const [date, setDate] = React.useState<DateRange | undefined>(initialValue || undefined);
  // Estado para el valor temporal durante la selección
  const [tempDate, setTempDate] = React.useState<DateRange | undefined>(date);
  // Estado para controlar la apertura del popover
  const [open, setOpen] = React.useState(false);

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
            variant={"outline"}
            className={cn("w-[300px] justify-start text-left font-normal", !date && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
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
            />
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                {cancelText}
              </Button>
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
