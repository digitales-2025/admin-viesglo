"use client";

import type React from "react";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Search, X } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";

// Tipos para el componente
export interface AutocompleteItem {
  id: string;
  name: string;
  [key: string]: any; // Para permitir propiedades adicionales
}

export interface AutocompleteProps {
  value?: AutocompleteItem | null;
  onChange?: (item: AutocompleteItem | null) => void;
  onSearch?: (query: string) => Promise<AutocompleteItem[]>;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  resultsClassName?: string;
  debounceTime?: number;
  minChars?: number;
  noResultsText?: string;
  loadingText?: string;
  maxResults?: number;
}

// Memorizar el elemento de la lista para evitar re-renders innecesarios
const ResultItem = memo(
  ({
    item,
    query,
    isSelected,
    onSelect,
    onMouseEnter,
  }: {
    item: AutocompleteItem;
    query: string;
    isSelected: boolean;
    onSelect: () => void;
    onMouseEnter: () => void;
    index: number;
  }) => {
    // Función para resaltar el texto coincidente
    const highlightMatch = (text: string, query: string) => {
      if (!query.trim()) return text;

      const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
      const parts = text.split(regex);

      return parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="bg-yellow-200 dark:bg-yellow-800">
            {part}
          </span>
        ) : (
          part
        )
      );
    };

    return (
      <li
        className={cn(
          "px-4 py-3 cursor-pointer flex items-center",
          "hover:bg-muted transition-colors duration-100",
          isSelected ? "bg-muted" : ""
        )}
        onClick={onSelect}
        onMouseEnter={onMouseEnter}
      >
        <div className="text-sm">{highlightMatch(item.name, query)}</div>
      </li>
    );
  }
);

ResultItem.displayName = "ResultItem";

export default function Autocomplete({
  value,
  onChange,
  onSearch,
  placeholder = "Buscar...",
  label,
  error,
  disabled = false,
  className,
  inputClassName,
  resultsClassName,
  debounceTime = 300,
  minChars = 2,
  noResultsText = "No se encontraron resultados",
  loadingText = "Buscando resultados...",
  maxResults = 100,
}: AutocompleteProps) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<AutocompleteItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // Inicializar el query con el valor seleccionado
  useEffect(() => {
    if (value) {
      setQuery(value.name);
    }
  }, [value]);

  // Limpiar referencias al desmontar
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Función para obtener datos de la API
  const fetchData = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim() || searchQuery.length < minChars) {
        setItems([]);
        return;
      }

      if (!onSearch) {
        console.warn("No se proporcionó la función onSearch");
        return;
      }

      setLoading(true);
      try {
        const data = await onSearch(searchQuery);

        // Verificar que el componente sigue montado antes de actualizar el estado
        if (mountedRef.current) {
          // Limitar el número máximo de resultados para mejor rendimiento
          setItems(data.slice(0, maxResults));
        }
      } catch (error) {
        console.error("Error al obtener datos:", error);
        if (mountedRef.current) {
          setItems([]);
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [onSearch, minChars, maxResults]
  );

  // Debounce para evitar llamadas excesivas a la API
  const debouncedSearch = useCallback(
    (searchQuery: string) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        fetchData(searchQuery);
      }, debounceTime);
    },
    [fetchData, debounceTime]
  );

  // Manejar cambios en la búsqueda
  const handleQueryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newQuery = e.target.value;
      setQuery(newQuery);
      setSelectedIndex(-1);
      debouncedSearch(newQuery);
    },
    [debouncedSearch]
  );

  // Manejar clic fuera para cerrar resultados
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Manejar navegación con teclado
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < items.length - 1 ? prev + 1 : prev));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === "Enter" && selectedIndex >= 0) {
        e.preventDefault();
        if (items[selectedIndex]) {
          selectItem(items[selectedIndex]);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        setFocused(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, selectedIndex]
  );

  // Seleccionar un elemento
  const selectItem = useCallback(
    (item: AutocompleteItem) => {
      setQuery(item.name);
      setFocused(false);
      onChange?.(item);
    },
    [onChange]
  );

  // Limpiar la selección
  const clearSelection = useCallback(() => {
    setQuery("");
    onChange?.(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [onChange]);

  // Determinar si se deben mostrar resultados
  const shouldShowResults = focused && (query.length >= minChars || loading);

  return (
    <div className={cn("w-full", className)}>
      {label && <label className="block text-sm font-medium text-muted-foreground mb-1">{label}</label>}
      <div className="relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>

          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            className={cn(
              "pl-10 pr-10 py-3 h-9 text-base rounded-md transition-all duration-200",
              focused ? "" : "",
              value ? "bg-muted/50" : "",
              error && "border-red-500 focus-visible:ring-red-500",
              inputClassName
            )}
            value={query}
            onChange={handleQueryChange}
            onFocus={() => setFocused(true)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
          />

          {(query || value) && !disabled && (
            <Button
              type="button"
              size="icon"
              tabIndex={-1}
              className="absolute inset-y-0 right-0 flex items-center h-full bg-transparent shadow-none text-muted-foreground hover:text-foreground hover:bg-transparent"
              onClick={clearSelection}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Limpiar</span>
            </Button>
          )}
        </div>

        {shouldShowResults && (
          <div
            ref={resultsRef}
            className={cn(
              "absolute z-10 mt-1 w-full bg-background border rounded-lg shadow-lg overflow-hidden",
              resultsClassName
            )}
          >
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
                <span>{loadingText}</span>
              </div>
            ) : items.length > 0 ? (
              <ul className="max-h-60 overflow-auto py-1">
                {items.map((item, index) => (
                  <ResultItem
                    key={item.id}
                    item={item}
                    query={query}
                    isSelected={selectedIndex === index}
                    onSelect={() => selectItem(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    index={index}
                  />
                ))}
              </ul>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                {noResultsText} "{query}"
              </div>
            )}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
