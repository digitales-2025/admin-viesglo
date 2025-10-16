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
  // Nuevas props para confirmación
  showConfirmButton?: boolean; // Mostrar botón de confirmación
  onConfirm?: (date: Date | undefined) => void; // Callback cuando se confirma
  confirmText?: string; // Texto del botón de confirmación
  cancelText?: string; // Texto del botón de cancelar
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
  // Nuevas props
  showConfirmButton = false,
  onConfirm,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [tempSelected, setTempSelected] = React.useState<Date | undefined>(selected);

  // Sincronizar tempSelected cuando cambia selected externamente
  React.useEffect(() => {
    setTempSelected(selected);
  }, [selected]);

  const handleSelect = (date: Date | undefined) => {
    if (disabled || readOnly) return; // No permitir selección si está deshabilitado o en modo readonly

    if (showConfirmButton) {
      // Si tiene botón de confirmación, solo actualizar temporalmente
      setTempSelected(date);
    } else {
      // Comportamiento normal: confirmar inmediatamente
      onSelect(date);
      setOpen(false); // Cerrar el popover al seleccionar una fecha
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(tempSelected);
    } else {
      onSelect(tempSelected);
    }
    setOpen(false);
  };

  const handleCancel = () => {
    setTempSelected(selected); // Restaurar valor original
    setOpen(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (disabled || readOnly) return; // No permitir abrir si está deshabilitado o en modo readonly
    setOpen(newOpen);
    if (!newOpen) {
      // Si se cierra sin confirmar, restaurar valor original
      setTempSelected(selected);
    }
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
            selected={showConfirmButton ? tempSelected : selected}
            onSelect={handleSelect}
            initialFocus
            locale={es}
            defaultMonth={showConfirmButton ? tempSelected : selected}
            fromDate={fromDate}
            toDate={toDate}
          />
          {clearable && !showConfirmButton && (
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
          {showConfirmButton && (
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border p-2">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                {cancelText}
              </Button>
              <Button size="sm" onClick={handleConfirm}>
                {confirmText}
              </Button>
            </div>
          )}
        </PopoverContent>
      )}
    </Popover>
  );
}
