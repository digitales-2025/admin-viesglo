"use client";

import { useState } from "react";

import { cn } from "@/shared/lib/utils";

interface CircularProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  showPercentage?: boolean;
  className?: string;
}

export default function CircularProgress({
  progress: initialProgress = 0,
  size = 120,
  strokeWidth = 8,
  showPercentage = true,
  className,
}: CircularProgressProps) {
  const [progress] = useState(initialProgress);

  // Ensure progress is between 0 and 100
  const clampedProgress = Math.min(100, Math.max(0, progress));

  // Calculate SVG parameters
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  // Determine color based on progress
  const getColor = () => {
    if (clampedProgress < 33) return "stroke-orange-500";
    if (clampedProgress < 66) return "stroke-yellow-500";
    return "stroke-green-500";
  };

  // Font size based on component size
  const fontSize = size / 4;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="stroke-muted-foreground/10 "
        />

        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={getColor()}
          style={{
            transition: "stroke-dashoffset 0.5s ease-in-out, stroke 0.5s ease-in-out",
          }}
        />
      </svg>

      {showPercentage && (
        <div
          className="absolute flex flex-col items-center justify-center text-center font-medium"
          style={{ fontSize: `${fontSize}px` }}
        >
          <span className="tabular-nums">{Math.round(clampedProgress)}%</span>
        </div>
      )}
    </div>
  );
}
