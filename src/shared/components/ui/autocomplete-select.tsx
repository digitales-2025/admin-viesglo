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

interface AutocompleteSelectProps {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
  className?: string;
}

export default function AutocompleteSelect({
  label,
  options,
  value,
  onChange,
  isLoading,
  className,
}: AutocompleteSelectProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="w-full max-w-md mx-auto">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between truncate", className)}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="ml-2 h-4 w-4 shrink-0 opacity-50 animate-spin text-emerald-500" />
            ) : (
              <>
                {value ? options.find((option) => option.value === value)?.label : `Selecciona un ${label}`}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput className="text-sm" placeholder={`Buscar ${label}`} />
            <CommandList>
              <CommandEmpty className="first-letter:uppercase lowercase text-xs text-center my-4">
                No se encontraron {label}s.
              </CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    keywords={[option.label]}
                    onSelect={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    className="cursor-pointer truncate"
                  >
                    <Check className={cn("mr-2 h-4 w-4", value === option.value ? "opacity-100" : "opacity-0")} />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
