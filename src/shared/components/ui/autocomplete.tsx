import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { UseInfiniteQueryResult, UseQueryResult, UseSuspenseInfiniteQueryResult } from "@tanstack/react-query";
import { AlertCircle, Check, ChevronDown, Loader2 } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./command";

export type Option<T> = {
  value: string;
  label: string;
  entity?: T;
  component?: React.ReactNode;
};

type AutoCompleteProps<T> = {
  // Props básicas (compatibilidad con versión anterior)
  options?: Option<T>[];
  emptyMessage?: string;
  value?: Option<T>;
  onValueChange?: (value: Option<T>) => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  onPreventSelection?: (value: Option<T>) => boolean;

  // Props para búsqueda remota (nuevas)
  queryState?:
    | UseQueryResult<T[], unknown>
    | UseInfiniteQueryResult<unknown, unknown>
    | UseSuspenseInfiniteQueryResult<unknown, unknown>;
  onSearchChange?: (searchTerm: string) => void;
  searchPlaceholder?: string;
  debounceMs?: number;
  regexInput?: RegExp;
  total?: number;
  notFoundAction?: React.ReactNode;

  // Props de scroll infinito
  onScrollEnd?: () => void;

  // Props de UI mejoradas
  className?: string;
  commandContentClassName?: string;
  commandInputClassName?: string;
};

export function AutoComplete<T = unknown>({
  // Props básicas
  options = [],
  placeholder = "Buscar...",
  emptyMessage = "No se encontraron resultados",
  value,
  onValueChange,
  disabled = false,
  isLoading: externalLoading = false,
  onPreventSelection,

  // Props de búsqueda remota
  queryState,
  onSearchChange,
  searchPlaceholder,
  debounceMs = 300,
  regexInput,
  total,
  notFoundAction,

  // Props de scroll
  onScrollEnd,

  // Props de UI
  className,
  commandContentClassName,
  commandInputClassName,
}: AutoCompleteProps<T>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const commandListRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isOpen, setOpen] = useState(false);
  const [selected, setSelected] = useState<Option<T> | undefined>(value);
  const [inputValue, setInputValue] = useState<string>("");

  // Sincronizar con el prop value cuando cambie externamente
  useEffect(() => {
    setSelected(value);
    // Solo actualizar el inputValue si no está abierto el dropdown
    // Cuando está abierto, permitimos búsqueda libre
    if (value && !isOpen && value.label !== inputValue) {
      setInputValue(value.label);
    }
  }, [value, isOpen, inputValue]);

  // Efecto para inicializar el inputValue cuando hay una selección inicial
  useEffect(() => {
    if (value && !isOpen && inputValue === "") {
      setInputValue(value.label);
    }
  }, [value, isOpen, inputValue]);

  // Determinar si usamos búsqueda remota o local
  const isRemoteSearch = Boolean(queryState && onSearchChange);

  // Estados de la query remota
  const remoteData = queryState?.data;
  const remoteLoading = Boolean(queryState?.isLoading);
  const isError = Boolean(queryState?.isError);
  const error = queryState?.error;
  const refetch = queryState?.refetch as (() => void) | undefined;

  // Determinar estado de loading
  const isLoading = Boolean(isRemoteSearch ? remoteLoading : Boolean(externalLoading));

  // Determinar opciones a usar
  const currentOptions = useMemo(() => {
    if (isRemoteSearch && remoteData) {
      return options.length > 0 ? options : [];
    }
    return options;
  }, [isRemoteSearch, remoteData, options]);

  // Mensajes memoizados
  const messages = useMemo(
    () => ({
      loading: "Cargando..." as const,
      error: "Error al cargar los datos" as const,
      empty: String(emptyMessage),
      noResults: "Sin resultados" as const,
    }),
    [emptyMessage]
  );

  // Callback con debounce para búsqueda remota
  const debouncedSearch = useDebouncedCallback((term: string) => {
    if (!isRemoteSearch) return;

    if (regexInput) {
      if (regexInput.test(term) || term === "") {
        onSearchChange?.(term);
      }
    } else {
      onSearchChange?.(term);
    }
  }, debounceMs);

  // Manejo de cambios en el input
  const handleInputChange = useCallback(
    (newValue: string) => {
      setInputValue(newValue);

      // Solo hacer búsqueda, no deseleccionar automáticamente
      // El usuario puede buscar mientras mantiene la selección
      if (isRemoteSearch) {
        debouncedSearch(newValue);
      }
    },
    [isRemoteSearch, debouncedSearch]
  );

  const handleSelectOption = useCallback(
    (selectedOption: Option<T>) => {
      onValueChange?.(selectedOption);
      if (onPreventSelection && onPreventSelection(selectedOption)) {
        return; // Si la selección está bloqueada, no hacer nada mas
      }
      setInputValue(selectedOption.label);
      setSelected(selectedOption);
      //onValueChange?.(selectedOption);
      setOpen(false);
    },
    [onPreventSelection, onValueChange]
  );

  const handleFocus = useCallback(() => {
    setOpen(true);
    // Limpiar el input para permitir búsqueda libre
    setInputValue("");
    if (isRemoteSearch) {
      debouncedSearch("");
    }
  }, [isRemoteSearch, debouncedSearch]);

  const handleBlur = useCallback(() => {
    // Delay para permitir clicks en opciones
    setTimeout(() => {
      setOpen(false);

      // Restaurar el label de la selección si existe, pero solo si no estamos escribiendo
      if (selected && inputValue === "") {
        setInputValue(selected.label);
      } else if (selected) {
        // Si hay selección pero también hay texto, mantener el label
        setInputValue(selected.label);
      } else {
        setInputValue("");
      }

      // Limpiar búsqueda al cerrar
      if (isRemoteSearch) {
        debouncedSearch("");
      }
    }, 200);
  }, [selected, inputValue, isRemoteSearch, debouncedSearch]);

  // Calcular opciones adicionales disponibles
  const moreOptions = useMemo(() => {
    return total ? Math.max(0, total - currentOptions.length) : 0;
  }, [total, currentOptions.length]);

  // Manejador de scroll para detectar cuando llegar al final
  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      if (!onScrollEnd) return;

      const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px de margen

      if (isAtBottom) {
        onScrollEnd();
      }
    },
    [onScrollEnd]
  );

  // Renderizar el trigger/input
  const renderTrigger = () => {
    if (selected) {
      // Mostrar información del item seleccionado
      return (
        <div
          className={cn(
            "flex items-center justify-between w-full px-3 py-2 text-sm bg-background border border-input rounded-md cursor-pointer hover:bg-accent transition-colors",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onClick={() => !disabled && setOpen(true)}
        >
          <div className="flex-1 min-w-0">
            {selected.component ? (
              <div className="truncate">{selected.component}</div>
            ) : (
              <span className="truncate" title={selected.label}>
                {selected.label}
              </span>
            )}
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </div>
      );
    }

    // Input inicial cuando no hay nada seleccionado
    return (
      <Command shouldFilter={false}>
        <CommandInput
          key="trigger-input"
          ref={inputRef}
          value={inputValue}
          onValueChange={handleInputChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={searchPlaceholder || placeholder}
          disabled={disabled}
          className={cn("h-10", commandInputClassName)}
          showBorder
        />
        {/* Hidden list to initialize cmdk internal list ref and avoid Array.from(undefined) */}
        <CommandList className="hidden" />
      </Command>
    );
  };

  // Cerrar al hacer click fuera del componente
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!containerRef.current || !target) return;
      if (!containerRef.current.contains(target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside, true);
    document.addEventListener("touchstart", handleClickOutside, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside, true);
      document.removeEventListener("touchstart", handleClickOutside, true);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {!isOpen && renderTrigger()}

      {isOpen && (
        <div
          className={cn(
            "absolute top-full left-0 right-0 z-50 rounded-md border bg-popover shadow-lg animate-in fade-in-0 zoom-in-95",
            commandContentClassName
          )}
        >
          <Command shouldFilter={false}>
            <CommandInput
              key={isOpen ? "search-input" : "trigger-input"}
              ref={inputRef}
              value={inputValue}
              onValueChange={handleInputChange}
              onBlur={handleBlur}
              onFocus={handleFocus}
              placeholder={searchPlaceholder || placeholder}
              disabled={disabled}
              className={cn("h-10", commandInputClassName)}
            />

            <CommandList ref={commandListRef} className="max-h-64 overflow-auto" onScroll={handleScroll}>
              {/* Estado de carga */}
              {isLoading && (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">{messages.loading}</span>
                </div>
              )}

              {/* Estado de error */}
              {isError && Boolean(error) && (
                <div className="flex flex-col items-center justify-center p-4 space-y-2">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                  <p className="text-sm text-muted-foreground text-center">{messages.error}</p>
                  {refetch && (
                    <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
                      Reintentar
                    </Button>
                  )}
                </div>
              )}

              {/* Lista de opciones */}
              {!isLoading && !isError && currentOptions.length > 0 && (
                <CommandGroup>
                  {currentOptions.map((option) => {
                    const isSelected = selected?.value === option.value;
                    return (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        onSelect={() => handleSelectOption(option)}
                        className={cn(
                          "flex w-full items-center gap-2 cursor-pointer",
                          !isSelected ? "" : "pl-8",
                          isSelected && "bg-accent text-accent-foreground"
                        )}
                      >
                        {option.component ? option.component : option.label}
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4 text-emerald-500 shrink-0",
                            isSelected ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}

              {/* Sin resultados */}
              {!isLoading && !isError && currentOptions.length === 0 && (
                <CommandEmpty>
                  <div className="p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-2">{messages.noResults}</p>
                    {notFoundAction && <>{notFoundAction}</>}
                  </div>
                </CommandEmpty>
              )}

              {/* Indicador de opciones adicionales */}
              {moreOptions > 0 && (
                <div className="px-3 py-2 text-xs text-muted-foreground border-t bg-muted/50">
                  {moreOptions} opciones adicionales disponibles
                </div>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}
