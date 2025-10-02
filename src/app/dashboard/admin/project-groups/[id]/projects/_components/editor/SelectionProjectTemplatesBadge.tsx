import { cn } from "@/lib/utils";

interface SelectionProjectTemplatesBadgeProps {
  count: number;
  total: number;
  type: string;
}

export default function SelectionProjectTemplatesBadge({ count, total, type }: SelectionProjectTemplatesBadgeProps) {
  if (total === 0) return null;

  const isComplete = count === total;
  const isEmpty = count === 0;
  return (
    <span
      className={cn("text-xs px-2 py-0.5 rounded-full font-medium ml-auto", {
        "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300": isComplete,
        "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300": !isComplete && !isEmpty,
        "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400": isEmpty,
      })}
    >
      {count}/{total} {type}
    </span>
  );
}
