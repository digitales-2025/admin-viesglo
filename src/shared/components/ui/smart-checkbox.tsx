import { Check, Minus } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { Button } from "./button";

export const SmartCheckbox = ({
  state,
  className,
  size = "default",
  ...props
}: {
  state: "none" | "empty" | "partial" | "full";
  className?: string;
  size?: "sm" | "default";
  [key: string]: any;
}) => {
  const sizeClass = size === "sm" ? "size-5" : "size-6";
  const iconSize = size === "sm" ? "h-3 w-3" : "h-4 w-4";

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className={cn(
        sizeClass,
        "hover:bg-transparent transition-all duration-200",
        {
          "border-blue-500 bg-blue-500 text-white shadow-sm dark:border-blue-400 dark:bg-blue-600": state === "full",
          "border-blue-400 bg-blue-100 text-blue-600 dark:border-blue-300 dark:bg-blue-950 dark:text-blue-400":
            state === "partial",
          "border-orange-400 bg-orange-100 text-orange-600 dark:border-orange-300 dark:bg-orange-950 dark:text-orange-400":
            state === "empty",
          "border-gray-200/20 bg-muted text-gray-400 hover:border-gray-400 dark:border-gray-600 dark:bg-muted dark:text-gray-500 dark:hover:border-gray-400":
            state === "none",
        },
        className
      )}
      {...props}
    >
      {state === "full" && <Check className={cn(iconSize, "opacity-100")} />}
      {state === "partial" && <Minus className={cn(iconSize, "opacity-100")} />}
      {state === "empty" && <Check className={cn(iconSize, "opacity-60")} />}
      {state === "none" && <Check className={cn(iconSize, "opacity-0")} />}
    </Button>
  );
};
