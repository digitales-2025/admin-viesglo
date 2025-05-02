"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { cn } from "@/shared/lib/utils";

export type ComboboxOption = {
  value: string;
  label: string | React.ReactNode;
};

type ComboboxProps = {
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  width?: string;
  label?: string;
  description?: string;
  isLoading?: boolean;
  onChange?: (value: string) => void;
  value?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  name?: string;
};

export function SelectCombobox({
  options,
  placeholder = "Seleccionar...",
  searchPlaceholder = "Buscar...",
  emptyMessage = "No se encontraron resultados.",
  width = "w-[200px]",
  label,
  description,
  isLoading = false,
  onChange,
  value: externalValue,
  disabled = false,
  required = false,
  id,
  name,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(externalValue || "");

  // Handle external value changes
  React.useEffect(() => {
    if (externalValue !== undefined) {
      setValue(externalValue);
    }
  }, [externalValue]);

  const handleSelect = (currentValue: string) => {
    const newValue = currentValue === value ? "" : currentValue;
    setValue(newValue);
    onChange?.(newValue);
    setOpen(false);
  };

  const selectedLabel = React.useMemo(() => {
    return options.find((option) => option.value === value)?.label || placeholder;
  }, [options, value, placeholder]);

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-baseline justify-between">
          <label htmlFor={id} className="text-sm font-medium">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        </div>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            name={name}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(width, "justify-between", disabled && "opacity-50 cursor-not-allowed")}
            disabled={disabled || isLoading}
            data-value={value} // Para facilitar el acceso al valor desde formularios
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Cargando...</span>
              </div>
            ) : (
              <>
                {selectedLabel}
                <ChevronsUpDown className="opacity-50 h-4 w-4 shrink-0" />
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className={cn(width, "p-0")}>
          <Command>
            <CommandInput placeholder={searchPlaceholder} className="h-9" />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem key={option.value} value={option.value} onSelect={handleSelect} disabled={disabled}>
                    {option.label}
                    <Check className={cn("ml-auto", value === option.value ? "opacity-100" : "opacity-0")} />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}
