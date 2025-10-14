import * as React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { cn } from "@/shared/lib/utils";

export interface DatePickerProps {
  selected: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean; // Modo de solo lectura - no permite cambios
  className?: string;
  clearable?: boolean;
  fromDate?: Date; // Fecha mínima permitida
  toDate?: Date; // Fecha máxima permitida
}

export function DatePicker({
  selected,
  onSelect,
  placeholder = "Seleccionar fecha",
  disabled = false,
  readOnly = false, // Por defecto no es solo lectura
  className,
  clearable = false,
  fromDate,
  toDate,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (date: Date | undefined) => {
    if (disabled || readOnly) return; // No permitir selección si está deshabilitado o en modo readonly
    onSelect(date);
    setOpen(false); // Cerrar el popover al seleccionar una fecha
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (disabled || readOnly) return; // No permitir abrir si está deshabilitado o en modo readonly
    setOpen(newOpen);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-between text-left font-normal",
            !selected && "text-muted-foreground",
            (disabled || readOnly) && "opacity-50 cursor-not-allowed",
            className
          )}
          disabled={disabled || readOnly}
        >
          {selected ? format(selected, "PPP", { locale: es }) : <span>{placeholder}</span>}
          <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      {!disabled && !readOnly && (
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            initialFocus
            locale={es}
            defaultMonth={selected}
            fromDate={fromDate}
            toDate={toDate}
          />
          {clearable && (
            <Button
              variant="ghost"
              onClick={() => {
                onSelect(undefined);
                setOpen(false);
              }}
            >
              Limpiar
              <X className="w-4 h-4" />
            </Button>
          )}
        </PopoverContent>
      )}
    </Popover>
  );
}
