import * as React from "react";
import { eachMonthOfInterval, endOfYear, format, startOfYear } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon, X } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { cn } from "@/shared/lib/utils";

export interface DatePickerWithYearMonthProps {
  selected: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  clearable?: boolean;
}

export function DatePickerWithYearMonth({
  selected,
  onSelect,
  placeholder = "Seleccionar fecha",
  disabled = false,
  className,
  clearable = false,
}: DatePickerWithYearMonthProps) {
  const [open, setOpen] = React.useState(false);
  const [month, setMonth] = React.useState<number>(selected ? selected.getMonth() : new Date().getMonth());
  const [year, setYear] = React.useState<number>(selected ? selected.getFullYear() : new Date().getFullYear());

  const years = React.useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i);
  }, []);

  const months = React.useMemo(() => {
    if (year) {
      return eachMonthOfInterval({
        start: startOfYear(new Date(year, 0, 1)),
        end: endOfYear(new Date(year, 0, 1)),
      });
    }
    return [];
  }, [year]);

  React.useEffect(() => {
    if (selected) {
      setMonth(selected.getMonth());
      setYear(selected.getFullYear());
    }
  }, [selected]);

  const handleDateSelect = (newDate: Date | undefined) => {
    onSelect(newDate);
    setOpen(false);
  };

  const handleYearChange = (selectedYear: string) => {
    const newYear = parseInt(selectedYear, 10);
    setYear(newYear);
    if (selected) {
      const newDate = new Date(selected);
      newDate.setFullYear(newYear);
    }
  };

  const handleMonthChange = (selectedMonth: string) => {
    const newMonth = parseInt(selectedMonth, 10);
    setMonth(newMonth);
    if (selected) {
      const newDate = new Date(selected);
      newDate.setMonth(newMonth);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn("w-full justify-start text-left font-normal", !selected && "text-muted-foreground", className)}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selected ? format(selected, "PPP", { locale: es }) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex justify-between p-2 space-x-1">
          <Select onValueChange={handleYearChange} value={year.toString()}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Año" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={handleMonthChange} value={month.toString()}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Mes" />
            </SelectTrigger>
            <SelectContent>
              {months.map((m, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {format(m, "MMMM", { locale: es })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleDateSelect}
          month={new Date(year, month)}
          onMonthChange={(newMonthDate) => {
            setMonth(newMonthDate.getMonth());
            setYear(newMonthDate.getFullYear());
          }}
          initialFocus
          locale={es}
          disabled={disabled}
        />
        {clearable && selected && (
          <Button
            variant="ghost"
            className="w-full justify-center"
            onClick={() => {
              onSelect(undefined);
              setOpen(false);
            }}
          >
            Limpiar
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}
