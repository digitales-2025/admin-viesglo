import React from "react";

import { cn } from "@/lib/utils";

interface TimelineNodeProps {
  children: React.ReactNode;
  index: number;
  total: number;
  status?: "default" | "active" | "completed" | "pending";
  className?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export const TimelineNode = ({ children, index, total, className = "", icon: Icon }: TimelineNodeProps) => {
  const isFirst = index === 0;
  const isLast = index === total - 1;

  return (
    <div className={`relative grid grid-cols-[50px_1fr]`}>
      {/* Timeline line container */}
      <div className="relative grid grid-rows-[1fr_auto_1fr] justify-items-center mr-4 h-full">
        {/* Top line */}
        {!isFirst ? <div className="w-px bg-ring h-[calc(100%+10px)]"></div> : <div />}

        {/* Circle indicator */}
        <div
          className={cn(
            "bg-muted dark:bg-ring inline-flex justify-center items-center relative z-10 size-5 rounded-full border flex-shrink-0",
            isFirst && "size-6",
            className
          )}
        >
          {Icon && (
            <Icon className={cn("size-[10px] shrink-0 text-muted-foreground", isFirst && "size-3", className)} />
          )}
        </div>

        {/* Bottom line - uses percentage-based height adaptation */}
        {!isLast ? <div className="w-px bg-ring h-[calc(100%+10px)]"></div> : <div />}
      </div>

      {/* Content container - uses flex for natural height adaptation */}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
};
