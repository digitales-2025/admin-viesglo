"use client";

import * as React from "react";
import { cva, VariantProps } from "class-variance-authority";
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
} from "date-fns";
import { formatInTimeZone, toDate } from "date-fns-tz";
import { es } from "date-fns/locale/es";
import { Calendar1, X } from "lucide-react";
import { DateRange } from "react-day-picker";

import { Badge } from "@/shared/components/ui/badge";
import { Button, buttonVariants } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Separator } from "@/shared/components/ui/separator";
import { cn } from "@/shared/lib/utils";

const months = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const multiSelectVariants = cva(
  "flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium text-foreground ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground text-background",
        link: "text-primary underline-offset-4 hover:underline text-background",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
      },
    },
    defaultVariants: {
      variant: "outline",
      size: "sm",
    },
  }
);

interface ServerDateRangeFacetedFilterProps extends VariantProps<typeof multiSelectVariants> {
  title?: string;
  from?: Date;
  to?: Date;
  onChange: (range: { from?: Date; to?: Date }) => void;
  closeOnSelect?: boolean;
  numberOfMonths?: 1 | 2;
  yearsRange?: number;
  disabled?: boolean;
  className?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export function ServerDateRangeFacetedFilter({
  title = "Fecha",
  from,
  to,
  onChange,
  closeOnSelect = false,
  numberOfMonths = 2,
  yearsRange = 10,
  variant,
  size,
  disabled,
  className,
  icon: Icon,
  ...props
}: ServerDateRangeFacetedFilterProps) {
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
  const [selectedRange, setSelectedRange] = React.useState<string | null>(numberOfMonths === 2 ? "This Year" : "Today");
  const [monthFrom, setMonthFrom] = React.useState<Date | undefined>(from);
  const [yearFrom, setYearFrom] = React.useState<number | undefined>(from?.getFullYear());
  const [monthTo, setMonthTo] = React.useState<Date | undefined>(numberOfMonths === 2 ? to : from);
  const [yearTo, setYearTo] = React.useState<number | undefined>(
    numberOfMonths === 2 ? to?.getFullYear() : from?.getFullYear()
  );
  const [highlightedPart, setHighlightedPart] = React.useState<string | null>(null);

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const date: DateRange = { from, to };

  const hasAny = Boolean(from || to);
  const formatWithTz = (date: Date, fmt: string) => formatInTimeZone(date, timeZone, fmt, { locale: es });

  const handleClose = () => setIsPopoverOpen(false);
  const handleTogglePopover = () => setIsPopoverOpen((prev) => !prev);

  const selectDateRange = (from: Date, to: Date, range: string) => {
    const startDate = startOfDay(toDate(from, { timeZone }));
    const endDate = numberOfMonths === 2 ? endOfDay(toDate(to, { timeZone })) : startDate;
    onChange({ from: startDate, to: endDate });
    setSelectedRange(range);
    setMonthFrom(from);
    setYearFrom(from.getFullYear());
    setMonthTo(to);
    setYearTo(to.getFullYear());
    closeOnSelect && setIsPopoverOpen(false);
  };

  const handleDateSelect = (range: DateRange | undefined) => {
    if (range) {
      let from = startOfDay(toDate(range.from as Date, { timeZone }));
      let to = range.to ? endOfDay(toDate(range.to as Date, { timeZone })) : from;
      if (numberOfMonths === 1) {
        if (range.from !== date.from) {
          to = from;
        } else {
          from = startOfDay(toDate(range.to as Date, { timeZone }));
        }
      }
      onChange({ from, to });
      setMonthFrom(from);
      setYearFrom(from.getFullYear());
      setMonthTo(to);
      setYearTo(to.getFullYear());
      closeOnSelect && setIsPopoverOpen(false);
    }
    setSelectedRange(null);
  };

  const handleMonthChange = (newMonthIndex: number, part: string) => {
    setSelectedRange(null);
    if (part === "from") {
      if (yearFrom !== undefined) {
        if (newMonthIndex < 0 || newMonthIndex > yearsRange + 1) return;
        const newMonth = new Date(yearFrom, newMonthIndex, 1);
        const from =
          numberOfMonths === 2
            ? startOfMonth(toDate(newMonth, { timeZone }))
            : date?.from
              ? new Date(date.from.getFullYear(), newMonth.getMonth(), date.from.getDate())
              : newMonth;
        const to =
          numberOfMonths === 2
            ? date.to
              ? endOfDay(toDate(date.to, { timeZone }))
              : endOfMonth(toDate(newMonth, { timeZone }))
            : from;
        if (from <= to) {
          onChange({ from, to });
          setMonthFrom(newMonth);
          setMonthTo(date.to);
        }
      }
    } else {
      if (yearTo !== undefined) {
        if (newMonthIndex < 0 || newMonthIndex > yearsRange + 1) return;
        const newMonth = new Date(yearTo, newMonthIndex, 1);
        const from = date.from
          ? startOfDay(toDate(date.from, { timeZone }))
          : startOfMonth(toDate(newMonth, { timeZone }));
        const to = numberOfMonths === 2 ? endOfMonth(toDate(newMonth, { timeZone })) : from;
        if (from <= to) {
          onChange({ from, to });
          setMonthTo(newMonth);
          setMonthFrom(date.from);
        }
      }
    }
  };

  const handleYearChange = (newYear: number, part: string) => {
    setSelectedRange(null);
    if (part === "from") {
      if (years.includes(newYear)) {
        const newMonth = monthFrom
          ? new Date(newYear, monthFrom ? monthFrom.getMonth() : 0, 1)
          : new Date(newYear, 0, 1);
        const from =
          numberOfMonths === 2
            ? startOfMonth(toDate(newMonth, { timeZone }))
            : date.from
              ? new Date(newYear, newMonth.getMonth(), date.from.getDate())
              : newMonth;
        const to =
          numberOfMonths === 2
            ? date.to
              ? endOfDay(toDate(date.to, { timeZone }))
              : endOfMonth(toDate(newMonth, { timeZone }))
            : from;
        if (from <= to) {
          onChange({ from, to });
          setYearFrom(newYear);
          setMonthFrom(newMonth);
          setYearTo(date.to?.getFullYear());
          setMonthTo(date.to);
        }
      }
    } else {
      if (years.includes(newYear)) {
        const newMonth = monthTo ? new Date(newYear, monthTo.getMonth(), 1) : new Date(newYear, 0, 1);
        const from = date.from
          ? startOfDay(toDate(date.from, { timeZone }))
          : startOfMonth(toDate(newMonth, { timeZone }));
        const to = numberOfMonths === 2 ? endOfMonth(toDate(newMonth, { timeZone })) : from;
        if (from <= to) {
          onChange({ from, to });
          setYearTo(newYear);
          setMonthTo(newMonth);
          setYearFrom(date.from?.getFullYear());
          setMonthFrom(date.from);
        }
      }
    }
  };

  const today = new Date();
  const years = Array.from({ length: yearsRange + 1 }, (_, i) => today.getFullYear() - yearsRange / 2 + i);

  const dateRanges = [
    { label: "Hoy", start: today, end: today },
    { label: "Ayer", start: subDays(today, 1), end: subDays(today, 1) },
    {
      label: "Esta Semana",
      start: startOfWeek(today, { weekStartsOn: 1 }),
      end: endOfWeek(today, { weekStartsOn: 1 }),
    },
    {
      label: "Semana Pasada",
      start: subDays(startOfWeek(today, { weekStartsOn: 1 }), 7),
      end: subDays(endOfWeek(today, { weekStartsOn: 1 }), 7),
    },
    { label: "Últimos 7 Días", start: subDays(today, 6), end: today },
    {
      label: "Este Mes",
      start: startOfMonth(today),
      end: endOfMonth(today),
    },
    {
      label: "Mes Pasado",
      start: startOfMonth(subDays(today, today.getDate())),
      end: endOfMonth(subDays(today, today.getDate())),
    },
    { label: "Este Año", start: startOfYear(today), end: endOfYear(today) },
    {
      label: "Año Pasado",
      start: startOfYear(subDays(today, 365)),
      end: endOfYear(subDays(today, 365)),
    },
  ];

  const handleMouseOver = (part: string) => {
    setHighlightedPart(part);
  };

  const handleMouseLeave = () => {
    setHighlightedPart(null);
  };

  const handleWheel = (event: React.WheelEvent) => {
    event.preventDefault();
    setSelectedRange(null);
    if (highlightedPart === "firstDay") {
      const newDate = new Date(date.from as Date);
      const increment = event.deltaY > 0 ? -1 : 1;
      newDate.setDate(newDate.getDate() + increment);
      if (newDate <= (date.to as Date)) {
        if (numberOfMonths === 2) {
          onChange({ from: newDate, to: new Date(date.to as Date) });
        } else {
          onChange({ from: newDate, to: newDate });
        }
        setMonthFrom(newDate);
      } else if (newDate > (date.to as Date) && numberOfMonths === 1) {
        onChange({ from: newDate, to: newDate });
        setMonthFrom(newDate);
      }
    } else if (highlightedPart === "firstMonth") {
      const currentMonth = monthFrom ? monthFrom.getMonth() : 0;
      const newMonthIndex = currentMonth + (event.deltaY > 0 ? -1 : 1);
      handleMonthChange(newMonthIndex, "from");
    } else if (highlightedPart === "firstYear" && yearFrom !== undefined) {
      const newYear = yearFrom + (event.deltaY > 0 ? -1 : 1);
      handleYearChange(newYear, "from");
    } else if (highlightedPart === "secondDay") {
      const newDate = new Date(date.to as Date);
      const increment = event.deltaY > 0 ? -1 : 1;
      newDate.setDate(newDate.getDate() + increment);
      if (newDate >= (date.from as Date)) {
        onChange({ from: new Date(date.from as Date), to: newDate });
        setMonthTo(newDate);
      }
    } else if (highlightedPart === "secondMonth") {
      const currentMonth = monthTo ? monthTo.getMonth() : 0;
      const newMonthIndex = currentMonth + (event.deltaY > 0 ? -1 : 1);
      handleMonthChange(newMonthIndex, "to");
    } else if (highlightedPart === "secondYear" && yearTo !== undefined) {
      const newYear = yearTo + (event.deltaY > 0 ? -1 : 1);
      handleYearChange(newYear, "to");
    }
  };

  React.useEffect(() => {
    const firstDayElement = document.getElementById(`firstDay-${title}`);
    const firstMonthElement = document.getElementById(`firstMonth-${title}`);
    const firstYearElement = document.getElementById(`firstYear-${title}`);
    const secondDayElement = document.getElementById(`secondDay-${title}`);
    const secondMonthElement = document.getElementById(`secondMonth-${title}`);
    const secondYearElement = document.getElementById(`secondYear-${title}`);

    const elements = [
      firstDayElement,
      firstMonthElement,
      firstYearElement,
      secondDayElement,
      secondMonthElement,
      secondYearElement,
    ];

    const addPassiveEventListener = (element: HTMLElement | null) => {
      if (element) {
        element.addEventListener("wheel", handleWheel as unknown as EventListener, {
          passive: false,
        });
      }
    };

    elements.forEach(addPassiveEventListener);

    return () => {
      elements.forEach((element) => {
        if (element) {
          element.removeEventListener("wheel", handleWheel as unknown as EventListener);
        }
      });
    };
  }, [highlightedPart, date]);

  return (
    <>
      <style>
        {`
          .date-part {
            touch-action: none;
          }
        `}
      </style>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            {...props}
            disabled={disabled}
            className={cn("h-8 border-dashed", multiSelectVariants({ variant, className, size }))}
            onClick={handleTogglePopover}
            suppressHydrationWarning
          >
            {Icon ? <Icon className="mr-2 h-4 w-4" /> : <Calendar1 className="mr-2 h-4 w-4" />}
            {title}
            {hasAny && (
              <>
                <Separator orientation="vertical" className="mx-2 h-4" />
                <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                  1
                </Badge>
                <div className="hidden space-x-1 lg:flex">
                  <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                    {date?.from ? (
                      date.to ? (
                        <>
                          <span
                            id={`firstDay-${title}`}
                            className={cn("date-part", highlightedPart === "firstDay" && "underline font-bold")}
                            onMouseOver={() => handleMouseOver("firstDay")}
                            onMouseLeave={handleMouseLeave}
                          >
                            {formatWithTz(date.from, "dd")}
                          </span>{" "}
                          <span
                            id={`firstMonth-${title}`}
                            className={cn("date-part", highlightedPart === "firstMonth" && "underline font-bold")}
                            onMouseOver={() => handleMouseOver("firstMonth")}
                            onMouseLeave={handleMouseLeave}
                          >
                            {formatWithTz(date.from, "LLL")}
                          </span>
                          ,{" "}
                          <span
                            id={`firstYear-${title}`}
                            className={cn("date-part", highlightedPart === "firstYear" && "underline font-bold")}
                            onMouseOver={() => handleMouseOver("firstYear")}
                            onMouseLeave={handleMouseLeave}
                          >
                            {formatWithTz(date.from, "y")}
                          </span>
                          {numberOfMonths === 2 && (
                            <>
                              {" - "}
                              <span
                                id={`secondDay-${title}`}
                                className={cn("date-part", highlightedPart === "secondDay" && "underline font-bold")}
                                onMouseOver={() => handleMouseOver("secondDay")}
                                onMouseLeave={handleMouseLeave}
                              >
                                {formatWithTz(date.to, "dd")}
                              </span>{" "}
                              <span
                                id={`secondMonth-${title}`}
                                className={cn("date-part", highlightedPart === "secondMonth" && "underline font-bold")}
                                onMouseOver={() => handleMouseOver("secondMonth")}
                                onMouseLeave={handleMouseLeave}
                              >
                                {formatWithTz(date.to, "LLL")}
                              </span>
                              ,{" "}
                              <span
                                id={`secondYear-${title}`}
                                className={cn("date-part", highlightedPart === "secondYear" && "underline font-bold")}
                                onMouseOver={() => handleMouseOver("secondYear")}
                                onMouseLeave={handleMouseLeave}
                              >
                                {formatWithTz(date.to, "y")}
                              </span>
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          <span
                            id="day"
                            className={cn("date-part", highlightedPart === "day" && "underline font-bold")}
                            onMouseOver={() => handleMouseOver("day")}
                            onMouseLeave={handleMouseLeave}
                          >
                            {formatWithTz(date.from, "dd")}
                          </span>{" "}
                          <span
                            id="month"
                            className={cn("date-part", highlightedPart === "month" && "underline font-bold")}
                            onMouseOver={() => handleMouseOver("month")}
                            onMouseLeave={handleMouseLeave}
                          >
                            {formatWithTz(date.from, "LLL")}
                          </span>
                          ,{" "}
                          <span
                            id="year"
                            className={cn("date-part", highlightedPart === "year" && "underline font-bold")}
                            onMouseOver={() => handleMouseOver("year")}
                            onMouseLeave={handleMouseLeave}
                          >
                            {formatWithTz(date.from, "y")}
                          </span>
                        </>
                      )
                    ) : (
                      "Seleccione fecha"
                    )}
                  </Badge>
                </div>
              </>
            )}
            {hasAny && (
              <span
                role="button"
                aria-label="Limpiar selección"
                className="ml-2 p-1 rounded-full inline-flex items-center justify-center hover:bg-accent cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange({ from: undefined, to: undefined });
                  setSelectedRange(null);
                  handleClose();
                }}
              >
                <X className="h-3 w-3" />
              </span>
            )}
          </Button>
        </PopoverTrigger>
        {isPopoverOpen && (
          <PopoverContent
            className="w-auto"
            align="start"
            side="bottom"
            avoidCollisions={true}
            onInteractOutside={handleClose}
            onEscapeKeyDown={handleClose}
            style={{
              maxHeight: "var(--radix-popover-content-available-height)",
              overflowY: "auto",
            }}
          >
            <div className="flex">
              {numberOfMonths === 2 && (
                <div className="hidden md:flex flex-col gap-1 pr-4 text-left border-r border-foreground/10">
                  {dateRanges.map(({ label, start, end }) => (
                    <Button
                      key={label}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "justify-start hover:bg-primary hover:text-background",
                        selectedRange === label &&
                          "bg-primary text-background hover:bg-primary/90 hover:text-background"
                      )}
                      onClick={() => {
                        selectDateRange(start, end, label);
                        setMonthFrom(start);
                        setYearFrom(start.getFullYear());
                        setMonthTo(end);
                        setYearTo(end.getFullYear());
                      }}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              )}
              <div className="flex flex-col">
                <div className="flex items-center gap-4">
                  <div className="flex gap-2 ml-3">
                    <Select
                      onValueChange={(value) => {
                        handleMonthChange(months.indexOf(value), "from");
                        setSelectedRange(null);
                      }}
                      value={monthFrom ? months[monthFrom.getMonth()] : undefined}
                    >
                      <SelectTrigger className="hidden sm:flex w-[122px] focus:ring-0 focus:ring-offset-0 font-medium hover:bg-accent hover:text-accent-foreground">
                        <SelectValue placeholder="Mes" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month, idx) => (
                          <SelectItem key={idx} value={month}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      onValueChange={(value) => {
                        handleYearChange(Number(value), "from");
                        setSelectedRange(null);
                      }}
                      value={yearFrom ? yearFrom.toString() : undefined}
                    >
                      <SelectTrigger className="hidden sm:flex w-[122px] focus:ring-0 focus:ring-offset-0 font-medium hover:bg-accent hover:text-accent-foreground">
                        <SelectValue placeholder="Año" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year, idx) => (
                          <SelectItem key={idx} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {numberOfMonths === 2 && (
                    <div className="flex gap-2">
                      <Select
                        onValueChange={(value) => {
                          handleMonthChange(months.indexOf(value), "to");
                          setSelectedRange(null);
                        }}
                        value={monthTo ? months[monthTo.getMonth()] : undefined}
                      >
                        <SelectTrigger className="hidden sm:flex w-[122px] focus:ring-0 focus:ring-offset-0 font-medium hover:bg-accent hover:text-accent-foreground">
                          <SelectValue placeholder="Mes" />
                        </SelectTrigger>
                        <SelectContent>
                          {months.map((month, idx) => (
                            <SelectItem key={idx} value={month}>
                              {month}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        onValueChange={(value) => {
                          handleYearChange(Number(value), "to");
                          setSelectedRange(null);
                        }}
                        value={yearTo ? yearTo.toString() : undefined}
                      >
                        <SelectTrigger className="hidden sm:flex w-[122px] focus:ring-0 focus:ring-offset-0 font-medium hover:bg-accent hover:text-accent-foreground">
                          <SelectValue placeholder="Año" />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((year, idx) => (
                            <SelectItem key={idx} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <div className="flex">
                  <Calendar
                    mode="range"
                    defaultMonth={monthFrom}
                    month={monthFrom}
                    onMonthChange={setMonthFrom}
                    selected={date}
                    onSelect={handleDateSelect}
                    numberOfMonths={numberOfMonths}
                    showOutsideDays={true}
                    className={className}
                    locale={es}
                  />
                </div>
                <div className="flex justify-end mt-2">
                  <span
                    className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                    onClick={() => {
                      onChange({ from: undefined, to: undefined });
                      setSelectedRange(null);
                      handleClose();
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onChange({ from: undefined, to: undefined });
                        setSelectedRange(null);
                        handleClose();
                      }
                    }}
                  >
                    Limpiar
                  </span>
                </div>
              </div>
            </div>
          </PopoverContent>
        )}
      </Popover>
    </>
  );
}

export default ServerDateRangeFacetedFilter;
