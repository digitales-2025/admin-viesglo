import * as React from "react";
import { Check, PlusCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "../../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Separator } from "../../ui/separator";

interface StyledFacetedFilterProps<TValue> {
  title?: string;
  options: {
    label: string;
    value: TValue;
    icon?: React.ComponentType<{ className?: string }>;
    badgeVariant?: "default" | "secondary" | "destructive" | "outline";
    className?: string;
    textClass?: string;
    borderColor?: string;
    iconClass?: string;
  }[];
  selectedValues?: TValue[] | undefined;
  onSelectedValuesChange?: (values: TValue[] | undefined) => void;
}

export function StyledFacetedFilter<TValue>({
  title,
  options,
  selectedValues,
  onSelectedValuesChange,
}: StyledFacetedFilterProps<TValue>) {
  const selectedValuesSet = React.useMemo(() => {
    if (selectedValues === undefined || selectedValues === null) {
      return new Set<TValue>();
    }
    return new Set<TValue>(selectedValues);
  }, [selectedValues]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircle className="mr-2 h-4 w-4" />
          {title}
          {selectedValuesSet?.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                {selectedValuesSet.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedValuesSet.size > 2 ? (
                  <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                    {selectedValuesSet.size} seleccionados
                  </Badge>
                ) : (
                  options
                    .filter((option) => selectedValuesSet.has(option.value))
                    .map((option) => {
                      const IconComponent = option.icon;
                      return (
                        <Badge
                          key={String(option.value)}
                          variant={option.badgeVariant || "secondary"}
                          className={cn(
                            "rounded-sm px-1 font-normal flex items-center gap-1",
                            option.className,
                            option.textClass
                          )}
                        >
                          {IconComponent && <IconComponent className={cn("w-3 h-3", option.iconClass)} />}
                          {option.label}
                        </Badge>
                      );
                    })
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>No se encontraron resultados.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValuesSet.has(option.value);
                const IconComponent = option.icon;
                return (
                  <CommandItem
                    key={String(option.value)}
                    onSelect={() => {
                      const filterValues = new Set(selectedValuesSet);
                      if (isSelected) {
                        filterValues.delete(option.value);
                      } else {
                        filterValues.add(option.value);
                      }

                      const next = filterValues.size ? Array.from(filterValues) : undefined;
                      onSelectedValuesChange?.(next as TValue[] | undefined);
                    }}
                    className={cn("flex items-center gap-2", isSelected && option.className)}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected ? "" : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <Check className={cn("h-4 w-4")} />
                    </div>
                    {IconComponent && <IconComponent className={cn("h-4 w-4", option.iconClass)} />}
                    <span className={cn(isSelected && option.textClass)}>{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedValuesSet.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      onSelectedValuesChange?.(undefined);
                    }}
                    className="justify-center text-center"
                  >
                    Limpiar filtros
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
